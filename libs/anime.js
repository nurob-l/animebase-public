const APIError = require('@/rest').APIError
const {
  AnimeRecord,
  Anime,
  AnimeOtherName,
  AnimeTypeGenre,
  AnimeRegion,
  AnimeReleaseDate,
  AnimeCopyright,
  AnimeStaff,
  AnimeCast,
  AnimeVote
} = require('@/model')
const {
  recordStatus: { success, history, fail, closed },
  defaultReleaseDate,
  valueOfRecommendStatus: { yes }
} = require('@/config/business-data')
const { animeScoreAvg, compareDate } = require('@/config/business-logic')
const db = require('@/config/db')
const {
  addAnimeCover,
  updateAnimeCover,
  closeAnimeCover,
  openAnimeCover,
  rollbackAnimeCover,
  deleteCover
} = require('@/config/oss')

module.exports = {
  /** 添加条目，将数据库中的条目审核表中的数据插入到各类动画相关的表中
   * @param {Object}record 动画条目档案sequelize实例数据
   * @param {Number}auditorId 审核员/管理员Id
   */
  addAnimeEntry: async (record, auditorId) => {
    const t = await db.transaction()
    try {
      // 先插入Anime表获取entryId
      let anime = await Anime.create(record.dataValues, {
        transaction: t,
        fields: ['chineseName', 'foreignName', 'typeMedium', 'typeSource', 'officialUrl', 'intro']
      })
      // 处理封面图片
      const coverUrl = await addAnimeCover(record.coverUrl, record.recordId, anime.entryId)
      // 准备数据
      const data = prepareEntryDataForAnime(anime.entryId, record)
      // 更新anime实例
      anime.earliestYear    = data.earliestYear
      anime.earliestMonth   = data.earliestMonth
      anime.earliestDay     = data.earliestDay
      // 更新record实例
      record.entryId        = anime.entryId
      record.coverUrl       = coverUrl
      record.auditorId      = auditorId
      record.auditedAt      = Date.now()
      record.status         = success
      // 批量插入
      await Promise.all([
        AnimeOtherName.bulkCreate(data.otherNames, { transaction: t }),
        AnimeTypeGenre.bulkCreate(data.typeGenres, { transaction: t }),
        AnimeRegion.bulkCreate(data.regions, { transaction: t }),
        AnimeReleaseDate.bulkCreate(data.releaseDates, { transaction: t }),
        AnimeCopyright.bulkCreate(data.copyrights, { transaction: t }),
        AnimeStaff.bulkCreate(data.staffs, { transaction: t }),
        AnimeCast.bulkCreate(data.casts, { transaction: t }),
        anime.save({ transaction: t }),
        record.save({ transaction: t })
      ])
      await t.commit()
    } catch (err) {
      await t.rollback()
      LOGABLE && console.log(err.message)
      throw new APIError('internal:unknown_error', '亲，系统出错了，请联系客服或稍后重试')
    }
  },
  
  /** 更新条目，将数据库中的条目审核表中的数据更新到各类动画相关的表中
   * @param {Object}record 动画条目档案sequelize实例数据
   * @param {Number}auditorId 审核员Id
   */
  updateAnimeEntry: async (record, auditorId) => {
    // 获取该动画公开版本（即审核成功）的条目档案和公开条目
    let [oldRecord, anime] = await Promise.all([
      AnimeRecord.findOne({ where: { entryId: record.entryId, status: success } }),
      Anime.findOne({ where: { entryId: record.entryId } })
    ])
    // 检测旧条目或公开条目是否存在（如果被下架了旧条目就找不到了）
    if(!oldRecord || !anime) throw new APIError('audit:no_entry', '亲，要修改的条目不存在或被下架了')

    const t = await db.transaction()
    try {
      // 处理封面图片
      const coverUrl = await updateAnimeCover(record.coverUrl, record.recordId, record.entryId)
      // 准备数据
      const data = prepareEntryDataForAnime(record.entryId, record, oldRecord)
      // 更新anime实例
      anime.chineseName     = record.chineseName
      anime.foreignName     = record.foreignName
      anime.typeMedium      = record.typeMedium
      anime.typeSource      = record.typeSource
      anime.officialUrl     = record.officialUrl
      anime.intro           = record.intro
      anime.earliestYear    = data.earliestYear
      anime.earliestMonth   = data.earliestMonth
      anime.earliestDay     = data.earliestDay
      // 更新record实例
      record.coverUrl       = coverUrl
      record.auditorId      = auditorId
      record.auditedAt      = Date.now()
      record.status         = success
      // 更新oldRecord实例
      oldRecord.status      = history
      // 先判断是否是新鲜数据，如果是新鲜数据, 则需要先删除旧数据
      const options = {
        where: {
          entryId: record.entryId,
        },
        transaction: t
      }
      await Promise.all([
        data.flagOtherNames ? AnimeOtherName.destroy(options) : null,
        data.flagTypeGenres ? AnimeTypeGenre.destroy(options) : null,
        data.flagRegions ? AnimeRegion.destroy(options) : null,
        data.flagReleaseDates ? AnimeReleaseDate.destroy(options) : null,
        data.flagCopyrights ? AnimeCopyright.destroy(options) : null,
        data.flagStaffs ? AnimeStaff.destroy(options) : null,
        data.flagCasts ? AnimeCast.destroy(options) : null
      ])
      await Promise.all([
        // 插入新鲜数据，如果是旧数据，则data对应的数据是空数组，因此插入前不需要判断新数据还是旧数据，可直接插入
        AnimeOtherName.bulkCreate(data.otherNames, { transaction: t }),
        AnimeTypeGenre.bulkCreate(data.typeGenres, { transaction: t }),
        AnimeRegion.bulkCreate(data.regions, { transaction: t }),
        AnimeReleaseDate.bulkCreate(data.releaseDates, { transaction: t }),
        AnimeCopyright.bulkCreate(data.copyrights, { transaction: t }),
        AnimeStaff.bulkCreate(data.staffs, { transaction: t }),
        AnimeCast.bulkCreate(data.casts, { transaction: t }),
        // 还有保存实例
        anime.save({ transaction: t }),
        oldRecord.save({ transaction: t }),
        record.save({ transaction: t })
      ])
      await t.commit()
    } catch (err) {
      await t.rollback()
      LOGABLE && console.log(err.message)
      throw new APIError('internal:unknown_error', '亲，系统出错了, 请联系客服或稍后重试')
    }
  },
  
  /** 下架已公开的条目
   * @param {Object}record 动画条目档案sequelize实例数据
   * @param {Number}adminId 管理员Id
   * @param {String}message 备注
   */
  closeAnimeEntry: async (record, adminId, message) => {
    const t = await db.transaction()
    try {
      // 更新实例，修改为下架状态
      record.auditorId      = adminId
      record.auditedAt      = Date.now()
      record.auditorMessage = message
      record.status         = closed
      const options = {
        where: { entryId: record.entryId },
        transaction: t
      }
      await Promise.all([
        // 删除公开数据
        Anime.destroy(options),
        AnimeOtherName.destroy(options),
        AnimeTypeGenre.destroy(options),
        AnimeRegion.destroy(options),
        AnimeReleaseDate.destroy(options),
        AnimeCopyright.destroy(options),
        AnimeStaff.destroy(options),
        AnimeCast.destroy(options),
        // 保存实例
        record.save({ transaction: t })
      ])
      // 最后处理封面图片，保证事务一致性
      await closeAnimeCover(record.entryId)
      await t.commit()
    } catch (err) {
      await t.rollback()
      LOGABLE && console.log(err.message)
      throw new APIError('internal:unknown_error', '亲，系统出错了，请联系客服或稍后重试')
    }
  },
  
  /** 重新上架已下架的条目，将数据库中的条目审核表中的数据插入到各类动画相关的表中
   * @param {Object}record 动画条目档案sequelize实例数据
   * @param {Number}adminId 管理员Id
   * @param {String}message 备注
   */
  openAnimeEntry: async (record, adminId, message = '') => {
    const t = await db.transaction()
    try {
      // 先插入Anime表获取entryId
      let anime = await Anime.create(record.dataValues, {
        fields: ['entryId', 'chineseName', 'foreignName', 'typeMedium', 'typeSource', 'officialUrl', 'intro'],
        transaction: t
      })
      // 准备数据
      const data = prepareEntryDataForAnime(record.entryId, record)
      // 准备评分统计数据
      const count = await countAnimeVotes(record.entryId)
      // 更新anime实例
      anime.earliestYear      = data.earliestYear
      anime.earliestMonth     = data.earliestMonth
      anime.earliestDay       = data.earliestDay
      anime.scoreStory        = count.scoreStory
      anime.scoreCharacter    = count.scoreCharacter
      anime.scoreMake         = count.scoreMake
      anime.scoreShow         = count.scoreShow
      anime.scoreMusic        = count.scoreMusic
      anime.scoreAvg          = animeScoreAvg(count)
      anime.numberRecommends  = count.numberRecommends
      anime.numberScores      = count.numberScores
      // 更新record实例
      record.auditorId        = adminId
      record.auditorMessage   = message
      record.auditedAt        = Date.now()
      record.status           = success
      // 批量插入
      await Promise.all([
        AnimeOtherName.bulkCreate(data.otherNames, { transaction: t }),
        AnimeTypeGenre.bulkCreate(data.typeGenres, { transaction: t }),
        AnimeRegion.bulkCreate(data.regions, { transaction: t }),
        AnimeReleaseDate.bulkCreate(data.releaseDates, { transaction: t }),
        AnimeCopyright.bulkCreate(data.copyrights, { transaction: t }),
        AnimeStaff.bulkCreate(data.staffs, { transaction: t }),
        AnimeCast.bulkCreate(data.casts, { transaction: t }),
        anime.save({ transaction: t }),
        record.save({ transaction: t })
      ])
      // 最后处理封面图片，保证事务一致性
      await openAnimeCover(record.recordId, record.entryId)
      await t.commit()
    } catch (err) {
      await t.rollback()
      LOGABLE && console.log(err.message)
      throw new APIError('internal:unknown_error', '亲，系统出错了，请联系客服或稍后重试')
    }
  },
  
  /** 回滚已公开的条目
   * @param {Object}record 动画条目档案sequelize实例数据
   * @param {Number}adminId 管理员Id
   * @param {String}message 备注
   */
  rollbackAnimeEntry: async (record, adminId, message) => {
    // 获取上一版本的条目档案和公开条目
    let [previousRecord, anime] = await Promise.all([
      AnimeRecord.findOne({
        where: {
          entryId: record.entryId,
          status: history
        },
        order: [['auditedAt', 'DESC']]
      }),
      Anime.findOne({ where: { entryId: record.entryId } })
    ])
    // 检测上一版本条目是否存在
    if(!previousRecord) throw new APIError('audit:no_entry', '亲，已经退无可退了啦')

    const t = await db.transaction()
    try {
      // 准备数据
      const data = prepareEntryDataForAnime(record.entryId, previousRecord, record)
      // 更新anime实例
      anime.chineseName     = previousRecord.chineseName
      anime.foreignName     = previousRecord.foreignName
      anime.typeMedium      = previousRecord.typeMedium
      anime.typeSource      = previousRecord.typeSource
      anime.officialUrl     = previousRecord.officialUrl
      anime.intro           = previousRecord.intro
      anime.earliestYear    = data.earliestYear
      anime.earliestMonth   = data.earliestMonth
      anime.earliestDay     = data.earliestDay
      // 更新record实例
      record.auditorId      = adminId
      record.auditorMessage = message
      record.auditedAt      = Date.now()
      record.status         = fail
      // 更新oldRecord实例
      previousRecord.status = success
      // 先判断是否是新鲜数据，如果是新鲜数据, 则需要先删除旧数据
      const options = {
        where: {
          entryId: record.entryId,
        },
        transaction: t
      }
      await Promise.all([
        data.flagOtherNames ? AnimeOtherName.destroy(options) : null,
        data.flagTypeGenres ? AnimeTypeGenre.destroy(options) : null,
        data.flagRegions ? AnimeRegion.destroy(options) : null,
        data.flagReleaseDates ? AnimeReleaseDate.destroy(options) : null,
        data.flagCopyrights ? AnimeCopyright.destroy(options) : null,
        data.flagStaffs ? AnimeStaff.destroy(options) : null,
        data.flagCasts ? AnimeCast.destroy(options) : null
      ])
      await Promise.all([
        // 插入新鲜数据，如果是旧数据，则data对应的数据是空数组，因此插入前不需要判断新数据还是旧数据，可直接插入
        AnimeOtherName.bulkCreate(data.otherNames, { transaction: t }),
        AnimeTypeGenre.bulkCreate(data.typeGenres, { transaction: t }),
        AnimeRegion.bulkCreate(data.regions, { transaction: t }),
        AnimeReleaseDate.bulkCreate(data.releaseDates, { transaction: t }),
        AnimeCopyright.bulkCreate(data.copyrights, { transaction: t }),
        AnimeStaff.bulkCreate(data.staffs, { transaction: t }),
        AnimeCast.bulkCreate(data.casts, { transaction: t }),
        // 还有保存实例
        anime.save({ transaction: t }),
        record.save({ transaction: t }),
        previousRecord.save({ transaction: t })
      ])
      // 最后处理封面图片，保证事务一致性
      await rollbackAnimeCover(previousRecord.coverUrl, record.coverUrl, record.entryId)
      await t.commit()
    } catch (err) {
      await t.rollback()
      LOGABLE && console.log(err.message)
      throw new APIError('internal:unknown_error', '亲，系统出错了, 请联系客服或稍后重试')
    }
  },
  
  /** 永久删除条目档案
   * @param {Object}record 动画条目档案sequelize实例数据
   */
  deleteAnimeEntry: async (record) => {
    // 处理封面图片
    await deleteCover(record.coverUrl, record.recordId)
    await record.destroy()
  }
}

/** 准备插入各类动画相关的表中的数据
 * @param {Number}entryId 条目id
 * @param {Object}newRecord 即将要插入的动画条目档案数据
 * @param {Object}oldRecord 旧的动画条目档案数据，更新条目数据需要用到
 * @return {Object} 准备好的数据
 */
function prepareEntryDataForAnime (entryId, newRecord, oldRecord = {}) {
  let data = {
    // 后续操作根据flag来判断是否需要更新表
    flagOtherNames: newRecord.otherNames !== oldRecord.otherNames,
    flagTypeGenres: newRecord.typeGenres !== oldRecord.typeGenres,
    flagRegions: newRecord.regions !== oldRecord.regions,
    flagReleaseDates: newRecord.releaseDates !== oldRecord.releaseDates,
    flagCopyrights: newRecord.copyrights !== oldRecord.copyrights,
    flagStaffs: newRecord.staffs !== oldRecord.staffs,
    flagCasts: newRecord.casts !== oldRecord.casts,
    otherNames: [],
    typeGenres: [],
    regions: [],
    releaseDates: [],
    copyrights: [],
    staffs: [],
    casts: [],
    earliestYear: defaultReleaseDate.year,
    earliestMonth: defaultReleaseDate.month,
    earliestDay: defaultReleaseDate.day
  }

  // 数据准备，后续要插入各种anime表，如果存在有效数据且数据是新鲜的则准备数据
  // 如果数据为空，或者数据没有变化（旧数据）则跳过
  if (newRecord.otherNames && data.flagOtherNames) {
    newRecord.otherNames.split('|').forEach(otherName => data.otherNames.push({
      entryId,
      otherName
    }))
  }
  if (newRecord.typeGenres && data.flagTypeGenres) {
    newRecord.typeGenres.split('|').forEach(typeId => data.typeGenres.push({
      entryId,
      typeId
    }))
  }
  if (newRecord.regions && data.flagRegions) {
    newRecord.regions.split('|').forEach(regionId => data.regions.push({
      entryId,
      regionId
    }))
  }
  if (newRecord.releaseDates && data.flagReleaseDates) {
    newRecord.releaseDates.split('|').forEach(releaseDate => {
      // 将数字字符串转换为数字，非数字字符串不用转换。isNaN 会将空字符串也当作数字
      let d = releaseDate.split('-').map(i => (isNaN(i) || i === '') ? i : Number(i))
      // 获取最早播放日期
      const isLeftDateEarlier = compareDate({
        year: d[0],
        month: d[1],
        day: d[2]
      }, {
        year: data.earliestYear,
        month: data.earliestMonth,
        day: data.earliestDay
      })
      if (isLeftDateEarlier) {
        data.earliestYear = d[0]
        data.earliestMonth = d[1]
        data.earliestDay = d[2]
      }
      data.releaseDates.push({
        entryId,
        year: d[0],
        month: d[1],
        day: d[2],
        region: d[3]
      })
    })
  }
  if (newRecord.copyrights && data.flagCopyrights) {
    newRecord.copyrights.split('|').forEach(websiteId => data.copyrights.push({
      entryId,
      websiteId
    }))
  }
  if (newRecord.staffs && data.flagStaffs) {
    newRecord.staffs.split('|').forEach(staff => {
      const s = staff.split(':')
      data.staffs.push({
        entryId,
        positionName: s[0],
        personId: s[1] || 0,
        personName: s[2]
      })
    })
  }
  if (newRecord.casts && data.flagCasts) {
    newRecord.casts.split('|').forEach(cast => {
      const c = cast.split(':')
      data.casts.push({
        entryId,
        characterId: c[0] || 0,
        characterName: c[1],
        personId: c[2] || 0,
        personName: c[3]
      })
    })
  }
  
  return data
}

/** 统计公开动画条目的评分数据
 * @param {Number}entryId 条目id
 * @return {Object} 准备好的数据
 */
async function countAnimeVotes (entryId) {
  return await AnimeVote.findOne({
    raw: true,
    attributes: [
      [db.fn('IFNULL', db.fn('AVG', db.col('score_story')), 0), 'scoreStory'],
      [db.fn('IFNULL', db.fn('AVG', db.col('score_character')), 0), 'scoreCharacter'],
      [db.fn('IFNULL', db.fn('AVG', db.col('score_make')), 0), 'scoreMake'],
      [db.fn('IFNULL', db.fn('AVG', db.col('score_show')), 0), 'scoreShow'],
      [db.fn('IFNULL', db.fn('AVG', db.col('score_music')), 0), 'scoreMusic'],
      [
        // 注意下面的调用中的括号！
        db.literal(`(
          SELECT COUNT(*)
          FROM anime_votes
          WHERE
            entry_id = ${entryId}
            AND
            recommend = ${yes}
        )`),
        'numberRecommends'
      ],
      [db.fn('COUNT', db.col('*')), 'numberScores']
    ],
    where: { entryId }
  })
}
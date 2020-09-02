const APIError = require('@/rest').APIError
const {
  PersonRecord,
  Person,
  PersonOtherName,
  PersonMember
} = require('@/model')
const {
  recordStatus: { success, history, fail, closed },
  defaultReleaseDate,
  valueOfRecommendStatus: { yes }
} = require('@/config/business-data')
const db = require('@/config/db')
const {
  addPersonCover,
  updatePersonCover,
  closePersonCover,
  openPersonCover,
  rollbackPersonCover,
  deleteCover
} = require('@/config/oss')

module.exports = {
  /** 添加条目，将数据库中的条目审核表中的数据插入到各类人物相关的表中
   * @param {Object}record 人物审核条目sequelize实例数据
   * @param {Number}auditorId 审核员Id
   */
  addPersonEntry: async (record, auditorId) => {
    const t = await db.transaction()
    try {
      // 先插入Person表获取entryId
      let person = await Person.create(record.dataValues, {
        transaction: t,
        fields: ['typePerson', 'chineseName', 'foreignName', 'birthday', 'birthplace', 'intro']
      })
      // 处理封面图片
      const coverUrl = await addPersonCover(record.coverUrl, record.recordId, person.entryId)
      // 准备数据
      const data = prepareEntryDataForPerson(person.entryId, record)
      // 更新record实例
      record.entryId    = person.entryId
      record.coverUrl   = coverUrl
      record.auditorId  = auditorId
      record.auditedAt  = Date.now()
      record.status     = success
      // 批量插入
      await Promise.all([
        PersonOtherName.bulkCreate(data.otherNames, { transaction: t }),
        PersonMember.bulkCreate(data.members, { transaction: t }),
        record.save({ transaction: t })
      ])
      await t.commit()
    } catch (err) {
      await t.rollback()
      LOGABLE && console.log(err.message)
      throw new APIError('internal:unknown_error', '亲，系统出错了，请联系客服或稍后重试')
    }
  },
  
  /** 更新条目，将数据库中的条目审核表中的数据更新到各类人物相关的表中
   * @param {Object}record 人物审核条目sequelize实例数据
   * @param {Number}auditorId 审核员Id
   */
  updatePersonEntry: async (record, auditorId) => {
    // 获取该人物公开版本（即审核成功）的审核条目和公开条目
    let [oldRecord, person] = await Promise.all([
      PersonRecord.findOne({ where: { entryId: record.entryId, status: success } }),
      Person.findOne({ where: { entryId: record.entryId } })
    ])
    // 检测旧条目或公开条目是否存在（如果被下架了旧条目就找不到了）
    if(!oldRecord || !person) throw new APIError('audit:no_entry', '亲，要修改的条目不存在或被下架了')

    const t = await db.transaction()
    try {
      // 处理封面图片
      const coverUrl = await updatePersonCover(record.coverUrl, record.recordId, record.entryId)
      // 准备数据
      const data = prepareEntryDataForPerson(record.entryId, record, oldRecord)
      // 更新person实例
      person.typePerson     = record.typePerson
      person.chineseName    = record.chineseName
      person.foreignName    = record.foreignName
      person.birthday       = record.birthday
      person.birthplace     = record.birthplace
      person.intro          = record.intro
      // 更新record实例
      record.coverUrl        = coverUrl
      record.auditorId       = auditorId
      record.auditedAt       = Date.now()
      record.status          = success
      // 更新oldRecord实例
      oldRecord.status       = history
      // 先判断是否是新鲜数据，如果是新鲜数据, 则需要先删除旧数据
      const options = {
        where: {
          entryId: record.entryId,
        },
        transaction: t
      }
      await Promise.all([
        data.flagOtherNames ? PersonOtherName.destroy(options) : null,
        data.flagMembers ? PersonMember.destroy(options) : null
      ])
      await Promise.all([
      // 插入新鲜数据，如果是旧数据，则data对应的数据是空数组，因此插入前不需要判断新数据还是旧数据，可直接插入
        PersonOtherName.bulkCreate(data.otherNames, { transaction: t }),
        PersonMember.bulkCreate(data.members, { transaction: t }),
      // 还有保存实例
        person.save({ transaction: t }),
        record.save({ transaction: t }),
        oldRecord.save({ transaction: t })
      ])
      await t.commit()
    } catch (err) {
      await t.rollback()
      LOGABLE && console.log(err.message)
      throw new APIError('internal:unknown_error', '亲，系统出错了, 请联系客服或稍后重试')
    }
  },
  
  /** 下架已公开的条目
   * @param {Object}record 人物条目档案sequelize实例数据
   * @param {Number}adminId 管理员Id
   * @param {String}message 备注
   */
  closePersonEntry: async (record, adminId, message) => {
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
        Person.destroy(options),
        PersonOtherName.destroy(options),
        PersonMember.destroy(options),
        // 保存实例
        record.save({ transaction: t })
      ])
      // 最后处理封面图片，保证事务一致性
      await closePersonCover(record.entryId)
      await t.commit()
    } catch (err) {
      await t.rollback()
      LOGABLE && console.log(err.message)
      throw new APIError('internal:unknown_error', '亲，系统出错了，请联系客服或稍后重试')
    }
  },
  
  /** 重新上架已下架的条目，将数据库中的条目审核表中的数据插入到各类人物相关的表中
   * @param {Object}record 人物条目档案sequelize实例数据
   * @param {Number}adminId 管理员Id
   * @param {String}message 备注
   */
  openPersonEntry: async (record, adminId, message = '') => {
    const t = await db.transaction()
    try {
      // 先插入Person表获取entryId
      let person = await Person.create(record.dataValues, {
        fields: ['entryId', 'typePerson', 'chineseName', 'foreignName', 'birthday', 'birthplace', 'intro'],
        transaction: t
      })
      // 准备数据
      const data = prepareEntryDataForPerson(record.entryId, record)
      // 更新record实例
      record.auditorId        = adminId
      record.auditorMessage   = message
      record.auditedAt        = Date.now()
      record.status           = success
      // 批量插入
      await Promise.all([
        PersonOtherName.bulkCreate(data.otherNames, { transaction: t }),
        PersonMember.bulkCreate(data.members, { transaction: t }),
        record.save({ transaction: t })
      ])
      // 最后处理封面图片，保证事务一致性
      await openPersonCover(record.recordId, record.entryId)
      await t.commit()
    } catch (err) {
      await t.rollback()
      LOGABLE && console.log(err.message)
      throw new APIError('internal:unknown_error', '亲，系统出错了，请联系客服或稍后重试')
    }
  },
  
  /** 回滚已公开的条目
   * @param {Object}record 人物条目档案sequelize实例数据
   * @param {Number}adminId 管理员Id
   * @param {String}message 备注
   */
  rollbackPersonEntry: async (record, adminId, message) => {
    // 获取上一版本的条目档案和公开条目
    let [previousRecord, person] = await Promise.all([
      PersonRecord.findOne({
        where: {
          entryId: record.entryId,
          status: history
        },
        order: [['auditedAt', 'DESC']]
      }),
      Person.findOne({ where: { entryId: record.entryId } })
    ])
    // 检测上一版本条目是否存在
    if(!previousRecord) throw new APIError('audit:no_entry', '亲，已经退无可退了啦')

    const t = await db.transaction()
    try {
      // 准备数据
      const data = prepareEntryDataForPerson(record.entryId, previousRecord, record)
      // 更新person实例
      person.typePerson     = previousRecord.typePerson
      person.chineseName    = previousRecord.chineseName
      person.foreignName    = previousRecord.foreignName
      person.birthday       = previousRecord.birthday
      person.birthplace     = previousRecord.birthplace
      person.intro          = previousRecord.intro
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
        data.flagOtherNames ? PersonOtherName.destroy(options) : null,
        data.flagMembers ? PersonMember.destroy(options) : null
      ])
      await Promise.all([
        // 插入新鲜数据，如果是旧数据，则data对应的数据是空数组，因此插入前不需要判断新数据还是旧数据，可直接插入
        PersonOtherName.bulkCreate(data.otherNames, { transaction: t }),
        PersonMember.bulkCreate(data.members, { transaction: t }),
        // 还有保存实例
        person.save({ transaction: t }),
        record.save({ transaction: t }),
        previousRecord.save({ transaction: t })
      ])
      // 最后处理封面图片，保证事务一致性
      await rollbackPersonCover(previousRecord.coverUrl, record.coverUrl, record.entryId)
      await t.commit()
    } catch (err) {
      await t.rollback()
      LOGABLE && console.log(err.message)
      throw new APIError('internal:unknown_error', '亲，系统出错了, 请联系客服或稍后重试')
    }
  },
  
  /** 永久删除条目档案
   * @param {Object}record 人物条目档案sequelize实例数据
   */
  deletePersonEntry: async (record) => {
    // 处理封面图片
    await deleteCover(record.coverUrl, record.recordId)
    await record.destroy()
  }
}

/** 准备插入各类人物相关的表中的数据
 * @param {Number}entryId 条目id
 * @param {Object}newRecord 即将要插入的人物审核条目数据
 * @param {Object}oldRecord 旧的人物审核条目数据，更新条目数据需要用到
 * @return {Object} 准备好的数据
 */
function prepareEntryDataForPerson (entryId, newRecord, oldRecord = {}) {
  let data = {
    // 后续操作根据flag来判断是否需要更新表
    flagOtherNames: newRecord.otherNames !== oldRecord.otherNames,
    flagMembers: newRecord.members !== oldRecord.members,
    otherNames: [],
    members: []
  }

  // 数据准备，后续要插入各种person表，如果存在有效数据且数据是新鲜的则准备数据
  // 如果数据为空，或者数据没有变化（旧数据）则跳过
  if (newRecord.otherNames && data.flagOtherNames) {
    newRecord.otherNames.split('|').forEach(otherName => data.otherNames.push({
      entryId,
      otherName
    }))
  }
  if (newRecord.members && data.flagMembers) {
    newRecord.members.split('|').forEach(member => {
      const m = member.split(':')
      data.members.push({
        entryId,
        positionName: s[0],
        personId: s[1] || 0,
        personName: s[2]
      })
    })
  }
  
  return data
}
const APIError = require('@/rest').APIError
const {
  AnimeRecord,
  Anime
} = require('@/model')
const { recordStatus: { success } } = require('@/config/business-data')

module.exports = {
  // 获取公开的动画条目，公共资源
  'GET /api/public/entry/animes/:id': async (ctx, next) => {
    const entryId = ctx.params.id
    let entry = await AnimeRecord.findOne({
      raw: true,
      attributes: [ 'recordId', 'entryId', 'coverUrl', 'chineseName',
                    'foreignName', 'otherNames', 'typeMedium', 'typeSource',
                    'typeGenres', 'regions', 'releaseDates', 'officialUrl',
                    'copyrights', 'intro', 'staffs', 'casts' ],
      where: {
        entryId,
        status: success
      }
    })
    if (entry) {
      ctx.rest(entry)
    } else {
      throw new APIError('entry:anime_not_found', '亲，没有该动画条目哦~')
    }
  },
  
  // 获取公开动画条目的评分相关信息，公共资源
  'GET /api/public/animes/score/:id': async (ctx, next) => {
    const entryId = ctx.params.id
    let anime = await Anime.findOne({
      raw: true,
      attributes: [ 'entryId', 'earliestYear', 'earliestMonth', 'earliestDay',
                    'scoreStory', 'scoreCharacter', 'scoreMake', 'scoreShow',
                    'scoreMusic', 'scoreAvg', 'numberRecommends', 'numberScores' ],
      where: { entryId }
    })
    if (anime) {
      // sequelize将 DECIMAL 类型作为字符串返回
      anime.scoreStory = Number(anime.scoreStory)
      anime.scoreCharacter = Number(anime.scoreCharacter)
      anime.scoreMake = Number(anime.scoreMake)
      anime.scoreShow = Number(anime.scoreShow)
      anime.scoreMusic = Number(anime.scoreMusic)
      anime.scoreAvg = Number(anime.scoreAvg)
      ctx.rest(anime)
    } else {
      throw new APIError('entry:anime_not_found', '亲，没有该动画条目哦~')
    }
  }
}
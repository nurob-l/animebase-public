const APIError = require('@/rest').APIError
const model = require('@/model')
const { valueOfReviewStatus: { wantToWatch, haveWatched }} = require('@/config/business-data')
const { compareDate } = require('@/config/business-logic')
const db = require('@/config/db')
const { checkPermission } = require('@/libs/auth')

const Anime = model.Anime
const AnimeVote = model.AnimeVote
const AnimeReview = model.AnimeReview

module.exports = {
  // 保存动画短评，角色资源
  'POST /api/review/animes': async (ctx, next) => {
    const review = ctx.request.body
    const user = ctx.state.user
    // 检查权限
    if(!(await checkPermission(user.userId, 'POST /api/review/animes'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    // 检查动画条目是否存在
    const anime = Anime.findOne({ where: { entryId: review.entryId }})
    if (!anime) throw new APIError('review:bad_params', '参数错误')
    // 检查动画条目是否开放评分
    const now = new Date()
    const isScoreOpen = !compareDate({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate()
    }, {
      year: anime.earliestYear,
      month: anime.earliestMonth,
      day: anime.earliestDay
    })
    // 评分未开放但评论状态却是“看过”
    if (!isScoreOpen && review.status === haveWatched) throw new APIError('review:bad_params', '作品尚未放送/上映呢，请问亲是怎么偷跑的，介绍一下？')
    
    // 设置where条件
    const where = {
      entryId: review.entryId,
      userId: user.userId
    }
    const t = await db.transaction()
    try {
      review.userId = user.userId
      const {
        entryId, userId, status, content,
        scoreStory, scoreCharacter, scoreMake, scoreShow, scoreMusic, recommend
      } = review
      await Promise.all([
        // upsert无法使用fileds配置
        AnimeReview.upsert({ entryId, userId, status, content }, { where, transaction: t }),
        // 如果状态为“想看”，需要检测数据库中是否已存在评分记录，有的话要删掉
        review.status === wantToWatch
          ? await AnimeVote.destroy({ where, limit: 1, transaction: t })
          : (recommend // 如果没有填写评分则不用插入
            ? await AnimeVote.upsert({ entryId, userId, scoreStory, scoreCharacter, scoreMake, scoreShow, scoreMusic, recommend }, { where, transaction: t })
            : null)
      ])
      await t.commit()
      ctx.rest({
        code: 'review:save_success',
        message: '保存成功'
      })
    } catch (err) {
      await t.rollback()
      LOGABLE && console.log(err.message)
      throw new APIError('internal:unknown_error', '保存失败，请稍后再试')
    }
  },
  
  // 获取用户自己的动画评论，角色资源
  'GET /api/review/animes/:id': async (ctx, next) => {
    const id = ctx.params.id
    const user = ctx.state.user
    
    // 检查权限
    if(!(await checkPermission(user.userId, 'GET /api/review/animes/:id'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    
    const where = {
      entryId: id,
      userId: user.userId
    }
    let review = await AnimeReview.findOne({
      raw: true,
      attributes: [ 'entryId', 'status', 'content','createdAt' ],
      where
    })
    
    let vote = await AnimeVote.findOne({
      raw: true,
      attributes: [ 'scoreStory', 'scoreCharacter', 'scoreMake',
                    'scoreShow', 'scoreMusic', 'recommend' ],
      where
    })
    ctx.rest(Object.assign(review || {}, vote || {}))
  },
  
  // 删除用户自己的动画评论，角色资源
  'DELETE /api/review/animes/:id': async (ctx, next) => {
    const id = ctx.params.id
    const user = ctx.state.user
    
    // 检查权限
    if(!(await checkPermission(user.userId, 'DELETE /api/review/animes/:id'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    
    const where = {
      entryId: id,
      userId: user.userId
    }
    const t = await db.transaction()
    try {
      await AnimeVote.destroy({ where, limit: 1, transaction: t })
      await AnimeReview.destroy({ where, limit: 1, transaction: t })
      await t.commit()
      ctx.rest({
        code: 'review:delete_success',
        message: '删除成功'
      })
    } catch(err) {
      await t.rollback()
      LOGABLE && console.log(err.message)
      throw new APIError('internal:unknown_error', '删除失败，请稍后再试')
    }
  }
}
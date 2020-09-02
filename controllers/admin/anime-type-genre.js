const APIError = require('@/rest').APIError
const { AnimeTypeGenre } = require('@/model')
const { checkPermission } = require('@/libs/auth')

module.exports = {
  // 管理员获取动画题材表
  'GET /api/admin/anime-type-genres': async (ctx, next) => {
    const user = ctx.state.user
    // 检查权限
    if (!(await checkPermission(user.userId, 'GET /api/admin/anime-type-genres'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    const { pageSize, currentPage } = ctx.request.query
    
    const { count, rows } = await AnimeTypeGenre.findAndCountAll({
      raw: true,
      limit: parseInt(pageSize),
      offset: (currentPage - 1) * pageSize,
      order: [['entryId', 'DESC']]
    })
    ctx.rest({ count, rows })
  }
}
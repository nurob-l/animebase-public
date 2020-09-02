const APIError = require('@/rest').APIError
const { DictionaryPosition } = require('@/model')
const { checkPermission } = require('@/libs/auth')
const db = require('@/config/db')

module.exports = {
  // 管理员获取职位词典
  'GET /api/admin/dictionary-positions': async (ctx, next) => {
    const user = ctx.state.user
    // 检查权限
    if (!(await checkPermission(user.userId, 'GET /api/admin/dictionary-positions'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    const { searchContent, pageSize, currentPage } = ctx.request.query
    const where = searchContent
      ? {
          [db.Op.or]: [{
            cn: { [db.Op.substring]: searchContent }
          }, {
            jp: { [db.Op.substring]: searchContent }
          }]
        }
      : null
    
    const { count, rows } = await DictionaryPosition.findAndCountAll({
      raw: true,
      where,
      limit: parseInt(pageSize),
      offset: (currentPage - 1) * pageSize,
      order: [['id', 'DESC']]
    })
    ctx.rest({ count, rows })
  },
  
  // 管理员添加职位词典
  'POST /api/admin/dictionary-positions': async (ctx, next) => {
    const user = ctx.state.user
    // 检查权限
    if (!(await checkPermission(user.userId, 'POST /api/admin/dictionary-positions'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    const data = ctx.request.body
    
    try {
      await DictionaryPosition.create(data, {
        fields: ['cn', 'jp']
      })

      ctx.rest({
        code: 'add:success',
        message: '添加成功'
      })
    } catch (err) {
      LOGABLE && console.error(err)
      throw new APIError('add:fail', '添加失败')
    }
  },
  
  // 管理员更新职位词典
  'PUT /api/admin/dictionary-positions/:id': async (ctx, next) => {
    const id = ctx.params.id
    const user = ctx.state.user
    // 检查权限
    if (!(await checkPermission(user.userId, 'PUT /api/admin/dictionary-positions/:id'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    const data = ctx.request.body
    
    try {
      await DictionaryPosition.update(data, {
        where: { id },
        fields: ['cn', 'jp'],
        limit: 1
      })
      
      ctx.rest({
        code: 'update:success',
        message: '更新成功'
      })
    } catch (err) {
      LOGABLE && console.error(err)
      throw new APIError('update:fail', '更新失败')
    }
  },
  
  // 管理员删除职位词典
  'DELETE /api/admin/dictionary-positions/:id': async (ctx, next) => {
    const id = ctx.params.id
    const user = ctx.state.user
    // 检查权限
    if (!(await checkPermission(user.userId, 'DELETE /api/admin/dictionary-positions/:id'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    
    try {
      await DictionaryPosition.destroy({
        where: { id },
        limit: 1
      })
      
      ctx.rest({
        code: 'delete:success',
        message: '删除成功'
      })
    } catch (err) {
      LOGABLE && console.error(err)
      throw new APIError('delete:fail', '删除失败')
    }
  }
}
const APIError = require('@/rest').APIError
const { PersonRecord } = require('@/model')
const { checkPermission } = require('@/libs/auth')
const { openPersonEntry, closePersonEntry, rollbackPersonEntry, deletePersonEntry } = require('@/libs/person')
const { recordStatus: { success, closed }} = require('@/config/business-data')

module.exports = {
  // 管理员获取人物档案表
  'GET /api/admin/person-records': async (ctx, next) => {
    const user = ctx.state.user
    // 检查权限
    if (!(await checkPermission(user.userId, 'GET /api/admin/person-records'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    const { status, pageSize, currentPage } = ctx.request.query
    const where = status ? { status } : {}
    
    const { count, rows } = await PersonRecord.findAndCountAll({
      raw: true,
      attributes: [ 'recordId', 'entryId', 'chineseName', 'foreignName',
                    'submitterId', 'submittedAt', 'submitterMessage', 'auditorId',
                    'auditedAt', 'auditorMessage', 'status' ],
      where,
      limit: parseInt(pageSize),
      offset: (currentPage - 1) * pageSize,
      order: [['updatedAt', 'DESC']]
    })
    ctx.rest({ count, rows })
  },
  
  // 管理员根据档案id获取人物档案表记录
  'GET /api/admin/person-records/:id': async (ctx, next) => {
    const recordId = ctx.params.id
    const user = ctx.state.user
    // 检查权限
    if (!(await checkPermission(user.userId, 'GET /api/admin/person-records/:id'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    
    let entry = await PersonRecord.findOne({
      raw: true,
      attributes: [ 'recordId', 'entryId', 'typePerson', 'coverUrl',
                    'chineseName', 'foreignName', 'otherNames', 'birthday',
                    'birthplace', 'intro', 'members', 'submitterMessage' ],
      where: { recordId }
    })
     
    ctx.rest(entry)
  },
  
  // 管理员下架已公开的人物条目
  'PUT /api/admin/person-records/:id/close': async (ctx, next) => {
    const recordId = ctx.params.id
    const user = ctx.state.user
    // 检查权限
    if (!(await checkPermission(user.userId, 'PUT /api/admin/person-records/:id/close'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    const { message } = ctx.request.body
    // 检查message合法性
    if (!message.trim()) throw new APIError('admin:invalid_data', '亲，数据格式不对哦')
    // 条目必须是已通过（即公开）状态才能下架
    let record = await PersonRecord.findOne({ where: { recordId, status: success } })
    if (!record) throw new APIError('admin:no_entry', '亲，条目不存在哦')
    
    await closePersonEntry(record, user.userId, message)
    
    ctx.rest({
      code: 'admin:success',
      message: '下架成功'
    })
  },
  
  // 管理员重新上架已下架的人物条目
  'PUT /api/admin/person-records/:id/open': async (ctx, next) => {
    const recordId = ctx.params.id
    const user = ctx.state.user
    // 检查权限
    if (!(await checkPermission(user.userId, 'PUT /api/admin/person-records/:id/open'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    // 条目必须是已下架状态才能上架
    let record = await PersonRecord.findOne({ where: { recordId, status: closed } })
    if (!record) throw new APIError('admin:no_entry', '亲，条目不存在哦')
    
    await openPersonEntry(record, user.userId, '重新上架')
    
    ctx.rest({
      code: 'admin:success',
      message: '上架成功'
    })
  },
  
  // 管理员回滚已公开的人物条目
  'PUT /api/admin/person-records/:id/rollback': async (ctx, next) => {
    const recordId = ctx.params.id
    const user = ctx.state.user
    // 检查权限
    if (!(await checkPermission(user.userId, 'PUT /api/admin/person-records/:id/rollback'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    const { message } = ctx.request.body
    // 检查message合法性
    if (!message.trim()) throw new APIError('admin:invalid_data', '亲，数据格式不对哦')
    // 条目必须是已通过（即公开）状态才能回滚
    let record = await PersonRecord.findOne({ where: { recordId, status: success } })
    if (!record) throw new APIError('admin:no_entry', '亲，条目不存在哦')
    
    await rollbackPersonEntry(record, user.userId, message)
    
    ctx.rest({
      code: 'admin:success',
      message: '回滚成功'
    })
  },
  
  // 管理员删除非公开的人物条目档案
  'PUT /api/admin/person-records/:id/delete': async (ctx, next) => {
    const recordId = ctx.params.id
    const user = ctx.state.user
    // 检查权限
    if (!(await checkPermission(user.userId, 'PUT /api/admin/person-records/:id/delete'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    // 条目必须是非公开状态才能删除
    let record = await PersonRecord.findOne({ where: { recordId } })
    if (!record) throw new APIError('admin:no_entry', '亲，条目不存在哦')
    // 检测条目是否是非公开状态
    if (record.status === success) throw new APIError('admin:wrong_status', '注意，公开条目不允许删除！若必须删除请先下架！')
    
    await deletePersonEntry(record)
    
    ctx.rest({
      code: 'admin:success',
      message: '删除成功'
    })
  }
}
const APIError = require('@/rest').APIError
const { PersonRecord } = require('@/model')
const { checkPermission } = require('@/libs/auth')
const { addPersonEntry, updatePersonEntry } = require('@/libs/person')
const { recordStatus: { pending, success, fail } } = require('@/config/business-data')

module.exports = {
  // 审核通过人物条目
  'PUT /api/audit/persons/:id/approve': async (ctx, next) => {
    const recordId = ctx.params.id
    const user = ctx.state.user
    // 检查权限
    if (!(await checkPermission(user.userId, 'PUT /api/audit/persons/:id/approve'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }

    let record = await PersonRecord.findOne({ where: { recordId } })
    if (!record) throw new APIError('audit:no_entry', '亲，条目不存在哦')
    // 检测条目是否是待审核状态
    if (record.status !== pending) throw new APIError('audit:wrong_status', '亲，该条目已被审核了呢')
    
    // 判断是添加条目还是更新条目
    if (record.entryId) {
      await updatePersonEntry(record, user.userId)
    } else {
      await addPersonEntry(record, user.userId)
    }
    
    ctx.rest({
      code: 'audit:success',
      message: '审核成功'
    })
  },
  
  // 审核不通过人物条目
  'PUT /api/audit/persons/:id/deny': async (ctx, next) => {
    const recordId = ctx.params.id
    const user = ctx.state.user
    // 检查权限
    if (!(await checkPermission(user.userId, 'PUT /api/audit/persons/:id/deny'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    const { auditorMessage } = ctx.request.body
    // 检查auditorMessage合法性
    if (!auditorMessage.trim()) throw new APIError('audit:invalid_data', '亲，数据格式不对哦')
    
    let record = await PersonRecord.findOne({ where: { recordId } })
    if (!record) throw new APIError('audit:no_entry', '亲，条目不存在哦')
    // 检测条目是否是待审核状态
    if (record.status !== pending) throw new APIError('audit:wrong_status', '亲，该条目已被审核了呢')
    
    record.auditorId = user.userId
    record.auditedAt = Date.now()
    record.auditorMessage = auditorMessage
    record.status = fail
    await record.save()
    
    ctx.rest({
      code: 'audit:success',
      message: '审核成功'
    })
  }
}
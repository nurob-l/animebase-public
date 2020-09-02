const APIError = require('@/rest').APIError
const {
  AnimeRecord,
  PersonRecord
} = require('@/model')
const { checkPermission } = require('@/libs/auth')
const { recordStatus: { pending } } = require('@/config/business-data')

module.exports = {
  // 审核员根据审核状态获取动画条目审核列表
  'GET /api/audit/animes': async (ctx, next) => {
    const user = ctx.state.user
    // 检查权限
    if(!(await checkPermission(user.userId, 'GET /api/audit/animes'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    const { status, pageSize, currentPage } = ctx.request.query
    
    const { count, rows } = await AnimeRecord.findAndCountAll({
      raw: true,
      attributes: [ 'recordId', 'entryId', 'chineseName', 'foreignName',
                    'submitterId', 'submittedAt', 'submitterMessage', 'auditorId',
                    'auditedAt', 'auditorMessage', 'status' ],
      where: { status },
      limit: parseInt(pageSize),
      offset: (currentPage - 1) * pageSize,
      order: [
        Number(status) === pending
          ? ['submittedAt', 'ASC']
          : ['auditedAt', 'DESC']
      ]
    })
    ctx.rest({ count, rows })
  },
  
  // 审核员根据审核状态获取人物条目审核列表
  'GET /api/audit/persons': async (ctx, next) => {
    const user = ctx.state.user
    // 检查权限
    if(!(await checkPermission(user.userId, 'GET /api/audit/persons'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    const { status, pageSize, currentPage } = ctx.request.query
    
    const { count, rows } = await PersonRecord.findAndCountAll({
      raw: true,
      attributes: [ 'recordId', 'entryId', 'chineseName', 'foreignName',
                    'submitterId', 'submittedAt', 'submitterMessage', 'auditorId',
                    'auditedAt', 'auditorMessage', 'status' ],
      where: { status },
      limit: parseInt(pageSize),
      offset: (currentPage - 1) * pageSize,
      order: [
        status === pending
          ? ['submittedAt', 'ASC']
          : ['submittedAt', 'DESC']
      ]
    })
    ctx.rest({ count, rows })
  },
  
  // 审核员根据审核id获取动画条目
  'GET /api/audit/animes/:id': async (ctx, next) => {
    const recordId = ctx.params.id
    const user = ctx.state.user
    // 检查权限
    if(!(await checkPermission(user.userId, 'GET /api/audit/animes/:id'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    
    let entry = await AnimeRecord.findOne({
      raw: true,
      attributes: [ 'recordId', 'entryId', 'coverUrl', 'chineseName',
                    'foreignName', 'otherNames', 'typeMedium', 'typeSource',
                    'typeGenres', 'regions', 'releaseDates', 'officialUrl',
                    'copyrights', 'intro', 'staffs', 'casts', 'submitterMessage' ],
      where: { recordId }
    })
     
    ctx.rest(entry)
  },
  
  // 审核员根据审核id获取人物条目
  'GET /api/audit/persons/:id': async (ctx, next) => {
    const recordId = ctx.params.id
    const user = ctx.state.user
    // 检查权限
    if(!(await checkPermission(user.userId, 'GET /api/audit/persons/:id'))) {
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
  }
}
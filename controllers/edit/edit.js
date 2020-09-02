const APIError = require('@/rest').APIError
const {
  AnimeRecord,
  PersonRecord
} = require('@/model')
const { checkPermission } = require('@/libs/auth')

module.exports = {
  // 编辑员获得自己创建的动画条目列表，角色资源
  'GET /api/edit/animes': async (ctx, next) => {
    const user = ctx.state.user
    // 检查权限
    if(!(await checkPermission(user.userId, 'GET /api/edit/animes'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    const { pageSize, currentPage } = ctx.request.query
        
    const { count, rows } = await AnimeRecord.findAndCountAll({
      raw: true,
      attributes: [ 'recordId', 'entryId', 'chineseName', 'foreignName',
                    'submitterMessage', 'auditorMessage', 'status', 'createdAt' ],
      where: { submitterId: user.userId },
      limit: parseInt(pageSize),
      offset: (currentPage - 1) * pageSize,
      order: [ ['recordId', 'DESC'] ]
    })
   
    ctx.rest({ count, rows })
  },
  
  // 编辑员获得自己创建的动画条目列表，角色资源
  'GET /api/edit/persons': async (ctx, next) => {
    const user = ctx.state.user
    // 检查权限
    if(!(await checkPermission(user.userId, 'GET /api/edit/persons'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    const { pageSize, currentPage } = ctx.request.query
        
    const { count, rows } = await PersonRecord.findAndCountAll({
      raw: true,
      attributes: [ 'recordId', 'entryId', 'chineseName', 'foreignName',
                    'submitterMessage', 'auditorMessage', 'status', 'createdAt' ],
      where: { submitterId: user.userId },
      limit: parseInt(pageSize),
      offset: (currentPage - 1) * pageSize,
      order: [ ['recordId', 'DESC'] ]
    })
   
    ctx.rest({ count, rows })
  },
  
  // 编辑员获得自己创建的动画条目，参数id是recordId，角色资源
  'GET /api/edit/animes/:id': async (ctx, next) => {
    const recordId = ctx.params.id
    const user = ctx.state.user
    // 检查权限
    if(!(await checkPermission(user.userId, 'GET /api/edit/animes/:id'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    
    let entry = await AnimeRecord.findOne({
      raw: true,
      attributes: [ 'recordId', 'entryId', 'coverUrl', 'chineseName',
                    'foreignName', 'otherNames', 'typeMedium', 'typeSource',
                    'typeGenres', 'regions', 'releaseDates', 'officialUrl',
                    'copyrights', 'intro', 'staffs', 'casts' ],
      where: {
        recordId,
        submitterId: user.userId
      }
    })
     
    ctx.rest(entry)
  },
  
  // 编辑员获得自己创建的人物条目，参数id是recordId，角色资源
  'GET /api/edit/persons/:id': async (ctx, next) => {
    const recordId = ctx.params.id
    const user = ctx.state.user
    // 检查权限
    if(!(await checkPermission(user.userId, 'GET /api/edit/persons/:id'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    
    let entry = await PersonRecord.findOne({
      raw: true,
      attributes: [ 'recordId', 'entryId', 'typePerson', 'coverUrl',
                    'chineseName', 'foreignName', 'otherNames', 'birthday',
                    'birthplace', 'intro', 'members' ],
      where: {
        recordId,
        submitterId: user.userId
      }
    })
     
    ctx.rest(entry)
  }
}
const APIError = require('@/rest').APIError
const { AnimeRecord, RoleEditor } = require('@/model')
const { recordStatus } = require('@/config/business-data')
const { checkPermission, isEditorSubmitAllowed } = require('@/libs/auth')
const db = require('@/config/db')

const defaultFields = [ 'entryId', 'coverUrl', 'chineseName', 'foreignName',
                        'otherNames', 'typeMedium', 'typeSource', 'typeGenres',
                        'regions', 'releaseDates', 'copyrights', 'officialUrl',
                        'intro', 'staffs', 'casts', 'submitterMessage' ]

module.exports = {
  // 获取用户自己的动画条目草稿，角色资源
  'GET /api/edit/animes/draft': async (ctx, next) => {
    let user = ctx.state.user
    // 检查权限
    if (!(await checkPermission(user.userId, 'GET /api/edit/animes/draft'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    let record = await AnimeRecord.findOne({
      raw: true,
      attributes: defaultFields,
      where: {
        submitterId: user.userId,
        status: recordStatus.draft
      }
    })
    if (record) {
      ctx.rest(record)
    } else {
      throw new APIError('edit:no_draft', '亲，当前已经没有草稿哦')
    }
  },
  
  // 上传动画条目, 保存草稿，角色资源
  'POST /api/edit/animes/save': async (ctx, next) => {
    let user = ctx.state.user
    // 检查权限
    if (!(await checkPermission(user.userId, 'POST /api/edit/animes/save'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    let entryData = ctx.request.body
    // 设置where条件
    const where = {
      submitterId: user.userId,
      status: recordStatus.draft
    }
    try {
      // 创建或更新用户草稿, 同一时间只允许一个用户最多拥有一个草稿
      // 由于where条件不包含主键或唯一约束键，因此不能使用upsert()来创建或更新
      let record = await AnimeRecord.findOne({ where })
      if (record) {
        await AnimeRecord.update(entryData, { 
          where,
          fields: defaultFields,
          limit: 1
        })
      } else {
        entryData.submitterId = user.userId
        entryData.status = recordStatus.draft
        await AnimeRecord.create(entryData, {
          fields: defaultFields.concat(['submitterId', 'status'])
        })
      }

      ctx.rest({
        code: 'edit:save_success',
        message: '保存成功'
      })
    } catch (err) {
      LOGABLE && console.error(err)
      throw new APIError('edit:fail_to_save', '保存失败，可以告诉我或稍后重试一下')
    }
  },
  
  // 提交动画条目，角色资源
  'POST /api/edit/animes/submit': async (ctx, next) => {
    let user = ctx.state.user
    // 检查权限
    if (!(await checkPermission(user.userId, 'POST /api/edit/animes/submit'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    // 检查提交次数
    let editor = await RoleEditor.findOne({ where: { userId: user.userId }})
    if (editor.countSubmit >= editor.maxSubmit) {
      throw new APIError('auth:permission_not_found', '哇！亲，您今天提交了好多，非常感谢您的贡献。今天要不休息一下，明天再提交，好吗？')
    }
    let entryData = ctx.request.body
    // 检查用户数据的合法性
    if (entryData.entryId && !entryData.submitterMessage.trim()) {
      throw new APIError('edit:invalid_data', '亲，数据格式不对哦')
    }
    // 设置where条件
    const where = {
      submitterId: user.userId,
      status: recordStatus.draft
    }
    const t = await db.transaction()
    try {
      let record = await AnimeRecord.findOne({ where })
      if (record) {
        // 设置status
        entryData.status = recordStatus.pending
        entryData.submittedAt = Date.now()
        // 提交次数加1
        editor.countSubmit++
        await Promise.all([
          AnimeRecord.update(entryData, {
            where,
            fields: defaultFields.concat(['submittedAt', 'status']),
            limit: 1,
            transaction: t
          }),
          editor.save({ transaction: t })
        ])
      } else {
        entryData.submitterId = user.userId
        entryData.status = recordStatus.pending
        entryData.submittedAt = Date.now()
        editor.countSubmit++
        await Promise.all([
          AnimeRecord.create(entryData, {
            fields: defaultFields.concat(['submitterId', 'submittedAt', 'status']),
            transaction: t
          }),
          editor.save({ transaction: t })
        ])
      }
      await t.commit()
      ctx.rest({
        code: 'edit:submit_success',
        message: '提交成功'
      })
    } catch (err) {
      await t.rollback()
      LOGABLE && console.error(err)
      throw new APIError('edit:fail_to_submit', '提交失败，可以告诉我或稍后重试一下')
    }
  },
  
  // 删除动画草稿，角色资源
  'DELETE /api/edit/animes/draft': async (ctx, next) => {
    let user = ctx.state.user
    // 检查权限
    if(!(await checkPermission(user.userId, 'DELETE /api/edit/animes/draft'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    const where = {
      submitterId: user.userId,
      status: recordStatus.draft
    }
    let record = await AnimeRecord.findOne({ where })
    if (record) {
      await AnimeRecord.destroy({ where, limit: 1 })
    } else {
      throw new APIError('edit:no_draft', '亲，当前已经没有草稿哦')
    }
    ctx.rest({
      code: 'edit:delete_success',
      message: '删除成功'
    })
  }
}
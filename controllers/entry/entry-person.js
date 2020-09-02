const APIError = require('@/rest').APIError
const {
  PersonRecord
} = require('@/model')
const { recordStatus: { success } } = require('@/config/business-data')

module.exports = {
  // 获取公开的人物条目，公共资源
  'GET /api/public/entry/persons/:id': async (ctx, next) => {
    let id = ctx.params.id
    let entry = await PersonRecord.findOne({
      raw: true,
      attributes: [ 'recordId', 'entryId', 'typePerson', 'coverUrl',
                    'chineseName', 'foreignName', 'otherNames', 'birthday',
                    'birthplace', 'intro', 'members' ],
      where: {
        entryId: id,
        status: success
      }
    })
    if (entry) {
      ctx.rest(entry)
    } else {
      throw new APIError('entry:anime_not_found', '亲，没有该人物条目哦~')
    }
  }
}
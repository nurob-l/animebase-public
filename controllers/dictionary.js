const APIError = require('@/rest').APIError
const {
  DictionaryPosition,
  DictionaryPerson
} = require('@/model')

module.exports = {
  // 获取职位翻译词典，公共资源
  'GET /api/public/dictionary/positions': async (ctx, next) => {
    const dictionary = await DictionaryPosition.findAll({
      raw: true,
      attributes: [ 'cn', 'jp' ]
    })
    ctx.rest(dictionary)
  },
    
  // 获取人名翻译词典，公共资源
  'GET /api/public/dictionary/persons': async (ctx, next) => {
    const dictionary = await DictionaryPerson.findAll({
      raw: true,
      attributes: [ 'cn', 'jp' ]
    })
    ctx.rest(dictionary)
  },
}
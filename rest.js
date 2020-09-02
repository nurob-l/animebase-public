module.exports = {
  // 函数内有this时不能改写为箭头函数
  APIError: function (code, message) {
    this.code = code || 'internal:unknown_error'
    this.message = message || ''
  },

  restify: function (app) {
    //app.context为ctx的原型
    app.context.rest = function (data) {
      this.response.type = 'application/json'
      this.response.body = data
    }
  },

  errorProcessor: () => {
    return async (ctx, next) => {
      try {
        await next()
      } catch (e) {
        if (LOGABLE) {
          console.log(`Process API error...`)
          console.log(`code: ${e.code}`)
          console.log(`message: ${e.message}`)
        }
        ctx.response.status = 400
        ctx.response.type = 'application/json'
        ctx.response.body = {
          code: e.code || 'internal:unknown_error',
          message: e.message || ''
        }
      }
    }
  }
}
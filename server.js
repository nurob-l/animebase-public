const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const koajwt = require('koa-jwt')
require('module-alias/register') // 注册模块路径别名

// 注册全局变量
// 是否允许日志记录
global.LOGABLE = !!process.env.DEBUG_API || process.env.NODE_ENV !== 'production'

const controller = require('./controller')
const rest = require('./rest')
const privateKey = require('./config/private-key')

// const isProd = process.env.NODE_ENV === 'production'
const useMicroCache = process.env.MICRO_CACHE !== 'false'

const server = new Koa()

const resolve = file => path.resolve(__dirname, file)

// bind .rest() for ctx:
rest.restify(server)

// log request URL:
server.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`)
  let start = new Date().getTime()
  let execTime
  await next()
  execTime = new Date().getTime() - start
  ctx.response.set('X-Response-Time', `${execTime}ms`)
})

// parse request body:
server.use(bodyParser())

// rest API 错误处理
server.use(rest.errorProcessor())

// jwt错误处理
server.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    if (err.status === 401) {
      ctx.response.status = 401
      // ctx.body = '您没有登录或者不够权限\n'
      // ctx.response.status = 401
      ctx.response.type = 'application/json'
      ctx.response.body = {
          code: 'auth:fail',
          message: '您没有登录或者不够权限'
      }
    } else {
      throw err
    }
  }
})

server.use(koajwt({
  secret: privateKey.jwt,
  // add the passthrough option to always yield next, even if no valid Authorization header was found
  // passthrough: true
}).unless({ path: [ /^\/api\/public/ ] }))

// REST API 需要jwt身份认证才能访问:
server.use(controller())

const port = process.env.PORT || 3000
server.listen(port)
console.log(`server started at port ${port}...`)
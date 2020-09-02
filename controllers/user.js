const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { APIError } = require('@/rest')
const {
  UserProfile,
  LocalAuth,
  UserRole,
  RoleEditor
} = require('@/model')
const privateKey = require('@/config/private-key')
const { roleIdForNormalUser, roleIdForEditor } = require('@/config/business-data')
const db = require('@/config/db')

module.exports = {
  // 公共资源
  'POST /api/public/signin': async (ctx, next) => {
    let { email, password } = ctx.request.body
    let hash = crypto.createHmac('sha1', privateKey.Hmac)
    
    let localAuth = await LocalAuth.findOne({
      raw: true,
      where: {
        email,
        password: hash.update(password).digest('hex')
      }
    })
    if (!localAuth) throw new APIError('auth:bad_password', '邮箱或密码错误')
    let user = await UserProfile.findOne({
      raw: true,
      where: { userId: localAuth.userId }
    })
    let roles = await UserRole.findAll({
      raw: true,
      attributes: ['roleId'],
      where: { userId: user.userId }
    })
    const token = jwt.sign({
      userId: user.userId,
      username: user.username,
      roles
    }, privateKey.jwt, {
      expiresIn: '24h'
    })
    ctx.rest(token)
  },
  
  // 公共资源
  'POST /api/public/signup': async (ctx, next) => {
    let { email, username, password } = ctx.request.body
    let hash = crypto.createHmac('sha1', privateKey.Hmac)
    // 检测合法性
    let isEmailUsed = await LocalAuth.findOne({ where: { email } })
    if (isEmailUsed) throw new APIError('auth:email_used', '该邮箱已注册')
    let isNameUsed = await UserProfile.findOne({ where: { username } })
    if (isNameUsed) throw new APIError('auth:name_used', '该昵称已被占用')
  
    // 通过检测，启用事务写入数据
    const t = await db.transaction()
    try {
      // 写入UserProfile
      let user = await UserProfile.create({
        username
      }, { transaction: t })
      await Promise.all([
        // 写入LocalAuth
        LocalAuth.create({
          userId: user.userId,
          email,
          password: hash.update(password).digest('hex')
        }, { transaction: t }),
        // 写入UserRole
        UserRole.bulkCreate([{
          userId: user.userId,
          roleId: roleIdForNormalUser
        }, {
          userId: user.userId,
          roleId: roleIdForEditor
        }], { transaction: t }),
        // 写入RoleEditor
        RoleEditor.create({ userId: user.userId }, { transaction: t })
      ])
      // 写入成功，提交事务
      await t.commit()
      console.log('created: ' + JSON.stringify(user))
      // 生成JWT token
      const token = jwt.sign({
        userId: user.userId,
        username: user.username,
        roles: [{ roleId: roleIdForNormalUser }, { roleId: roleIdForEditor }]
      }, privateKey.jwt, {
        expiresIn: '24h'
      })
      ctx.rest(token)
    } catch (err) {
      // 我们回滚事务.
      await t.rollback()
      LOGABLE && console.log(err.message)
      throw new APIError('internal:unknown_error', '亲，系统出错了, 请联系客服或稍后重试')
    }
  },

  // 私人资源
  'GET /api/user/info': async (ctx, next) => {
    // 如果请求带有jwt, 中间件koa-jwt会验证并解析token. 如果token存在则会存进ctx.state.user, 后面的中间件直接使用即可
    const user = ctx.state.user

    ctx.rest(user)
  }
}

/** 检查用户的注册数据是否合法并返回安全的数据，否则返回false值
 * @param {Object}rawData 不安全的数据对象
 * @return {Object/Boolean} 安全的数据对象/false值
 */
// function getValidUserData ({ email, username, password }) {
//   if (!regEmail.test(email)) return false
//   if (!regUsername.test(username)) return false
//   return { email, username, password }
// }

// const regEmail = /^[a-zA-Z0-9_\.\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$/
// const regUsername = /^[a-zA-Z0-9_\-\u4e00-\u9fa5]{2,16}$/
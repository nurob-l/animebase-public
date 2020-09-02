const { getEditSTS } = require('@/config/oss')
const { checkPermission } = require('@/libs/auth')

module.exports = {
  // 获取上传临时封面许可，角色资源
  'GET /api/edit/upload-policy': async (ctx, next) => {
    const user = ctx.state.user
    // 检查权限
    if(!(await checkPermission(user.userId, 'GET /api/edit/upload-policy'))) {
      throw new APIError('auth:permission_not_found', '亲，您当前没有权限哦')
    }
    try {
      // Policy限制用户只能操作自己的文件夹，且只能上传webp文件
      const result = await getEditSTS(user)
      ctx.rest(result)
    } catch (err) {
      LOGABLE && console.log(err)
      throw new APIError('edit:server_error', '连接上传服务器失败, 请重试')
    }
  }
}
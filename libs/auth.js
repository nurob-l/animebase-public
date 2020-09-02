// 用户权限相关函数库
const APIError = require('../rest').APIError
const db = require('@/config/db')

module.exports = {
  // 检查用户是否有操作权限
  checkPermission: async (userId, permissionName) => {
    const statement = '\
      SELECT *\
      FROM user_roles ur INNER JOIN role_permissions rp INNER JOIN permissions p\
      ON ur.role_id = rp.role_id AND rp.permission_id = p.permission_id\
      WHERE ur.user_id = $userId AND p.permission_name = $permissionName\
      LIMIT 1'
    
    let result = await db.query(statement, {
      bind: {
        userId,
        permissionName
      }
    })
    return result.length ? true : false
  }
}
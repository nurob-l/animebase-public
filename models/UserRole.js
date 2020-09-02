const db = require('@/config/db')

module.exports = db.defineModel('user_roles', {
  userId: {
    type: db.INTEGER.UNSIGNED,
    primaryKey: true
  },
  roleId: {
    type: db.INTEGER.UNSIGNED,
    primaryKey: true
  }
})

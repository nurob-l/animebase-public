const db = require('@/config/db')

module.exports = db.defineModel('role_editors', {
  userId: {
    type: db.INTEGER.UNSIGNED,
    primaryKey: true
  },
  maxSubmit: {
    type: db.INTEGER.UNSIGNED,
    defaultValue: 30
  },
  countSubmit: {
    type: db.INTEGER.UNSIGNED,
    defaultValue: 0
  }
})

const db = require('@/config/db')

module.exports = db.defineModel('local_auths', {
  authId: {
    type: db.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: db.INTEGER.UNSIGNED
  },
  email: {
    type: db.STRING(100),
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: db.STRING(40),
  },
  createdAt: {
    type: db.DATE,
    defaultValue: db.NOW
  },
  updatedAt: {
    type: db.DATE,
    defaultValue: db.NOW,
    onUpdate: db.NOW
  }
})

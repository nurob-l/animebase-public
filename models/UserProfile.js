const db = require('@/config/db')

module.exports = db.defineModel('user_profiles', {
  userId: {
    type: db.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: db.STRING(16),
    unique: true,
    validate: {
      len: [2, 16]
    }
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

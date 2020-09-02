const db = require('@/config/db')

module.exports = db.defineModel('dictionary_persons', {
  id: {
    type: db.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  cn: {
    type: db.STRING(50)
  },
  jp: {
    type: db.STRING(50)
  }
})
const db = require('@/config/db')

module.exports = db.defineModel('persons', {
  entryId: {
    type: db.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  typePerson: {
    type: db.INTEGER.UNSIGNED
  },
  chineseName: {
    type: db.STRING(100),
    defaultValue: ''
  },
  foreignName: {
    type: db.STRING(100),
    defaultValue: ''
  },
  birthday: {
    type: db.STRING(10),
    defaultValue: ''
  },
  birthplace: {
    type: db.STRING(30),
    defaultValue: ''
  },
  intro: {
    type: db.STRING(1000),
    defaultValue: ''
  }
})
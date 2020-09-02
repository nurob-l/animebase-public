const db = require('@/config/db')

module.exports = db.defineModel('anime_release_dates', {
  entryId: {
    type: db.INTEGER.UNSIGNED,
    primaryKey: true
  },
  year: {
    type: db.INTEGER.UNSIGNED,
    defaultValue: 9999,
    primaryKey: true
  },
  month: {
    type: db.INTEGER.UNSIGNED,
    defaultValue: 99,
    primaryKey: true
  },
  day: {
    type: db.INTEGER.UNSIGNED,
    defaultValue: 99,
    primaryKey: true
  },
  region: {
    type: db.STRING(20),
    defaultValue: ''
  }
})
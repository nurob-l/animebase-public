const db = require('@/config/db')

module.exports = db.defineModel('person_other_names', {
  entryId: {
    type: db.INTEGER.UNSIGNED,
    primaryKey: true
  },
  otherName: {
    type: db.STRING(100),
    primaryKey: true
  }
})
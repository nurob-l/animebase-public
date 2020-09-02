const db = require('@/config/db')

module.exports = db.defineModel('anime_type_genres', {
  entryId: {
    type: db.INTEGER.UNSIGNED,
    primaryKey: true
  },
  typeId: {
    type: db.INTEGER.UNSIGNED,
    primaryKey: true
  }
})
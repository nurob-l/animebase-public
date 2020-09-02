const db = require('@/config/db')

module.exports = db.defineModel('anime_copyrights', {
  entryId: {
    type: db.INTEGER.UNSIGNED,
    primaryKey: true
  },
  websiteId: {
    type: db.INTEGER.UNSIGNED,
    primaryKey: true
  }
})
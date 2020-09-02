const db = require('@/config/db')

module.exports = db.defineModel('anime_regions', {
  entryId: {
    type: db.INTEGER.UNSIGNED,
    primaryKey: true
  },
  regionId: {
    type: db.INTEGER.UNSIGNED,
    primaryKey: true
  }
})
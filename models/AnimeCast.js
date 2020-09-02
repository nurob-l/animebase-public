const db = require('@/config/db')

module.exports = db.defineModel('anime_casts', {
  id: {
    type: db.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  entryId: {
    type: db.INTEGER.UNSIGNED
  },
  characterId: {
    type: db.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  characterName: {
    type: db.STRING(100),
    defaultValue: ''
  },
  personId: {
    type: db.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  personName: {
    type: db.STRING(100),
    defaultValue: ''
  }
})
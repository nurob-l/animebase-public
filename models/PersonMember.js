const db = require('@/config/db')

module.exports = db.defineModel('person_members', {
  id: {
    type: db.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  entryId: {
    type: db.INTEGER.UNSIGNED
  },
  positionName: {
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
});
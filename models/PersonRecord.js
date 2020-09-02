const moment = require('moment')
const db = require('@/config/db')
const {
  recordStatus: { draft },
  valueOfTypePersons: { human },
  setOfTypePersons
} = require('@/config/business-data')

module.exports = db.defineModel('person_records', {
  recordId: {
    type: db.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  entryId: {
    type: db.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  typePerson: {
    type: db.INTEGER.UNSIGNED,
    defaultValue: human,
    validate: { isIn: [setOfTypePersons] }
  },
  coverUrl: {
    type: db.STRING(300),
    defaultValue: ''
  },
  chineseName: {
    type: db.STRING(100),
    defaultValue: ''
  },
  foreignName: {
    type: db.STRING(100),
    defaultValue: ''
  },
  otherNames: {
    type: db.STRING(500),
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
  },
  members: {
    type: db.STRING(3000),
    defaultValue: ''
  },
  submitterId: {
    type: db.INTEGER.UNSIGNED,
  },
  submittedAt: {
    type: db.DATE,
    defaultValue: db.NOW,
    get() {
      return moment(this.getDataValue('submittedAt')).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  submitterMessage: {
    type: db.STRING(100),
    defaultValue: ''
  },
  auditorId: {
    type: db.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  auditedAt: {
    type: db.DATE,
    defaultValue: db.NOW,
    get() {
      return moment(this.getDataValue('auditedAt')).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  auditorMessage: {
    type: db.STRING(100),
    defaultValue: ''
  },
  status: {
    type: db.INTEGER.UNSIGNED,
    defaultValue: draft
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
const moment = require('moment')
const db = require('@/config/db')
const {
  recordStatus: { draft },
  valueOfTypeMediums,
  valueOftypeSources,
  setOfTypeMediums,
  setOfTypeSources
} = require('@/config/business-data')

module.exports = db.defineModel('anime_records', {
  recordId: {
    type: db.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  entryId: {
    type: db.INTEGER.UNSIGNED,
    defaultValue: 0
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
  typeMedium: {
    type: db.INTEGER.UNSIGNED,
    defaultValue: valueOfTypeMediums.draft,
    validate: { isIn: [setOfTypeMediums] }
  },
  typeSource: {
    type: db.INTEGER.UNSIGNED,
    defaultValue: valueOftypeSources.draft,
    validate: { isIn: [setOfTypeSources] }
  },
  typeGenres: {
    type: db.STRING(50),
    defaultValue: ''
  },
  regions: {
    type: db.STRING(20),
    defaultValue: ''
  },
  releaseDates: {
    type: db.STRING(100),
    defaultValue: ''
  },
  copyrights: {
    type: db.STRING(20),
    defaultValue: ''
  },
  officialUrl: {
    type: db.STRING(100),
    defaultValue: ''
  },
  intro: {
    type: db.STRING(1000),
    defaultValue: ''
  },
  staffs: {
    type: db.STRING(3000),
    defaultValue: ''
  },
  casts: {
    type: db.STRING(3000),
    defaultValue: ''
  },
  submitterId: {
    type: db.INTEGER.UNSIGNED,
    allowNull: false,
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
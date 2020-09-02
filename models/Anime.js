const db = require('@/config/db')
const { maximumScore } = require('@/config/business-data')

module.exports = db.defineModel('animes', {
  entryId: {
    type: db.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  chineseName: {
    type: db.STRING(100),
    defaultValue: ''
  },
  foreignName: {
    type: db.STRING(100),
    defaultValue: ''
  },
  typeMedium: {
    type: db.INTEGER.UNSIGNED
  },
  typeSource: {
    type: db.INTEGER.UNSIGNED
  },
  officialUrl: {
    type: db.STRING(100),
    defaultValue: ''
  },
  intro: {
    type: db.STRING(1000),
    defaultValue: ''
  },
  earliestYear: {
    type: db.INTEGER.UNSIGNED,
    defaultValue: 9999
  },
  earliestMonth: {
    type: db.INTEGER.UNSIGNED,
    defaultValue: 99
  },
  earliestDay: {
    type: db.INTEGER.UNSIGNED,
    defaultValue: 99
  },
  scoreStory: {
    type: db.DECIMAL(4, 2).UNSIGNED,
    defaultValue: 0,
    validate: {
      max: maximumScore
    }
  },
  scoreCharacter: {
    type: db.DECIMAL(4, 2).UNSIGNED,
    defaultValue: 0,
    validate: {
      max: maximumScore
    }
  },
  scoreMake: {
    type: db.DECIMAL(4, 2).UNSIGNED,
    defaultValue: 0,
    validate: {
      max: maximumScore
    }
  },
  scoreShow: {
    type: db.DECIMAL(4, 2).UNSIGNED,
    defaultValue: 0,
    validate: {
      max: maximumScore
    }
  },
  scoreMusic: {
    type: db.DECIMAL(4, 2).UNSIGNED,
    defaultValue: 0,
    validate: {
      max: maximumScore
    }
  },
  scoreAvg: {
    type: db.DECIMAL(4, 2).UNSIGNED,
    defaultValue: 0,
    validate: {
      max: maximumScore
    }
  },
  numberRecommends: {
    type: db.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  numberScores: {
    type: db.INTEGER.UNSIGNED,
    defaultValue: 0
  }
})
const db = require('@/config/db')
const {
  minimumScore,
  maximumScore,
  valueOfRecommendStatus: { yes, no }
} = require('@/config/business-data')
const { animeScoreAvg } = require('@/config/business-logic')

module.exports = db.defineModel('anime_votes', {
  entryId: {
    type: db.INTEGER.UNSIGNED,
    primaryKey: true
  },
  userId: {
    type: db.INTEGER.UNSIGNED,
    primaryKey: true
  },
  scoreStory: {
    type: db.INTEGER.UNSIGNED,
    validate: {
      min: minimumScore,
      max: maximumScore
    }
  },
  scoreCharacter: {
    type: db.INTEGER.UNSIGNED,
    validate: {
      min: minimumScore,
      max: maximumScore
    }
  },
  scoreMake: {
    type: db.INTEGER.UNSIGNED,
    validate: {
      min: minimumScore,
      max: maximumScore
    }
  },
  scoreShow: {
    type: db.INTEGER.UNSIGNED,
    validate: {
      min: minimumScore,
      max: maximumScore
    }
  },
  scoreMusic: {
    type: db.INTEGER.UNSIGNED,
    validate: {
      min: minimumScore,
      max: maximumScore
    }
  },
  recommend: {
    type: db.INTEGER.UNSIGNED,
    validate: {
      // 不明白为什么要两对括号
      isIn: [[yes, no]]
    }
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
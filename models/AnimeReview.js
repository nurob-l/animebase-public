const db = require('@/config/db')
const {
  valueOfReviewStatus: { wantToWatch, haveWatched }
} = require('@/config/business-data')

module.exports = db.defineModel('anime_reviews', {
  entryId: {
    type: db.INTEGER.UNSIGNED,
    primaryKey: true
  },
  userId: {
    type: db.INTEGER.UNSIGNED,
    primaryKey: true
  },
  status: {
    type: db.INTEGER.UNSIGNED,
    validate: {
      // 不明白为什么要两对括号
      isIn: [[wantToWatch, haveWatched]]
    }
  },
  content: {
    type: db.STRING(300),
    defaultValue: ''
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
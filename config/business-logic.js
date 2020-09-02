module.exports = {
  /** 计算动画综合评分
   * @param {Object}score 各单项评分对象
   * @return {Number} 综合评分
   */
  animeScoreAvg: ({ scoreStory, scoreCharacter, scoreMake, scoreShow, scoreMusic }) => {
    return  scoreStory     * 0.2
          + scoreCharacter * 0.2
          + scoreMake      * 0.2
          + scoreShow      * 0.2
          + scoreMusic     * 0.2
  },
  
  /** 比较两个播放日期的大小
   * @param {Object}date1 比较的日期
   * @param {Object}date2 被比较的日期
   * @return {Boolean} date1比date2更早返回真，否则返回假
   */
  compareDate: (date1, date2) => {
    if (date1.year < date2.year) {
      return true
    } else if (date1.year === date2.year) {
      if (date1.month < date2.month) {
        return true
      } else if (date1.month === date2.month) {
        if (date1.day < date2.day) {
          return true
        }
      }
    }
    return false
  }
}
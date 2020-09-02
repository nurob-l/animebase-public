// 字符串下划线转换驼峰
function toCamel (string) {
  return string.replace(/\_(\w)/g, function (all, letter) {
    return letter.toUpperCase()
  })
}

// 字符串驼峰转换下划线
function toSnake (string) {
  return string.replace(/([A-Z])/g, "_$1").toLowerCase()
}

module.exports = {
  /** 将一个对象所有属性名称的命名方式从下划线改为驼峰式
   * @param {Object}oldObject 需要转换的对象
   * @return {Object} 属性命名为驼峰式的新对象
   */
  toCamelForObject: function (oldObject) {
    let newObject = {}
    Object.keys(oldObject).forEach(key => newObject[toCamel(key)] = oldObject[key])
    return newObject
  },

  /** 将一个对象所有属性名称的命名方式从驼峰式改为下划线
   * @param {Object}oldObject 需要转换的对象
   * @return {Object} 属性命名为下划线式的新对象
   */
  toSnakeForObject: function (oldObject) {
    let newObject = {}
    Object.keys(oldObject).forEach(key => newObject[toSnake(key)] = oldObject[key])
    return newObject
  }
}
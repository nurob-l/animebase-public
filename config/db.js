const Sequelize = require('sequelize')

const config = require('./config')

console.log('init sequelize...')

let sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect, // 选择方言
  pool: { // 连接池设置
    max: 5,
    min: 0,
    idle: 10000
  },
  dialectOptions: { // 该选项作用是格式化数据库中日期的格式
    dateStrings: true,
    typeCast: true
  },
  timezone: '+08:00', // 东八时区
  transactionType: 'DEFERRED' , // 设置事务类型
})

function defineModel(name, attributes) {
  let attrs = {}
  for (let key in attributes) {
    let value = attributes[key]
    if (typeof value === 'object' && value['type']) {
      value.allowNull = value.allowNull || false
      attrs[key] = value
    } else {
      attrs[key] = {
        type: value,
        allowNull: false
      }
    }
  }
  // attrs.id = {
  //     type: ID_TYPE,
  //     primaryKey: true
  // }
  // attrs.createdAt = {
  //     type: Sequelize.BIGINT,
  //     allowNull: false
  // }
  // attrs.updatedAt = {
  //     type: Sequelize.BIGINT,
  //     allowNull: false
  // }
  // attrs.version = {
  //     type: Sequelize.BIGINT,
  //     allowNull: false
  // }
  // LOGABLE && console.log('model defined for table: ' + name + '\n' + JSON.stringify(attrs, function(k, v) {
  //   if (k === 'type') {
  //     for (let key in Sequelize) {
  //       if (key === 'ABSTRACT' || key === 'NUMBER') {
  //         continue
  //       }
  //       let dbType = Sequelize[key]
  //       if (typeof dbType === 'function') {
  //         if (v instanceof dbType) {
  //           if (v._length) {
  //             return `${dbType.key}(${v._length})`
  //           }
  //           return dbType.key
  //         }
  //         if (v === dbType) {
  //           return dbType.key
  //         }
  //       }
  //     }
  //   }
  //   return v
  // }, '  '))
  let ops = {
    tableName: name,
    timestamps: false,
    underscored: true
  }
  return sequelize.define(name, attrs, ops)
}

let exp = {
  defineModel: defineModel,
  
  sync: () => {
    // only allow create ddl in non-production environment:
    if (process.env.NODE_ENV !== 'production') {
      sequelize.sync({
        force: true
      })
    } else {
      throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.')
    }
  },
  
  // 原始查询
  query: (statement, options) => {
    return sequelize.query(statement, Object.assign({ type: sequelize.QueryTypes.SELECT }, options || {}))
  },
  
  // 运算符
  Op: Sequelize.Op,
  
  // 启用一个非托管事务并将其返回
  transaction: async (options) => await sequelize.transaction(options),
  
  /** 指定 SQL 函数调用
   * @param {String}fn 函数名称
   * @param {Any}...args 其余参数
   */
  fn: (fn, ...args) => {
    return sequelize.fn(fn, ...args)
  },
  
  /** 指定 SQL 列
   * @param {String}col 列名称
   */
  col: (col) => {
    return sequelize.col(col)
  },
  
  /** 生成原始子查询，不知道怎么命名这玩意
   * @param {any}val 任何原始文本
   */
  literal: (val) => {
    return sequelize.literal(val)
  }
}

// 限制类型的使用
const TYPES = ['STRING', 'INTEGER', 'BIGINT', 'TEXT', 'DOUBLE', 'DATE', 'BOOLEAN', 'DATEONLY', 'DECIMAL', 'NOW']
for (let type of TYPES) {
  exp[type] = Sequelize[type]
}

module.exports = exp

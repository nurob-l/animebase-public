require('module-alias/register') // 注册模块路径别名
const { AnimeRecord } = require('@/model')

// AnimeRecord.findAll()
//   .then(records => {
//     records.forEach(record => {
//       record.staffs = record.staffs.split('|').map(staff => staff.substr(1)).join('|')
//       record.save()
//     })
//   })

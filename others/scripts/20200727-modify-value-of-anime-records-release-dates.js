require('module-alias/register') // 注册模块路径别名
const { AnimeRecord } = require('@/model')

const regions = ['', '其他', '中国', '中国大陆', '中国香港', '中国澳门', '中国台湾', '日本', '美国']

// AnimeRecord.findAll()
//   .then(records => {
//     records.forEach(record => {
//       record.releaseDates = record.releaseDates.split('|').map(releaseDate => {
//         let d = releaseDate.split('-')
//         return [d[1], d[2], d[3], regions[Number(d[0])]].join('-')
//       }).join('|')
//       record.save()
//     })
//   })

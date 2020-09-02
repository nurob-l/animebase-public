require('module-alias/register') // 注册模块路径别名
const { AnimeRecord, Anime, AnimeReleaseDate } = require('@/model')

const months = {
  '1': 1,
  '2': 2,
  '3': 4,
  '4': 5,
  '5': 6,
  '6': 8, 
  '7': 9, 
  '8': 10,
  '9': 12,
  '10': 13,
  '11': 14,
  '12': 16,
  '13': 7,
  '14': 11,
  '15': 15,
  '16': 3,
  '99': 99
}

// AnimeRecord.findAll()
//   .then(records => {
//     records.forEach(record => {
//       // console.log('before: ', record.releaseDates)
//       record.releaseDates = record.releaseDates.split('|').map(releaseDate => {
//         let d = releaseDate.split('-')
//         return [d[0], months[d[1]], d[2], d[3]].join('-')
//       }).join('|')
//       record.save()
//       // console.log('after: ', record.releaseDates)
//     })
//   })

// Anime.findAll()
//   .then(animes => {
//     animes.forEach(anime => {
//       anime.earliestMonth = months[anime.earliestMonth.toString()]
//       anime.save()
//     })
//   })

// AnimeReleaseDate.findAll()
//   .then(releaseDates => {
//     releaseDates.forEach(releaseDate => {
//       releaseDate.month = months[releaseDate.month.toString()]
//       releaseDate.save()
//     })
//   })

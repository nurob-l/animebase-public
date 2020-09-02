require('module-alias/register') // 注册模块路径别名
const { AnimeReleaseDate } = require('@/model')

const regions = ['', '其他', '中国', '中国大陆', '中国香港', '中国澳门', '中国台湾', '日本', '美国']

// AnimeReleaseDate.findAll()
//   .then(releaseDates => {
//     releaseDates.forEach(releaseDate => {
//       releaseDate.region = regions[Number(releaseDate.region)]
//       releaseDate.save()
//     })
//   })

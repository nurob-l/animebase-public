/*
  Usage: npm install -S @alicloud/pop-core
  powered by alinode (http://alinode.aliyun.com/)
*/

const APIError = require('@/rest').APIError
const Core = require('@alicloud/pop-core')
const OSS = require('ali-oss')
const isProd = process.env.NODE_ENV === 'production'

// 构建一个阿里云client, 用于发起请求
// 构建阿里云client时需要设置AccessKey ID和AccessKey Secret
let client = new Core({
  accessKeyId: '********************',
  accessKeySecret: '******************************',
  endpoint: '********************',
  apiVersion: '**********'
})

module.exports = {
  // 获得上传封面用的STS临时授权
  getEditSTS: ({ userId, username }) => {
    let params = {
      'RoleArn': process.env.NODE_ENV === 'production'
        ? 'acs:ram::********************:role/******************************'
        : 'acs:ram::********************:role/******************************',
      'RoleSessionName': `${userId}-${username}`,
      'Policy': JSON.stringify({
        'Version': '1',
        'Statement': [{
          'Effect': 'Allow',
          'Action': [
            'oss:PutObject',
            'oss:DeleteObject'
          ],
          'Resource': [
            process.env.NODE_ENV === 'production'
              ? `acs:oss:*:*:**********/**********/**********/${userId}/*.webp`
              : `acs:oss:*:*:**********-test/**********/**********/${userId}/*.webp`
          ]
        }]
      })
    }
    // 构建AssumeRole请求
    // 返回Promise
    return client.request('AssumeRole', params)
  },
  
  addAnimeCover: async (coverUrl, recordId, entryId) => {
    return await addCover('animes', coverUrl, recordId, entryId)
  },
  
  addPersonCover: async (coverUrl, recordId, entryId) => {
    return await addCover('persons', coverUrl, recordId, entryId)
  },
  
  updateAnimeCover: async (coverUrl, recordId, entryId) => {
    return await updateCover('animes', coverUrl, recordId, entryId)
  },
  
  updatePersonCover: async (coverUrl, recordId, entryId) => {
    return await updateCover('persons', coverUrl, recordId, entryId)
  },
  
  closeAnimeCover: async (entryId) => {
    await closeCover('animes', entryId)
  },
  
  closePersonCover: async (entryId) => {
    await closeCover('persons', entryId)
  },
  
  openAnimeCover: async (recordId, entryId) => {
    await openCover('animes', recordId, entryId)
  },
  
  openPersonCover: async (recordId, entryId) => {
    await openCover('persons', recordId, entryId)
  },
  
  rollbackAnimeCover: async (previousCoverUrl, currentCoverUrl, entryId) => {
    await rollbackCover('animes', previousCoverUrl, currentCoverUrl, entryId)
  },
  
  rollbackPersonCover: async (previousCoverUrl, currentCoverUrl, entryId) => {
    await rollbackCover('persons', previousCoverUrl, currentCoverUrl, entryId)
  },
  
  /** 管理员删除条目档案时处理阿里云OSS中的封面图片
   * @param {String}coverUrl 封面链接
   * @param {Number}recordId 档案id
   */
  deleteCover: async (coverUrl, recordId) => {
    const fileName = coverUrl.substr(coverUrl.indexOf('public'))
    let ossClient = createOssClientForAdmin()
    // 判断是临时图片还是留档图片
    if (fileName.indexOf('/temporary/') !== -1) { // 临时图片
      await ossClient.delete(fileName)
    } else if (fileName.indexOf('/cover-history/') !== -1) { // 留档图片
      // 判断图片是否属于自己（被删除的条目档案）
      const s = fileName.split('/')
      const fileName = s[s.length - 1]
      const id = Number(fileName.substring(0, fileName.indexOf('.webp')))
      if (id === recordId) {
        await ossClient.delete(fileName)
      }
    }
  }
}

// 因为tuile-images-test bucket有可能会直接从tuile-images bucket拷贝数据过来进行开发测试
// 因此如果违规操作删除tuile-images bucket链接的图片时会报错

/** 添加条目审核通过时处理阿里云OSS中的封面图片
 * @param {String}type 条目类型
 * @param {String}coverUrl 临时封面链接
 * @param {Number}recordId 档案id
 * @param {Number}entryId 条目id
 * @return {String} 返回历史版本留档的封面链接
 */
async function addCover (type, coverUrl, recordId, entryId) {
  // 如果没有链接则返回空链接
  if (!coverUrl) return ''
  const fileName = coverUrl.substr(coverUrl.indexOf('public'))
  let ossClient = createOssClientForAuditor()
  const [{ res: { requestUrls }}, {}] = await Promise.all([
    ossClient.copy(getHistoryCoverName(type, recordId), fileName),
    ossClient.copy(getPublicCoverName(type, entryId), fileName)
  ])
  await ossClient.delete(fileName)
  return requestUrls[0]
}

/** 更新条目审核通过时处理阿里云OSS中的封面图片
 * @param {String}type 条目类型
 * @param {String}coverUrl 封面链接
 * @param {Number}recordId 档案id
 * @param {Number}entryId 条目id
 * @return {String} 返回历史版本留档的封面链接
 */
async function updateCover (type, coverUrl, recordId, entryId) {
  // 如果没有链接则删除公开图片并返回空链接
  if (!coverUrl) {
    await deletePublicCover(type, entryId)
    return ''
  }
  const fileName = coverUrl.substr(coverUrl.indexOf('public'))
  let ossClient = createOssClientForAuditor()
  // 判断是临时图片还是留档图片
  if (fileName.indexOf('/temporary/') !== -1) { // 临时图片
    const [{ res: { requestUrls }}, {}] = await Promise.all([
      ossClient.copy(getHistoryCoverName(type, recordId), fileName),
      ossClient.copy(getPublicCoverName(type, entryId), fileName)
    ])
    await ossClient.delete(fileName)
    return requestUrls[0]
  } else { // 属于其他条目档案，而不属于自己的留档图片
    return coverUrl
  }
}

/** 管理员下架条目时处理阿里云OSS中的公开封面图片
 * @param {String}type 条目类型
 * @param {Number}entryId 条目id
 */
async function closeCover (type, entryId) {
  await deletePublicCover(type, entryId)
}

/** 管理员重新上架条目时处理阿里云OSS中的公开封面图片
 * @param {String}type 条目类型
 * @param {Number}recordId 档案id
 * @param {Number}entryId 条目id
 */
async function openCover (type, recordId, entryId) {
  const historyCoverName = getHistoryCoverName(type, recordId)
  const publicCoverName = getPublicCoverName(type, entryId)
  let ossClient = createOssClientForAdmin()
  try {
    const { res: { status }} = await ossClient.get(historyCoverName)
    if (status === 200) { // 档案图片存在，则添加公开图片
      await ossClient.copy(publicCoverName, historyCoverName)
    }
  } catch (err) { // 档案图片不存在，无需添加公开图片
    LOGABLE && console.log(err)
  }
}

async function rollbackCover (type, previousCoverUrl, currentCoverUrl, entryId) {
  const publicCoverName = getPublicCoverName(type, entryId)
  if (previousCoverUrl === currentCoverUrl) return
  if (previousCoverUrl) { // 有链接则添加到公开封面
    const fileName = previousCoverUrl.substr(previousCoverUrl.indexOf('public'))
    let ossClient = createOssClientForAdmin()
    await ossClient.copy(publicCoverName, fileName)
  } else { // 没有链接则删掉公开封面
    await deletePublicCover(type, entryId)
  }
}

/** 生成公开封面文件名
 * @param {String}type 条目类型
 * @param {Number}entryId 条目id
 * @return {String} 封面文件名
 */
function getPublicCoverName (type, entryId) {
  // 限定type值
  if (['animes', 'persons', 'characters'].indexOf(type) === -1) throw new APIError('oss:bad_params', '亲，参数错误哦')
  return `**********/**********/${type}/${entryId}.webp`
}

/** 生成历史留档封面文件名
 * @param {String}type 条目类型
 * @param {Number}recordId 档案id
 * @return {String} 封面文件名
 */
function getHistoryCoverName (type, recordId) {
  // 限定type值
  if (['animes', 'persons', 'characters'].indexOf(type) === -1) throw new APIError('oss:bad_params', '亲，参数错误哦')
  return `**********/**********-history/${type}/${recordId}.webp`
}

/** 删除公开封面
 * @param {String}type 条目类型
 * @param {Number}entryId 条目id
 */
async function deletePublicCover (type, entryId) {
  const publicCoverName = getPublicCoverName(type, entryId)
  let ossClient = createOssClientForAdmin()
  try {
    const { res: { status }} = await ossClient.get(publicCoverName)
    if (status === 200) { // 公开图片存在，则删除公开图片
      await ossClient.delete(publicCoverName)
    }
  } catch (err) { // 公开图片不存在，则无需删除
    LOGABLE && console.log(err)
  }
}

// 服务器调用OSS
function createOssClientForAuditor () {
  return new OSS({
    region: 'oss-cn-beijing',
    //云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，创建并使用STS方式来进行API访问
    accessKeyId: '******************************',
    accessKeySecret: '******************************',
    bucket: process.env.NODE_ENV === 'production' ? '**********-**********' : '**********-**********-test'
  })
}

// 服务器调用OSS
function createOssClientForAdmin () {
  return new OSS({
    region: 'oss-cn-beijing',
    accessKeyId: '******************************',
    accessKeySecret: '******************************',
    bucket: process.env.NODE_ENV === 'production' ? '**********-images' : '**********-images-test'
  })
}
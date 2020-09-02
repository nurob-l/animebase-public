const fs = require('fs')
const path = require('path')

const resolve = (...paths) => path.resolve(__dirname, ...paths)

// add url-route in /controllers:

function addMapping(router, mapping) {
  for (let url in mapping) {
    if (url.startsWith('GET ')) {
      let path = url.substring(4)
      router.get(path, mapping[url])
      console.log(`register URL mapping: GET ${path}`)
    } else if (url.startsWith('POST ')) {
      let path = url.substring(5)
      router.post(path, mapping[url])
      console.log(`register URL mapping: POST ${path}`)
    } else if (url.startsWith('PUT ')) {
      let path = url.substring(4)
      router.put(path, mapping[url])
      console.log(`register URL mapping: PUT ${path}`)
    } else if (url.startsWith('DELETE ')) {
      let path = url.substring(7)
      router.del(path, mapping[url])
      console.log(`register URL mapping: DELETE ${path}`)
    } else {
      console.log(`invalid URL: ${url}`)
    }
  }
}

function addControllers(router, dir) {
  fs.readdirSync(resolve(dir)).forEach(item => {
    const fullPath = resolve(dir, item)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      addControllers(router, fullPath) //递归读取文件
    } else {
      if (!fullPath.endsWith('.js')) return
      console.log(`process controller: ${item}...`)
      const mapping = require(resolve(fullPath))
      addMapping(router, mapping)
    }
  })
}

module.exports = function(dir) {
  const controllersDir = dir || 'controllers'
  const router = require('koa-router')()
  addControllers(router, controllersDir)
  return router.routes()
}

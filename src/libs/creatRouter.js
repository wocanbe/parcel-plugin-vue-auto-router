const path = require('path')

function creatRouters(options) {
  const dirPath = options.dirPath
  const xdPath = options.dirPath
  const routerPath = options.routerPath
  const pathMS = options.files

  let router

  const chunkName = pathMS.asyncDir ? hash(xdPath) : options.chunkName
  let filterPath = ''
  if (pathMS.hasAuth) {
    filterPath = xdPath + '/extendRouter.js'
  }

  if (pathMS.hasMain) { // 如果拥有主入口
    const mainPath = pathMS.asyncDir ? '/$main.vue' : '/main.vue'
    router = {
      dirPath: dirPath, // 文件路径
      path: routerPath, // 路由路径
      component: xdPath + mainPath, // 入口文件路径
      filterPath, // 过滤文件路径
      chunkName,
      children: [] // 子组件
    }
  } else { // 没有主入口，会创建默认主入口
    router = {
      dirPath: dirPath,
      path: routerPath,
      component: 'default',
      filterPath,
      chunkName,
      children: []
    }
  }
  if (options.needIndex) {
    if (pathMS.files.indexOf('index') > -1) { // 如果有默认子路由
      const indexPath = xdPath + '/index.vue'
      router.children.push({
        path: '',
        dirPath: dirPath,
        chunkName,
        component: indexPath
      })
    } else if (pathMS.files.indexOf('$index') > -1) { // 如果有异步默认子路由
      const indexPath = xdPath + '/$index.vue'
      router.children.push({
        path: '',
        chunkName: hash(xdPath + '/'),
        dirPath: dirPath,
        component: indexPath
      })
    } else { // 为了能正确拦截到extendRouter.js配置的首页权限，这个必须加
      router.children.push({
        path: ''
      })
    }
  }

  // 处理其他vue文件
  for (var o in pathMS.files) {
    const localFile = pathMS.files[o]
    if (pathMS.hasUrlParam) {
      if (localFile.substr(0, 1) === '_') {
        // 处理有url参数的路由
        const localRoute = localFile.replace('_', ':').replace('$', '')
        if (localRoute === 'index') continue
        const localChunk = localFile.substr(0, 2) === '_$' ? hash(xdPath + '/' + localFile) : chunkName
        const localPath = xdPath + '/' + localFile + '.vue'
        router.children.push({
          dirPath: dirPath,
          path: localRoute,
          chunkName: localChunk,
          component: localPath
        })
      } else {
        continue
      }
    } else {
      const localRoute = localFile.replace('$', '')
      if (localRoute === 'index') continue
      const localChunk = localFile.substr(0, 1) === '$' ? hash(xdPath + '/' + localFile) : chunkName
      const localPath = xdPath + '/' + localFile + '.vue'
      router.children.push({
        dirPath: dirPath,
        path: localRoute,
        chunkName: localChunk,
        component: localPath
      })
    }
  }
  // 处理子目录
  for (var key in pathMS.dirs) {
    if (pathMS.files.indexOf(key) > -1) continue // 跳过存在同名vue文件的目录
    let pathParams = key
    if (key.substr(0, 1) === '_') pathParams = pathParams.replace('_', ':') // 处理目录的url参数

    let needIndex = true
    if (pathMS.hasUrlParam) needIndex = false

    router.children = router.children.concat(creatRouters({
      routerPath: pathParams,
      dirPath: dirPath + '/' + key,
      chunkName,
      needIndex,
      files: pathMS.dirs[key]
    }))
  }
  // 处理*号的地址栏参数
  if (pathMS.hasPathAll) {
    router.children.push({
      dirPath: dirPath,
      path: '*',
      chunkName,
      component: xdPath + '/_.vue'
    })
  }
  return router
}

module.exports = creatRouters

const path = require('path')
const readPath = require('./readAndWatchPath')
const creatRouters = require('./creatRouter')
const compileRouter = require('./compile')

function creatRouter (code, relatePath) {
  const config = JSON.parse(code);
  let dirPath // 要扫描的目录路径
  let ignore = ['assets', 'components']; // 要排除的子目录名字
  if (config.dirPath) {
    dirPath = config.dirPath
  } else {
    throw new Error('config has not dirPath')
  }
  if (config.ignore) ignore = config.ignore;
  // 获取目录结构
  const files = readPath(path.resolve(relatePath, dirPath), {ignore: ignore});

  // 生成路由元数据
  const routerObj = creatRouters({
    routerPath: '', // 子路径名字
    dirPath, // 要扫描的路径
    files, // 文件列表
    needIndex: true
  })
  // 处理数据，生成路由配置
  return compileRouter(routerObj)
}
module.exports = creatRouter

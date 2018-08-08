const path = require('path')
const JSAsset = require('parcel-bundler/src/assets/JSAsset');
const babylon = require('babylon');
const readPath = require('./libs/readPath')
const creatRouters = require('./libs/creatRouter')
const compileRouter = require('./libs/compile')
class RouterAsset extends JSAsset {
  constructor(...args) {
    super(...args);
  }
  async parse(code) {
    const options = await this.getParserOptions();
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
    const files = readPath(path.resolve(options.filename, '../' + dirPath), {ignore: ignore});
    // 生成路由元数据
    const routerObj = creatRouters({
      routerPath: '', // 子路径名字
      dirPath, // 要扫描的路径
      files, // 文件列表
      needIndex: true
    })
    // 处理数据，生成路由配置
    const routerConfig = compileRouter(routerObj)
    // 将代码解析为 AST 树
    return babylon.parse(routerConfig.router, options);
  }
}

module.exports = RouterAsset;
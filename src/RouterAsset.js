const JSAsset = require('parcel-bundler/src/assets/JSAsset');
const babylon = require('babylon');
const creatRoutersCode = require('./libs/creatCode')
class RouterAsset extends JSAsset {
  constructor(...args) {
    super(...args);
    this.dependPaths = []
  }
  async parse(code) {
    const options = await this.getParserOptions();
    const localDir = options.filename.substr(0, options.filename.lastIndexOf('/'))
    // 生成路由配置
    const routerConfig = creatRoutersCode(code, localDir)
    // 将代码解析为 AST 树
    return babylon.parse(routerConfig.router, options);
  }
}

module.exports = RouterAsset;
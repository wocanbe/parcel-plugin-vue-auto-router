const JSAsset = require('parcel-bundler/src/assets/JSAsset');
const babylon = require('babylon');
const AutoRouter = require('./libs/AutoRouter')
class RouterAsset extends JSAsset {
  constructor(...args) {
    super(...args);
  }
  async parse(code) {
    const options = await this.getParserOptions()
    // 生成路由配置
    const autoRouter = new AutoRouter(options.filename, JSON.parse(code));
    // 扫描目录
    autoRouter.scan();
    // 添加监听
    autoRouter.watchPath();
    const routeStr = autoRouter.getCode()
    // 将代码解析为 AST 树
    return babylon.parse(routeStr, options);
  }
}

module.exports = RouterAsset;


const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const scanPath = require('./scanPath')
const creatRouter = require('./creatRouter')
const creatText = require('./creatText')

class AutoRouter {
  constructor (filePath, config) {
    let dirPath;
    if (config.dirPath) {
      dirPath = config.dirPath;
    } else {
      throw new Error('config has not dirPath');
    }
    const fileName = filePath.substr(0, filePath.lastIndexOf('.'));
    this.fileName = fileName.substr(fileName.lastIndexOf('/'));
    this.filePath = fileName.substr(0, fileName.lastIndexOf('/'))
    this.relatePath = dirPath;
    this.scanPath = path.resolve(filePath, '../' + dirPath);
    this.ignore = config.ignore ? config.ignore : ['assets', 'components'];
    this.ready = false;
  }
  watchPath () {
    const watcher = chokidar.watch(this.scanPath, {ignored: /\.(?!vue|js)\w+$/});
    watcher
      .on('add', this._fileListener.bind(this))
      .on('addDir', this._dirListener.bind(this))
      .on('unlink', this._fileListener.bind(this))
      .on('unlinkDir', this._dirListener.bind(this))
      .on('error',  error => {
        console.log('Error happened', error);
      })
      .on('ready', () => {
        console.info('parcel-plugin-vue-auto-router is ready.');
        this.ready = true;
      })
  }
  scan () {
    // 获取目录结构
    const files = scanPath(this.scanPath, {ignore: this.ignore});
    // 生成路由元数据
    const routerObj = creatRouter({
      routerPath: '', // 子路径名字，用于生成路由path
      dirPath: this.relatePath, // 相对autorouter文件的路径， 用于生成目录引用结构
      files, // 文件列表
      needIndex: true
    });
    const code = creatText(routerObj);
    fs.writeFileSync(this.filePath + this.fileName + '.js', code.router);
  }
  getCode () {
    return 'import routeStr from \'.' + this.fileName +'.js\'\nexport default routeStr'
  }
  _fileListener (path_) {
    if (this.ready) {
      const relatePath = path_.substr(0, path_.lastIndexOf('/'));
      const pathName = relatePath.substr(relatePath.lastIndexOf('/') + 1);
      if (this.ignore.indexOf(pathName) === -1) this.scan();
    }
  }
  _dirListener (path_) {
    if (this.ready) {
      const pathName = path_.substr(path_.lastIndexOf('/') + 1);
      if (this.ignore.indexOf(pathName) === -1) this.scan();
    }
  }
}

module.exports = AutoRouter

const path = require('path')
const _ = require('lodash')
const hash = require('hash-sum')
let fs = require('fs')
const compileRouter = require('./compile')

const REGEX_VALIDATE_PAGE = /^[$]?[\w-]+\.vue$/i
const REGEX_MODULE_ENTER = /^main\.vue$/i
const REGEX_ASYNC_MODULE_ENTER = /^[$]main\.vue$/i
const IGNORES = ['_', '$_', '_$', '$_.vue', '_$.vue'] // 要跳过不处理的无意义目录及文件

/**
 * 生成文件树
 * @param {String} path 要扫描的目录
 * @param {*} options 附加配置，目前仅支持忽略该目录配置
 */
function readPath (path, options) {
  const result = {
    hasMain: false, // 拥有入口文件
    asyncDir: false, // 本目录进行分包且打成一个包
    hasDir: false, // 拥有下级目录
    hasAuth: false, // 拥有权限描述
    hasUrlParam: false, // 拥有文件类型地址参数
    hasPathAll: false, // 拥有目录类型地址参数
    files: [], // 文件列表
    dirs: {} // 目录列表
  }
  let hasUrlParamPath = false // 已经拥有_开头的目录
  result.hasAuth = fs.existsSync(path + '/extendRouter.js')
  const files = fs.readdirSync(path)
  for (const order in files) {
    const fname = files[order]
    if (IGNORES.indexOf(fname) > -1) continue
    if (fname.substr(0, 2) === '__') continue
    const fpath = path + '/' + fname
    let stat = fs.statSync(fpath)
    if (stat.isDirectory()) {
      if (options.ignore.indexOf(fname) > -1) continue

      if (fname.substr(0, 1) === '_') {
        if (hasUrlParamPath) continue
        hasUrlParamPath = true
      }

      // 对目录进行处理
      const childFiles = readPath(fpath, options)
      if (childFiles) {
        result.dirs[fname] = childFiles
        result.hasDir = true
      }
    } else {
      if (fname.substr(-4) !== '.vue') continue // 跳过非vue文件
      if (fname === '_.vue') { // 处理*的地址参数
        result.hasPathAll = true
        continue
      }
      if (result.hasUrlParam) continue // 如果该目录已经拥有带url参数的路由，跳过下面的所有文件
      if (REGEX_MODULE_ENTER.test(fname)) {
        // 存在子路由
        result.hasMain = true
      } else if (REGEX_ASYNC_MODULE_ENTER.test(fname)) {
        // 存在子路由且本目录下所有模块打成一个包
        result.hasMain = true
        result.asyncDir = true
      } else if (REGEX_VALIDATE_PAGE.test(fname)) {
        // 跳过不处理的文件
        if (fname.substr(0, 1) === '_') result.hasUrlParam = true
        // 是vue文件，与子路由是平行路由
        result.files.push(fname.replace('.vue', ''))
      }
    }
  }
  if (result.hasMain || result.hasDir || result.files.length > 0) {
    return result
  } else {
    return false
  }
}

module.exports = readPath

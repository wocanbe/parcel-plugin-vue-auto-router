const path = require('path')
let fs = require('fs')
const template = require('lodash/template')
const hash = require('hash-sum')
let dependents = []
let files = []

function addDependent (path, chunkName) {
  if (path === 'default') return 'defaultRouter'
  const hashName = '_' + hash(path)

  dependents.push(path)
  if (chunkName) {
    // 异步加载的组件才能并且只能分包
    files.push(`const ${hashName} = () => import('${path}' /* webpackChunkName: "${chunkName}" */)`)
  } else {
    files.push(`import ${hashName} from '${path}'`)
  }
  return hashName
}
function compile(router, spaceNo, authObj) {
  let routerStr = ''
  if (authObj !== undefined && router.path !== '*') routerStr += `pubFilter(${authObj},`
  routerStr += `{path:'${router.path}',`
  if (router.component) {
    routerStr += `component:${addDependent(router.component, router.chunkName)}`
  }

  // 获取子路由的权限描述
  let authFun
  if (router.filterPath) {
    // 过滤中可能包含方法，如beforeEnter方法，而loader只能处理字符串，所以没法在这儿处理后再返回
    authFun = addDependent(router.filterPath)
  }
  if (router.children && router.children.length > 0) {
    routerStr += `,children:[`
    for (let r = 0; r < router.children.length; r++) {
      if (r === 0) {
        routerStr += compile(router.children[r], spaceNo + 1, authFun)
      } else {
        routerStr += ',' + compile(router.children[r], spaceNo + 1, authFun)
      }
    }
    routerStr += `]`
  }
  routerStr += '}'
  if (authObj !== undefined && router.path !== '*') routerStr += ')'
  return routerStr
}
function compileRouter (routers) {
  files = ['import extend from \'lodash/extend\'']
  dependents = []
  const routerStr = compile(routers, 0, undefined)

  // 编译路由
  const templateFilePath = path.resolve(__dirname, 'template.js')
  const fileContent = fs.readFileSync(templateFilePath, 'utf8')
  const tempCompile = template(fileContent)
  const router = tempCompile({
    files,
    routerStr
  })
  return {
    router,
    dependents
  }
}
module.exports = compileRouter

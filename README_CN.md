# parcel自动路由插件

## 简介
扫描指定目录的vue文件，并根据文件及目录结构自动生成路由，规则简单

 * 下划线(_)开头的文件（特指vue文件，下同）代表地址栏参数(params)
 * 货币符号($)开头的文件代表懒加载路由
 * 双下划线(__)开头的文件代表忽略该文件
 * extendRouter.js 为该目录生成的路由添加额外信息（path和component以外的信息）

## 使用

src/router/index.js

```javascript
import Vue from 'vue'
import Router from 'vue-router'
import autorouter from './view.autorouter'

Vue.use(Router)

const router = new Router({
  routes: [autorouter]
})
```

src/router/view.autorouter

```json
{
  "dirPath": "../views"
}
```
autorouter文件支持两个参数
 - dirPath: 要扫描的文件夹，必填
 - ignore: 不扫描的文件夹名称，默认值['assets', 'components']

 该插件会在同一目录下生成同名js文件

## 特殊文件约定

  - main.vue：主入口，可选
  
  作为下面所有路由的容器，该文件里面必须写vouter-view，没有时自动插入默认主入口（一个只包含vouter-view标签的组件）
  - index.vue: 主页，可选
  
  作为默认子路由,没有该文件时该路径不可访问（该路径的下级路由可以访问）
  - _.vue: 处理成*，可选

  用来处理该路径下所有不在路由规则中的路由（一般用作404页面），注意，该文件仍然会经过主入口（main.vue）
  - extendRouter.js 额外路由信息，可选
  
  提供除了path和component外的其他路由信息

注意：main.vue和index.vue的文件名一定要全部小写
## url地址参数
所有以_（下划线）开头的目录或文件自动处理成url参数，参数名为下划线后面的字符

  - 只能出现一个下划线，两个及以上代表忽略该文件
  - 为了避免路由走到意外的分支，对目录下的子文件及子目录做以下约定
    - 只能有一个以_开头的目录，多个时只处理遇到的第一个
    - 只能有一个以_开头的vue文件(不包括_.vue，_.vue处理成*），存在这样的文件时，将忽略其他所有vue文件
    - 同时存在以_开头的文件和目录时，目录中的index.vue或$index.vue将被忽略
  - 其他可能的路由冲突，如以_开头的目录和正常的兄弟目录，他们下面都有step1.vue，这种情况会造成其中一个路由走不到，需要自己去解决
## 忽略目录及文件
- 扫描时将自动忽略以'__'(双下划线)开头的目录或vue文件
## 异步与分包
- 按文件分包：以$开头的vue文件代表异步组件，会自动分包
- 按目录分包：创建$main.vue文件，则本层目录及所有下级目录将打成一个包，main.vue文件必须包含一个router-view
## 添加路由附加信息
通过extendRouter.js处理(filter.js中处理path和component将被忽略)
  
该文件在路由所在路径，返回一个方法，自动路由插件会自动调用，该方法传入路由路径，返回需要的路径配置。
 
## 注意事项

 - 不能有同名vue文件和目录，如果有，按文件来处理，忽略目录。
 - $_.vue和_$.vue无意义，_目录无意义，将忽略
 - 使用异步组件时，只能出现一个$
 - 同时使用异步和url参数时，请以_$开头

## 引言

前一段时间, 正好在做微前端的接入和微前端管理平台的相关事项。 而我们当前使用的微前端框架则是 `qiankun`,
他是这样介绍自己的:  
> qiankun 是一个基于 single-spa 的微前端实现库，旨在帮助大家能更简单、无痛的构建一个生产可用微前端架构系统。

所以本文基于 `single-spa` 源码, 来介绍 `single-spa`

当前使用版本 5.9.4

## 概念  todo  待定位置

在single-spa中，有以下三种微前端类型：

1.  single-spa applications: 为一组特定路由渲染组件的微前端。
2.  single-spa parcels: 不受路由控制，渲染组件的微前端。
3.  utility modules: 非渲染组件，用于暴露共享javascript逻辑的微前端。

## 启动

在官方 demo 中, 要运行此框架需要做的是有这四步:

1. 准备好子应用的文件, 需要抛出一些生命周期函数
2. 一个子应用 app1 的加载函数(_可以是 import 异步加载, 也可以是 ajax/fetch 加载_)
3. 注册子应用
4. 启动程序

app1.js:

```js
export function bootstrap(props) {
    //初始化时触发
}
export function mount(props) {
    // 应用挂载完毕之后触发
}
export function unmount(props) {
    // 应用卸载之后触发
}
```

main.js:

```js
import * as singleSpa from 'single-spa'

const name = 'app1';
const app = () => import('./app1/app1.js'); // 一个加载函数
const activeWhen = '/app1'; // 当路由为 app1 时, 会触发微应用的加载

// 注册应用
singleSpa.registerApplication({ name, app, activeWhen });
// 启动
singleSpa.start();
```

## 文件结构

single-spa 的文件结构为:

// TODO 添加文件的注释
```
├── applications
│   ├── app-errors.js
│   ├── app.helpers.js
│   ├── apps.js
│   └── timeouts.js
├── devtools
│   └── devtools.js
├── jquery-support.js
├── lifecycles
│   ├── bootstrap.js
│   ├── lifecycle.helpers.js
│   ├── load.js
│   ├── mount.js
│   ├── prop.helpers.js
│   ├── unload.js
│   ├── unmount.js
│   └── update.js
├── navigation
│   ├── navigation-events.js
│   └── reroute.js
├── parcels
│   └── mount-parcel.js
├── single-spa.js
├── start.js
└── utils
    ├── assign.js
    ├── find.js
    └── runtime-environment.js
```

## registerApplication


## 总结

在后续再来介绍 `qiankun` 和其他的微前端框架(如...)


## 引用
- https://zh-hans.single-spa.js.org/docs/getting-started-overview
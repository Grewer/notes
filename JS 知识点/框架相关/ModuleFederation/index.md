# module Federation 模块联邦在微前端中的应用

## 什么是 module Federation

`module Federation`(下面简称 MF) 是 webpack5 推出的最新的概念

有用过 webpack 的小伙伴都知道, 在我们打包时, 都会对资源进行分包, 或者使用异步加载路由的方案,
这样打出来的包(也叫 chunk), 在我们使用时, 就是一个单独的加载

在过去, chunk 只是在一个项目中使用,  webpack5 中, chunk 通过路径/fetch 等方式也可以提供给其他应用使用

这便是 MF 的发展由来, 不得不说这是一个很有想象力的API

MF 的粒度, 最小可以是一个组件/组件库, 最大可以是一个页面, 取决于你怎样使用

## 基础使用

首先我们来看 `ModuleFederationPlugin` 的一些基础配置参数:

```js
const { ModuleFederationPlugin } = require('webpack').container;
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      // options
    }),
  ],
};
```

### 参数

#### runtime

新的运行时模块名称

// todo 是否必须

#### shared

使用 `shared` 可以最大限度地减少依赖关系的重复，因为远程依赖于主机的依赖关系。如果主机缺少一个依赖项，远程只在必要时下载其依赖项



`ModuleFederationPlugin` 插件组合了 `ContainerPlugin` 和 `ContainerReferencePlugin`
所以它既是一个入口, 也是一个出口




## 引用

- https://www.syncfusion.com/blogs/post/what-is-webpack-module-federation-and-why-does-it-matter.aspx

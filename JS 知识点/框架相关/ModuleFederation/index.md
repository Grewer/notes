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

#### file filename

`name` 是容器的名称, `filename` 是具体的文件名入口

如果没有 `filename` 则以 `name` 为文件名, 需要注意的是 `name` 需要是唯一值

```js
new ModuleFederationPlugin({
    name: 'app2', // 名称
    filename: 'remoteEntry.js', // 入口文件
    // 打包后, 就会自动打出 remoteEntry.js 
    // 他的内容就是 exposes 参数中的映射
})
```

#### exposes

在这个配置里你可以暴露你想要的所有内容

```js

new ModuleFederationPlugin({
  name: 'app2', // 名称
  filename: 'remoteEntry.js', // 入口文件
  exposes: {
    './Widget': './src/Widget',
  },
})
```

`exposes` 的 `key` 不能是一个直接的名称, 如 `'Widget': './src/Widget',` 这样会报错


#### shared

使用 `shared` 可以最大限度地减少依赖关系的重复，因为远程依赖于主机的依赖关系。如果主机缺少一个依赖项，远程只在必要时下载其依赖项

使用 `dependencies` 是为了共享模块的版本和 `package.json` 中的版本保持一致。如果不一致则会打印警告

```js
const deps = require('./package.json').dependencies;

new ModuleFederationPlugin({
  name: 'app2',
  filename: 'remoteEntry.js',
  exposes: {
    './Widget': './src/Widget',
  },
  shared: {
    moment: deps.moment,
    react: {
      requiredVersion: deps.react,
      import: 'react', // 所提供的模块应该被放置在共享范围内。如果在共享范围内没有找到共享模块或版本无效，这个提供的模块也作为后备模块。
      shareKey: 'react', // 所请求的共享模块在这个键下从共享范围中被查找出来。
      shareScope: 'default', // 共享范围的名称。
      singleton: true, 
    },
    'react-dom': {
      requiredVersion: deps['react-dom'],
      singleton: true,
    },
  },
})
```

**关于 `singleton`**

> 这个参数只允许在共享范围内有一个单一版本的共享模块（默认情况下禁用）。一些库使用全局的内部状态（例如 react, react-dom）。
> 因此，在同一时间只有一个库的实例在运行是很关键的。


#### remotes

一般来说，remote 是使用 URL 配置的，示例如下

```js
new ModuleFederationPlugin({
  name: "app1",
  remotes: {
    app2: 'app2@http://localhost:3002/remoteEntry.js',
  }
})
```

当然 `remotes` 还可以有其他的扩展, 我们将它放在后面

### 引用 MF

`MF` 插件组合了 `ContainerPlugin` 和 `ContainerReferencePlugin`
所以它既是一个入口, 也是一个出口




## 引用

- https://www.syncfusion.com/blogs/post/what-is-webpack-module-federation-and-why-does-it-matter.aspx
- https://juejin.cn/post/7005450458009600036

# module Federation 模块联邦在微前端中的应用

## 什么是 module Federation

`module Federation`(下面简称 `MF`) 是 `webpack5` 推出的最新的概念

有用过 `webpack` 的小伙伴都知道, 在我们打包时, 都会对资源进行分包, 或者使用异步加载路由的方案,
这样打出来的包(也叫 `chunk`), 在我们使用时, 就是一个单独的加载

在过去, chunk 只是在一个项目中使用,  `webpack5` 中, `chunk` 通过 路径/fetch 等方式也可以提供给其他应用使用

这便是 `MF` 的发展由来, 不得不说这是一个很有想象力的API

`MF` 的粒度, 最小可以是一个组件/组件库, 最大可以是一个页面, 取决于你怎样使用

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

一般来说，`remote` 是使用 `URL` 配置的，示例如下

```js
new ModuleFederationPlugin({
  name: "app1",
  remotes: {
    app2: 'app2@http://localhost:3002/remoteEntry.js',
  }
})
```

当然 `remotes` 还可以有其他的扩展, 在后面会详细说明

### 引用 MF

`MF` 插件组合了 `ContainerPlugin` 和 `ContainerReferencePlugin`
所以它既是一个入口, 也是一个出口

所以我们再使用 `MF` 时, 也是需要添加对应插件:

```js
new ModuleFederationPlugin({
  name: 'mainApp',
  remotes: {
    app2: 'app2@http://localhost:3002/remoteEntry.js',
  },
  // 省略 shared
})
```

运行时截图:

![img.png](images%2Fimg.png)

之后我们就可以直接使用组件了:

```js
import App2Widget from 'app2/Widget';

function App() {
  // 当成正常组件一样使用
  return (
    <div>
      <h1>Dynamic System Host</h1>
      <h2>main App</h2>
      <App2Widget/>
    </div>
  );
}
```

## remotes 的方案

### 环境变量

在不同的环境中使用不同的链接, 可以解决 `pro` 和 `dev` 的不同环境问题
但是在大型应用中, 环境较多, 配置(添加/修改 `url`)就比较麻烦了

```js
new ModuleFederationPlugin({
  name: "Host",
  remotes: {
    RemoteA: `RemoteA@${env.A_URL}/remoteEntry.js`,
    RemoteB: `RemoteB@${env.B_URL}/remoteEntry.js`,
  },
})
```

### Webpack External Remotes Plugin

有一个方便的 `Webpack` 插件，由 `MF` 的创建者之一 [Zack Jackson](https://github.com/ScriptedAlchemy) 开发，称为 [external-remotes-plugin](https://www.npmjs.com/package/external-remotes-plugin)。它允许我们使用模板在运行时解析 URL


```js
plugins: [
  new ModuleFederationPlugin({
    name: "Host",
    remotes: {
      RemoteA: "RemoteA@[window.appAUrl]/remoteEntry.js",
      RemoteB: "RemoteB@[window.appBUrl]/remoteEntry.js",
    },
  }),
  new ExternalTemplateRemotesPlugin(),
]
```

在从远程应用程序加载任何代码之前, 我们加可以定义 `window` 的属性来灵活地定义我们的 `URL`

这种方法是完全动态的，可以解决我们的用例，但这种方法仍有一点限制:  
我们不能完全控制加载的生命周期。

### Promise

基于 `promise` 的获取方案, 此方案在官网也有所[提及](https://webpack.docschina.org/concepts/module-federation/#promisebaseddynamicremotes)


> 但是你也可以向 remote 传递一个 promise，其会在运行时被调用。你应该用任何符合上面描述的 get/init 接口的模块来调用这个 promise。例如，如果你想传递你应该使用哪个版本的联邦模块，你可以通过一个查询参数做以下事情：

```js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        app1: `promise new Promise(resolve => {
        
      const urlParams = new URLSearchParams(window.location.search)
      const version = urlParams.get('app1VersionParam')
      
      const remoteUrlWithVersion = 'http://localhost:3001/' + version + '/remoteEntry.js'
      
      const script = document.createElement('script')
      script.src = remoteUrlWithVersion
      
      script.onload = () => {
        // the injected script has loaded and is available on window
        // we can now resolve this Promise
        const proxy = {
          get: (request) => window.app1.get(request),
          init: (arg) => {
            try {
              return window.app1.init(arg)
            } catch(e) {
              console.log('remote container already initialized')
            }
          }
        }
        resolve(proxy)
      }
      document.head.appendChild(script);
    })
    `,
      },
      // ...
    }),
  ],
};
```

请注意当使用该 `API` 时，你 _必须_ `resolve` 一个包含 `get/init` `API` 的对象。


在 `promise` 中我们创建一个 `script` 标签, 同时添加动态 `URL`, 不过此方案是比较死板的, 因为 `url` 仍旧是写在配置中


### Dynamic Remote Containers

在 `webpack` 官网中有一种方案, 即[动态远程容器](https://webpack.docschina.org/concepts/module-federation/#dynamic-remote-containers)

这种方案就是像加载 `react` 子应用一样加载 `MF` 应用

我们的插件可以不用设置 `remotes`:

```js
plugins: [
  new ModuleFederationPlugin({
    name: "Host",
    remotes: {},
  }),
]
```

核心加载程序:

```js
function loadComponent(scope, module) {
  return async () => {
    // 初始化共享作用域（shared scope）用提供的已知此构建和所有远程的模块填充它
    await __webpack_init_sharing__('default');
    const container = window[scope]; // or get the container somewhere else
    // 初始化容器 它可能提供共享模块
    await container.init(__webpack_share_scopes__.default);
    const factory = await window[scope].get(module);
    const Module = factory();
    return Module;
  };
}
```

> __webpack_init_sharing__ 是一些 webpack 编译的变量, 最后运行时都是会转换成 __webpack_require__
> __webpack_require__ 是 webpack 运行时引用文件内容的方法

`container` 指的是我们在 `webpack` 配置的 `remotes` 中配置的一个应用。

`module` 指的是另一个 `exposes` 字段中的定义。

最后封装获取到 `hooks`:

```js
// 这里的 url, scope, module  都是可以通过接口什么的异步获取, 做到完全动态
// 原理还是通过 script 标签加载js 代码
const { Component: FederatedComponent, errorLoading } = useFederatedComponent('http://localhost:3002/remoteEntry.js', 'app2', './Widget');

<Suspense fallback={'loading...'}>
  {errorLoading
    ? `Error loading module "${module}"`
    : FederatedComponent && <FederatedComponent />}
</Suspense>
```

![img_1.png](images%2Fimg_1.png)

其中 `remoteEntry` 就是我们的入口了, 762 和 700, 这两个是 `moment` 的主题和多语言文件
而 630 则是 `Widget` 文件的内容

子组件单独加载 `moment`, 而没有 `react`, `react-dom`, 就是因为我们的 `shared` 配置

整个 `Dynamic Remote Containers` 的加载流:


![img_2.png](images%2Fimg_2.png)

具体例子可[点此查看](https://github.com/Grewer/notes/tree/master/JS%20%E7%9F%A5%E8%AF%86%E7%82%B9/%E6%A1%86%E6%9E%B6%E7%9B%B8%E5%85%B3/ModuleFederation/demo) 


## 基于 MF 的框架

这里也有一个框架是基于 `MF` 的: [EMP](https://emp2.netlify.app/)

该框架通过灵活的共享配置, 可自定义选择 `MF` / `CDN` / `ES import` / `Dll` 多种方式来共享库

## 扩展的可能性

`MF` 目前的 定位在于公共组件库/业务库的复用、统一, 但是他能作为应用级别的载体吗

在 `qiankun` 中, 子应用的获取, 是通过 `fetch` 来获取实例, 并在沙盒中解析的

但是 `MF` 的组件就不能实现这种场景, 因为我们一开始引用的是入口文件, 后续具体文件不能通过接口获取

只能通过 `script` 来拿, 但是这样就没有了 `js` 环境的隔离

所以在应用级别上, 目前的结论是: **可以当做一个乞丐版微前端的框架**

但是也需要注意各个应用直接的重复关系, `JS/CSS` 的隔离问题, 同时他也缺少对应生命周期来管理

在这方面, `qiankun` 是一个成熟的案例实现, `MF` 值得尝试的场景还是在业务公共组件这一块

## 总结

 `MF` 已经引来了许多的尝鲜者, 他是一种可扩展的解决方案，在独立的应用程序之间共享代码，对开发者来说非常方便。  

但是也存在以下的问题点:

1. 需要使用 `webpack5`, 现在很多老项目是在用 `webpack4`, 而又有一些新项目使用了 `vite`
2. `shared` 依赖不能 `tree sharking`
3. 代码执行不能使用沙箱隔离, 不太推荐做到应用级别


## 引用

- https://www.syncfusion.com/blogs/post/what-is-webpack-module-federation-and-why-does-it-matter.aspx
- https://juejin.cn/post/7005450458009600036
- https://oskari.io/blog/dynamic-remotes-module-federation/

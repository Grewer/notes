## bun.js  一个新的JavaScript运行环境

## 前言



## 介绍

Bun是一个现代的JavaScript运行环境，如Node, Deno。主要特性如下:

1. 启动速度快。
2. 更高的性能。
3. 完整的工具（打包器、转码器、包管理）。

下面我们来横向对比下框架所说的性能:

相同电脑下, 不同 js 运行环境的每秒操作数

![](images/bun1.png)

### 更多具体的优点

- 内置 `fetch`、`WebSocket` 和 `ReadableStream` 等API

- 可以在bun.js中使用npm包。支持ESM和CommonJS，但Bun内部使用ESM。

- 在bun.js中，每个文件都是转译的。TypeScript & JSX就可以使用。

- bun支持 "paths"、"jsxImportSource" 和更多来自tsconfig.json文件的内容。

- 使用 Bun.write 提供的最快的系统调用来写入、复制、管道、发送文件。

- bun.js会自动从.env文件中加载环境变量。不再需要 require("dotenv").config()

- bun内置了一个快速的 SQLite3 客户端 bun:sqlite

- bun.js实现了大部分的Node-API（N-API）。许多Node.js的本地模块都能正常工作。

### 加载器

目前，bun实现了以下加载器:

| Input | Loader | Output |
| --- | --- | --- |
| .js | JSX + JavaScript | .js |
| .jsx | JSX + JavaScript | .js |
| .ts | TypeScript + JavaScript | .js |
| .tsx | TypeScript + JSX + JavaScript | .js |
| .mjs | JavaScript | .js |
| .cjs | JavaScript | .js |
| .mts | TypeScript | .js |
| .cts | TypeScript | .js |
| .toml | TOML | .js |
| .css | CSS | .css |
| .env | Env | N/A |
| .\* | file | string |



### 实现

Bun.js 使用的是 [JavaScriptCore](https://github.com/WebKit/WebKit/tree/main/Source/JavaScriptCore) 引擎,
它的执行速度往往要比 V8 等更传统引擎要快。

而他本身, 是由叫做 [Zig](https://ziglang.org/) 的语言编写而成的, Zig 是一门新的系统级编程语言，相当于加强版 C 语言


## 配置

`bunfig.toml` 是 bun 的配置文件。

这里给出一个例子:

```
# 默认框架
# 默认情况下，bun会寻找一个类似于`bun-framework-${framework}的npm包，然后是`${framework}`。
framework = "next"
logLevel = "debug"

# publicDir = "public"
# external = ["jquery"]

[macros]
# 像这样重新映射的配置:
#     import {graphql} from 'react-relay';
# To:
#     import {graphql} from 'macro:bun-macro-relay';
react-relay = { "graphql" = "bun-macro-relay" }

[bundle]
saveTo = "node_modules.bun"
# Don't need this if `framework` is set, but showing it here as an example anyway
entryPoints = ["./app/index.ts"]

[bundle.packages]
# 如果设置了`framework'，就不需要这个了，在这里作为一个例子展示一下。
"@bigapp/design-system" = true

[dev]
# dev 的启动端口 3000-5000
port = 5000

[define]
# 环境变量
"process.env.bagel" = "'lox'"

[loaders]
# 如果文件后缀是 .bagel 则使用 JS 的解析器
".bagel" = "js"

[debug]
# 当导航到blob:或src:链接时，在你的编辑器中打开该文件
# 如果没有，它会尝试用$EDITOR或$VISUAL
# 如果仍然失败，它会尝试Visual Studio Code，然后是Sublime Text，然后是其他一些编辑器
# 这是由Bun.openInEditor()使用的
editor = "code"

# List of editors:
# - "subl", "sublime"
# - "vscode", "code"
# - "textmate", "mate"
# - "idea"
# - "webstorm"
# - "nvim", "neovim"
# - "vim","vi"
# - "emacs"
# - "atom"
```

## 使用

首先我们下载 cli

在终端执行如下指令即可进行下载:
```
curl https://bun.sh/install | bash
```

### 启用服务

先尝试实现类似于 node 的相关功能:

新建文件 http.js
```js
export default {
  port: 3000,
  fetch(request) {
    return new Response("Welcome to Bun!");
  },
};
```
之后在终端执行:

```shell
bun run http.js
```
之后打开浏览器地址 `http://localhost:3000/` 即可查看到对应页面的返回 `Welcome to Bun!`


### 创建项目

我们先尝试使用它默认的 react 模板项目来创建:
```shell
bun create react ./app
```

运行指令之后的终端部分输出:

![](images/bun2.png)

之后便出现如下目录:

![](images/bun3.png)

这就是他的官方 react 项目模板

## 问题

目前存在的问题

### Zig 的问题

### Issue 的问题

### 生态问题
很多常用的, 较为重要的功能还未支持, 例如: 
- treeShaking
- Source maps
- Code splitting
- CSS 压缩

具体可查看 [此处](https://github.com/oven-sh/bun/issues/159)

## 总结

# module Federation 在微前端中的应用

## 什么是 module Federation

`module Federation`(下面简称 MF) 是 webpack5 推出的最新的概念

有用过 webpack 的小伙伴都知道, 在我们打包时, 都会对资源进行分包, 或者使用异步加载路由的方案,
这样打出来的包(也叫 chunk), 在我们使用时, 就是一个单独的加载

在过去, chunk 只是在一个项目中使用,  webpack5 中, chunk 通过路径/fetch 等方式也可以提供给其他应用使用

这便是 MF 的发展由来, 不得不说这是一个很有想象力的API, 现在我们来看看他是怎么使用的

## 基础使用



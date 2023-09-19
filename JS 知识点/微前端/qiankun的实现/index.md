# 微前端的实现-以 qiankun 为例

## 微前端简介

>  Techniques, strategies and recipes for building a **modern web app** with **multiple teams** that can **ship features independently**. -- [Micro Frontends](https://micro-frontends.org/)
>
>  前端是一种多个团队通过独立发布功能的方式来共同构建现代化 web 应用的技术手段及方法策略。

在当前的微前端框架中， `qiankun` 是使用量最多的框架，今天本就以此框架来介绍他的运行原理

### 启动

我们先从 qiankun 的整体 API 启动来入手：

```js
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'react app', // app name registered
    entry: '//localhost:7100',
    container: '#yourContainer',
    activeRule: '/yourActiveRule',
  },
]);

start();
```

这便是 qiankun 在主应用最简单的启动方案

1. 注册子应用
2. 启动


我们先看 `registerMicroApps` 做了什么

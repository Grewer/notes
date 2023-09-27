# 微前端的实现-以 qiankun 为例

## 微前端简介

>  Techniques, strategies and recipes for building a **modern web app** with **multiple teams** that can **ship features independently**. -- [Micro Frontends](https://micro-frontends.org/)
>
>  前端是一种多个团队通过独立发布功能的方式来共同构建现代化 web 应用的技术手段及方法策略。

在当前的微前端框架中， `qiankun` 是使用量最多的框架，今天本就以此框架来介绍他的运行原理


## single-spa

首先我们需要知道的是 qiankun 是基于 single-spa 的封装框架，所以在这之前可以先了解下他是做什么的

TODO

## 启动

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

```tsx
import { registerApplication } from 'single-spa';

// todo
const frameworkStartedDefer = new Deferred<void>();

export function registerMicroApps<T extends ObjectType>(
  apps: Array<RegistrableApp<T>>,
  lifeCycles?: FrameworkLifeCycles<T>,
) {
  // 过滤,保证 name 的唯一
  const unregisteredApps = apps.filter((app) => !microApps.some((registeredApp) => registeredApp.name === app.name));

  // microApps 是缓存的数据， 默认[]
  microApps = [...microApps, ...unregisteredApps];

  // 针对每一个微应用，进行循环注册， registerApplication 是 single-spa 的方法
  unregisteredApps.forEach((app) => {
    const { name, activeRule, loader = noop, props, ...appConfig } = app;

    registerApplication({
      name,
      app: async () => {
        loader(true);
        await frameworkStartedDefer.promise;

        const { mount, ...otherMicroAppConfigs } = (
          await loadApp({ name, props, ...appConfig }, frameworkConfiguration, lifeCycles)
        )();

        return {
          mount: [async () => loader(true), ...toArray(mount), async () => loader(false)],
          ...otherMicroAppConfigs,
        };
      },
      activeWhen: activeRule,
      customProps: props,
    });
  });
}
```


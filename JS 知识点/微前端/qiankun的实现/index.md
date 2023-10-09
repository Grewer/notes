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

    // 注册微应用
    registerApplication({
      name,
      app: async () => {
        // 这是 single-spa 用来加载微应用的函数，这里 qiankun 对他做了下包装
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


这里说下 qiankun 新增的 API loader - `(loading: boolean) => void` - 可选，loading 状态发生变化时会调用的方法。

其他的都是 single-spa 自身的 API，不再赘述。

在加载微应用时， 最核心的函数 `loadApp`:

```ts
const { mount, ...otherMicroAppConfigs } = (
  await loadApp({ name, props, ...appConfig }, frameworkConfiguration, lifeCycles)
)()
```

此函数主要分为三个部分：

```tsx
async function loadApp<T extends ObjectType>(
  app: LoadableApp<T>,
  configuration: FrameworkConfiguration = {}, // 看成 qiankun 的一个全局配置
  lifeCycles?: FrameworkLifeCycles<T>, // 注册时的生命周期传递
): Promise<ParcelConfigObjectGetter>
```

### 1. 基础配置

```ts
 const {entry, name: appName} = app; // app 中的参数获取
  // 存储在 __app_instance_name_map__ 上的 全局唯一名称  根据次数生成名字
  const appInstanceId = genAppInstanceIdByName(appName);

  const markName = `[qiankun] App ${appInstanceId} Loading`;

  const {
    singular = false,
    sandbox = true,
    excludeAssetFilter,
    globalContext = window,
    ...importEntryOpts
  } = configuration; // 从全局配置中取值， 附加默认值
  
  // import-html-entry 库提供的方法
  // 获取入口的 html 内容和 script
  const {template, execScripts, assetPublicPath, getExternalScripts} = await importEntry(entry, importEntryOpts);
  
  // 触发外部脚本加载以确保所有资源准备好
  await getExternalScripts();

  
  // singular 是否为单实例场景，单实例指的是同一时间只会渲染一个微应用。默认为 true。
  // boolean | ((app: RegistrableApp<any>) => Promise<boolean>);
  // 相当于加了一个 flag， 保证所有微应用都卸载完毕
  // https://github.com/CanopyTax/single-spa/blob/master/src/navigation/reroute.js#L74
  if (await validateSingularMode(singular, app)) {
    await (prevAppUnmountedDeferred && prevAppUnmountedDeferred.promise);
  }

  // 在 html 中添加 qiankun 特有的 html 标签属性， 返回模板 html
  const appContent = getDefaultTplWrapper(appInstanceId, sandbox)(template);
  
  // 样式是否严格隔离
  const strictStyleIsolation = typeof sandbox === 'object' && !!sandbox.strictStyleIsolation;

  const scopedCSS = isEnableScopedCSS(sandbox);
  
  // 根据模板和对应配置创建 html 元素
  let initialAppWrapperElement: HTMLElement | null = createElement(
    appContent,
    strictStyleIsolation,
    scopedCSS,
    appInstanceId,
  );

  const initialContainer = 'container' in app ? app.container : undefined;
  const legacyRender = 'render' in app ? app.render : undefined;

  // 生成渲染函数
  const render = getRender(appInstanceId, appContent, legacyRender);

  // 第一次加载设置应用可见区域 dom 结构
  // 确保每次应用加载前容器 dom 结构已经设置完毕
  render({element: initialAppWrapperElement, loading: true, container: initialContainer}, 'loading');
  
  // 简单来说看做一个  document.getElementById 即可
  const initialAppWrapperGetter = getAppWrapperGetter(
    appInstanceId,
    !!legacyRender,
    strictStyleIsolation,
    scopedCSS,
    () => initialAppWrapperElement,
  );

  // 默认的一些参数值
  let global = globalContext;
  let mountSandbox = () => Promise.resolve();
  let unmountSandbox = () => Promise.resolve();
  const useLooseSandbox = typeof sandbox === 'object' && !!sandbox.loose;
  
  // 沙箱的快速模式，默认开启，官网文档还没更新介绍
  const speedySandbox = typeof sandbox === 'object' ? sandbox.speedy !== false : true;
  let sandboxContainer;
  
  // 是否开启了沙箱
  if (sandbox) {
    sandboxContainer = createSandboxContainer(
      appInstanceId,
      initialAppWrapperGetter,
      scopedCSS,
      useLooseSandbox,
      excludeAssetFilter,
      global,
      speedySandbox,
    );
    // 用沙箱的代理对象作为接下来使用的全局对象
    global = sandboxContainer.instance.proxy as typeof window;
    mountSandbox = sandboxContainer.mount;
    unmountSandbox = sandboxContainer.unmount;
  }

  // 合并参数
  const {
    beforeUnmount = [],
    afterUnmount = [],
    afterMount = [],
    beforeMount = [],
    beforeLoad = [],
  } = mergeWith({}, getAddOns(global, assetPublicPath), lifeCycles, (v1, v2) => concat(v1 ?? [], v2 ?? []));

```

### 2. hook 以及代码执行

```ts
 // 执行 beforeLoad 生命周期
  await execHooksChain(toArray(beforeLoad), app, global);

  // 正式执行代码，获取生命周期
  const scriptExports: any = await execScripts(global, sandbox && !useLooseSandbox, {
    scopedGlobalVariables: speedySandbox ? cachedGlobals : [],
  });
  
  // 从 script 导出中执行生命周期
  const {bootstrap, mount, unmount, update} = getLifecyclesFromExports(
    scriptExports,
    appName,
    global,
    sandboxContainer?.instance?.latestSetProp,
  );

  // qiankun 提供的一个全局状态，方便 loading 等状态的控制
  const {onGlobalStateChange, setGlobalState, offGlobalStateChange}: Record<string, CallableFunction> =
    getMicroAppStateActions(appInstanceId);

```

### 3，返回函数的逻辑

```ts
export async function loadApp<T extends ObjectType>(
  app: LoadableApp<T>,
  configuration: FrameworkConfiguration = {}, // 看成 qiankun 的一个全局配置
  lifeCycles?: FrameworkLifeCycles<T>, // 注册时的生命周期传递
): Promise<ParcelConfigObjectGetter> {
  // ...
 
  // 返回值： 获取配置的一个函数
  const parcelConfigGetter: ParcelConfigObjectGetter = (remountContainer = initialContainer) => {
    let appWrapperElement: HTMLElement | null;
    let appWrapperGetter: ReturnType<typeof getAppWrapperGetter>;
    
    // 一个配置对象， 在各个周期中手动添加需要执行的逻辑
    const parcelConfig: ParcelConfigObject = {
      name: appInstanceId,
      bootstrap,
      mount: [
        async () => {
          if (process.env.NODE_ENV === 'development') {
            // dev 场景下的判断，忽略
          }
        },
        async () => {
          // 同上， 保证所有微应用都卸载完毕
          if ((await validateSingularMode(singular, app)) && prevAppUnmountedDeferred) {
            return prevAppUnmountedDeferred.promise;
          }

          return undefined;
        },
        // 在子应用 mount 之前初始化包装元素
        async () => {
          appWrapperElement = initialAppWrapperElement;
          appWrapperGetter = getAppWrapperGetter(
            appInstanceId,
            !!legacyRender,
            strictStyleIsolation,
            scopedCSS,
            () => appWrapperElement,
          );
        },
        // 添加 mount hook, 确保每次应用加载前容器 dom 结构已经设置完毕
        async () => {
          const useNewContainer = remountContainer !== initialContainer;
          if (useNewContainer || !appWrapperElement) {
            // element will be destroyed after unmounted, we need to recreate it if it not exist
            // or we try to remount into a new container
            appWrapperElement = createElement(appContent, strictStyleIsolation, scopedCSS, appInstanceId);
            syncAppWrapperElement2Sandbox(appWrapperElement);
          }

          render({element: appWrapperElement, loading: true, container: remountContainer}, 'mounting');
        },
        mountSandbox,
        // exec the chain after rendering to keep the behavior with beforeLoad
        async () => execHooksChain(toArray(beforeMount), app, global),
        async (props) => mount({...props, container: appWrapperGetter(), setGlobalState, onGlobalStateChange}),
        // finish loading after app mounted
        async () => render({element: appWrapperElement, loading: false, container: remountContainer}, 'mounted'),
        async () => execHooksChain(toArray(afterMount), app, global),
        // initialize the unmount defer after app mounted and resolve the defer after it unmounted
        async () => {
          if (await validateSingularMode(singular, app)) {
            prevAppUnmountedDeferred = new Deferred<void>();
          }
        },
        async () => {
          if (process.env.NODE_ENV === 'development') {
            const measureName = `[qiankun] App ${appInstanceId} Loading Consuming`;
            performanceMeasure(measureName, markName);
          }
        },
      ],
      unmount: [
        async () => execHooksChain(toArray(beforeUnmount), app, global),
        async (props) => unmount({...props, container: appWrapperGetter()}),
        unmountSandbox,
        async () => execHooksChain(toArray(afterUnmount), app, global),
        async () => {
          render({element: null, loading: false, container: remountContainer}, 'unmounted');
          offGlobalStateChange(appInstanceId);
          // for gc
          appWrapperElement = null;
          syncAppWrapperElement2Sandbox(appWrapperElement);
        },
        async () => {
          if ((await validateSingularMode(singular, app)) && prevAppUnmountedDeferred) {
            prevAppUnmountedDeferred.resolve();
          }
        },
      ],
    };

    if (typeof update === 'function') {
      parcelConfig.update = update;
    }

    return parcelConfig;
  };

  return parcelConfigGetter;
}

```

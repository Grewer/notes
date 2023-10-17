# 微前端的实现-以 qiankun 为例

## 微前端简介

>  Techniques, strategies and recipes for building a **modern web app** with **multiple teams** that can **ship features independently**. -- [Micro Frontends](https://micro-frontends.org/)
>
>  前端是一种多个团队通过独立发布功能的方式来共同构建现代化 web 应用的技术手段及方法策略。

在当前的微前端框架中， `qiankun` 是使用量最多的框架，今天本就以此框架来介绍他的运行原理


## single-spa

首先我们需要知道的是 qiankun 是基于 single-spa 的封装框架，所以在这之前可以先了解下他是做什么的

TODO

## 例子

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

## 注册

我们先看 `registerMicroApps` 做了什么

```tsx
import { registerApplication } from 'single-spa';

// 一个空的 promise
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
  // 相当于加了一个 flag， 保证 start 的执行
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
          // 同上， 保证所有微应用执行了
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
            // 元素在卸载后将被销毁，如果它不存在，需要重新创建它
            appWrapperElement = createElement(appContent, strictStyleIsolation, scopedCSS, appInstanceId); // 看做一个容器 div 即可
            syncAppWrapperElement2Sandbox(appWrapperElement);
          }
          // 渲染
          render({element: appWrapperElement, loading: true, container: remountContainer}, 'mounting');
        },
        mountSandbox,
        // 执行 beforeMount 声明周期
        async () => execHooksChain(toArray(beforeMount), app, global),
        // 子应用的 mount export
        async (props) => mount({...props, container: appWrapperGetter(), setGlobalState, onGlobalStateChange}),
        // 切换 loading 在 mounted
        async () => render({element: appWrapperElement, loading: false, container: remountContainer}, 'mounted'),
        async () => execHooksChain(toArray(afterMount), app, global),
        // 在应用程序安装后初始化 添加 prevAppUnmountedDeferred 的 promise 事件
        async () => {
          if (await validateSingularMode(singular, app)) {
            prevAppUnmountedDeferred = new Deferred<void>();
          }
        },
        async () => {
          if (process.env.NODE_ENV === 'development') {
            // dev 场景下的判断，忽略
          }
        },
      ],
      unmount: [
        // unmount 的一些事件执行，和 mount 类似
        // ...
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

到这里 `single-spa` 的 `registerApplication` 注册阶段已完成

那么注册完就是启动： `start`

## 启动

```tsx
function start(opts: FrameworkConfiguration = {}) {
  // 参数合并，取值
  frameworkConfiguration = { prefetch: true, singular: true, sandbox: true, ...opts };
  const { prefetch, urlRerouteOnly = defaultUrlRerouteOnly, ...importEntryOpts } = frameworkConfiguration
  
  // 如果有预加载策略
  // prefetch - boolean | 'all' | string[] | (( apps: RegistrableApp[] ) => { criticalAppNames: string[]; minorAppsName: string[] }) - 可选，是否开启预加载，默认为 true。
  // 配置为 true 则会在第一个微应用 mount 完成后开始预加载其他微应用的静态资源
  // 配置为 'all' 则主应用 start 后即开始预加载所有微应用静态资源
  // 配置为 string[] 则会在第一个微应用 mounted 后开始加载数组内的微应用资源
  // 配置为 function 则可完全自定义应用的资源加载时机 (首屏应用及次屏应用)
  if (prefetch) {
    doPrefetchStrategy(microApps, prefetch, importEntryOpts);
  }

  // 判断是否支持 Proxy 或者一些其他配置 ，不支持则自动降级， 设置 { loose: true } 或者 { speedy: false }
  // frameworkConfiguration 是全局变量
  frameworkConfiguration = autoDowngradeForLowVersionBrowser(frameworkConfiguration);

  // 来自 single-spa 的 API
  startSingleSpa({ urlRerouteOnly });
  started = true; // flag 设置
  
  // 空 promise 正式添加状态，原本都是挂载，处于 await 状态
  frameworkStartedDefer.resolve();
}
```

### 关于沙箱

在创建沙箱时会根据 `start` 时的判断切换沙箱模式：

```tsx
  if (window.Proxy) {
  sandbox = useLooseSandbox
    ? new LegacySandbox(appName, globalContext)
    : new ProxySandbox(appName, globalContext, { speedy: !!speedySandBox });
} else {
  sandbox = new SnapshotSandbox(appName);
}
```

他们之间的具体区别，已经在沙箱一文中讲述了，可点此查看

## 以组件的方式使用微应用

```tsx
import { loadMicroApp } from 'qiankun';

// do something

const container = document.createElement('div');
const microApp = loadMicroApp({ name: 'app', container, entry: '//micro-app.alipay.com' });

// do something and then unmount app
microApp.unmout();

// do something and then remount app
microApp.mount();
```

通过这个 API 我们可以自己去控制一个微应用加载/卸载

我们先来看看 `loadMicroApp` 他做了什么：

```tsx
export function loadMicroApp<T extends ObjectType>(
  app: LoadableApp<T>,
  configuration?: FrameworkConfiguration & { autoStart?: boolean },
  lifeCycles?: FrameworkLifeCycles<T>,
): MicroApp {
  const { props, name } = app;

  const container = 'container' in app ? app.container : undefined;
  // Must compute the container xpath at beginning to keep it consist around app running
  // If we compute it every time, the container dom structure most probably been changed and result in a different xpath value
  const containerXPath = getContainerXPath(container);
  const appContainerXPathKey = `${name}-${containerXPath}`;

  let microApp: MicroApp;
  const wrapParcelConfigForRemount = (config: ParcelConfigObject): ParcelConfigObject => {
    let microAppConfig = config;
    if (container) {
      if (containerXPath) {
        const containerMicroApps = containerMicroAppsMap.get(appContainerXPathKey);
        if (containerMicroApps?.length) {
          const mount = [
            async () => {
              // While there are multiple micro apps mounted on the same container, we must wait until the prev instances all had unmounted
              // Otherwise it will lead some concurrent issues
              const prevLoadMicroApps = containerMicroApps.slice(0, containerMicroApps.indexOf(microApp));
              const prevLoadMicroAppsWhichNotBroken = prevLoadMicroApps.filter(
                (v) => v.getStatus() !== 'LOAD_ERROR' && v.getStatus() !== 'SKIP_BECAUSE_BROKEN',
              );
              await Promise.all(prevLoadMicroAppsWhichNotBroken.map((v) => v.unmountPromise));
            },
            ...toArray(microAppConfig.mount),
          ];

          microAppConfig = {
            ...config,
            mount,
          };
        }
      }
    }

    return {
      ...microAppConfig,
      // empty bootstrap hook which should not run twice while it calling from cached micro app
      bootstrap: () => Promise.resolve(),
    };
  };

  /**
   * using name + container xpath as the micro app instance id,
   * it means if you rendering a micro app to a dom which have been rendered before,
   * the micro app would not load and evaluate its lifecycles again
   */
  const memorizedLoadingFn = async (): Promise<ParcelConfigObject> => {
    const userConfiguration = autoDowngradeForLowVersionBrowser(
      configuration ?? { ...frameworkConfiguration, singular: false },
    );
    const { $$cacheLifecycleByAppName } = userConfiguration;

    if (container) {
      // using appName as cache for internal experimental scenario
      if ($$cacheLifecycleByAppName) {
        const parcelConfigGetterPromise = appConfigPromiseGetterMap.get(name);
        if (parcelConfigGetterPromise) return wrapParcelConfigForRemount((await parcelConfigGetterPromise)(container));
      }

      if (containerXPath) {
        const parcelConfigGetterPromise = appConfigPromiseGetterMap.get(appContainerXPathKey);
        if (parcelConfigGetterPromise) return wrapParcelConfigForRemount((await parcelConfigGetterPromise)(container));
      }
    }

    const parcelConfigObjectGetterPromise = loadApp(app, userConfiguration, lifeCycles);

    if (container) {
      if ($$cacheLifecycleByAppName) {
        appConfigPromiseGetterMap.set(name, parcelConfigObjectGetterPromise);
      } else if (containerXPath) appConfigPromiseGetterMap.set(appContainerXPathKey, parcelConfigObjectGetterPromise);
    }

    return (await parcelConfigObjectGetterPromise)(container);
  };

  if (!started && configuration?.autoStart !== false) {
    // We need to invoke start method of single-spa as the popstate event should be dispatched while the main app calling pushState/replaceState automatically,
    // but in single-spa it will check the start status before it dispatch popstate
    // see https://github.com/single-spa/single-spa/blob/f28b5963be1484583a072c8145ac0b5a28d91235/src/navigation/navigation-events.js#L101
    // ref https://github.com/umijs/qiankun/pull/1071
    startSingleSpa({ urlRerouteOnly: frameworkConfiguration.urlRerouteOnly ?? defaultUrlRerouteOnly });
  }

  microApp = mountRootParcel(memorizedLoadingFn, { domElement: document.createElement('div'), ...props });

  if (container) {
    if (containerXPath) {
      // Store the microApps which they mounted on the same container
      const microAppsRef = containerMicroAppsMap.get(appContainerXPathKey) || [];
      microAppsRef.push(microApp);
      containerMicroAppsMap.set(appContainerXPathKey, microAppsRef);

      const cleanup = () => {
        const index = microAppsRef.indexOf(microApp);
        microAppsRef.splice(index, 1);
        microApp = null;
      };

      // gc after unmount
      microApp.unmountPromise.then(cleanup).catch(cleanup);
    }
  }

  return microApp;
}

```


## 总结

在 qiankun 中，总共做了以下几件事情：

- 基于 single-spa 封装，提供了更加开箱即用的 API。
- 技术栈无关，任意技术栈的应用均可 使用/接入。
- HTML Entry ，保持技术站的。
- 样式隔离。
- JS 沙箱，确保微应用之间 全局变量/事件 不冲突。
- 资源预加载。

## 引用

- https://qiankun.umijs.org/zh/guide

## 引言

前一段时间, 正好在做微前端的接入和微前端管理平台的相关事项。 而我们当前使用的微前端框架则是 `qiankun`, 他是这样介绍自己的:
> qiankun 是一个基于 single-spa 的微前端实现库，旨在帮助大家能更简单、无痛的构建一个生产可用微前端架构系统。

所以本文基于 `single-spa` 源码, 来介绍 `single-spa`

当前使用版本 5.9.4

## 概念 todo 待定位置

在single-spa中，有以下三种微前端类型：

1. single-spa applications: 为一组特定路由渲染组件的微前端。
2. single-spa parcels: 不受路由控制，渲染组件的微前端。
3. utility modules: 非渲染组件，用于暴露共享javascript逻辑的微前端。

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
singleSpa.registerApplication({name, app, activeWhen});
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

我们先从注册应用开始看起

```js
function registerApplication(
    appNameOrConfig,
    appOrLoadApp,
    activeWhen,
    customProps
) {
    // 数据整理, 验证传参的合理性, 最后整理得到数据源:
    // {
    //      name: xxx,
    //      loadApp: xxx,
    //      activeWhen: xxx,
    //      customProps: xxx,
    // }
    const registration = sanitizeArguments(
        appNameOrConfig,
        appOrLoadApp,
        activeWhen,
        customProps
    );
    
    // 如果有重名,则抛出错误, 所以 name 应该是要保持唯一值
    if (getAppNames().indexOf(registration.name) !== -1)
        throw Error('xxx'); // 这里省略具体错误
    
    // 往 apps 中添加数据
    // apps 是 single-spa 的一个全局变量, 用来存储当前的应用数据
    apps.push(
        assign(
            {
                // 预留值
                loadErrorTime: null,
                status: NOT_LOADED,
                parcels: {},
                devtools: {
                    overlays: {
                        options: {},
                        selectors: [],
                    },
                },
            },
            registration
        )
    );
    
    // 判断 window 是否为空, 进入条件
    if (isInBrowser) {
        ensureJQuerySupport(); // 使用 js 来监听路径变化的事件
        reroute();
    }
}
```

### reroute
reroute 比较复杂, 简单来说, 在注册应用时, 调用此函数, 就是将应用的 promise 加载函数, 注入一个待加载的数组中
等后面正式启动时再调用, 类似于 `()=>import('xxx')`


```js
export function reroute(pendingPromises = [], eventArguments) {
    if (appChangeUnderway) { //  一开始默认是 false
        // 如果是 true, 则返回一个 promise, 在队列中添加 resolve 参数等等
        return new Promise((resolve, reject) => {
            peopleWaitingOnAppChange.push({
                resolve,
                reject,
                eventArguments,
            });
        });
    }
    
    const {
        appsToUnload,
        appsToUnmount,
        appsToLoad,
        appsToMount,
    } = getAppChanges();
    // 遍历所有应用数组 apps , 根据 app 的状态, 来分类到这四个数组中
    // unload , unmount, to load, to mount
    
    let appsThatChanged,
        navigationIsCanceled = false,
        oldUrl = currentUrl,
        newUrl = (currentUrl = window.location.href);
    
    // 存储着一个闭包变量, 是否已经启动, 在注册步骤中, 是未启动的
    if (isStarted()) {
        appChangeUnderway = true;
        appsThatChanged = appsToUnload.concat(
            appsToLoad,
            appsToUnmount,
            appsToMount
        );
        // performAppChanges 放在后面讲解
        return performAppChanges();
    } else {
        // 未启动, 直接返回 loadApps, 他的定义在下方
        appsThatChanged = appsToLoad;
        return loadApps();
    }
    
    function cancelNavigation() {
        navigationIsCanceled = true;
    }
    
    // 返回一个 resolve 的 promise
    // 将需要加载的应用,  map 成一个新的 promise 数组
    // 并且用 promise.all 来返回
    // TODO toLoadPromise
    // 不管成功或者失败, 都会调用 callAllEventListeners 函数, 进行路由通知
    function loadApps() {
        return Promise.resolve().then(() => {
            const loadPromises = appsToLoad.map(toLoadPromise);
            
            return (
                Promise.all(loadPromises)
                .then(callAllEventListeners)
                // there are no mounted apps, before start() is called, so we always return []
                .then(() => [])
                .catch((err) => {
                    callAllEventListeners();
                    throw err;
                })
            );
        });
    }
    
    
    
    // 调用 pendingPromises, 在注册应用时, pendingPromises 为空, 可忽略
    // 
    function callAllEventListeners() {
        pendingPromises.forEach((pendingPromise) => {
            callCapturedEventListeners(pendingPromise.eventArguments);
        });
        // 根据 eventArguments 调用路由事件, 如 "hashchange", "popstate"
        //  在注册应用时因为 eventArguments为空, 不会产生调用结果
        callCapturedEventListeners(eventArguments);
    }
    
}
```

### toLoadPromise

```js
export function toLoadPromise(app) {
  return Promise.resolve().then(() => {
    if (app.loadPromise) {
      return app.loadPromise;
    }

    if (app.status !== NOT_LOADED && app.status !== LOAD_ERROR) {
      return app;
    }

    app.status = LOADING_SOURCE_CODE;

    let appOpts, isUserErr;

    return (app.loadPromise = Promise.resolve()
      .then(() => {
        const loadPromise = app.loadApp(getProps(app));
        if (!smellsLikeAPromise(loadPromise)) {
          // The name of the app will be prepended to this error message inside of the handleAppError function
          isUserErr = true;
          throw Error(
            formatErrorMessage(
              33,
              __DEV__ &&
                `single-spa loading function did not return a promise. Check the second argument to registerApplication('${toName(
                  app
                )}', loadingFunction, activityFunction)`,
              toName(app)
            )
          );
        }
        return loadPromise.then((val) => {
          app.loadErrorTime = null;

          appOpts = val;

          let validationErrMessage, validationErrCode;

          if (typeof appOpts !== "object") {
            validationErrCode = 34;
            if (__DEV__) {
              validationErrMessage = `does not export anything`;
            }
          }

          if (
            // ES Modules don't have the Object prototype
            Object.prototype.hasOwnProperty.call(appOpts, "bootstrap") &&
            !validLifecycleFn(appOpts.bootstrap)
          ) {
            validationErrCode = 35;
            if (__DEV__) {
              validationErrMessage = `does not export a valid bootstrap function or array of functions`;
            }
          }

          if (!validLifecycleFn(appOpts.mount)) {
            validationErrCode = 36;
            if (__DEV__) {
              validationErrMessage = `does not export a mount function or array of functions`;
            }
          }

          if (!validLifecycleFn(appOpts.unmount)) {
            validationErrCode = 37;
            if (__DEV__) {
              validationErrMessage = `does not export a unmount function or array of functions`;
            }
          }

          const type = objectType(appOpts);

          if (validationErrCode) {
            let appOptsStr;
            try {
              appOptsStr = JSON.stringify(appOpts);
            } catch {}
            console.error(
              formatErrorMessage(
                validationErrCode,
                __DEV__ &&
                  `The loading function for single-spa ${type} '${toName(
                    app
                  )}' resolved with the following, which does not have bootstrap, mount, and unmount functions`,
                type,
                toName(app),
                appOptsStr
              ),
              appOpts
            );
            handleAppError(validationErrMessage, app, SKIP_BECAUSE_BROKEN);
            return app;
          }

          if (appOpts.devtools && appOpts.devtools.overlays) {
            app.devtools.overlays = assign(
              {},
              app.devtools.overlays,
              appOpts.devtools.overlays
            );
          }

          app.status = NOT_BOOTSTRAPPED;
          app.bootstrap = flattenFnArray(appOpts, "bootstrap");
          app.mount = flattenFnArray(appOpts, "mount");
          app.unmount = flattenFnArray(appOpts, "unmount");
          app.unload = flattenFnArray(appOpts, "unload");
          app.timeouts = ensureValidAppTimeouts(appOpts.timeouts);

          delete app.loadPromise;

          return app;
        });
      })
      .catch((err) => {
        delete app.loadPromise;

        let newStatus;
        if (isUserErr) {
          newStatus = SKIP_BECAUSE_BROKEN;
        } else {
          newStatus = LOAD_ERROR;
          app.loadErrorTime = new Date().getTime();
        }
        handleAppError(err, app, newStatus);

        return app;
      }));
  });
}

```

## 总结

在后续再来介绍 `qiankun` 和其他的微前端框架(如...)

## 引用

- https://zh-hans.single-spa.js.org/docs/getting-started-overview
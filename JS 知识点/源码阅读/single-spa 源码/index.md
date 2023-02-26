## 引言

前一段时间, 正好在做微前端的接入和微前端管理平台的相关事项。 而我们当前使用的微前端框架则是 `qiankun`, 他是这样介绍自己的:
> qiankun 是一个基于 single-spa 的微前端实现库，旨在帮助大家能更简单、无痛的构建一个生产可用微前端架构系统。

所以本文基于 `single-spa` 源码, 来介绍 `single-spa`

当前使用版本 5.9.4

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
                status: NOT_LOADED, // 默认是 NOT_LOADED , 也就是待加载的状态
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

reroute 比较复杂, 简单来说, 在注册应用时, 调用此函数, 就是将应用的 promise 加载函数, 注入一个待加载的数组中 等后面正式启动时再调用, 类似于 `()=>import('xxx')`

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
    // 不管成功或者失败, 都会调用 callAllEventListeners 函数, 进行路由通知
    function loadApps() {
        return Promise.resolve().then(() => {
            // toLoadPromise 主要作用在甲方有讲述, 主要来定义资源的加载, 以及对应的回调
            const loadPromises = appsToLoad.map(toLoadPromise);
            
            // 通过 Promise.all 来执行, 返回的是 app.loadPromise
            // 这是资源加载
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

主要功能是赋值 loadPromise 给 app, 其中 loadPromise 函数中包括了 执行函数,来加载应用的资源, 定义加载完毕的回调函数, 状态的修改, 还有加载错误的一些处理

```js
export function toLoadPromise(app) {
    return Promise.resolve().then(() => {
        // 是否重复注册 promise 加载了
        if (app.loadPromise) {
            return app.loadPromise;
        }
        // 刚注册的就是 NOT_LOADED 状态
        if (app.status !== NOT_LOADED && app.status !== LOAD_ERROR) {
            return app;
        }
        
        // 修改状态为, 加载源码
        app.status = LOADING_SOURCE_CODE;
        
        let appOpts, isUserErr;
        
        // 返回的是 app.loadPromise
        return (app.loadPromise = Promise.resolve()
        .then(() => {
            // 这里调用的了 app的 loadApp 函数(由外部传入的), 开始加载资源
            // getProps 用来判断 customProps 是否合法, 最后传值给 loadApp 函数
            const loadPromise = app.loadApp(getProps(app));
            // 判断 loadPromise 是否是一个 promise
            if (!smellsLikeAPromise(loadPromise)) {
                // 省略报错
                isUserErr = true;
                throw Error("...");
            }
            return loadPromise.then((val) => {
                // 资源加载成功
                app.loadErrorTime = null;
                
                appOpts = val;
                
                let validationErrMessage, validationErrCode;
                
                // 省略对于资源返回结果的判断
                // 比如appOpts是否是对象, appOpts.mount appOpts.bootstrap 是否是函数, 等等
                // ...
                
                // 修改状态为, 未进入引导
                // 同时将资源结果的函数赋值, 以备后面执行
                app.status = NOT_BOOTSTRAPPED;
                app.bootstrap = flattenFnArray(appOpts, "bootstrap");
                app.mount = flattenFnArray(appOpts, "mount");
                app.unmount = flattenFnArray(appOpts, "unmount");
                app.unload = flattenFnArray(appOpts, "unload");
                app.timeouts = ensureValidAppTimeouts(appOpts.timeouts);
                
                // 执行完毕之后删除 loadPromise
                delete app.loadPromise;
                
                return app;
            });
        })
        .catch((err) => {
            // 报错也会删除 loadPromise
            delete app.loadPromise;
            // 修改状态为 用户的传参报错, 或者是加载出错
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

## start

注册完应用之后, 最后是 `singleSpa.start();` 的执行

`start` 的代码很简单:

```js
// 一般来说 opts 是不传什么东西的
function start(opts) {
    // 主要作用还是将标记符 started设置为 true 了
    started = true;
    if (opts && opts.urlRerouteOnly) {
        // 使用此参数可以人为地触发事件 popstate
        setUrlRerouteOnly(opts.urlRerouteOnly);
    }
    if (isInBrowser) {
        reroute();
    }
}
```

### reroute

上述已经讲过注册时 `reroute` 的一些代码了, 这里会忽略已讲过的一些东西

```js
function reroute(pendingPromises = [], eventArguments) {
    const {
        appsToUnload,
        appsToUnmount,
        appsToLoad,
        appsToMount,
    } = getAppChanges();
    let appsThatChanged,
        navigationIsCanceled = false,
        oldUrl = currentUrl,
        newUrl = (currentUrl = window.location.href);
    
    if (isStarted()) {
        // 这次开始执行此处
        appChangeUnderway = true;
        // 合并状态需要变更的 app
        appsThatChanged = appsToUnload.concat(
            appsToLoad,
            appsToUnmount,
            appsToMount
        );
        // 返回 performAppChanges 函数
        return performAppChanges();
    }
```

### performAppChanges

在启动后,就会触发此函数 `performAppChanges`, 并返回结果  
本函数的作用主要是事件的触发, 包括自定义事件和子应用中的一些事件

```js
  function performAppChanges() {
    return Promise.resolve().then(() => {
        // 触发自定义事件, 关于 CustomEvent 我们再下方详述
        // 当前事件触发 getCustomEventDetail
        // 主要是 app 的状态, url 的变更, 参数等等
        window.dispatchEvent(
            new CustomEvent(
                appsThatChanged.length === 0
                    ? "single-spa:before-no-app-change"
                    : "single-spa:before-app-change",
                getCustomEventDetail(true)
            )
        );
        
        // 省略类似事件
        
        // 除非在上一个事件中调用了 cancelNavigation, 才会进入这一步
        if (navigationIsCanceled) {
            window.dispatchEvent(
                new CustomEvent(
                    "single-spa:before-mount-routing-event",
                    getCustomEventDetail(true)
                )
            );
            // 将 peopleWaitingOnAppChange 的数据重新执行 reroute 函数 reroute(peopleWaitingOnAppChange)  
            finishUpAndReturn();
            // 更新 url
            navigateToUrl(oldUrl);
            return;
        }
        
        // 准备卸载的 app
        const unloadPromises = appsToUnload.map(toUnloadPromise);
        
        // 执行子应用中的 unmount 函数, 如果超时也会有报警
        const unmountUnloadPromises = appsToUnmount
        .map(toUnmountPromise)
        .map((unmountPromise) => unmountPromise.then(toUnloadPromise));
        
        const allUnmountPromises = unmountUnloadPromises.concat(unloadPromises);
        
        const unmountAllPromise = Promise.all(allUnmountPromises);
        
        // 所有应用的卸载事件
        unmountAllPromise.then(() => {
            window.dispatchEvent(
                new CustomEvent(
                    "single-spa:before-mount-routing-event",
                    getCustomEventDetail(true)
                )
            );
        });
        
        // 执行 bootstrap 生命周期, tryToBootstrapAndMount 确保先执行 bootstrap
        const loadThenMountPromises = appsToLoad.map((app) => {
            return toLoadPromise(app).then((app) =>
                tryToBootstrapAndMount(app, unmountAllPromise)
            );
        });
        
        // 执行 mount 事件
        const mountPromises = appsToMount
        .filter((appToMount) => appsToLoad.indexOf(appToMount) < 0)
        .map((appToMount) => {
            return tryToBootstrapAndMount(appToMount, unmountAllPromise);
        });
        // 其他的部分不太重要, 可省略
    });
}

```

### CustomEvent

`CustomEvent` 是一个原生 API, 这里稍微介绍下

### 图的描述


## 总结

single-spa 无疑是微前端的一个重要里程碑,在大型应用场景下, 可支持多类框架, 抹平了框架间的巨大交互成本

他的核心是对子应用进行管理，但还有很多工程化问题没做。比如JavaScript全局对象覆盖、css加载卸载、公共模块管理要求只下载一次等等性能问题

这又促成了其他的框架的诞生, 比较出名的就是 `qiankun`、`Isomorphic Layout Composer`。

而这些就是另一个话题了。

## 引用

- https://zh-hans.single-spa.js.org/docs/getting-started-overview
- https://zhuanlan.zhihu.com/p/344145423
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

reroute 比较复杂, 我们单独讲:


```js
export function reroute(pendingPromises = [], eventArguments) {
  if (appChangeUnderway) {
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
  let appsThatChanged,
    navigationIsCanceled = false,
    oldUrl = currentUrl,
    newUrl = (currentUrl = window.location.href);

  if (isStarted()) {
    appChangeUnderway = true;
    appsThatChanged = appsToUnload.concat(
      appsToLoad,
      appsToUnmount,
      appsToMount
    );
    return performAppChanges();
  } else {
    appsThatChanged = appsToLoad;
    return loadApps();
  }

  function cancelNavigation() {
    navigationIsCanceled = true;
  }

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

  function performAppChanges() {
    return Promise.resolve().then(() => {
      // https://github.com/single-spa/single-spa/issues/545
      window.dispatchEvent(
        new CustomEvent(
          appsThatChanged.length === 0
            ? "single-spa:before-no-app-change"
            : "single-spa:before-app-change",
          getCustomEventDetail(true)
        )
      );

      window.dispatchEvent(
        new CustomEvent(
          "single-spa:before-routing-event",
          getCustomEventDetail(true, { cancelNavigation })
        )
      );

      if (navigationIsCanceled) {
        window.dispatchEvent(
          new CustomEvent(
            "single-spa:before-mount-routing-event",
            getCustomEventDetail(true)
          )
        );
        finishUpAndReturn();
        navigateToUrl(oldUrl);
        return;
      }

      const unloadPromises = appsToUnload.map(toUnloadPromise);

      const unmountUnloadPromises = appsToUnmount
        .map(toUnmountPromise)
        .map((unmountPromise) => unmountPromise.then(toUnloadPromise));

      const allUnmountPromises = unmountUnloadPromises.concat(unloadPromises);

      const unmountAllPromise = Promise.all(allUnmountPromises);

      unmountAllPromise.then(() => {
        window.dispatchEvent(
          new CustomEvent(
            "single-spa:before-mount-routing-event",
            getCustomEventDetail(true)
          )
        );
      });

      /* We load and bootstrap apps while other apps are unmounting, but we
       * wait to mount the app until all apps are finishing unmounting
       */
      const loadThenMountPromises = appsToLoad.map((app) => {
        return toLoadPromise(app).then((app) =>
          tryToBootstrapAndMount(app, unmountAllPromise)
        );
      });

      /* These are the apps that are already bootstrapped and just need
       * to be mounted. They each wait for all unmounting apps to finish up
       * before they mount.
       */
      const mountPromises = appsToMount
        .filter((appToMount) => appsToLoad.indexOf(appToMount) < 0)
        .map((appToMount) => {
          return tryToBootstrapAndMount(appToMount, unmountAllPromise);
        });
      return unmountAllPromise
        .catch((err) => {
          callAllEventListeners();
          throw err;
        })
        .then(() => {
          /* Now that the apps that needed to be unmounted are unmounted, their DOM navigation
           * events (like hashchange or popstate) should have been cleaned up. So it's safe
           * to let the remaining captured event listeners to handle about the DOM event.
           */
          callAllEventListeners();

          return Promise.all(loadThenMountPromises.concat(mountPromises))
            .catch((err) => {
              pendingPromises.forEach((promise) => promise.reject(err));
              throw err;
            })
            .then(finishUpAndReturn);
        });
    });
  }

  function finishUpAndReturn() {
    const returnValue = getMountedApps();
    pendingPromises.forEach((promise) => promise.resolve(returnValue));

    try {
      const appChangeEventName =
        appsThatChanged.length === 0
          ? "single-spa:no-app-change"
          : "single-spa:app-change";
      window.dispatchEvent(
        new CustomEvent(appChangeEventName, getCustomEventDetail())
      );
      window.dispatchEvent(
        new CustomEvent("single-spa:routing-event", getCustomEventDetail())
      );
    } catch (err) {
      /* We use a setTimeout because if someone else's event handler throws an error, single-spa
       * needs to carry on. If a listener to the event throws an error, it's their own fault, not
       * single-spa's.
       */
      setTimeout(() => {
        throw err;
      });
    }

    /* Setting this allows for subsequent calls to reroute() to actually perform
     * a reroute instead of just getting queued behind the current reroute call.
     * We want to do this after the mounting/unmounting is done but before we
     * resolve the promise for the `reroute` function.
     */
    appChangeUnderway = false;

    if (peopleWaitingOnAppChange.length > 0) {
      /* While we were rerouting, someone else triggered another reroute that got queued.
       * So we need reroute again.
       */
      const nextPendingPromises = peopleWaitingOnAppChange;
      peopleWaitingOnAppChange = [];
      reroute(nextPendingPromises);
    }

    return returnValue;
  }

  /* We need to call all event listeners that have been delayed because they were
   * waiting on single-spa. This includes haschange and popstate events for both
   * the current run of performAppChanges(), but also all of the queued event listeners.
   * We want to call the listeners in the same order as if they had not been delayed by
   * single-spa, which means queued ones first and then the most recent one.
   */
  function callAllEventListeners() {
    pendingPromises.forEach((pendingPromise) => {
      callCapturedEventListeners(pendingPromise.eventArguments);
    });

    callCapturedEventListeners(eventArguments);
  }

  function getCustomEventDetail(isBeforeChanges = false, extraProperties) {
    const newAppStatuses = {};
    const appsByNewStatus = {
      // for apps that were mounted
      [MOUNTED]: [],
      // for apps that were unmounted
      [NOT_MOUNTED]: [],
      // apps that were forcibly unloaded
      [NOT_LOADED]: [],
      // apps that attempted to do something but are broken now
      [SKIP_BECAUSE_BROKEN]: [],
    };

    if (isBeforeChanges) {
      appsToLoad.concat(appsToMount).forEach((app, index) => {
        addApp(app, MOUNTED);
      });
      appsToUnload.forEach((app) => {
        addApp(app, NOT_LOADED);
      });
      appsToUnmount.forEach((app) => {
        addApp(app, NOT_MOUNTED);
      });
    } else {
      appsThatChanged.forEach((app) => {
        addApp(app);
      });
    }

    const result = {
      detail: {
        newAppStatuses,
        appsByNewStatus,
        totalAppChanges: appsThatChanged.length,
        originalEvent: eventArguments?.[0],
        oldUrl,
        newUrl,
        navigationIsCanceled,
      },
    };

    if (extraProperties) {
      assign(result.detail, extraProperties);
    }

    return result;

    function addApp(app, status) {
      const appName = toName(app);
      status = status || getAppStatus(appName);
      newAppStatuses[appName] = status;
      const statusArr = (appsByNewStatus[status] =
        appsByNewStatus[status] || []);
      statusArr.push(appName);
    }
  }
}
```



## 总结

在后续再来介绍 `qiankun` 和其他的微前端框架(如...)

## 引用

- https://zh-hans.single-spa.js.org/docs/getting-started-overview
本文仓库: https://github.com/Grewer/react-loadable-notes

react-loadable 源码解析

简要的来说, loadable 是一个高阶函数, 他同时利用了 react 的渲染 API, webpack 知识点, babel,  promise 合并起来的组件


## 使用
首先我们要知道 `react-loadable` 他的用法是什么:

1. loader
   需要延迟加载的组件, 使用必须要用 `() => import('xxx')` 语法
2. loading
   loading 组件, props 接受 error, pastDelay , timedOut, retry参数, 可以自定义
3. delay
   可以添加延迟
4. timeout
   超时时间
5. render
   类型为: (loaded, props)=>ReactNode, 可以添加额外的参数注入

### 多个组件同时加载

其中接受的参数 loader, render, 类型和上述差不太多

```
Loadable.Map({
  loader: {
    Bar: () => import('./Bar'),
    i18n: () => fetch('./i18n/bar.json').then(res => res.json()),
  },
  render(loaded, props) {
    let Bar = loaded.Bar.default;
    let i18n = loaded.i18n;
    return <Bar {...props} i18n={i18n}/>;
  },
})
```

### 预加载

```
const LoadableBar = Loadable({
  loader: () => import('./Bar'),
  loading: Loading,
});


触发:
LoadableBar.preload();
```

**库里还涉及到 SSR 相关知识点, 这里就不涉及了**

## 源码
这里因为不讲 SSR 相关, 所以我在这里删除了相关代码: `loadable.jsx`


### 主体

在此高阶组件中, 他的主体是: `createLoadableComponent`


首先我们看他闭包中所作的东西:

```jsx
function createLoadableComponent(loadFn, options) {
    // loading 的判断, 忽略

    // 创建配置项, 覆盖默认值
    // 其中 render 源码:  function render(loaded, props) {
    //     return React.createElement(resolve(loaded), props);
    // }
    let opts = Object.assign(
        {
            loader: null,
            loading: null,
            delay: 200,
            timeout: null,
            render: render,
            webpack: null,
            modules: null
        },
        options
    );
    
    // 结果, 用于 调用 loader
    let res = null;
    
    // 初始化时调用, loadFn 函数后面再讲
    function init() {
        if (!res) {
            res = loadFn(opts.loader);
        }
        return res.promise;
    }
    
    return class LoadableComponent extends React.Component{
        // 这里先忽略
    }
}
```

### 返回组件

我们再来看返回的组件:

```jsx
class LoadableComponent extends React.Component {
        constructor(props) {
            super(props);
            init(); // 在构造函数中启用初始化函数, 他将 res 赋值为一个 promise
            
            // 定义的 state
            this.state = {
                error: res.error,
                pastDelay: false,
                timedOut: false,
                loading: res.loading,
                loaded: res.loaded
            };
        }
        
        // 静态函数, 之前介绍用法的时候说过了
        static preload() {
            return init();
        }

        componentWillMount() {
            // 用来设置定时器和 delay 相关
            this._loadModule();
        }

        componentDidMount() {
            // 标记是否mounted
            this._mounted = true;
        }
        
        componentWillUnmount() {
            // 修改标记, 清除定时器
            this._mounted = false;
            this._clearTimeouts();
        }

        render() {
            // 渲染函数, 如果当前是 加载中或者错误加载的状态 , 则使用 loading 渲染, 并且传递多种参数
            if (this.state.loading || this.state.error) {
                return React.createElement(opts.loading, {
                    isLoading: this.state.loading,
                    pastDelay: this.state.pastDelay,
                    timedOut: this.state.timedOut,
                    error: this.state.error,
                    retry: this.retry
                });
            } else if (this.state.loaded) {
                // 如果已经加载完毕, 则调用 render 函数, 使用 React.createElement 渲染
                return opts.render(this.state.loaded, this.props);
            } else {
                return null;
            }
        }
    }
```

### load
```js
// 这里的 load 就是 createLoadableComponent(loadFn, options) 中的入参loadFn
function load(loader) {
    // loader 是 options 中的 loader
    // 比如: () => import('./my-component')
    let promise = loader();
    
    // 用来返回结果
    let state = {
        loading: true,
        loaded: null,
        error: null
    };
    
    // 一个 promise 赋值, 未调用
    state.promise = promise
        .then(loaded => {
            state.loading = false;
            state.loaded = loaded;
            return loaded;
        })
        .catch(err => {
            state.loading = false;
            state.error = err;
            throw err;
        });

    return state;
}
```


### loadMap

调用:
```js
Loadable.Map = LoadableMap;

function LoadableMap(opts) {
    return createLoadableComponent(loadMap, opts);
}
```

具体代码:
```js
function loadMap(obj) {
    let state = {
        loading: false,
        loaded: {},
        error: null
    };

    let promises = [];

    try {
        Object.keys(obj).forEach(key => {
            let result = load(obj[key]);

            if (!result.loading) {
                state.loaded[key] = result.loaded;
                state.error = result.error;
            } else {
                state.loading = true;
            }

            promises.push(result.promise);

            result.promise
                .then(res => {
                    state.loaded[key] = res;
                })
                .catch(err => {
                    state.error = err;
                });
        });
    } catch (err) {
        state.error = err;
    }

    state.promise = Promise.all(promises)
        .then(res => {
            state.loading = false;
            return res;
        })
        .catch(err => {
            state.loading = false;
            throw err;
        });

    return state;
}
```

总的来说, 和 load 类似, 利用了 `Promise.all` api 来构建了一个 promise 数组结果

## 总结

从组件来上看结构:

`Loadable()` === `createLoadableComponent(load, opts)` === `class LoadableComponent`

从调用上来看:

1. `init`  调用 `load` 函数, 他用来包装 组件加载后的参数
2. init 直接返回组件对应 promise 的结果
3. 在 render 函数中根据对应结果渲染 loading 组件或者 render 组件
4. render 组件利用的是 `React.createElement` 组件渲染


总的来说去除 SSR 相关, 还是一个比较简单的组件, 主要的利用还是 `()=>import()` 语法的支持

## 参考:
https://github.com/jamiebuilds/react-loadable

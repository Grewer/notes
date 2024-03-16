
> 在工作中，我经常用到的一个 hooks 库： ahooks，最近在使用中，他是一个常见的三方库，通过阅读源码，知道他的代码是怎么写的，原理是什么，这样的使用的时候，才能知其所以然


### API

首先我们看下他的使用方式：

```ts
function useRequest<TData, TParams extends any[], TFormated, TTFormated extends TFormated = any>(
   service: Service<TData, TParams>,
   options: OptionsWithFormat<TData, TParams, TFormated, TTFormated>,
   plugins?: Plugin<TData, TParams>[],
): Result<TFormated, TParams>
function useRequest<TData, TParams extends any[]>(
   service: Service<TData, TParams>,
   options?: OptionsWithoutFormat<TData, TParams>,
   plugins?: Plugin<TData, TParams>[],
): Result<TData, TParams>
```

`usRequest`  可接收三个参数，
- `service`  请求， 一般是 promise
- `options`  配置参数， 可通过参数控制请求的不同色模式
- `plugins`  自定义插件， 目前 useRequest 的轮询， 依赖刷新，防抖，节流等等功能都是通过插件来实现的。

最后返回内部包装的对象 `useRequestImplement` ：

```ts
function useRequest<TData, TParams extends any[]>(
  service: Service<TData, TParams>,
  options?: Options<TData, TParams>,
  plugins?: Plugin<TData, TParams>[],
) {
  return useRequestImplement<TData, TParams>(service, options, [
    ...(plugins || []),
    useDebouncePlugin,
    useLoadingDelayPlugin,
    usePollingPlugin,
    useRefreshOnWindowFocusPlugin,
    useThrottlePlugin,
    useAutoRunPlugin,
    useCachePlugin,
    useRetryPlugin,
  ] as Plugin<TData, TParams>[]);
}
```

如上述代码 `xxxPlugin`，通过插件的能力, 可自定义扩展 useRequest 的能力，它也内置了很多常见功能。 

###  useRequestImplement

我们先来看 `useRequestImplement` 的实现

```tsx
function useRequestImplement<TData, TParams extends any[]>(
  service: Service<TData, TParams>,
  options: Options<TData, TParams> = {},
  plugins: Plugin<TData, TParams>[] = [],
) {
  const { manual = false, ...rest } = options;

  // 整个的参数，同时给 manual 添加上默认值
  const fetchOptions = {
    manual,
    ...rest,
  };

 // 返回当前最新值的, 避免闭包
  const serviceRef = useLatest(service);

  // 强行 reRender 的 hook
  const update = useUpdate();

 // 使用 useCreation 创建对象， 避免重复创建
  const fetchInstance = useCreation(() => {
   // 插件触发 onInit 静态方法，并且根据返回值， 过滤出初始状态
    const initState = plugins.map((p) => p?.onInit?.(fetchOptions)).filter(Boolean);
    // new 一个 Fetch, 具体在下面讲述
    return new Fetch<TData, TParams>(
      serviceRef,
      fetchOptions,
      update,
      Object.assign({}, ...initState),
    );
  }, []);

  fetchInstance.options = fetchOptions;
  
 
  fetchInstance.pluginImpls = plugins.map((p) => p(fetchInstance, fetchOptions));
  // 参数的一些赋值，插件的初始化运行， 用一个闭包，返回各个插件的生命周期

  useMount(() => {
    if (!manual) {
      // useCachePlugin can set fetchInstance.state.params from cache when init
      const params = fetchInstance.state.params || options.defaultParams || [];
      // 在初始化时， 如果没有设置 manual 为 true， 则直接运行
      fetchInstance.run(...params);
    }
  });

  useUnmount(() => {
    fetchInstance.cancel();
  });

  return {
    loading: fetchInstance.state.loading,
    data: fetchInstance.state.data,
    error: fetchInstance.state.error,
    params: fetchInstance.state.params || [],
    cancel: useMemoizedFn(fetchInstance.cancel.bind(fetchInstance)),
    refresh: useMemoizedFn(fetchInstance.refresh.bind(fetchInstance)),
    refreshAsync: useMemoizedFn(fetchInstance.refreshAsync.bind(fetchInstance)),
    run: useMemoizedFn(fetchInstance.run.bind(fetchInstance)),
    runAsync: useMemoizedFn(fetchInstance.runAsync.bind(fetchInstance)),
    mutate: useMemoizedFn(fetchInstance.mutate.bind(fetchInstance)),
  } as Result<TData, TParams>;
}
```

接下来就是，最一个简单的请求部分 `Fetch` 包含一些插件生命周期的执行：

```ts
export default class Fetch<TData, TParams extends any[]> {
	// 这里只展示他的核心代码
  async runAsync(...params: TParams): Promise<TData> {
	// 记录请求次数
    this.count += 1;
    const currentCount = this.count;

    // 运行所有插件里的  onBefore 事件， 如果 stopNow = true 则停止当前的请求
    const {
      stopNow = false,
      returnNow = false,
      ...state
    } = this.runPluginHandler('onBefore', params);

    // stop request  阻止请求
    if (stopNow) {
      return new Promise(() => {});
    }
    
    // loading 开始请求
    this.setState({
      loading: true,
      params,
      ...state,
    });

    // 如果 returnNow = true 则立马返回 promise， 在缓存插件中会用到
    if (returnNow) {
      return Promise.resolve(state.data);
    }

    // 运行生命周期函数
    this.options.onBefore?.(params);

    try {
      // 运行插件里的 onRequest , 在缓存插件里会使用缓存的请求
      let { servicePromise } = this.runPluginHandler('onRequest', this.serviceRef.current, params);

      if (!servicePromise) {
       // 没有这个值则取默认传入的
        servicePromise = this.serviceRef.current(...params);
      }

      const res = await servicePromise;

      if (currentCount !== this.count) {
        // 当请求被取消时，阻止 run.then
        return new Promise(() => {});
      }

	 // 原本 ahooks v2 版本中的 API， 可以在最后改变 res 的值， 之后再返回 onSuccess 中， 堵车因为类型定义问题，被放弃了
      // const formattedResult = this.options.formatResultRef.current ? this.options.formatResultRef.current(res) : res;

      this.setState({
        data: res,
        error: undefined,
        loading: false,
      });

	  // 到这里是执行成功了，执行各个生命周期函数
      this.options.onSuccess?.(res, params);
      this.runPluginHandler('onSuccess', res, params);

      this.options.onFinally?.(params, res, undefined);

      if (currentCount === this.count) {
        this.runPluginHandler('onFinally', params, res, undefined);
      }

      return res;
    } catch (error) {
      if (currentCount !== this.count) {
        // 当请求被取消时，阻止 run.then
        return new Promise(() => {});
      }

      this.setState({
        error,
        loading: false,
      });

	 // 省略， 同 success 的执行，但是他执行的 error 事件
    }
  }
}
```

### 插件

在 useRequest 中内部已经集成了很多插件， 这里就讲几个常用到的

useDebouncePlugin:

```tsx
const useDebouncePlugin: Plugin<any, any[]> = (
  fetchInstance,
  { debounceWait, debounceLeading, debounceTrailing, debounceMaxWait },
) => {
  const debouncedRef = useRef<DebouncedFunc<any>>();

 // 参数， 根据外部传参改变
  const options = useMemo(() => {
    const ret: DebounceSettings = {};
    if (debounceLeading !== undefined) {
      ret.leading = debounceLeading;
    }
    if (debounceTrailing !== undefined) {
      ret.trailing = debounceTrailing;
    }
    if (debounceMaxWait !== undefined) {
      ret.maxWait = debounceMaxWait;
    }
    return ret;
  }, [debounceLeading, debounceTrailing, debounceMaxWait]);


 // 在初始化时， 或者参数变化时触发，
  useEffect(() => {
    if (debounceWait) {
      const _originRunAsync = fetchInstance.runAsync.bind(fetchInstance);
// 使用 lodash 的函数来实现
      debouncedRef.current = debounce(
        (callback) => {
          callback();
        },
        debounceWait,
        options,
      );

      // 覆写原有的 promise
      fetchInstance.runAsync = (...args) => {
        return new Promise((resolve, reject) => {
          debouncedRef.current?.(() => {
            _originRunAsync(...args)
              .then(resolve)
              .catch(reject);
          });
        });
      };

     // 离开页面 取消事件
      return () => {
        debouncedRef.current?.cancel();
        fetchInstance.runAsync = _originRunAsync;
      };
    }
  }, [debounceWait, options]);

  if (!debounceWait) {
    return {};
  }

  return {
    onCancel: () => {
      debouncedRef.current?.cancel();
    },
  };
};
```

插件的写作逻辑主要就这两点
1. 利用 `hooks`， 编写各类请求逻辑、 缓存、维护
2. 利用利用各类生命周期钩子，实现触发机制

在目前的官网中，并没有描述 `useRequest` 的插件，甚至都不知道还有这个传参， 通过此次源码的阅读，我们可以利用此 API 编写我们自己想要的一些插件，对于代码的开发更加自由。
## 结语

`ahooks` 是工作中最常用的工具库，了解他的原理，对于我们日常中的使用帮助较大，同时也能提前预见一些隐患，避免一些错误写法。

## 引用
- https://ahooks.gitee.io/zh-CN/hooks/use-request/index

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

我们先来看 useRequestImplement 的实现

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
      // @ts-ignore
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
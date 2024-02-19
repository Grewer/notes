
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
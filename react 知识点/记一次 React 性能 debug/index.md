## 前言

之前开发重构项目的时候，遇到了一些问题， 如 `hooks` 的性能问题和 `quill` 的重载问题。本文就是记录这些问题的解决过程。

## 场景

在基于富文本的输入场景中，我们发现在输入回车后会出现明显的卡顿现象。为了更好地展示此类场景，这里使用了一个简单的例子展示。

```tsx
function App() {
    const [value, setValue] = useState('');

    // mock 调用多次 hooks
    const hook1 = useHooks();
    //...
    const hook20 = useHooks();

    const modules = useMemo(() => ({
        toolbar: {
            container: '#toolbar',
            handlers: {
            },
        },
    }), []);
    

    return (<div className={'container'}>
        <CustomToolbar/>
        <ReactQuill ref={editorRef} theme="snow" value={value} modules={modules} onChange={setValue}/>
        <form className="todo-list">
            {/* ... */}
        </form>
    </div>)
}
```

这是页面的主要结构, 内容分别是一堆 `hooks` + `quill` + 其他操作(这里用一个 `TODO list` 来替代)

## 性能监控

既然是卡顿,那当然属于性能方面的问题 ,这里就轮到 Chrome 的性能监控出场了: 重复步骤, 最后缩短监控范围, 点击卡顿的任务

![img_1.png](images%2Fimg_1.png)


再来看下调用树:

![img_1.png](images%2Fimg_1.png)

可以发现, 光看这里很难发现是页面那个地方的问题, 都是 `react` 的源码执行函数

最关键的点在于`自上而下`那一栏:

![img_2.png](images%2Fimg_2.png)

从这里, 我们很明显的就能看到是这个 `hooks - useI18n` 影响到了

> 因为这是一个多语言 hooks, 所以它的引用范围特别广


因为不方便透露源码, 大概的逻辑是这样的:

```ts
const useHooks = () => {
  const {lang, handle:langHandle} = useContext(myContext);
  
  const handle = (number) => {
    langHandle();
  }

  return {
    value: lang,
    setValue: handle
  }
}
```

## 解决方案

这里我尝试加上 react 的性能优化 `useMemo`:

```ts
const useHooks = () => {
  const {lang, handle:langHandle} = useContext(myContext);
  
  const handle = (number) => {
    langHandle();
  }

  return useMemo(() => ({
    value: lang,
    setValue: handle
  }), [lang, handle])
}
```

再通使用 `Chrome` 的性能监控, 发现问题已经缓解

![img_3.png](images%2Fimg_3.png)

由此可得出结论, 在多场景使用的 `hooks` 中, 可通过在返回值中加上 `useMemo` 来提高性能

---

当然, 除了 `hooks` 的优化, 阻止其他组件的重渲染, 也可以缓解一定的渲染性能问题

这里又回到了我们老生常谈的 `react` 性能优化那一套, 就不赘述了

## quill.js 的重渲染

在 `function` 组件中添加 `quill.js` 富文本的时候, 会经常出现重复渲染导致编辑器加载出现问题的场景, 报错如图:

![img_4.png](images%2Fimg_4.png)

一般来说都是因为 `quill` 的 `modules` 对象指向改变了, 这一点在 `hooks` 组件中会经常遇到:

```tsx
function App(){
  const modules = {
    toolbar: {
      container: '#toolbar',
      handlers: {
        handleClick
      },
    },
  }
  
  return (
    <ReactQuill ref={editorRef} theme="snow" value={value} modules={modules} onChange={setValue}/>
  )
}
```

如上述的代码, 由于 `react` 的机制问题, 在每次 `render` 时, 都会触发 `reRender`, 重新声明一个 `modules`, 造成 `react-quill` 中的传值问题

常见的解决方案就是万能的 `useRef` 了:

```tsx
function App(){
  const modulesRef = useRef({
    toolbar: {
      container: '#toolbar',
      handlers: {
        handleClick
      },
    },
  })
  
  return (
    <ReactQuill ref={editorRef} theme="snow" value={value} modules={modulesRef.current} onChange={setValue}/>
  )
}
```

在 `react` 的 `hooks` 中, `useRef` 反而是一个比较 `OOP` 的函数, 因为设置之后, 不管 `render` 几次, 他的对象引用都不会变化;  

就像是 `class` 中构造函数里设置了 `this.query = {}`, 在 `render` 过程中 `query` 值引用都是不变的


由此, 很多自定义 `hooks`, 都用上了他

比如最常见的 `useUpdateEffect`:

```tsx
const createUpdateEffect = (hook) => (effect, deps) => {
    const isMounted = useRef(false);

    // for react-refresh
    hook(() => {
      return () => {
        isMounted.current = false;
      };
    }, []);

    hook(() => {
      if (!isMounted.current) {
        isMounted.current = true;
      } else {
        return effect();
      }
    }, deps);
  };



useUpdateEffect = createUpdateEffect(useEffect)
```

代码来源于 [ahooks](https://github.com/alibaba/hooks/blob/master/packages/hooks/src/useUpdateEffect/index.ts),  使用 `ref` 的值来标记一个私有化值

原理都是很简单的，但是在开发中想要得心应手，还需要更多的练习。


## 总结

我们在使用 `hooks` 进行组件开发时，发现在组件频繁更新的情况下，`hooks` 的性能会受到一定的影响。可以通过对代码进行优化，避免过多的无用渲染，从而提高了组件的性能。
另外，我们在使用 `quill` 编辑器时，发现在重载页面或组件时，`quill` 的编辑内容会丢失。这给我们的开发带来了一定的困扰。
通过对 quill 的初始化和销毁进行优化，解决了这个问题，保证了编辑器的稳定性和可靠性。
总的来说，在开发过程中遇到问题是很常见的，我们需要及时记录和解决这些问题，以提高开发效率和质量。

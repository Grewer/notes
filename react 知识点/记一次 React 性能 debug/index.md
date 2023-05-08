
之前开发重构项目的时候，我们遇到了一些问题，比如 hooks 的性能问题和 quill 的重载问题。本文就是记录这些问题的解决过程。

## 问题点

在基于富文本的输入场景中，我们发现在输入回车后会出现明显的卡顿现象。为了更好地复现此类场景，这里使用了一个简单的demo展示。

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

这是页面的主要结构, 内容分别是一堆 hooks + quill + 其他操作(这里用一个 TODO list 来替代)

这里展示下当时通过 Chrome 的性能监控显示的图片:




## 


我们在使用 hooks 进行组件开发时，发现在组件频繁更新的情况下，hooks 的性能会受到一定的影响。我们通过对代码进行优化，避免过多的无用渲染，从而提高了组件的性能。
另外，我们在使用 quill 编辑器时，发现在重载页面或组件时，quill 的编辑内容会丢失。这给我们的开发带来了一定的困扰。我们通过对 quill 的初始化和销毁进行优化，解决了这个问题，保证了编辑器的稳定性和可靠性。
总的来说，在开发过程中遇到问题是很常见的，我们需要及时记录和解决这些问题，以提高开发效率和质量。

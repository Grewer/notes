
在 quill.js 中,扩展性最强大的功能就是插件了  
本文主要以一个图片扩展的 quill.js 插件来介绍 quill 插件开发

在 quill.js 中此种功能名为: `Modules`, 目前已有 5 种插件:

- TOOLBAR
- KEYBOARD
- HISTORY
- CLIPBOARD
- SYNTAX

分别是: 自定义工具栏, 键盘事件控制, 撤销/重做功能配置, 剪贴板配置, 语法高亮


## modules 模板

先建立一个简单的 `modules` `demo`

创建文件 `modules/index.ts`:

```js
export default class QuillResize {
  private quill: any;

  constructor(quill, options = {}) {
    // 赋值, 备用
    this.quill = quill;

    this.onCreate()
  }

  onCreate () {
    console.log('onCreate')
    // 在这里我们开始做一些事情
  }

}
```

`App.tsx`  引用 `modules`:

```tsx
import ImageResize from './modules/index'

Quill.register('modules/resize', ImageResize);


function App() {

  const modules = useMemo(() => ({
    toolbar: {
      container: '#toolbar',
    },
    resize: { // resize 就是上面注册的名字 'modules/resize'
      foo: 1 // 这里传一个自定义的参数
    }
  }), []);

  // ...

  return (<div className={'container'}>
    <CustomToolbar/>
    <ReactQuill ref={editorRef} theme="snow" value={value} modules={modules} onChange={setValue}/>
  </div>)
}
```

这就是 modules 的雏形, 现在我们可以做任何想做的事了！

## 图片交互

我们需要缩放图片, 那么就需要给图片添加状态, 即点击图片之后, 用户知道它是能够交互的


添加监听事件, 知道用户高亮的是什么元素:

```js
export default class QuillResize {
  constructor(quill, options = {}) {
    this.quill = quill;
    
    this.quill.root.addEventListener('mousedown', this.handleClick, false);
  }

  handleClick = (evt)=> {
    let show = false;
    let blot;
    const target = evt.target;

    if (target && target.tagName) {
      // 在 quill 编辑器中找到对应的点击结构
      blot = this.quill.constructor.find(target);
      if (blot) {
        // 如果有,再通过 judgeShow 函数判断是否该高亮
        show = this.judgeShow(blot, target);
      }
    }
    // 如果需要高亮, 则阻止默认动作(如 a 标签等等)
    if (show) {
      evt.preventDefault();
      return;
    }
    if (this.activeEle) {
      // 如果点击在其他位置, 已经聚焦图片了, 那就取消高亮
      this.hide();
    }
  }
}
```

`handleClick` 流程:

![img.png](images%2Fimg.png)



`judgeShow` 判断是否应该聚焦图片:

```js
  judgeShow = (blot, target) => {
    let res = false;
    if (!blot) return res;
    // 数据的一些判断和补充
    if (!target && blot.domNode) target = blot.domNode;
    
    // 参数, 支持最小是 10px 的图片, 可从外部传入
    const options = {
        limit: {
          minWidth: 10,
        },
      }
    
    if (!options) return res;
    // 如果当前聚焦的是再次点击的,则直接 return
    if (this.activeEle === target) return true;
  
    // 判断大小的限制
    const limit = options.limit || {};
    if (!limit.minWidth || (limit.minWidth && target.offsetWidth >= limit.minWidth)) {
      res = true;
      
      // 当前聚焦和点击的图片不是同一个的时候, 隐藏原有的
      if (this.activeEle) {
        this.hide();
      }
      // 重新赋值
      this.activeEle = target;
      this.blot = blot;
      
      // 调用 show 方法, 显示聚焦样式
      this.show();
    }

    return res;
  }
```

`judgeShow` 的具体流程:




显示图片高亮聚焦样式

```js
show = ()=> {
  this.showOverlay(); // 显示样式
  this.initializeModules(); //初始化拖动事件
  // 如果有样式, 则添加聚焦样式
  if (this.activeEle) this.activeEle.classList.add(this.activeClass);
}

showOverlay = () => {
  if (this.overlay) {
    this.hideOverlay();
  }
  
  // 取消光标选中
  this.quill.setSelection(null);

  // 阻止用户选中
  this.setUserSelect('none');

  // 创建一个遮罩
  this.overlay = document.createElement('div');
  // 添加遮罩样式
  Object.assign(this.overlay.style, this.overlayStyle);
  // 插入到编辑器中
  this.quill.root.parentNode.appendChild(this.overlay);

  this.hideProxy = () => {
    if (!this.activeEle) return;
    this.hide();
  };
  // 监听输入事件, 发生变化则隐藏
  this.quill.root.addEventListener('input', this.hideProxy, true);
  
  // 监听滚动事件, 遮罩要随着滚动偏移
  this.quill.root.addEventListener('scroll', this.updateOverlayPosition);

  // 样式上添加具体的坐标
  this.repositionElements();
};
```

// TODO 没有拉伸的截图

// TODO 流程图


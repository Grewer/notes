
在 `quill.js` 中，扩展性最强大的功能就是插件   
本文主要以一个图片扩展的插件来介绍 `quill` 插件开发

在 `quill.js` 中他有着自己的名字: `Modules`，而他也内置了 5 种插件：

- TOOLBAR
- KEYBOARD
- HISTORY
- CLIPBOARD
- SYNTAX

分别是: 自定义工具栏、键盘事件控制、撤销/重做功能配置、剪贴板配置、语法高亮

本文中的例子主要来源于 `quill` 最有名插件之一：https://github.com/kensnyder/quill-image-resize-module

## modules 模板

先建立一个简单的 `modules` demo

创建文件 `modules/index.ts`：

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

这就是 `modules` 的雏形, 现在我们可以做任何想做的事了！

## 图片交互

我们需要缩放图片，那么就需要给图片添加状态，即点击图片之后，用户知道它是能够交互的

添加监听事件，让用户知道高亮的是什么元素：

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

`handleClick` 流程：

![img.png](images%2Fimg.png)



`judgeShow` 判断是否应该聚焦图片：

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

显示图片高亮聚焦样式

```js
show = ()=> {
  this.showOverlay(); // 显示样式
  // this.initializeModules(); //初始化拖动事件/其他事件 这里暂不开放
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

图片聚焦样式：

![img2.png](images%2Fimg2.png)


滚动事件：

![gif.gif](images%2Fgif.gif)


## 模块扩展

在图片聚焦时，添加额外功能，如图片的缩放

新增文件 `Resize.ts`

```ts
class Resize {
  onCreate = () => {
    this.boxes = [];

    // 添加手柄
    this.addBox('nwse-resize'); // top left
    this.addBox('nesw-resize'); // top right
    this.addBox('nwse-resize'); // bottom right
    this.addBox('nesw-resize'); // bottom left

    // 计算坐标
    this.positionBoxes();
  };


  addBox = cursor => {
    const box = document.createElement('div');

    Object.assign(box.style, this.handleStyles);

    box.style.width = `${this.handleStyles.width}px`;
    box.style.height = `${this.handleStyles.height}px`;

    // 监听动作, 拖动时触发函数
    box.addEventListener('mousedown', this.handleMousedown, false);
    // 插入元素
    this.overlay.appendChild(box);
    // 记录到 boxes 中
    this.boxes.push(box);
  };
}

```

![img3.png](images%2Fimg3.png)

按下手柄时触发拖动事件

```ts
  handleMousedown = evt => {
  // 修改状态
  this.blot.handling && this.blot.handling(true);
  this.dragBox = evt.target;
  this.dragStartX = evt.clientX;
  this.dragStartY = evt.clientY;
  // 存储坐标
  this.preDragSize = {
    width: this.activeEle?.offsetWidth || 0,
    height: this.activeEle?.offsetHeight || 0,
  };
  // 存储原本尺寸
  this.naturalSize = this.getNaturalSize();

  const {width, height} = this.naturalSize;
  this.localRatio = height / width;
  this.editorMaxWidth = this.quill.container.clientWidth - 30;


  // 修改手柄的 cursor 属性
  this.setCursor(this.dragBox!.style.cursor);

  // 监听拖动和放开事件
  // 根据拖动的距离, 计算图片的尺寸,进行缩放
  // 在 mouseup 中释放监听事件
  document.addEventListener('mousemove', this.handleDrag, false);
  document.addEventListener('mouseup', this.handleMouseup, false);
};

```

大体流程：

![img4.png](images%2Fimg4.png)

拖动效果:

![gif2.gif](images%2Fgif2.gif)


## 总结

当前例子只讲述了点击图片之后的缩放功能，另外还有很多地方值得我们进行扩展，
如: 点击图片的预览、展示图片的尺寸、添加图片的工具按钮、扩展到视频组件等等

不过即使是一个简单的例子，也能管中窥豹，入门插件的开发

当然这这也只是 `quill` 富文本的开发，在业界还有很多优秀的富文本编辑器，他们都有着不同的实现和特殊功能，这些都值得我们继续深入学习

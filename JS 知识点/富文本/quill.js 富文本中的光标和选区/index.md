聊聊光标和选区的问题


## 术语表
首先我们需要知道一些术语, 才能更好地理解, 如果您已经了解, 可以跳过这一段

**锚点 (anchor)**

锚指的是一个选区的起始点（不同于 HTML 中的锚点链接）。当我们使用鼠标框选一个区域的时候，锚点就是我们鼠标按下瞬间的那个点。在用户拖动鼠标时，锚点是不会变的。

**焦点 (focus)**

选区的焦点是该选区的终点，当您用鼠标框选一个选区的时候，焦点是你的鼠标松开瞬间所记录的那个点。随着用户拖动鼠标，焦点的位置会随着改变。

**范围 (range)**

范围指的是文档中连续的一部分。一个范围包括整个节点，也可以包含节点的一部分，例如文本节点的一部分。用户通常下只能选择一个范围，但是有的时候用户也有可能选择多个范围（例如当用户按下 Control 按键并框选多个区域时，Chrome 中禁止了这个操作）。“范围”会被作为 [`Range`](https://developer.mozilla.org/zh-CN/docs/Web/API/Range) 对象返回。Range 对象也能通过 DOM 创建、增加、删减。

本术语表来源于 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Selection#%E6%9C%AF%E8%AF%AD%E8%A1%A8)

## contenteditable

> contenteditable全局属性是一个枚举属性，表示该元素是否应该由用户编辑。如果是的话，浏览器就会修改其小部件以允许编辑。

简单的来说, 如果要让一个 div 变得可编辑, 我们加上这个属性就能实现了

这就是富文本编辑器的最基础的构造了, 想要完整的富文本, 首先我们要控制他的光标

而浏览器提供了 selection 对象和 range 对象来操作光标。

## Selection

> Selection 对象表示用户选择的文本范围或插入符号的当前位置。它代表页面中的文本选区，可能横跨多个元素。文本选区由用户拖拽鼠标经过文字而产生。

我们可以通过 API `window.getSelection()` 来获取当前用户选中了哪些文本

这是调用后的返回结果:

![](images/img1.png)

### 部分属性说明

#### anchorNode 只读
> 返回该选区起点所在的节点（Node）。

#### anchorOffset 只读
> 返回一个数字，其表示的是选区起点在 `anchorNode` 中的位置偏移量。
>
> 1.  如果 `anchorNode` 是文本节点，那么返回的就是从该文字节点的第一个字开始，直到被选中的第一个字之间的字数（如果第一个字就被选中，那么偏移量为零）。
> 2.  如果 `anchorNode` 是一个元素，那么返回的就是在选区第一个节点之前的同级节点总数。(这些节点都是 `anchorNode` 的子节点)

#### isCollapsed 只读

返回一个布尔值，用于判断选区的起始点和终点是否在同一个位置。

#### rangeCount 只读
返回该选区所包含的连续范围的数量。

### 方法


## Range


## quill 中的操作

在 quill 中, 会基于原生 API 获取信息, 并包装出一个自己的对象:

```js
  getNativeRange() {
    const selection = document.getSelection();
    if (selection == null || selection.rangeCount <= 0) return null;
    const nativeRange = selection.getRangeAt(0);
    if (nativeRange == null) return null;
    const range = this.normalizeNative(nativeRange);
    debug.info('getNativeRange', range);
    return range;
}
```

首先是通过原生 API 获取是否有选中, 如果没有则返回 null  
如果有则通过 getRangeAt 方法获取 range // TODO


normalizeNative 函数包装

## 总结


## 引用

- https://developer.mozilla.org/zh-CN/docs/Web/API/Selection
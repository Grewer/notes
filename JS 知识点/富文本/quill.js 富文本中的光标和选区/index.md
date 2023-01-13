聊聊光标和选区的问题

## contenteditable

> contenteditable全局属性是一个枚举属性，表示该元素是否应该由用户编辑。如果是的话，浏览器就会修改其小部件以允许编辑。

简单的来说, 如果要让一个 div 变得可编辑, 我们加上这个属性就能实现了

这就是富文本编辑器的最基础的构造了, 想要完整的富文本, 首先我们要控制他的光标

而浏览器提供了 selection 对象和 range 对象来操作光标。

## Selection

> Selection 对象表示用户选择的文本范围或插入符号的当前位置。它代表页面中的文本选区，可能横跨多个元素。文本选区由用户拖拽鼠标经过文字而产生。

我们可以通过 API `window.getSelection()` 来获取当前用户选中了哪些文本


## Range


## quill 中的操作

normalizeNative 函数包装

## 总结


## 引用

- https://developer.mozilla.org/zh-CN/docs/Web/API/Selection

> Web Worker 为 Web 内容在后台线程中运行脚本提供了一种简单的方法。线程可以执行任务而不干扰用户界面。此外，它们可以使用 [`XMLHttpRequest`](/zh-CN/docs/Web/API/XMLHttpRequest)（尽管 `responseXML` 和 `channel` 属性总是为空）或 [`fetch`](/zh-CN/docs/Web/API/Fetch_API)（没有这些限制）执行 I/O。一旦创建，一个 worker 可以将消息发送到创建它的 JavaScript 代码，通过将消息发布到该代码指定的事件处理器（反之亦然）。


## API

一个 worker 是使用一个构造函数创建的一个对象（例如 [`Worker()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Worker/Worker "Worker()")）运行一个命名的 JavaScript 文件——这个文件包含将在 worker 线程中运行的代码;

在 worker 线程中你可以运行任何你喜欢的代码，不过有一些例外情况。比如：在 worker 内，不能直接操作 DOM 节点，也不能使用 [`window`](https://developer.mozilla.org/zh-CN/docs/Web/API/Window) 对象的默认方法和属性。但是你可以使用大量 `window` 对象之下的东西，包括 [WebSockets](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSockets_API)，以及 [IndexedDB](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API) 等数据存储机制。查看 [Web Workers 可以使用的函数和类](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers) 获取详情。

---

workers 和主线程间的数据传递通过这样的消息机制进行——双方都使用 `postMessage()` 方法发送各自的消息，使用 `onmessage` 事件处理函数来响应消息（消息被包含在 [`message`](https://developer.mozilla.org/zh-CN/docs/Web/API/BroadcastChannel/message_event) 事件的 data 属性中）。这个过程中数据并不是被共享而是被复制。

## demo

我们以 cra 创建的项目为例子：



## 引用

- https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Using_web_workers
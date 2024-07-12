
> Web Worker 为 Web 内容在后台线程中运行脚本提供了一种简单的方法。线程可以执行任务而不干扰用户界面。此外，它们可以使用 [`XMLHttpRequest`](/zh-CN/docs/Web/API/XMLHttpRequest)（尽管 `responseXML` 和 `channel` 属性总是为空）或 [`fetch`](/zh-CN/docs/Web/API/Fetch_API)（没有这些限制）执行 I/O。一旦创建，一个 worker 可以将消息发送到创建它的 JavaScript 代码，通过将消息发布到该代码指定的事件处理器（反之亦然）。


## API

一个 worker 是使用一个构造函数创建的一个对象（例如 [`Worker()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Worker/Worker "Worker()")）运行一个命名的 JavaScript 文件——这个文件包含将在 worker 线程中运行的代码;

在 worker 线程中你可以运行任何你喜欢的代码，不过有一些例外情况。比如：在 worker 内，不能直接操作 DOM 节点，也不能使用 [`window`](https://developer.mozilla.org/zh-CN/docs/Web/API/Window) 对象的默认方法和属性。但是你可以使用大量 `window` 对象之下的东西，包括 [WebSockets](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSockets_API)，以及 [IndexedDB](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API) 等数据存储机制。查看 [Web Workers 可以使用的函数和类](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers) 获取详情。

---

workers 和主线程间的数据传递通过这样的消息机制进行——双方都使用 `postMessage()` 方法发送各自的消息，使用 `onmessage` 事件处理函数来响应消息（消息被包含在 [`message`](https://developer.mozilla.org/zh-CN/docs/Web/API/BroadcastChannel/message_event) 事件的 data 属性中）。这个过程中数据并不是被共享而是被复制。

## 专用和共享

worker 目前分为专用和共享两种

专用：一个专用 worker 仅能被生成它的脚本所使用
共享：一个共享 worker 可以被多个脚本使用——即使这些脚本正在被不同的 window、iframe 或者 worker 访问。

区别：

##  专用 worker

我们以一个专用 worker的项目为例子：

```jsx
// App.jsx


function App (){

const workerRef = useRef()

useEffect(()=>{
	if (window.Worker) {
	  const myWorker = new Worker("/src/worker/worker.js");
	  console.log(myWorker);
	  myWorker.onmessage = function(e) {
		console.log('Message received from worker', e);
	  }m
	  workerRef.current = myWorker
	}
}, [])


return  <button onClick={()=> {
			workerRef.current.postMessage([1, 2]);
			console.log('Message posted to worker');
		}}>send to worker</button>
}
```

这是 worker.js 的代码：

```js
onmessage = function(e) {
    console.log('Worker: Message received from main script');
    const result = e.data[0] * e.data[1];
    if (isNaN(result)) {
      postMessage('Please write two numbers');
    } else {
      const workerResult = 'Result: ' + result;
      console.log('Worker: Posting message back to main script');
      postMessage(workerResult);
    }
  }
```

在页面上点击按钮之后的打印：

```
Message posted to worker
worker.js:2 Worker: Message received from main script
worker.js:8 Worker: Posting message back to main script
App.js:14 Message received from worker MessageEvent {…}
```

从这里可以看出 worker 的执行顺序

本 demo 展现了在 worker 的代码中常用的两个变量/函数：

- `onmessage`  全局变量， 通过赋值来让代码生效
- `postMessage` 发送信息给主进程， 信息需要是 `String` 类型

可以把 `worker` 文件里的 js 执行环境看做主进程中调用的环境

## 终止

```
myWorker.terminate();
```

worker 线程会被立即终止，记住只有某些组件使用时，需要调用卸载。

## 错误处理

在发生错误时，会自动调用 `onerror` 事件：

```js
// worker.js
onmessage = function(e) {
    console.log('Worker: Message received from main script');
    const result = e.data[0] * e.data[1];

    throw new Error('Ops Error')
}


App.tsx

const myWorker = new Worker("/src/worker/worker.js");
console.log(myWorker);
myWorker.onmessage = function (e) {
	console.log('Message received from worker', e);
}
myWorker.onerror = function (err) {
	console.log(err);
	err.preventDefault(); // 如果不阻止默认行为，则 Error 会传递到 console， 被全局错误监控捕获
}
```

错误打印：

![1.png](images%2F1.png)

## subWorker

如果需要，一个 worker 可以派生出无限的 worker， 我们称为 subWorker。

Worker 线程能够访问一个全局函数 `importScripts()` 来引入脚本，该函数接受 0 个或者多个 URI 作为参数来引入资源；

以下例子都是合法的：

```js
importScripts(); /* 什么都不引入 */
importScripts("foo.js"); /* 只引入 "foo.js" */
importScripts("foo.js", "bar.js"); /* 引入两个脚本 */
importScripts("//example.com/hello.js"); /* 你可以从其他来源导入脚本 */
```

现在我在 worker 边上创建文件 `foo.js`

```js
const see = () => {
    console.log('subWorker: I can see you')
}
```

之后在 `worker.js` 中引用：

```js
importScripts("foo.js");

onmessage = function(e) {
    console.log('Worker: Message received from main script');
    see();
}
```

在 `subworker` 中的变量定义，不需要 `export` 和 `import`， 而是像全局变量一样定义即可，同样的使用也是如此。

在 chrome 的 network 中，`subworker` 有清晰的调用痕迹和标识：

![[2.png]]

## 共享 worker

在使用共享worker 时，需要注意的是：

> 如果共享 worker 可以被多个浏览上下文调用，所有这些浏览上下文必须属于同源（相同的协议，主机和端口号）。


正如他的名字，共享 work 的使用场景是在多个浏览器 tab 的场景下，使用同一个网站，tab 之间的数据统一处理。


```js
const myWorker = new SharedWorker("worker.js");
```

和专用worker不同的是构造函数， 使用的是 SharedWorker

当然，他的通信方式也不同：

```js

const myWorker = new SharedWorker("/src/worker/shareWorker.js");

myWorker.port.onmessage = function (e) {
  // do something
};
```

worker 中接收：

```js
onconnect = function (event) {
    const port = event.ports[0];

    port.onmessage = function (e) {
        console.log(e);
        // reveive e.data
    };
};
```


在调试时需要注释，如果刷新页面 worker 代码一直不更新，需要把相关网站都关闭，只保留一个，才会更新对应代码（多个worker 连接着，就会使用缓存的 worker 代码);

## 嵌入式 webWorker

web worker的代码可以进行 `inline` 处理，直接嵌到 HTML 中 

```html
    <script type="text/js-worker">
      // 该脚本不会被 JS 引擎解析，因为它的 mime-type 是 text/js-worker。
      onmessage = (event) => {
        postMessage(myVar);
      };
      // 剩下的 worker 代码写到这里。
    </script>


 <script>
      // 该脚本会被 JS 引擎解析，因为它的 mime-type 是 text/javascript。

      // 过去存在 blob builder，但现在我们使用 Blob
      const blob = new Blob(
        Array.prototype.map.call(
          document.querySelectorAll("script[type='text\/js-worker']"),
          (script) => script.textContent,
          { type: "text/javascript" },
        ),
      );

      // 创建一个新的 document.worker 属性，包含所有 "text/js-worker" 脚本。
      document.worker = new Worker(window.URL.createObjectURL(blob));

      document.worker.onmessage = (event) => {
        pageLog(`Received: ${event.data}`);
      };

      // 启动 worker。
      window.onload = () => {
        document.worker.postMessage("");
      };
    </script>

```

通过此方案可实现嵌入式的 `webWorker`


## 其他

- worker 并不受限于创建它的 document（或者父级 worker）的[内容安全策略](https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/Content_Security_Policy)
- 在主页面与 worker 之间传递的数据是通过**拷贝**，而不是共享

除了 webWorker 之外，还有 [ServiceWorkers](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API) ， [Audio Worklet](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API#%E4%BD%BF%E7%94%A8_javascript_%E5%A4%84%E7%90%86%E9%9F%B3%E9%A2%91) 等等，后面单开文章来讲。

## 兼容性

目前 webWorker 的兼容性:

![[JS 知识点/技术介绍/images/3.png]]

如果目标用户使用的是 web 端， 则兼容还是能接受的。

由于是浏览器的特性，并不能通过 polyfill 填补，即使有, 也仍旧是在JS的主线程中完成的。 使用时还需要仔细斟酌.


>获取 worker 中完整的方法列表，请参阅 [worker 可用的方法和接口](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers "此页面目前仅提供英文版本")。

>你可以使用网站测试一个方法是否对 worker 可用： [https://worker-playground.glitch.me/](https://worker-playground.glitch.me/)。例如，如果你在 Firefox 84 的网站上输入 [EventSource](https://developer.mozilla.org/zh-CN/docs/Web/API/EventSource)，你会发现在 service worker 不支持这个方法，但在专用和共享 worker 中支持。


## 引用

- https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Using_web_workers
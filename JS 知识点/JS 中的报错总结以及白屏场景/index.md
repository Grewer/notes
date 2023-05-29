## 前言

本文就 JS 中存在的报错, 在 react 场景中, 一些错误会比较容易造成"白屏"场景,
而又有一些方法是能解决这些问题的, 作出一个汇总

## 常见的错误


### SyntaxError

> SyntaxError（语法错误）对象代表尝试解析不符合语法的代码的错误。当 Javascript 引擎解析代码时，遇到了不符合语法规范的标记（token）或标记顺序，则会抛出 SyntaxError。
> 
> 

#### 保留字错误

`SyntaxError: "x" is a reserved identifier` (Firefox)
`SyntaxError: Unexpected reserved word` (Chrome)

如在控制台执行下方代码,则会上述错误出现
```js
const enum = 1
```

`enum` 在**严格模式和非严格模式**下都是保留字。

而以下标记符只会在**严格模式**下才作为保留字：

* `implements`

* `interface`

* `let`

* `package`

* `private`

* `protected`

* `public`

* `static`


例如:

```js

const implements = 1 // ✅


"use strict";
const implements = 1; // ❌ caught SyntaxError: Unexpected strict mode reserved word
```


// 以数字开头的变量名
var 1a       // Uncaught SyntaxError: Invalid or unexpected token
// 给关键字赋值
function = 5     // Uncaught SyntaxError: Unexpected token =
// 没有写完的花括号
if (true) {
console.log(1)
else {
console.error(1)
}

2. Uncaught ReferenceError：引用错误

引用一个不存在的变量时发生的错误。将一个值分配给无法分配的对象，比如对函数的运行结果或者函数赋值。

常见错误信息如：Uncaught ReferenceError: xxx is not defined；Uncaught ReferenceError: Invalid left-hand side in assignment；


. RangeError：范围错误

RangeError是当一个值超出有效范围时发生的错误。主要的有几种情况，第一是数组长度为负数，第二是Number对象的方法参数超出范围，以及函数堆栈超过最大值。还有一种情况是当你调用一个不会终止的递归函数时。

常见错误信息如：Uncaught RangeError: Maximum Call Stack；Uncaught RangeError: Invalid array length；


4. TypeError类型错误

变量或参数不是预期类型时发生的错误。比如使用new字符串、布尔值等原始类型和调用对象不存在的方法就会抛出这种错误，因为new命令的参数应该是一个构造函数。

常见错误类型如：Uncaught TypeError: Cannot Read Property；TypeError: ‘undefined’ Is Not an Object (evaluating...)；TypeError: Null Is Not an Object (evaluating...)；TypeError: ‘undefined’ Is Not a Function；TypeError: Cannot Read Property ‘length’；Uncaught TypeError: Cannot Set Property；

// 调用不存在的方法
123()        // Uncaught TypeError: 123 is not a function
var o = {}
o.run()        // Uncaught TypeError: o.run is not a function
// new关键字后接基本类型
var p = new 456      // Uncaught TypeError: 456 is not a constructor

5. URIError，URL错误

主要是相关函数的参数不正确。

创建错误信息如：Uncaught URIError: URI malformed at decodeURI；

decodeURI("%")     // Uncaught URIError: URI malformed at decodeURI
总结&解决方案：运行时错误是js代码中最常见的，原则上说它是js代码中最严重的错误，因为它会阻断js代码的运行，如果你不去捕获并处理它，接下来的js代码都不会再执行了。它也是比较容易定位和解决的一种js错误，因为它有非常详细的错误堆栈，可以精确到行列号。借此，我们就可以定位到js错误发生的具体位置。通过sourceMap映射文件，我们也可直接定位到它的源码位置。也可以跳转到行为轨迹上，分析它发生环境和时机。如图



第四类、其他类错误
1. 未处理的异常：unhandledrejection

当我们使用Promise的时候，被reject且没有reject处理器的时候，会触发 unhandledrejection 事件；这个时候，就会报一个错误：unhanled rejection；没有堆栈信息，只能依靠行为轨迹来定位错误发生的时机。

2. 内存泄漏

js的内存泄漏（Memory Leak）是指程序中己动态分配的堆内存由于某种原因程序未释放或无法释放，造成系统内存的浪费，导致程序运行速度减慢甚至系统崩溃等严重后果。通俗点就是指由于疏忽或者错误造成程序未能释放已经不再使用的内存，不再用到的内存却没有及时释放，从而造成内存上的浪费。

如何避免：在局部作用域中，等函数执行完毕，变量就没有存在的必要了，垃圾回收机制很亏地做出判断并且回收，但是对于全局变量，很难判断什么时候不用这些变量，无法正常回收；所以，尽量少使用全局变量。在使用闭包的时候，就会造成严重的内存泄漏，因为闭包中的局部变量，会一直保存在内存中。



第五类、手动抛出异常
我们在书写逻辑的时候，比如作为第三方库的时候，对于严重的错误，我们无法进行处理，可以直接将错误抛出来，警告使用者。但是throw error会阻断程序运行，请谨慎使用。

throw new Error("出错了！");
throw new RangeError("出错了，变量超出有效范围！");
throw new TypeError("出错了，变量类型无效！");

好了，以上就是我总结常见错误问题，我也会持续补充。


## 引用

> https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Errors

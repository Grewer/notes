## 前言

导致白屏的原因大概有两种, 一为资源的加载, 二为 JS 执行出错

本文就 JS 中执行的报错, 会比较容易造成"白屏"场景, 和能解决这些问题的一些方法, 作出一个汇总

## 常见的错误

### SyntaxError

> #
**`SyntaxError`**（语法错误）对象代表尝试解析不符合语法的代码的错误。当 Javascript 引擎解析代码时，遇到了不符合语法规范的标记（token）或标记顺序，则会抛出 `SyntaxError`。
> 

这里陈列下 `SyntaxError` 的常见错误

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
const implements = 1; // caught SyntaxError: Unexpected strict mode reserved word
```


#### 命名错误

> 一个 JavaScript 标识符必须以字母开头，下划线（_）或美元符号（$）。他们不能以数字开头。只有后续字符可以是数字（0-9）。

```js
var 1life = 'foo';
// SyntaxError: identifier starts immediately after numeric literal

var foo = 1life;
// SyntaxError: identifier starts immediately after numeric literal
```

#### 错误的标点

> 在代码中有非法的或者不期望出现的标记符号出现在不该出现的位置。

```js
“This looks like a string”;
// SyntaxError: illegal character

42 – 13;
// SyntaxError: illegal character
```

代码里使用了中文的引号和横杠, 造成了解析错误, 这里就提现了编辑器的重要性

#### JSON 解析

```js
JSON.parse('[1, 2, 3, 4, ]');
JSON.parse('{"foo" : 1, }');
// SyntaxError JSON.parse: unexpected character
// at line 1 column 14 of the JSON data
```

json 解析失败的类型有很多, 这里就不赘述了, 我们在进行 `json` 解析的时候, 一定要加上 `try...catch` 语句来避免错误


#### 分号问题

> 通常情况下，这个错误只是另一个错误一个导致的，如不正确转义字符串，使用 var 的错误

```js
const foo = 'Tom's bar';
// SyntaxError: missing ; before statement
```

通过其他方案声明:

```js
var foo = "Tom's bar";
var foo = 'Tom\'s bar';
var foo = `Tom's bar`; // 推荐这种方案
```

---

使用 `var` 错误

```js
var array = [];
var array[0] = "there"; // SyntaxError missing ; before 
```


类似当前错误的还有很多, 比如: 

- `SyntaxError: missing ) after argument list`
- `SyntaxError: missing ) after condition`
- `SyntaxError: missing } after function body`
- `SyntaxError: missing } after property list`

等等, 这些都是语法的错误, 在编辑器/IDE使用时期都能解析, 但是在某些比较古老的框架下, 
编辑器可能并不能识别出来他的语法, 这便是此错误经常出现的场景

#### 小结

`SyntaxError` 属于运行时代码错误, 通常也是新手开发者容易犯得的错误 , 在 `dev` 时期就可以发现, 不然无法通过编译, 是属于比较容易发现的问题

### TypeError

> **`TypeError`**（类型错误）对象通常（但并不只是）用来表示值的类型非预期类型时发生的错误。

以下情况会抛出 `TypeError`：

* 传递给运算符的操作数或传递给函数的参数与预期的类型不兼容； 
* 尝试修改无法更改的值； 
* 尝试以不适当的方法使用一个值。

#### 不可迭代属性

当使用 `for...of` , 右侧的值不是一个可迭代值时, 或者作为数组解构赋值时, 会报此问题

例如:

```js
const myobj = { arrayOrObjProp1: {}, arrayOrObjProp2: [42] };

const {
  arrayOrObjProp1: [value1],
  arrayOrObjProp2: [value2],
} = myobj; // TypeError: object is not iterable


const obj = { France: "Paris", England: "London" };
for (const p of obj) {
  // …
} // TypeError: obj is not iterable
```

JS 中有内置的可迭代对象, 如: `String`、`Array`、`TypedArray`、`Map`、`Set` 以及 `Intl.Segments (en-US)`, 因为它们的每个 `prototype` 对象都实现了 `@@iterator` 方法。

`Object` 是不可迭代的，除非它们实现了迭代协议。

简单来说, 对象中缺少一个可迭代属性: `next` 函数

将上述 `obj` 改造:

```js
const obj = {
  France: "Paris", England: "London",
  [Symbol.iterator]() {
    // 用原生的空数组迭代器来兼容
    return [][Symbol.iterator]();
  },
};
for (const p of obj) {
  // …
}
```

如此可不报错, 但是也不会进入循环中

[点此查看什么是迭代协议](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol)

#### 空值问题

```js
null.foo;
// 错误类型：null 没有这个属性

undefined.bar;
// 错误类型：undefined 没有这个属性

const foo = undefined;
foo.substring(1); // TypeError: foo is undefined
```

虽然看起来简单, 但是他是出现白屏最为频繁的报错原因之一

在以前我们通常这样解决问题:

```js
var value = null;

value && value.foo;
```

现在我们可以使用 **可选链** [Optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) 来解决这个问题


```js
var value = null;

value?.foo;

// 但是他也不能用来赋值:
value?.foo = 1
```

可选链语法:

```js
obj.val?.prop
obj.val?.[expr]
obj.func?.(args)
```

#### 错误的函数执行

错误的函数名称: 
```js
var x = document.getElementByID("foo");
// TypeError: document.getElementByID is not a function

var x = document.getElementById("foo"); // 正确的函数
```

---

不存在的函数:

```js
var obj = { a: 13, b: 37, c: 42 };

obj.map(function(num) {
  return num * 2;
});
// TypeError: obj.map is not a function
```

#### `in` 的错误场景

在判断一个对象中是否存在某个值时, 比较常用的是一种方法是使用 `in` 来判断:

```js
var foo = { baz: "bar" };

if('baz' in foo){
  // operation 
}
```

因为不能确定 foo['baz'] 的具体值, 所以这种方案也是不错的, 但是当 `foo` 的类型也不能确认的时候就会容易出现报错了

```js
var foo = null;
"bar" in foo;
// TypeError: invalid 'in' operand "foo"

"Hello" in "Hello World";
// TypeError: invalid 'in' operand "Hello World"
```
字符串和空值不适合使用此语法

_另外需要注意的是_, 我们在**数组**中需要小心使用

```js
const number = [2, 3, 4, 5];

3 in number // 返回 true.
2 in number // 返回 true.

5 in number // 返回 false，因为 5 不是数组上现有的索引，而是一个值;
```

#### 小结

因为错误是跟随着不同的值类型来的, 而数据的接收/转变我们并不能做到 100% 的把控。
它是我们平时线上报错最频繁的一种类型,也是最容易造成页面白屏的。需要保持 120% 的小心。

### RangeError

> **`RangeError`** 对象表示一个特定值不在所允许的范围或者集合中的错误。

在以下的情况中，可能会遇到这个问题：

* 将不允许的字符串值传递给 [`String.prototype.normalize()`](/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/normalize)，或
* 尝试使用 [`Array`](/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array) 构造函数创建一个具有不合法的长度的字符串，或
* 传递错误值到数值计算方法（[`Number.toExponential()`](/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/toExponential)、[`Number.toFixed()`](/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed) 或 [`Number.toPrecision()`](/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/toPrecision)）。

这里举几个例子: 

```js
String.fromCodePoint("_"); // RangeError

new Array(-1); // RangeError

new Date("2014-25-23").toISOString(); // RangeError

(2.34).toFixed(-100); // RangeError

(42).toString(1);

const b = BigInt(NaN);
// RangeError: NaN cannot be converted to a BigInt because it is not an integer
```

---

总的来说 RangeError 都是因为传入了不正确的值而导致的该问题, 这种情况发生的概率较小, 部分数字都是自己可以手动控制或者写死在代码里的,
除非是定制化很高的情况, 比如低代码, 让用户随意输入的时候, 在使用的时候, 最好先做出判断, 或者加上 try...catch 即可

### ReferenceError

> **`ReferenceError`**（引用错误）对象代表当一个不存在（或尚未初始化）的变量被引用时发生的错误。

这种报错的场景大多处于严格模式下, 在正常情况下 **"变量未定义"** 这种报错出现的情况较多


```js
foo.substring(1); // ReferenceError: foo is not defined
```

如上, `foo` 未定义即直接使用, 则就会出现报错

还有一类报错是赋值的问题, 比如上方讲过的**_可选链_**功能, 他是不能赋值的:

```js
foo?.bar = 123
```

这一类在编码因为容易分析, 一般在编辑器中就能容易发现, 所以并不会带来很多困扰。

### 其他

**`InternalError` 对象**表示出现在 JavaScript 引擎内部的错误。尚未成为任何规范的一部分, 所以我们可以忽略。

---

**`EvalError`** 代表了一个关于 `eval()` 全局函数的错误。

他不在当前的 `ECMAScript` 规范中使用，因此不会被运行时抛出。但是对象本身仍然与规范的早期版本向后兼容。

--- 

**`URIError`** 对象用来表示以一种错误的方式使用全局 URI 处理函数而产生的错误。

例如:

```js
decodeURIComponent('%')
// caught URIError: URI malformed

decodeURI("%")     
// Uncaught URIError: URI malformed at decodeURI
```

所以使用 `decodeURIComponent` 函数时, 需要加上 `try...catch` 来保持正确性

## 另类错误

### unhandledrejection

当 [`Promise`](/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise) 被 reject 且没有 reject 处理器的时候，会触发 **`unhandledrejection`** 事件；
这个时候，就会报一个错误：`unhanled rejection；`没有堆栈信息，只能依靠行为轨迹来定位错误发生的时机。

```js
window.addEventListener('unhandledrejection', event =>
{
    console.log('unhandledrejection: ', event.reason); // 打印
});

let p = Promise.reject("oops");

// 打印 unhandledrejection:  oops
// caught (in promise) oops
```

### 手动抛出错误

我们在书第三方库的时候，可以手动抛出错误。但是throw error会阻断程序运行，请谨慎使用。


```js
throw new Error("出错了！"); // caught Error: 出错了！
throw new RangeError("出错了，变量超出有效范围！");
throw new TypeError("出错了，变量类型无效！");
```


同样的, 此种方案我们可以使用在 `Promise` 的 `then` 中:

```js
// 模拟一个接口的返回
Promise.resolve({code: 3000, message: '这是一个报错！'}).then(res => {
  if (res.code !== 200) {
    throw new Error(`code 3000: ${res.message}`)
  }
  console.log(res); // 这里可以看做是执行正常操作, 抛出错误时, 此处就不会执行了
}).catch(err => {
  alert(err.message)
});
```

在 `catch` 中我们可以通过 `name` 来判断不同的 `Error`:


```js
try {
  throw new TypeError(`This is an Error`)
} catch (e) {
  console.log(e.name); // TypeError
}
```

再加上自定义的 `Error`, 我们就可以制作更加自由的报错信息:

```js
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

try {
  throw new ValidationError(`This is an Error`)
} catch (e) {
  console.log(e.name);
  // 'ValidationError'
  if (e instanceof ValidationError) {
    alert("Invalid data: " + e.message); // Invalid data: This is an Error
  }
}
```

在 `Error` 的基础上我们还可以做更深入的继承, 来制作更多的自定义 `Error`

## 报错在 react 中的影响

`react` 报错按照位置, 我将他分成两类, 一类是**渲染报错**, 另一类是**执行报错**;   
渲染即 `render` 函数中的视图渲染报错, 另一个则是执行函数报错;

函数的执行报错, 是不会影响视图的渲染的, 即**白屏**, 但是他会有一些不良影响, 如
- 代码执行暂停, 部分逻辑未执行, 未能闭环整体逻辑, 如点击按钮一直卡在 `loading` 中
- 数据的渲染出现异常, 两边数据对不上


在视图渲染中*(包括函数的 `return`)* ,触发 JS 错误, 都会渲染问题

那为什么整个页面都会白屏呢 ?

原因是自 `React 16` 起，任何未被**错误边界**捕获的错误将会导致整个 `React` 组件树被卸载。

### 错误边界


### 降级和熔断

react-error-boundary


## 总结



## 引用

> https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Errors
> https://zhuanlan.zhihu.com/p/602293047
> https://baobangdong.cn/the-story-about-blank-screen/

## typeof

typeof 一般用来判断一个变量的类型

```js
// 需要注意的是这个:

typeof {} // "object"

typeof null // "object"
```
null 也是返回一个对象

js 在底层存储变量的时候，会在变量的机器码的低位1-3位存储其类型信息👉

*   000：对象
*   010：浮点数
*   100：字符串
*   110：布尔
*   1：整数

but, 对于 `undefined` 和 `null` 来说，这两个值的信息存储是有点特殊的。

`null`：所有机器码均为0

`undefined`：用 −2^30 整数来表示

所以，`typeof` 在判断 `null` 的时候就出现问题了，由于 `null` 的所有机器码均为0，因此直接被当做了对象来看待。

## instanceof
要想判断一个数据具体是哪一种 object 的时候，我们需要利用 instanceof 这个操作符来判断


```js
null instanceof null // TypeError: Right-hand side of 'instanceof' is not an object
```

`null` 直接被判断为不是 object，这也是 JavaScript 的历史遗留bug，可以参考 [typeof](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/typeof)


## Object.prototype.toString

用这个来判断类型也是一个不错的选择:

```js
Object.prototype.toString.call(1) // "[object Number]"

Object.prototype.toString.call('hi') // "[object String]"

Object.prototype.toString.call({a:'hi'}) // "[object Object]"

Object.prototype.toString.call([1,'a']) // "[object Array]"

Object.prototype.toString.call(true) // "[object Boolean]"

Object.prototype.toString.call(() => {}) // "[object Function]"

Object.prototype.toString.call(null) // "[object Null]"

Object.prototype.toString.call(undefined) // "[object Undefined]"

Object.prototype.toString.call(Symbol(1)) // "[object Symbol]"
```


参考
- https://juejin.cn/post/6844903613584654344

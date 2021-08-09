首先我们要实现一个东西, 必须先确定他具有怎样的特点(特性):


> bind()方法创建一个新的函数，在bind()被调用时，这个新函数的this被指定为bind()的第一个参数，而其余参数将作为新函数的参数，供调用时使用。(来自于MDN)


基础环境:

```js
var foo = {
    value: 1
};

function bar() {
    this.name = 'name is bar'
    console.log(arguments)
    console.log(this.value);
}

// 正常调用 bar()  打印 undefined
```

### 版本一

首先我们可以使用 `call` 或者 `apply` 来进行模拟, 虽然这样不算一种完全的方案:

```js

Function.prototype.myBind = function (obj, ...rest) {
    const that = this
    return function (...params) {
        that.apply(obj, params.concat(rest))
    }
}

var bindBar = bar.myBind(foo, '1234')

bindBar('5678')

// 打印结果:
//  Arguments(2) ["5678", "1234"]
// 1
```

可以看到, 已经实现了这几个基本特性

### 版本二

因为bind还有一个特点，就是

> 一个绑定函数也能使用new操作符创建对象：这种行为就像把原函数当成构造器。提供的 this 值被忽略，同时调用时的参数被提供给模拟函数。

也就是说当bind返回的函数作为构造函数的时候，bind时指定的this值会失效，但传入的参数依然生效。

实现:

```js
Function.prototype.myBind = function (obj, ...rest) {
    const that = this
    
    const bound = function (...params) {
        that.apply(this instanceof that ? this : obj, params.concat(rest))
    }
    
    bound.prototype = this.prototype
    
    return bound
    
}

var bindBar = bar.myBind(foo, '1234')

var ins = new bindBar('2345')


// ins: {name: "name is bar"}
// Arguments(2) ["5678", "1234"]
```

通过 bound 我们可以很好地解决这个问题, 但是究竟是什么原因可以改变呢

我们要搭配 `new 的实现` 来理解, 大家可以看这篇文章: [点击查看](./new%20%E7%9A%84%E5%AE%9E%E7%8E%B0.md)


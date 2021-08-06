首先我们要实现一个东西, 必须先确定他具有怎样的特点(特性):


> bind()方法创建一个新的函数，在bind()被调用时，这个新函数的this被指定为bind()的第一个参数，而其余参数将作为新函数的参数，供调用时使用。(来自于MDN)


基础环境:

```js
var foo = {
    value: 1
};

function bar() {
    console.log(arguments)
    console.log(this.value);
}

// 正常调用 bar()  打印 undefined
```

### 版本一

首先我们可以使用 `call` 或者 `apply` 来进行模拟, 虽然这样不算一种完全的方案:

```js

Function.prototype.myBind = function(obj, ...rest) {
    const that = this
    return function (...params) {
        that.call(obj, ...params, ...rest)
    }
}

var bindBar = bar.myBind(foo, '1234')

bindBar('5678')

// 打印结果:
//  Arguments(2) ["5678", "1234"]
// 1
```

可以看到, 已经实现了这几个基本特性

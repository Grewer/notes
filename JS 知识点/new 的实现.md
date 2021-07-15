## new 的实现

new 是一个我们常用的语法, 也是面试经常考的, 现在我们就要实现一个

第一版代码:

```js
function myNew(fn, ...args) {
    const o = {}
    o.__proto__ = fn.prototype
    fn.call(o, ...args)
    return o
}


const foo = function (name) {
    this.name = name
}

foo.prototype.say = function () {
    console.log(this.name)
}

const ins = myNew(foo, 'zhang san')
ins.say()
```

假如构造函数有返回值

一个 new 他会有四步操作:

* 创建一个空的简单JavaScript对象（即`{ }`）；
* 链接该对象（设置该对象的**constructor**）到另一个对象 ；
* 将步骤1新创建的对象作为`this`的上下文 ；
* 如果该函数没有返回对象，则返回`this`。

所以当 foo 返回 一个对象时, new 之后的结果不应该有 name 属性和 say 方法

所以我们需要修改第一版代码:

```js
function myNew(fn, ...args) {
    const o = {}
    o.__proto__ = fn.prototype
    const result = fn.call(o, ...args)
    return (typeof result === 'object' && result) ? result : o
}


const foo = function (name) {
    this.name = name

    return {
        age: 18,
        standUp() {
            console.log('stand up')
        }
    }
}

foo.prototype.say = function () {
    console.log(this.name)
}

const ins = myNew(foo, 'zhang san')
ins.say() // ins.say is not a function

```

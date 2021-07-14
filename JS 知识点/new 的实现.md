## new 的实现

new 是一个我们常用的语法, 也是面试经常考的, 现在我们就要实现一个


第一版代码:

```js
function myNew(fn, ...args) {
    const o = Object.create(fn.prototype)
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

首先我们需要 promise 的过程

1. 初始化 Promise 状态（pending）
2. 立即执行 Promise 中传入的 fn 函数，将Promise 内部 resolve、reject 函数作为参数传递给 fn ，按事件机制时机处理
3. 执行 then(..) 注册回调处理数组（then 方法可被同一个 promise 调用多次）
4. Promise里的关键是要保证，then方法传入的参数 onFulfilled 和 onRejected，必须在then方法被调用的那一轮事件循环之后的新执行栈中执行。

根据此过程来构建我们的 promise:

```js
function MyPromise(fn) {
    this.status = 'padding'
    this.data = undefined
    this.pool = []

    function resolve(data) {
        console.log('run resolve')
        this.data = data
        this.status = 'resolve'
        this.pool.forEach(_fn => fn())
    }

    function reject(data) {
        this.data = data
        this.status = 'reject'
        this.pool.forEach(_fn => fn())
    }

    fn(resolve.bind(this), reject.bind(this))
}

MyPromise.prototype.then = function (fn) {
    this.pool.push(() => {
        console.log('qwert run')
        if (this.status === 'resolve') {
            this.status = 'fulfilled'
            fn(this.data)
        } else {
            fn()
        }
    })
    return this
}

MyPromise.prototype.catch = function (fn) {
    this.pool.push(() => {
        if (this.status === 'reject') {
            fn(this.data)
        }
    })

    return this
}

```

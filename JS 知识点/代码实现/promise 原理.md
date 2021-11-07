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
        this.data = data
        this.status = 'resolve'
        setTimeout(() => {
            this.pool.forEach(_fn => {
                _fn();
            })
        }, 0)
    }

    function reject(data) {
        this.data = data
        this.status = 'reject'
        setTimeout(() => {
            this.pool.forEach(_fn => {
                _fn();
            })
        }, 0)
    }

    fn(resolve.bind(this), reject.bind(this))
}

MyPromise.prototype.then = function (fn) {
    this.pool.push(() => {
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

用来测试的代码:

```js
var test = new MyPromise((resolve, reject) => {
    setTimeout(resolve, 1000, 'qwer')
})
    .then(res => console.log('run1', res))
    .then(res => console.log('run2', res))

var test2 = new MyPromise((resolve, reject) => {
    resolve('asdf')
})
    .then(res => console.log('run1', res))
    .then(res => console.log('run2', res))
```

基本是实现的他的需求, 但是针对 eventLoop 来说也是有些不太对的


## Promise.all

首先是 `Promise.all` 的使用:

```js
const foo = new Promise(function (resolve) { 
    setTimeout(resolve, 1000, 1234)
})

const bar = Promise.resolve('my')

const baz = '123'


const result = Promise.all([foo,bar,baz])

```

polyfill:

```js
myPromise.all = function (promises) {
    let responses = []
    let errors = []
    
    return new Promise( (resolve, reject) => { 
        promises.forEach(async (siglePromise,i)=>{
            
            try {
                const res = await  siglePromise
                responses.push(res)
                if(i == promises.length - 1){
                    if(errors.length>0){
                        reject(errors)
                    }else{
                        resolve(responses)
                    }
                }
            }catch (err) {
                errors.push(err)
                reject(err)
            }
        })
    })
    
}
```

```js
const foo = new Promise(function (resolve) {
    setTimeout(resolve, 1000)
})

const bar = Promise.resolve()

const baz = '123'


const result = myPromise.all([foo,bar,baz])
```

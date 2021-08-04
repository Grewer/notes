## 1 原型链继承

```js
function Parent() {
    this.name = 'foo'
}

Parent.prototype.test = function () {
    console.log(this.name)
}

const Child = function () {

}

Child.prototype = new Parent()

const ins = new Child()

ins.test()
```

**缺点:**

- 原型链中的引用值, 所有实例会出现空间共享的情况
- 传值不太方便(即`new Parent()`)

## 2. 盗用构造函数

```js
function Parent() {
    this.name = 'foo'
    this.test = function () {
        console.log(this.name)
    }
}


const Child = function () {
    Parent.call(this)
}
const ins = new Child()

ins.test()
```
  
没有借助原型链, 实现了 this 的转移  

现在也可以进行传参了

**缺点:**

必须在构造函数中定义方法, 因此也不能重用


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

没有了空间共享的情况

**缺点:**

- 必须在构造函数中定义方法, 因此也不能重用

## 3. 原型式

通过类似于 `Object.create` 的 API 创建:

```js
let Parent = {
    name: 'foo',
    test: function () {
        console.log(this.name)
    }
}

const ins = Object.create(Parent)

ins.test()
```

**缺点:**

- 没有构造函数(可以说是特点)
- 引用值也会存在共享

## 4. 寄生式

```js
function createObject(origin) {
    let clone = Object.create(origin)
    clone.test2 = function () {
        console.log(this.name)
    }
    return clone
}

let Parent = {
    name: 'foo',
    test: function () {
        console.log(this.name)
    }
}

const ins = createObject(Parent)

ins.test()

ins.test2()

```

**缺点:**

- 没有构造函数(可以说是特点)

## 5. 寄生式组合

```js

function inheritPeototype(child, parent) {
    let prototype = Object.create(parent.prototype)
    prototype.constructor = child
    child.prototype = prototype
}

function Parent() {
    this.name = 'foo'
}

Parent.prototype.test = function () {
    console.log(this.name)
}


const Child = function () {
    Parent.call(this)
}

inheritPeototype(Child, Parent)

const ins = new Child()

ins.test()

```

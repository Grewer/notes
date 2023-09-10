# 微前端的实现机制

## 前言

在大型项目中，微前端是一种常见的优化手段，本文就微前端中的机制及原理，并以 `qiankun` 为例子， 作一下讲解

## 首先什么是微前端

>  Techniques, strategies and recipes for building a **modern web app** with **multiple teams** that can **ship features independently**. -- [Micro Frontends](https://micro-frontends.org/)
>
>  前端是一种多个团队通过独立发布功能的方式来共同构建现代化 web 应用的技术手段及方法策略。

## 常见的微前端实现机制

微前端的架构

![img.png](images%2Fimg.png)

## iframe

如果你还是不了解什么是微前端， 那么就将它当做一种 `iframe` 即可， 但我们为什么不直接用它呢？ 

`iframe` 最大的特性就是提供了浏览器原生的硬隔离方案，不论是样式隔离、js 隔离这类问题统统都能被完美解决。但他的最大问题也在于他的隔离性无法被突破，导致应用间上下文无法被共享，随之带来的开发体验、产品体验的问题。

1. url 不同步。浏览器刷新 iframe url 状态丢失、后退前进按钮无法使用。
2. UI 不同步，DOM 结构不共享。想象一下屏幕右下角 1/4 的 iframe 里来一个带遮罩层的弹框，同时我们要求这个弹框要浏览器居中显示，还要浏览器 resize 时自动居中..
3. 全局上下文完全隔离，内存变量不共享。iframe 内外系统的通信、数据同步等需求，主应用的 cookie 要透传到根域名都不同的子应用中实现免登效果。
4. 慢。每次子应用进入都是一次浏览器上下文重建、资源重新加载的过程。

其中有的问题比较好解决(问题1)，有的问题我们可以睁一只眼闭一只眼(问题4)，但有的问题我们则很难解决(问题3)甚至无法解决(问题2)，而这些无法解决的问题恰恰又会给产品带来非常严重的体验问题， 最终导致我们舍弃了 iframe 方案。

取自文章：[Why Not Iframe](https://www.yuque.com/kuitos/gky7yw/gesexv)  

## 微前端沙箱

在微前端的场景，由于多个独立的应用被组织到了一起，在没有类似 `iframe` 的原生隔离下，势必会出现冲突，如全局变量冲突、样式冲突，这些冲突可能会导致应用样式异常，甚至功能不可用。
这时候我们就需要一个独立的运行环境，而这个环境就叫做沙箱，即 `sandbox`。


实现沙盒的第一步就是创建一个作用域。这个作用域不会包含全局的属性对象。首先需要隔离掉浏览器的原生对象，但是如何隔离，建立一个沙箱环境呢？


## 基于代理(Proxy)的沙箱

假设当前一个页面中只有一个微应用在运行，那他可以独占整个 window 环境， 在切换微应用时，只有将 window 环境恢复即可，保证下一个的使用。

这便是**单实例场景**。

### 单实例

一个最简单的实现demo：

```js
const varBox = {};
const fakeWindow = new Proxy(window, {
  get(target, key) {
    return varBox[key] || window[key];
  },
  set(target, key, value) {
    varBox[key] = value;
    return true;
  },
});

window.test = 1;
```

通过一个简单的 `proxy` 即可实现一个 window 的代理，将数据存储到 `varBox` 中，而不影响原有的 `window` 的值


而在某些文章里，他把沙箱实现的更加具体，还拥有**启用**和**停用**功能：

```js
// 修改全局对象 window 方法
const setWindowProp = (prop, value, isDel) => {
    if (value === undefined || isDel) {
        delete window[prop];
    } else {
        window[prop] = value;
    }
}

class Sandbox {
    name;
    proxy = null;

    // 沙箱期间新增的全局变量
    addedPropsMap = new Map();

    // 沙箱期间更新的全局变量
    modifiedPropsOriginalValueMap = new Map();

    // 持续记录更新的(新增和修改的)全局变量的 map，用于在任意时刻做沙箱激活
    currentUpdatedPropsValueMap = new Map();

    // 应用沙箱被激活
    active() {
        // 根据之前修改的记录重新修改 window 的属性，即还原沙箱之前的状态
        this.currentUpdatedPropsValueMap.forEach((v, p) => setWindowProp(p, v));
    }

    // 应用沙箱被卸载
    inactive() {
        // 1 将沙箱期间修改的属性还原为原先的属性
        this.modifiedPropsOriginalValueMap.forEach((v, p) => setWindowProp(p, v));
        // 2 将沙箱期间新增的全局变量消除
        this.addedPropsMap.forEach((_, p) => setWindowProp(p, undefined, true));
    }

    constructor(name) {
        this.name = name;
        const fakeWindow = Object.create(null); // 创建一个原型为 null 的空对象
        const { addedPropsMap, modifiedPropsOriginalValueMap, currentUpdatedPropsValueMap } = this;
        const proxy = new Proxy(fakeWindow, {
            set(_, prop, value) {
                if(!window.hasOwnProperty(prop)) {
                    // 如果 window 上没有的属性，记录到新增属性里
                    addedPropsMap.set(prop, value);
                } else if (!modifiedPropsOriginalValueMap.has(prop)) {
                    // 如果当前 window 对象有该属性，且未更新过，则记录该属性在 window 上的初始值
                    const originalValue = window[prop];
                    modifiedPropsOriginalValueMap.set(prop, originalValue);
                }

                // 记录修改属性以及修改后的值
                currentUpdatedPropsValueMap.set(prop, value);

                // 设置值到全局 window 上
                setWindowProp(prop,value);
                console.log('window.prop', window[prop]);

                return true;
            },
            get(target, prop) {
                return window[prop];
            },
        });
        this.proxy = proxy;
    }
}

// 初始化一个沙箱
const newSandBox = new Sandbox('app1');
const proxyWindow = newSandBox.proxy;
proxyWindow.test = 1;
console.log(window.test, proxyWindow.test) // 1 1;

// 关闭沙箱
newSandBox.inactive();
console.log(window.test, proxyWindow.test); // undefined undefined;

// 重启沙箱
newSandBox.active();
console.log(window.test, proxyWindow.test) // 1 1 ;
```


添加了沙箱的 `active` 和 `inactive` 方案来激活或者卸载沙箱，核心的功能 `proxy` 的创建则在构造函数中  
原理和上述的简单 `demo` 中的实现类似，但是没有直接拦截 `window`， 而是创建一个 `fakeWindow`，这就引出了我们要讲的
**多实例沙箱**

### 多实例

我们把 `fakeWindow` 使用起来，将微应用使用到的变量放到 `fakeWindow` 中，而共享的变量都从 `window` 中读取。

```js
class Sandbox {
    name;
    constructor(name, context = {}) {
        this.name = name;
        const fakeWindow = Object.create({});

        return new Proxy(fakeWindow, {
            set(target, name, value) {
                if (Object.keys(context).includes(name)) {
                    context[name] = value;
                }
                target[name] = value;
            },
            get(target, name) {
                // 优先使用共享对象
                if (Object.keys(context).includes(name)) {
                    return context[name];
                }
                if (typeof target[name] === 'function' && /^[a-z]/.test(name)) {
                    return target[name].bind && target[name].bind(target);
                } else {
                    return target[name];
                }
            }
        });
    }
    //  ...
}

/**
 * 注意这里的 context 十分关键，因为我们的 fakeWindow 是一个空对象，window 上的属性都没有，
 * 实际项目中这里的 context 应该包含大量的 window 属性，
 */

// 初始化2个沙箱，共享 doucment 与一个全局变量
const context = { document: window.document, globalData: 'abc' };

const newSandBox1 = new Sandbox('app1', context);
const newSandBox2 = new Sandbox('app2', context);

newSandBox1.test = 1;
newSandBox2.test = 2;
window.test = 3;

/**
 * 每个环境的私有属性是隔离的
 */
console.log(newSandBox1.test, newSandBox2.test, window.test); // 1 2 3;

/**
 * 共享属性是沙盒共享的，这里 newSandBox2 环境中的 globalData 也被改变了
 */
newSandBox1.globalData = '123';
console.log(newSandBox1.globalData, newSandBox2.globalData); // 123 123;
```

## 基于 diff 的沙箱


也叫做**快照沙箱**，顾名思义，即在某个阶段给当前的运行环境打一个快照，再在需要的时候把快照恢复，从而实现隔离。

类似玩游戏的 SL 大法，在某个时刻保存起来，操作完毕再重新 Load，回到之前的状态。

他的实现可以说是单实例的简化版，分为激活与卸载两个部分的操作。

```js
active() {
  // 缓存active状态的沙箱
  this.windowSnapshot = {};
  for (const item in window) {
    this.windowSnapshot[item] = window[item];
  }

  Object.keys(this.modifyMap).forEach(p => {
    window[p] = this.modifyMap[p];
  })
}
```

```js
inactive() {
  for (const item in window) {
    if (this.windowSnapshot[item] !== window[item]) {
      // 记录变更
      this.modifyMap[item] = window[item];
      // 还原window
      window[item] = this.windowSnapshot[item];
    }
  }
}
```


在 `activate` 的时候遍历 `window` 上的变量，存为 `windowSnapshot`
在 `deactivate` 的时候再次遍历 `window` 上的变量，分别和 `windowSnapshot` 对比，将不同的存到 `modifyMap` 里，将 `window` 恢复
当应用再次切换的时候，就可以把 `modifyMap` 的变量恢复回 window 上，实现一次沙箱的切换。

```js
class Sandbox {
    private windowSnapshot
    private modifyMap
    activate: () => void;
    deactivate: () => void;
}

const sandbox = new Sandbox();
sandbox.activate();
// 执行任意代码
sandbox.deactivate();
```

此方案在实际项目中实现起来要复杂的多，其对比算法需要考虑非常多的情况，比如对于 `window.a.b.c = 123` 这种修改或者对于原型链的修改，这里都不能做到回滚到应用加载前的全局状态。所以这个方案一般不作为首选方案，是对老旧浏览器的一种降级处理。

在 `qiankun` 中也有该降级方案，被称为 `SnapshotSandbox`。

## 基于 iframe 的沙箱

在上文讲述了 `iframe` 作为微前端的一种实现方式，在沙箱中 iframe 也有他的独特作用。

```js
const iframe = document.createElement('iframe', { url: 'about:blank' });

const sandboxGlobal = iframe.contentWindow;
sandbox(sandboxGlobal);
```
 
> 注意：只有同域的 iframe 才能取出对应的的 contentWindow。所以需要提供一个宿主应用空的同域 URL 来作为这个 iframe 初始加载的 URL. 根据 HTML 的规范 这个 URL 用了 about:blank 一定保证保证同域，也不会发生资源加载。

```js
class SandboxWindow {
    constructor(options, context, frameWindow) {
        return new Proxy(frameWindow, {
            set(target, name, value) {
                if(Object.keys(context).includes(name)) {
                    context[name] = value;
                }
                target[name] = value;
            },
            get(target, name) {
                // 优先使用共享对象
                if(Object.keys(context).includes(name)) {
                    return context[name];
                }

                if(typeof target[name] === 'function' && /^[a-z]/.test(name)) {
                    return target[name].bind && target[name].bind(target);
                } else {
                    return target[name];
                }
            }
        });
    }
    //  ...
}

const iframe = document.createElement('iframe', { url: 'about:blank' });
document.body.appendChild(iframe);
const sandboxGlobal = iframe.contentWindow;
// 需要全局共享的变量
const context = { document: window.document, history: window.histroy };
const newSandBoxWindow = new SandboxWindow({}, context, sandboxGlobal);
// newSandBoxWindow.history 全局对象
// newSandBoxWindow.abc 为 'abc' 沙箱环境全局变量
// window.abc 为 undefined
```

总结一些，利用 iframe 沙箱可以实现以下特性：

* 全局变量隔离，如 setTimeout, location, react 不同版本隔离
* 路由隔离，应用可以实现独立路由，也可以共享全局路由
* 多实例，可以同时存在多个独立的微应用同时运行
* 安全策略，可以配置微应用对 Cookie, localStorage 资源加载的限制

在沙箱方案上 `iframe` 是比较好的，但是仍然存在以下问题：

1. 兼容性问题， 不同的浏览器之间的实现方案可能存在差异，会导致兼容性问题。
2. 额外的性能开销
3. 相对于其他的方案，应用间的通信手段更麻烦

## 基于 ShadowRealm 的沙箱

`ShadowRealm` 提议提供了一种新的机制，可在新的全局对象和 `JavaScript` 内置程序集的上下文中执行 `JavaScript` 代码。

```js
const sr = new ShadowRealm();

// Sets a new global within the ShadowRealm only
sr.evaluate('globalThis.x = "my shadowRealm"');

globalThis.x = "root"; //

const srx = sr.evaluate('globalThis.x');

srx; // "my shadowRealm"
x; // "root"
```

除了直接指向字符串代码， 还可以引用文件执行：

```js
const sr = new ShadowRealm();

const redAdd = await sr.importValue('./inside-code.js', 'add');

let result = redAdd(2, 3);

console.assert(result === 5);
```

[点此查看详细介绍](https://github.com/tc39/proposal-shadowrealm/blob/main/explainer.md)

回到正题，`ShadowRealm` 在功能和性能方面确实是最好的微前端沙箱方案，但是他的兼容性也是一大痛点：

截止目前 Chrome 版本 117.0.5938.48， 并未支持此 API，我们仍然需要 polyfill才能使用，他在微前端上发力还需要很长时间。

## 基于 VM 沙箱

VM 沙箱使用类似于 `node` 的 `vm` 模块，通过创建一个沙箱，然后传入需要执行的代码。

```js
const vm = require('node:vm');

const x = 1;

const context = { x: 2 };
vm.createContext(context); // Contextify the object.

const code = 'x += 40; var y = 17;';
// `x` and `y` are global variables in the context.
// Initially, x has the value 2 because that is the value of context.x.
vm.runInContext(code, context);

console.log(context.x); // 42
console.log(context.y); // 17

console.log(x); // 1; y is not defined. 
```



## 总结


[//]: # (传统的 js 沙箱注意是考虑的安全领域，锁定不信任脚本的执行，防止全局变量的获取与修改等。在微前端领域，侧重点不太一样，重要的是不能有全局变量的污染，这也决定了微前端的沙箱实现重点是对于独立运行环境的构造。由于 js 的灵活性，在微前端的沙盒里通过原型链等方式是可以拿到全局 window 变量的内容的。这个时候我们就还需要配合一定的规范来做代码隔离，而不仅仅是依靠沙箱环境)

## 引用

- https://www.garfishjs.org/blog
- https://qiankun.umijs.org/zh/guide
- https://zqianduan.com/pages/micro-app-sandbox.html

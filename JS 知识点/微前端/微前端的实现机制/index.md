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

在微前端的场景，由于多个独立的应用被组织到了一起，在没有类似 iframe 的原生隔离下，势必会出现冲突，如全局变量冲突、样式冲突，这些冲突可能会导致应用样式异常，甚至功能不可用。
所以想让微前端达到生产可用的程度，让每个子应用之间达到一定程度隔离的沙箱机制是必不可少的。




### iframe 实现

先说 `iframe` ，




//todo  搞清楚， diff  vm  快照  到底是那种沙箱

在 qiankun 中的沙箱思路：

```js
const windowProxy = new Proxy(window, traps);

with(windowProxy) {
  // 应用代码，通过 with 确保所有的全局变量的操作实际都是在操作 qiankun 提供的代理对象
  ${appCode}  
}
```


## iframe



### (Proxy)实现单实例沙箱

### VM 沙箱
VM 沙箱使用类似于 node 的 vm 模块，通过创建一个沙箱，然后传入需要执行的代码。




在微前端的场景，由于多个独立的应用被组织到了一起，在没有类似iframe的原生隔离下，势必会出现冲突，如全局变量冲突、样式冲突，这些冲突可能会导致应用样式异常，甚至功能不可用。所以想让微前端达到生产可用的程度，让每个子应用之间达到一定程度隔离的沙箱机制是必不可少的。

## qiankun 中的实现


    


## 总结


## 引用

- https://www.garfishjs.org/blog
- https://qiankun.umijs.org/zh/guide


本文中的微前端基于 qiankun 框架

## 多个子应用共存

如果需要多个子应用同时共存，在管理就有很多例子：

> https://qiankun.umijs.org/zh/faq#%E5%A6%82%E4%BD%95%E5%90%8C%E6%97%B6%E6%BF%80%E6%B4%BB%E4%B8%A4%E4%B8%AA%E5%BE%AE%E5%BA%94%E7%94%A8

```js
registerMicroApps([
  // 自定义 activeRule
  { name: 'reactApp', entry: '//localhost:7100', container, activeRule: () => isReactApp() },
  { name: 'react15App', entry: '//localhost:7102', container, activeRule: () => isReactApp() },
  { name: 'vueApp', entry: '//localhost:7101', container, activeRule: () => isVueApp() },
]);

start({ singular: false });
```

而使用 loadMicroApp 也会更加灵活：

```js
class App extends React.Component {
  containerRef = React.createRef();
  microApp = null;

  componentDidMount() {
    this.microApp = loadMicroApp({
      name: 'app1',
      entry: '//localhost:1234',
      container: this.containerRef.current,
      props: { brand: 'qiankun' },
    });
  }

  componentWillUnmount() {
    this.microApp.unmount();
  }

  componentDidUpdate() {
    this.microApp.update({ name: 'kuitos' });
  }

  render() {
    return <div ref={this.containerRef}></div>;
  }
}
```

这里对于多个子应用同时存在的方案不再赘述，要解决的是多个子应用同时存在时，css的冲突问题：

### 解决方法 1：通用的挂载入口解决

比如你使用的是 antd 组件库， 在他的配置 provider 中有挂载节点的配置：

https://ant-design.antgroup.com/components/config-provider-cn

```jsx
import React from 'react';

import { ConfigProvider } from 'antd';

// ...

const Demo: React.FC = () => (

  <ConfigProvider direction="rtl" getPopupContainer={()=>{
	  // 通过判断 当前是否某个特殊环境，如微前端环境
	  // 返回不同的 dom
	return document.getElementById('content-id')
	// 或者返回默认
	return document.body
  }}>

    <App />

  </ConfigProvider>

);

export default Demo;
```

当然这种方法适用于只有 antd 组件的场景，一旦使用三方的组件，没有任何挂载 dom 的入口 API就会抓瞎

这个时候，如果你能改三方包则需要一个个检查和升级，那么有没有一个方法可以解决所有问题呢？

### 方案 2： 代理 API

通用型方案出现，通过代理 api 的操作来解决挂载问题

```js
// 保存原始的 document.body.appendChild 方法
const originalAppendChild = document.body.appendChild;

// customDom 是子应用的根节点元素
const proxiedAppendChild = new Proxy(document.body.appendChild, {
    apply(target, thisArg, argumentsList) {
        // 在这里可以添加自定义逻辑
        console.log('即将添加一个新元素到自定义DOM');

        // 获取要添加的元素
        const elementToAdd = argumentsList[0];

        // 将元素添加到自定义DOM元素中
        customDom.appendChild(elementToAdd);

        // 如果需要在添加到自定义DOM后还有其他操作，可以在这里添加


        return elementToAdd;
    }
});
```

在切到到气筒页面，如主应用的某些页面，或其他技术站页面，再或者是 iframe 页面时，需要取消代理：

```js
// 取消代理的函数
function cancelAppendChildProxy() {
    if (document.body.appendChild === proxiedAppendChild) {
        document.body.appendChild = originalAppendChild;
        console.log('已成功取消对 document.body.appendChild 方法的代理');
    } else {
        console.log('当前 document.body.appendChild 方法未处于代理状态');
    }
}
```


**注意：** 在代理 `document.body.appendChild` 的函数时，对应的 `document.body.removeChild` 也需要添加。

这里为了简化代码，方便展示，也去掉了很多特殊场景的判断。

如果需要考虑兼容性，可以不使用 Proxy， 使用最简单的赋值方法即可：

```js
// 保存原始的 document.body.appendChild 方法
const originalAppendChild = document.body.appendChild;


// customDom 是子应用的根节点元素
const proxyAppendChild = (dom) => {
	const target = cutomDom || document.body;
	// 记得加上 try catch 避免报错
	// 其他的一些特殊场景的判断
	target[`appendChild`](dom);
}

document.body['appendChild'] = proxyAppendChild;

```


在这里还有个特殊场景需要注意：

> 16 升级到 17 后，**React 将事件委托到 ReactDOM 挂载的根节点上，比如 div#app，而不再是原来 document**。

所以在我们添加子应用渲染 dom 节点时，需要注意不要 `appendChild` 到更高一层的节点上，不然在点击 modal 组件时，里面的按钮都会失效 

## 子应用保活

按照正常情况来说， 微前端应用应该不需要保活，但是形式比人强，有些客户、需求就必须要这样做。

主要的思路是挂载的 dom 




## 如何提取出公共的依赖库

官方不太推荐将运行时共用, 即使共用也只推荐使用了一个方案：`external` ， 在主应用中加载必要的公共依赖

在如今 MF 微前端大火的情况下，后续我将调研此方案，应该能给出更好的解决办法；
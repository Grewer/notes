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




> 16 升级到 17 后，**React 将事件委托到 ReactDOM 挂载的根节点上，比如 div#app，而不再是原来 document**。

## 子应用保活



## 如何提取出公共的依赖库

官方不太推荐将运行时共用, 即使共用也值推荐使用了一个方案：`external`

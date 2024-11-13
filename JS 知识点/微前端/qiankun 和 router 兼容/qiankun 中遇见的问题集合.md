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





## 子应用保活



## 如何提取出公共的依赖库

官方不太推荐将运行时共用, 即使共用也值推荐使用了一个方案：`external`

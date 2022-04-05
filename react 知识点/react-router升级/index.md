## 背景
在当前业务项目中使用的 react-router 版本为 3.x, 而当前主流使用的是 5.x 以上, 
本文就来探究 react-router 升级的方案

## 当前情况

目前使用的是 react-router3.x 版本 再加上和 redux 的搭配库 `react-router-redux` 一起使用的


## 4.x 5.x API 的变动

> 因为 4 和 5 之间差别不是很大, 所以就放一起讲了

1. 路由不能集中在一个文件中
2. `<Router>` 具象为某一类, 比如: `<BrowserRouter>` ,`<HashRouter>` 等等
3. `<Switch>` 组件来匹配路由, 排他性路由
4. 用exact属性代替了 <IndexRoute>`
5. `react-router-dom` 的出现, 只需要依赖此组件即可
6. 支持 React 16 , 兼容 React >= 15
7. Route 组件 path 可以为数组
8. 如果没有匹配的路由，也可通过 <Redirect>

## 6.x API 的变动

1.  `<Switch>`重命名为`<Routes>`。
2.  `<Route>`的新特性变更。
3.  嵌套路由变得更简单。
4.  用`useNavigate`代替`useHistory`。
5.  新钩子`useRoutes`代替`react-router-config`。
6.  大小减少：从`20kb`到`8kb`

React Router需要 React >= 16.8兼容。



## 总结
升级的总结

## 参考

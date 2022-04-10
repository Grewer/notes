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
4. `<Link>` 组件 , `<NavLink>` 组件
5. 用exact属性代替了 <IndexRoute>`
6. `react-router-dom` 的出现, 只需要依赖此组件即可
7. 支持 React 16 , 兼容 React >= 15
8. Route 组件 path 可以为数组
9. 如果没有匹配的路由，也可通过 <Redirect>

## 6.x API 的变动

1. `<Switch>`重命名为`<Routes>` , 不再需要该exact。
2. `<Route>`的新特性变更。
3. 再度支持路由嵌套
4. `<Navigate>`替代`<Redirect>`
5. 用`useNavigate`代替`useHistory`。
6. 删除 `<Prompt>` 组件
7. 新钩子`useRoutes`代替`react-router-config`。
8. 大小减少：从`20kb`到`8kb`
9.增强的路径模式匹配算法。

## 小结

从 3 到 4, 5 之间有许多 break change, 同样地, 4,5 到 6 之间也是这样

所以当前项目如果是 3 的话, 我们就准备一口气升级到 6, 避免中间的多重更改


## 升级的痛点

API 修改:  
一般来说, 唯一的难点在于旧 API 的语法, 调用发生了变化, 导致一旦升级, 所有的地方都要重新写一遍

API 的删除:
- 有出现新 API 的替换 这种情况是和修改一样的
- 单纯的删除, 这里的话也是需要所有的地方修改的, 但是这种情况比较少, 而且被删除的 API 用到的地方也很少

API 新增:
单纯的新增并不影响现有的升级

同时 API 我们需要有所区分
1. 配置型 API, 这种一般只会使用一次, 比如 `<Router>`, 只在路由配置页面使用, 那我们升级的时候直接修改便可以了
2. 使用型 API, 这类 api 覆盖比较广泛, 比如说 `router.push` 改成了 `history.push`

## 升级

现在开始我们的升级

### redux 升级

需要升级 redux 相关库:
- react-redux^6.0.0
- redux-first-history

可以删除库: `react-router-redux`

> `connected-react-router` 只支持 v4 和 v5,  这里我们使用 `redux-first-history`, 更小, 更快的替代方案

store.js:
```js
import { createStore, combineReducers, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { createReduxHistoryContext } from "redux-first-history";
import { createBrowserHistory } from 'history';


// 原有 routerMiddleware 来自于 react-router-redux
const { createReduxHistory, routerMiddleware, routerReducer } = createReduxHistoryContext({ 
  history: createBrowserHistory(),
  //other options if needed 
});

export const store = createStore(
  combineReducers({
    router: routerReducer
    //... reducers //your reducers!
  }),
  composeWithDevTools(
    applyMiddleware(routerMiddleware)
  )
);

export const history = createReduxHistory(store);
```

关于 `redux-first-history` 仓库, 如果有依赖 `redux-devtools`, `redux-devtools-log-monitor` 等库, 可以不使用它

这样使用:

```js
import { compose, createStore, combineReducers, applyMiddleware } from 'redux';
import DevTools from '../utils/DevTools';

// 省略 createReduxHistoryContext

const enhancer = compose(
    applyMiddleware(
        // ...省略
        logger,
        routerMiddleware
    ),
    DevTools.instrument({maxAge: 10})
);

export const store = createStore(
    combineReducers({
        router: routerReducer
        // ...省略
    }),
    enhancer
);

```

app.js:

```js
import { Provider } from "react-redux";
import { HistoryRouter as Router } from "redux-first-history/rr6";
import { store, history } from "./store";

const App = () => (
    <Provider store={store}>
        <Router history={history}>
            //.....
        </Router>
    </Provider>
);
```

### router

经过上面 redux 的替换, 我们已经拥有了 `store`, `history`, `Router` 等几个重要属性了

接下来只需要对 routes 进行控制即可:

```jsx
<Routes path={url} component={App}> // TODO check
    <Route path={url2} element={<Foo/>} />
</Routes>
```


之后就是


在 hooks 中的用法:

```js
import { useNavigate } from "react-router-dom";

// hooks 
const navigate = useNavigate();
//这会将新路线推送到导航堆栈的顶部
navigate("/new-route");

//这会将当前路线替换为导航堆栈中的新路由
navigate("/new-route", { replace: true });
```

//TODO  import {Link} from 'react-router' 

## 总结
升级的总结

## 参考
- https://juejin.cn/post/6966242922278682632

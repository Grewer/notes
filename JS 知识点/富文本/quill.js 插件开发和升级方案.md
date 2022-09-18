## 前言

在前端开发中, 富文本是一种常见的业务场景, 而本文要讲的就是富文本框架 quill.js 中的插件的开发以及他的升级方案

## 介绍

Quill.js 是一个具有跨平台和跨浏览器支持的富文本编辑器。凭借其可扩展架构和富有表现力的 API，可以完全自定义它以满足个性化的需求。由于其模块化架构和富有表现力的 API，可以从 Quill 核心开始，然后根据需要自定义其模块或将自己的扩展添加到这个富文本编辑器中。它提供了两个用于更改编辑器外观的主题，可以使用插件或覆盖其 CSS 样式表中的规则进一步自定义。Quill 还支持任何自定义内容和格式，因此可以添加嵌入式幻灯片、3D 模型等。

![](images/img.png)

该富文本编辑器的**特点**：

*   由于其 API 驱动的设计，无需像在其他文本编辑器中那样解析 HTML 或不同的 DOM 树；
*   跨平台和浏览器支持，快速轻便；
*   通过其模块和富有表现力的 API 完全可定制；
*   可以将内容表示为 JSON，更易于处理和转换为其他格式；
*   提供两个主题以快速轻松地更改编辑器的外观。

## 插件的开发

> 本次的编辑器使用 `react-quill` 组件库, 他在 `quill.js` 外层包装了一层 `react` 组件, 使得开发者在 react 框架用使用更加友好  
> 相关链接: https://github.com/zenoamaro/react-quill
> 

### 使用:

```tsx
import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function App() {
  const [value, setValue] = useState('');

  return <ReactQuill theme="snow" value={value} onChange={setValue} />;
}
```

### 自定义 toolbar

> 传递自定义 `toolbar` 的值

`toolbar` 中 **自定义的按钮**, 可以用 `iconfont` 的 `svg` 或者 `class`, 这里为了方便, 我们直接用文字
```tsx
const CustomButton = () => <span className="iconfont">
    find
</span>;
```

```tsx
function App() {
    const [value, setValue] = useState('');
    
    function insertStar() {
        // 点击自定义图标后的回调
    }
    
    // 自定义的 toolbar, useCallback 重渲染会有显示问题
    const CustomToolbar = useCallback(() => (
        <div id="toolbar">
            <select
                className="ql-header"
                defaultValue={''}
                onChange={(e) => e.persist()}
            >
                <option value="1"></option>
                <option value="2"></option>
                <option selected></option>
            </select>
            <button className="ql-bold"></button>
            <button className="ql-italic"></button>
            <button className="ql-insertStar">
                <CustomButton/>
            </button>
        </div>
    ), []);
    
    // 直接声明会有显示问题
    const modules = useMemo(() => ({
        toolbar: {
            container: '#toolbar',
            handlers: {
                insertStar: insertStar,
            },
        },
    }), []);
    
    return (<div>
        <CustomToolbar/>
        <ReactQuill theme="snow" value={value} modules={modules} onChange={setValue}/>
    </div>)
}   
```

通过此方案, 可以打造一个属于自己的工具栏了

_但是也有一个缺点: **原有的 `quill.js` 工具栏**功能需要自己手写或者去官方 copy 下来_

## 例子

> 现在可以自定义添加工具栏了, 那就开始我们的插件开发之旅

本次的例子是一个**查找与替换功能**的插件开发

首先根据 `自定义 toolbar` 中的方案添加按钮, 因为上面已经有了例子, 这里就忽略掉自定义按钮的代码

现在根据点击之后的回调, 显示如下的样式:

![](images/img_1.png)

```tsx
class FindModal extends React.Component {
    render(){
        return <div className={'find-modal'}>
            <span className={'close'} onClick={this.props.closeFindModal}>x</span>
            <Tabs defaultActiveKey="1" size={'small'}>
                <TabPane tab={'查找'} key="1">
                    {this.renderSearch()}
                </TabPane>
                <TabPane tab={'替换'} key="2">
                    {this.renderSearch()}
                    <div className={'find-input-box replace-input'}>
                        <label>{'替换'}</label>
                        <Input onChange={this.replaceOnChange}/>
                    </div>
                    <div className={'replace-buttons'}>
                        <Button disabled={!indices.length} size={'small'} onClick={this.replaceAll}>
                            {'全部替换'}
                        </Button>
                        <Button
                            disabled={!indices.length}
                            size={'small'}
                            type={'primary'}
                            onClick={this.replace}
                        >
                            {'替换'}
                        </Button>
                    </div>
                </TabPane>
            </Tabs>
        </div>
    }
}
```

在外部使用 `state` 的 `visible` 控制即可:

```tsx
visible ? (<FindModal/>) : null
```


### 思路

### 实战

## 升级现状

## 升级方案

## 结语


## 引用
- https://juejin.cn/post/7084046542994145294

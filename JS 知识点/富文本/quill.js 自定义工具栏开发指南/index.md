## 前言

在前端开发中, 富文本是一种常见的业务场景, 而本文要讲的就是富文本框架 quill.js 中的自定义工具栏的开发

## 介绍

> [Quill.js](https://quilljs.com/) 是一个具有跨平台和跨浏览器支持的富文本编辑器。凭借其可扩展架构和富有表现力的 API，可以完全自定义它以满足个性化的需求。由于其模块化架构和富有表现力的 API，可以从 Quill 核心开始，然后根据需要自定义其模块或将自己的扩展添加到这个富文本编辑器中。它提供了两个用于更改编辑器外观的主题，可以使用插件或覆盖其 CSS 样式表中的规则进一步自定义。Quill 还支持任何自定义内容和格式，因此可以添加嵌入式幻灯片、3D 模型等。

![](images/img.png)

该富文本编辑器的**特点**：

*   由于其 API 驱动的设计，无需像在其他文本编辑器中那样解析 HTML 或不同的 DOM 树；
*   跨平台和浏览器支持，快速轻便；
*   通过其模块和富有表现力的 API 完全可定制；
*   可以将内容表示为 JSON，更易于处理和转换为其他格式；
*   提供两个主题以快速轻松地更改编辑器的外观。

## 自定义工具栏的开发

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

首先我们上在线例子: https://d1nrnh.csb.app/

> 现在可以自定义添加工具栏了, 那就开始我们的开发之旅

本次的例子是一个**查找与替换功能**的工具栏开发

首先根据 `自定义 toolbar` 中的方案添加按钮, 因为上面已经有了例子, 这里就忽略掉自定义按钮的代码

### 主要结构

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

### 搜索栏的处理

这里我们从用户的输入关键词开始入手: 当用户**输入搜索关键词**时, 触发回调:

```tsx
<Input
    onChange={this.onChange}
    value={searchKey}
/>
```

`onChange` 输入时的触发 _(这里我们可以加上 debounce)_:

首先我们保存输入的值, 将搜索结果 `indices` 重置为空:
```ts
this.setState({
    searchKey: value,
    indices: [],
});
```

通过 quill 获取所有文本格式:
```ts
const {getEditor} = this.props;
const quill = getEditor();
const totalText = quill.getText();
```

解析用户输入的词, 将其转换成正则 (**_注意这里要对用户输入转义, 避免一些关键词影响正则_**)   
之后则是是非大小写敏感: 使用 `i` 标记, `g` 表示全局匹配的意思(_不加上就只会匹配一次_):
```ts
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
const re = new RegExp(escapeRegExp(searchKey), this.state.checked ? 'g' : 'gi');
```

之后我们就要利用 `totalText` 和 `re` 进行循环正则匹配:

```ts
while ((match = re.exec(totalText)) !== null) {
    // 目标文本在文档中的位置
    let index = match.index;
    // 计算 从最初到 index 有多少个特殊 insert
    index = this.countSpecial(index, indices.length ? indices[indices.length - 1].index : 0);
    
    // 来自于 formatText 的方法, 使其高亮, 第 0 个默认选中
    quill.formatText(index, searchKey.length, 'SearchedString', true, 'api');
    // 最后记录搜索到的坐标
    indices.push({index});
}
```

### 特殊字符问题

这里需要注意的是 `countSpecial` 方法

具体实现:

```ts
countSpecial = (index, lastIndex) => {
        const {getEditor} = this.props;
        const quill = getEditor();
        const delta = quill.getContents();
        // 获取上一个节点到当前节点的 delta
        const restDelta = delta.slice(lastIndex, index);
        const initValue = this.specialArray.length
            ? this.specialArray[this.specialArray.length - 1]
            : 0;
        const num = restDelta.reduce((num, op) => {
            if (typeof op.insert === 'object') {
                return num + 1;
            }
            return num;
        }, initValue);
        this.specialArray.push(num);
        return index + num;
    };
```

他的主要作用是用来计算编辑器中的**特殊字符**数量, 如**图片、emoji、附件**等等

这样做的原因在于, 通过 `quill` 的方法 `quill.getText();` 并不能完全返回所有的显示, 他只能返回**文本**, 而像是**图片**这样的, 他是没有实际的文本, 但是却有着真实的占位符

像这些特殊符号只能通过 `delta` 的方案来获取 **它是否存在**, 而如果全局使用 `delta` 方案的话, 他就不能完成搜索了;

#### 举个例子

比如我现在输入一句古诗 `但愿人长久，千里共婵娟。`, 其中 `长久` 两个字使用了**加粗**的格式, 他显示的 `delta` 是这样的: 

```js
[
    {insert: '但愿人'},
    {attributes: {bold: true}, insert: '长久'},
    {insert: '，千里共婵娟。\n'},
]
```

可以看到 `delta` 的文字是断裂的, 会被任意的格式所拆开;

所以现在使用的是这样一种 `text` + `delta` 组合的方案

### 搜索结束

搜索完毕之后, 格局结果的坐标一次赋予对应格式, 同时记录当前选中的第 `0` 个搜索关键词

```ts
if (indices.length) {
  this.currentIndex = indices[0].index;
  // 使得 indices[0].index 到 length 的距离的文本 添加 SearchedStringActive 格式
  quill.formatText(indices[0].index, length, 'SearchedStringActive', true, Emitter.sources.API);
  this.setState({
    currentPosition: 0,
    indices,
  });
}
```

### quill 格式

在上面搜索功能中我们使用了一个 `API`: `quill.formatText` 这里我们就来介绍一下他

在 `quill.js` 中我们可以给他添加自定义的格式, 以这个 `SearchedString` 格式为例子:

```ts
quill.formatText(index, length, 'SearchedString', true, 'api');
```
想要让他起效我们就要先创建文件 `SearchedString.ts`(_使用 js 也没问题_):

```ts
import {Quill} from 'react-quill';
const Inline = Quill.import('blots/inline');

class SearchedStringBlot extends Inline {
  static blotName: string;
  static className: string;
  static tagName: string;
}

SearchedStringBlot.blotName = 'SearchedString';
SearchedStringBlot.className = 'ql-searched-string';
SearchedStringBlot.tagName = 'div';

export default SearchedStringBlot;

```

在入口使用:

```ts
import SearchedStringBlot from './SearchedString'

Quill.register(SearchedStringBlot);
```

添加这样一个格式, 在我们搜索调用之后, 搜索到的结果就会有对应的类名了:

![](images/img_2.png)

在这里我们还需要在 CSS 中添加对应的样式即可完成高亮功能:

```less
  .ql-searched-string {
    // 这里需要保证权重, 避免查找的显示被背景色和字体颜色覆盖
    background-color: #ffaf0f !important;
    display: inline;
  }
```

### 搜索的选中

在搜索完毕之后, 默认选中的是第 0 个, 并且我们还需要赋予另一个格式: `SearchedStringActive`,
按照上述方案同样添加这个 `formats`

之后添加样式:

```less
  // 选中的规则权限需要大于 ql-searched-string 的规则, 并且要不一样的颜色和背景
  .ql-searched-string-active {
    display: inline;
    .ql-searched-string {
        background-color: #337eff !important;
        color: #fff !important;
    }
  }
```

给我们的输入框末尾添加**上一个**和**下一个**功能, 这里就直接用图标来做按钮, 中间显示当前索引和总数:

```tsx
<Input
    onChange={this.onChange}
    value={searchKey}
    suffix={
        indices.length ? (
            <span className={'search-range'}>
                <LeftOutlined onClick={this.leftClick} />
                {currentPosition + 1} / {indices.length}
                <RightOutlined onClick={this.rightClick} />
            </span>
        ) : null
    }
/>
```

#### 点击事件

在点击**下一个**图标之后, 我们只需要做四步:

1. 清除上一个索引的样式
2. 索引数加一, 并判断下一个是否存在, 如果不存在则赋值为 0
3. 获取下一个的索引, 并添加高亮
4. 检查下一个的位置是否在视窗中, 不在则滚动窗口

上述的数据获取来源都在于搜索函数中的 `indices` 数组, 它标记着每一个搜索结果的索引

和**下一个**事件相反的就是**上一个**事件了, 他的步骤和**下一个**步骤类似

#### 视窗的检查

在点击之后我们需要对当前高亮的索引位置进行判断, 依赖于 `quill` 和**原生的位置 `API`** 来做出调整: 

```ts

const scrollingContainer = quill.scrollingContainer;
const bounds = quill.getBounds(index + searchKey.length, 1);
// bounds.top + scrollingContainer.scrollTop 等于目标到最顶部的距离
if (
    bounds.top < 0 ||
    bounds.top > scrollingContainer.scrollTop + scrollingContainer.offsetHeight
) {
    scrollingContainer.scrollTop = bounds.top - scrollingContainer.offsetHeight / 3;
}
```

### 替换

在查找功能之后, 我们就需要添加替换的功能

单个的替换是非常简单的, 只需要三步: 删除原有词, 添加新词, 重新搜索:

```ts
quill.deleteText(this.currentIndex, searchKey.length, 'user');
quill.insertText(this.currentIndex, this.replaceKey, 'user');
this.search();
```

---

想要实现全部替换, 就不是循环单个替换了, 这样花费的性能较多, 甚至会产生卡顿, 对用户是否不友好

目前我使用的方案是, 倒序删除:

```ts
let length = indices.length;
        // 遍历 indices 尾部替换
while (length--) {
    // 先删除再添加
    quill.deleteText(indices[length].index, oldStringLen, 'user');
    quill.insertText(indices[length].index, newString, 'user');
}
// 结束后重新搜索
this.search();
```

## 总结


目前 `quill` 存在了两点问题:

- 不支持表格等格式, 需要升级到 `2.0dev` 版本, 但是此版本更改了很多东西
- 当前此仓库的人员称已经停止维护了, 后续的更新维护是一个大问题

本文从单个工具栏的开发, 介绍了 `quill` 富文本编辑器的部分开发流程, 整个结构是很简单的, 基本也是都用了 `quill` 的官方 `API`

当前功能只涉及到了 `format` 格式, 在下一篇文章中, 我讲继续讲述 `table` `modules` 和 `quill.js@2.x` 的开发


本文中例子的源码: [点击查看](https://github.com/Grewer/notes/tree/master/JS%20%E7%9F%A5%E8%AF%86%E7%82%B9/%E5%AF%8C%E6%96%87%E6%9C%AC/quill.js%20%E6%8F%92%E4%BB%B6%E5%BC%80%E5%8F%91%E6%8C%87%E5%8D%97/example)

## 引用
- https://juejin.cn/post/7084046542994145294

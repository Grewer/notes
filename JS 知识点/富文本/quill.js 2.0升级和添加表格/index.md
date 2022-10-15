## 前言

在富文本编辑器场景中, **表格**是一种不可忽视的功能, 但是在当前 `quill.js` 的正式版本(`1.x`)中, 却不支持此功能

所以本文承接上文 [链接](ss), 来讲述下 `quill.js` 升级到 `2.x` 的问题以及添加表格功能

## 为什么需要升级

在开源的表格库中, 常用的两个库 , 会有这样一句话

> ## Requirements  
> [quilljs](https://github.com/quilljs/quill) v2.0.0-dev.3  

表格功能的基础就是在 `2.x` 版本中的 `TABLE`, `TR`, `TD` 等标签格式

除非我们自己也写一套对应的表格, 但是这样的成本比手动升级要大多了

## 当前官方进度

![](images/img.png)

根据 [npm](https://www.npmjs.com/package/quill) 官方包的发布时间来看, `2.x` 版本处于开发的停滞阶段

所以本次我们就以当前官方版本 `1.3.7` 为基础, 再手动添加 `2.0.0-dev.4` 的代码

## 手动进行 2.0 升级

目前我们使用的是 `react-quill` 仓库, 我们要将其源码复制下来, 同时也将 `quill` 的 `2.x` 源码克隆, 将其作为依赖

详情可查看仓库: https://github.com/Grewer/react-quill2

差异点:
- CSS 样式问题
- 




## 现有表格功能调研

在 `GitHub` 上搜索关键词 `quill` + `table` 之后出现的[结果](https://github.com/search?q=quill+table):

目前 star 大于 10, 且是正常库(_非测试库, 类似于[这种](https://github.com/dost/quilljs-table)_), 最近 2-3 年有更新的, 结果只有 2 个, 最后我们对这 2 个库来进行调研

1. https://github.com/volser/quill-table-ui
2. https://github.com/soccerloway/quill-better-table

这两个库都是有自己对应的 demo, 可以点击查看:

1. [quill-table-ui](https://codepen.io/volser/pen/QWWpOpr)
2. [quill-better-table](https://codepen.io/soccerloway/pen/WWJowj)

目前看这两个仓库基本都能实现较好的表格方案

本文选择了 `quill-table-ui` 作为接入方案, 大伙如果喜欢 `quill-better-table` 也可以考虑自己来了接入




## 添加表格功能

## 结语

## 引用
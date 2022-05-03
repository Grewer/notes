## CSS 自定义属性

## 前言
在现代浏览器中, 我们会经常看到这样的属性:
```css
element {
  --main-bg-color: brown;
}
```
这里我们就来介绍一下他, 并提供一些相关的说明

## 简介

> 自定义属性（有时候也被称作CSS变量或者级联变量）是由CSS作者定义的，它包含的值可以在整个文档中重复使用。由自定义属性标记设定值（比如： --main-color: black;），由var() 函数来获取值（比如： color: var(--main-color);）


## 声明

声明一个自定义属性，属性名需要以两个减号（--）开始，属性值则可以是任何有效的CSS值。
如前言中的 `--main-bg-color` 属性

**通常**的最佳实践是定义在根伪类 `:root` 下，这样就可以在HTML文档的任何地方访问到它了：

```css
:root {
  --main-bg-color: brown;
}
```


## 引用

- https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties

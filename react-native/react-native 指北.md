## 前言

本文主要介绍 react-native(下称 RN) 的入门, 和前端的异同点以及学会他有什么好处

## 跨端框架横向对比

RN 和 Flutter 的简单对比

### 环境
无论是 RN 还是 Flutter ，都需要 Android 和 IOS 的开发环境，也就是 JDK 、Android SDK、Xcode 等环境配置，而不同点在于:

- RN 需要 npm 、node 、react-native-cli 等配置 。
- Flutter 需要 flutter sdk 和 Android Studio / VSCode 上的 Dart 与 Flutter 插件。

针对前端来说 RN 环境相对友好一点

### 实现原理

在 *Android* 和 *IOS* 上，默认情况下 **Flutter** 和 **React Native** 都**需要一个原生平台的
`Activity` / `ViewController` 支持，且在原生层面属于一个“单页面应用”，** 而它们之间最大的不同点其实在于 UI 构建 ：

- RN: 

**React Native** 是一套 UI 框架，默认情况下 **React Native** 会在 `Activity` 下加载 JS 文件，然后运行在 `JavaScriptCore` 中解析 *Bundle* 文件布局，最终堆叠出一系列的原生控件进行渲染。

简单来说就是 **通过写 JS 代码配置页面布局，然后 React Native 最终会解析渲染成原生控件**，如 `<View>` 标签对应 `ViewGroup/UIView` ，`<ScrollView>` 标签对应 `ScrollView/UIScrollView` ，`<Image>` 标签对应 `ImageView/UIImageView` 等。

![img.png](./images/img.png)

- Flutter ：

**Flutter** 中绝大部分的 `Widget` 都与平台无关， 开发者基于 `Framework` 开发 App ，而 `Framework` 运行在 `Engine` 之上，由 `Engine` 进行适配和跨平台支持。这个跨平台的支持过程，其实就是将 **Flutter UI 中的 `Widget` “数据化” ，然后通过 `Engine` 上的 `Skia` 直接绘制到屏幕上 。**

**类似于前端的 canvas 绘图**

![img2.png](./images/img2.png)

_此节来自于文章: https://www.jianshu.com/p/da80214720eb_

### 缺点

- RN:
  * 不能完全兼容W3C的规范，比如W3C里面，可以轻易设置圆角的大小，粗细，边框是实现和虚线，但是在客户端，这个实现起来都比较难。所以这类技术都只能有限的支持W3C的标准。
  * js运行性能瓶颈。
  * 数据通信的性能瓶颈。
- Flutter:
  * 无法动态更新。
  * 内存和包大小占用。
  * 学习成本高，生态不足。

## js 运行环境

## 原生模块

## 原生 ui 组件

## 原生组件和 js 组件的通信

## 手势方案

## 路由管理

## APP 更新以及热更新

## debug 方案

## 针对物理键的操作

## 暗黑模式

## 沉浸式状态栏

## 文件管理

## 版本变化

0.59-0.60

0.68 https://juejin.cn/post/7063738658913779743

## 引用
- https://www.jianshu.com/p/da80214720eb
- https://blog.csdn.net/tyuiof/article/details/105595253
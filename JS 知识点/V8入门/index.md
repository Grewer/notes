## V8 入门记录之初识

本文就 V8 入门，做一个记录

## 关于 V8

我想前端从业人员或多或少会听说过这个词，但是他具体是什么， 怎么入门， 怎么学习是一个较高的门槛

> V8 是 Google 用 C++ 编写的开源高性能 JavaScript 和 WebAssembly 引擎。它被用于 Chrome 浏览器和 Node.js 等。它实现了 ECMAScript 和 WebAssembly，可在 Windows 7 或更高版本、macOS 10.12+ 和使用 x64、IA-32、ARM 或 MIPS 处理器的 Linux 系统上运行。V8 可独立运行，也可嵌入到任何 C++ 应用程序中。

### js 引擎

![img.png](images%2Fimg.png)

JavaScript本质上是一种解释型语言，与编译型语言不同的是它需要一遍执行一边解析，而编译型语言在执行时已经完成编译，可直接执行，有更快的执行速度(如上图所示)。

为了提高性能，引入了Java虚拟机和C++编译器中的众多技术。现在JavaScript引擎的执行过程大致是：

源代码-→抽象语法树-→字节码-→JIT-→本地代码

V8更加直接的将抽象语法树通过JIT技术转换成本地代码，放弃了在字节码阶段可以进行的一些性能优化，但保证了执行速度。在V8生成本地代码后，也会通过Profiler采集一些信息，来优化本地代码。

这便是现在的执行过程：
源代码-→抽象语法树-→JIT-→本地代码

### V8引擎编译




<!-- 
V8在执行之前将JavaScript编译成了机器代码，而非字节码或是解释执行它，以此提升性能。更进一步，使用了如内联缓存（inline caching）等方法来提高性能。有了这些功能，JavaScript程序与V8引擎的速度媲美二进制编译。

传统的Javascript是动态语言，又可称之为Prototype-based Language，JavaScript继承方法是使用prototype，透过指定prototype属性，便可以指定要继承的目标。属性可以在运行时添加到或从对象中删除，引擎会为执行中的物件建立一个属性字典，新的属性都要透过字典查找属性在内存中的位置。V8为object新增属性的时候，就以上次的hidden class为父类别，创建新属性的hidden class的子类别，如此一来属性访问不再需要动态字典查找了。

为了缩短由垃圾回收造成的停顿，V8使用stop-the-world, generational, accurate的垃圾回收器。在执行回收之时会暂时中断程序的执行，而且只处理物件堆栈。还会收集内存内所有物件的指针，可以避免内存溢出的情况。V8汇编器是基于Strongtalk汇编器。 -->

// TODO

## 环境搭建

### 我的环境

系统： Mac Monterey 12.6.8
Xcode: 14.2
Python: 




### 


## 引用

- https://v8.dev/
- https://v8.js.cn/
- https://www.jianshu.com/p/47afd0ac17fd

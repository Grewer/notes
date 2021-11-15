## MAP

> Map 对象保存键值对，并且能够**记住键的原始插入顺序**。**任何值(对象或者原始值)** 都可以作为一个键或一个值。

### 键的相等(Key equality)

- 键的比较是基于 `[sameValueZero](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Equality_comparisons_and_sameness#%E9%9B%B6%E5%80%BC%E7%9B%B8%E7%AD%89)` 算法：
- NaN 是与 NaN 相等的（虽然 NaN !== NaN），剩下所有其它的值是根据 === 运算符的结果判断是否相等。
- 在目前的ECMAScript规范中，-0和+0被认为是相等的，尽管这在早期的草案中并不是这样。

### Objects 和 maps 的比较



## SET



## 引用
- https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map

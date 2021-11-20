## Map

> Map 对象保存键值对，并且能够**记住键的原始插入顺序**。**任何值(对象或者原始值)** 都可以作为一个键或一个值。

### 键的相等(Key equality)

- 键的比较是基于 `[sameValueZero](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Equality_comparisons_and_sameness#%E9%9B%B6%E5%80%BC%E7%9B%B8%E7%AD%89)` 算法：
- NaN 是与 NaN 相等的（虽然 NaN !== NaN），剩下所有其它的值是根据 === 运算符的结果判断是否相等。
- 在目前的ECMAScript规范中，-0和+0被认为是相等的，尽管这在早期的草案中并不是这样。

### Objects 和 maps 的比较


|   |  Map |  Object |
|---|---|---|
| 意外的键 | `Map` 默认情况不包含任何键。只包含显式插入的键。 |一个 `Object` 有一个原型, 原型链上的键名有可能和你自己在对象上的设置的键名产生冲突。**注意:** 虽然 ES5 开始可以用 `Object.create(null)` 来创建一个没有原型的对象，但是这种用法不太常见。|
| 键的类型 | 一个 `Map`的键可以是**任意值**，包括函数、对象或任意基本类型。 | 一个`Object` 的键必须是一个 `String` 或是 `Symbol` |
| 键的顺序 |`Map` 中的 key 是有序的。因此，当迭代的时候，一个 `Map` 对象以插入的顺序返回键值。|一个 `Object` 的键是无序的注意：自ECMAScript 2015规范以来，对象*确实*保留了字符串和Symbol键的创建顺序； 因此，在只有字符串键的对象上进行迭代将按插入顺序产生键。|
| Size |  `Map` 的键值对个数可以轻易地通过 `size` 属性获取 | `Object` 的键值对个数只能手动计算 |
| 迭代 | `Map` 是 [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) 的，所以可以直接被迭代。 | 迭代一个`Object`需要以某种方式获取它的键然后才能迭代。 |
| 性能 |在频繁增删键值对的场景下表现更好。|在频繁添加和删除键值对的场景下未作出优化。|

### 将 NaN 作为 Map 的键

NaN 也可以作为Map对象的键。虽然 NaN 和任何值甚至和自己都不相等(NaN !== NaN 返回true)，但下面的例子表明，NaN作为Map的键来说是没有区别的:

```js
let myMap = new Map();
myMap.set(NaN, "not a number");

myMap.get(NaN); // "not a number"

let otherNaN = Number("foo");
myMap.get(otherNaN); // "not a number"
```

### 迭代

- for...of
- forEach

### array

```js
let kvArray = [["key1", "value1"], ["key2", "value2"]];

// 使用常规的Map构造函数可以将一个二维键值对数组转换成一个Map对象
let myMap = new Map(kvArray);

myMap.get("key1"); // 返回值为 "value1"

// 使用Array.from函数可以将一个Map对象转换成一个二维键值对数组
console.log(Array.from(myMap)); // 输出和kvArray相同的数组

// 更简洁的方法来做如上同样的事情，使用展开运算符
console.log([...myMap]);

// 或者在键或者值的迭代器上使用Array.from，进而得到只含有键或者值的数组
console.log(Array.from(myMap.keys())); // 输出 ["key1", "key2"]
```


### 复制或合并 Maps

```js
let original = new Map([
  [1, 'one']
]);

let clone = new Map(original);

console.log(clone.get(1)); // one
console.log(original === clone); // false. 浅比较 不为同一个对象的引用
```

Map对象间可以进行合并，但是会保持键的唯一性。

```js
let first = new Map([
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
]);

let second = new Map([
  [1, 'uno'],
  [2, 'dos']
]);

// 合并两个Map对象时，如果有重复的键值，则后面的会覆盖前面的。
// 展开运算符本质上是将Map对象转换成数组。
let merged = new Map([...first, ...second]);

console.log(merged.get(1)); // uno
console.log(merged.get(2)); // dos
console.log(merged.get(3)); // three
```

## WeakMap


## Set

> Set对象是值的集合，你可以按照插入的顺序迭代它的元素。 Set中的元素只会出现一次，即 Set 中的元素是唯一的。

### 值的相等
和 Map 相同

### array

```js
let myArray = ["value1", "value2", "value3"];

// 用Set构造器将Array转换为Set
let mySet = new Set(myArray);

mySet.has("value1"); // returns true

// 用...(展开操作符)操作符将Set转换为Array
console.log([...mySet]); // 与myArray完全一致
Copy to Clipboard

```

### 迭代

- for...of
- forEach

### 数组去重

```js
// Use to remove duplicate elements from the array
const numbers = [2,3,4,4,2,3,3,4,4,5,5,6,6,7,5,32,3,4,5]
console.log([...new Set(numbers)])
// [2, 3, 4, 5, 6, 7, 32]
```

### string

```js
let text = 'India';

let mySet = new Set(text);  // Set {'I', 'n', 'd', 'i', 'a'}
mySet.size;  // 5

// 大小写敏感 & duplicate ommision
new Set("Firefox")  // Set(7) [ "F", "i", "r", "e", "f", "o", "x" ]
new Set("firefox")  // Set(6) [ "f", "i", "r", "e", "o", "x" ]
```


## WeakSet

## 引用
- https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map
- https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set

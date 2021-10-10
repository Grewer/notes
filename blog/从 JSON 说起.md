## 标准 JSON 格式

## js 中的 JSON

>  JavaScript Object Notation (JSON) 是一种数据交换格式。尽管不是严格意义上的子集，JSON 非常接近  JavaScript 语法的子集。

### js 转换 JSON

json 更接近是 js 支持的原生语法, 所以他也内置了解析 API:

#### JSON.stringify

> 此方法将一个 JavaScript 对象或值转换为 JSON 字符串，如果指定了一个 replacer 函数，则可以选择性地替换值，或者指定的 replacer 是数组，则可选择性地仅包含数组指定的属性。

第二个参数常用来删除,替换:

```js
function replacer(key, value) {
  if (typeof value === "string") {
    return undefined;
  }
  return value;
}

var foo = {foundation: "Mozilla", model: "box", week: 45, transport: "car", month: 7};
var jsonString = JSON.stringify(foo, replacer);
// {"week":45,"month":7}  打印结果  类似于 去除了value 是字符串的类型
```
如果第二个参数是一个数组:

```js
var foo = {foundation: "Mozilla", model: "box", week: 45, transport: "car", month: 7};

JSON.stringify(foo, ['week', 'month']);
// '{"week":45,"month":7}' 他将值保留这两数组对应的结果
```


第三个参数常用来格式化 json:

```js
JSON.stringify({ a: 2 }, null, " ");
// 打印结果: '{\n "a": 2\n}'

// 或者这样:
JSON.stringify({ a: 2 }, null, 2);
```

#### JSON.parse

> 方法用来解析JSON字符串，构造由字符串描述的JavaScript值或对象。提供可选的 reviver 函数用以在返回之前对所得到的对象执行变换(操作)。

```js
const json = '{"result":true, "count":42}';
const obj = JSON.parse(json);
```

`JSON.parse` 解析经常会报错, 所以我们也需要 `try...catch` 来包裹它

需要注意的是:  **`JSON.parse()` 不允许用逗号作为结尾**
如: `JSON.parse('{"foo" : 1, }');`


#### 另外的方案

在 JS 中想要解析成 json 对象, 还可以使用另一种 hack 的方案:

```js
var a = '{"foo" : 1, }'
eval(`(${a})`)
//  {foo: 1}
```
可以看到它的转换是十分宽松的, 甚至他还支持, 但引号和无引号

其实他利用的就是 js 的解析能力, 但是 使用 eval 同样也会存在隐患(主要是在性能, 安全性上问题很大)

### 相关 JSON 库

这边就将一些 json 相关的, 可能会使用到的库介绍下


[json5](https://www.npmjs.com/package/json5)

json5 规范, 比普通的 json 支持得更多, 兼容性更好, 可以说是他的超集



[JSON-js](https://github.com/douglascrockford/JSON-js)  
用来兼容 ie8, 类似于官方提供的 JSON API mock, 现在应该不常用到



[parse-json](https://github.com/sindresorhus/parse-json)  
解析 json 的时候, 会提供更有用的错误, 这个库在搭建基础环境的时候更有作用

在某些业务场景下(自定义字段, 自定义表单等等)也能发挥巨大作用


[strip-json-comments](https://www.npmjs.com/package/strip-json-comments)  

允许在 json 中使用注释, 在解析时删除, 在配置文件, 或者基础库中可以作为使用


[JSONStream](https://www.npmjs.com/package/JSONStream)  
一个解析库, 可以根据一些配置来解析 json


#### node 中操作 JSON

在 node 中因为要操作文件, 并且又要转换 json, 所以搞得很麻烦, 这里我会使用这个库:

[jsonfile](https://www.npmjs.com/package/jsonfile)

在读取配置文件的时候也是异常好用


## 其他格式

既然聊到了 json,我们也需要了解下其他格式, 以及他的优缺点

### BSON

>  JSON 是把对象序列化为字符串，BSON 是把对象序列化为二进制。
> 因为是用二进制的方式来序列化，所以无论是在时间（序列化、反序列化的速度）还是空间（序列化之后的体积）上都优于 JSON，缺点就是二进制没什么可读性可言。
> 
> 他的支持的数据格式同样也多

```json
{"BSON": ["awesome", 5.05, 1986]}
```
将会转换为:

```bson
 \x31\x00\x00\x00
 \x04BSON\x00
 \x26\x00\x00\x00
 \x02\x30\x00\x08\x00\x00\x00awesome\x00
 \x01\x31\x00\x33\x33\x33\x33\x33\x33\x14\x40
 \x10\x32\x00\xc2\x07\x00\x00
 \x00
 \x00
```


[官网](https://bsonspec.org/)

### CSV
其文件以纯文本形式存储表格数据（数字和文本）。纯文本意味着该文件是一个字符序列，不含必须像二进制数字那样被解读的数据。CSV文件由任意数目的记录组成，记录间以某种换行符分隔；

```csv
Passenger,Id,Survived,Pclass,Name,Sex.Age
1,0,3 Braund, Mr. Owen Harris ,male, 22
2,1,1 Cumings, Mrs. John Bradley (Florence Briggs Thayer), female,38
```
看起来像是简洁版的 table 格式

[papaparse](https://www.npmjs.com/package/papaparse): 这个库是可以使用 js 来解析 csv 格式的

### YAML
拥有几乎所有 web 编程语言都可用的解析器。它还有一些额外的功能，如循环引用、软包装、多行键、类型转换标签、二进制数据、对象合并和集合映射。它具有非常好的可读性和可写性，并且是 JSON 的超集，因此你可以在 YAML 中使用完全合格的 JSON 语法并且一切正常工作。你几乎不需要引号，它可以解释大多数基本数据类型（字符串、整数、浮点数、布尔值等）。
```yaml
books:
  - id: bk102
  author: Crockford, Douglas
  title: 'JavaScript: The Good Parts'
  genre: Computer
```

在 js 中解析 YAML:
- [yaml](https://www.npmjs.com/package/yaml)
- [js-yaml](https://www.npmjs.com/package/js-yaml)

### XML
XML 语言非常灵活且易于编写，但它的缺点是冗长，人类难以阅读、计算机非常难以读取，并且有很多语法对于传达信息并不是完全必要的。
```xml
<book id="bk101">
<author>Gambardella, Matthew</author>
<title>XML Developer's Guide</title>
<genre>Computer</genre>
```

解析库: [htmlparser2](https://www.npmjs.com/package/htmlparser2)

### TOML
允许以相当快捷、简洁的方式定义深层嵌套的数据结构。与 JSON 相比，语法有点尴尬，更类似 ini 文件。这不是一个糟糕的语法，但是需要一些时间适应。
```toml
[a.b.c]
d = 'Hello'
e = 'World'
```
使用 TOML，你可以肯定在时间和文件长度上会节省不少。很少有系统使用它或非常类似的东西作为配置，这是它最大的缺点。根本没有很多语言或库可以用来解释 TOML。

[toml](https://www.npmjs.com/package/toml) 目前来看暂时只支持 node


## 总结

目前看起来 json 是一种不错的交换,传递信息的格式, 有挺多缺点(当然他也能被某些库解决)

但是个人来说YAML, 是一个更加热门, 有未来发展空间的格式, 希望大家有空也学习一下


参考文档:
- https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
- https://zhuanlan.zhihu.com/p/60747338
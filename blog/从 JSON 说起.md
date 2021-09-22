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

https://github.com/douglascrockford/JSON-js
兼容 ie8, 类似于官方提供的 JSON API mock


parse-json
解析 json 的时候, 会提供更有用的错误
https://github.com/sindresorhus/parse-json


strip-json-comments 
允许在 json 中使用注释, 在解析时删除
https://www.npmjs.com/package/strip-json-comments

JSONStream
JSON 解析库
https://www.npmjs.com/package/JSONStream


#### node 中操作 JSON
https://www.npmjs.com/package/jsonfile


## 其他格式

CSV
https://www.npmjs.com/package/papaparse

YAML

XML

TOML


参考文档:
- https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
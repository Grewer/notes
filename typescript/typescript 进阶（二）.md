
本文主要针对实际工作中的场景，来介绍 ts 的使用

## 复用函数的类型

在定义好一个函数之后， 如

```ts
function foo(params: {id: number; name: string}): {count:number;}[]{
	// 省略...
	return [{count:1}];
}

```

在 ts 高阶函数的作用下，可以直接获取函数的参数和返回值类型

```ts
type IFooRet = ReturnType<typeof foo>
// type IFooRet = {  
//   count: number;  
// }[]
	
type IFooParam = Parameters<typeof foo>
//	type IFooParam = [params: {  
// 		id: number;  
// 		name: string;  
// 	}]

```

## 接口请求

在我们常用的一种接口请求的场景中, 也需要覆盖 ts 的类型:

```ts
// 如果使用的是 axios

import Ax from './axios';

interface ResponseData<T = any> {
    // 比较常用的一种接口返回形式
    code: number;
    result: T;
    message: string;
}

// 在这里我们有多重方案, 可以使用泛型, 在使用的时候传入值, 因为接口返回可能会有点变动

export function getUser<T>() {
    return Ax.get<ResponseData<T>>('/user/get')
        .then(res => res.data)
        .catch(err => console.error(err));
}

interface User {
    name: string;
    age: number;
}

async function test() {
    // user 被推断出为
    // {
    //  code: number,
    //  result: { name: string, age: number },
    //  message: string
    // }
    const user = await getUser<User>();
}

// 二是直接在这里就定义好
export function getUser() {
    return Ax.get<ResponseData<User>>('/user/get');
}
```

## 函数重载的问题

在使用重载时，需要注意顺序的问题：

```ts
declare function fn(x: unknown): unknown;

declare function fn(x: HTMLElement): number;

declare function fn(x: HTMLDivElement): string;

var myElem: HTMLDivElement;

var x = fn(myElem); // x: unknown
```

在 ts 中，他的类型显示是这样的
`function fn(x: unknown): unknown (+2 overloads)`
当较早的重载比后面的重载“更通用”时，后一个重载实际上被隐藏并且无法被调用

正确使用：

```ts
declare function fn(x: HTMLDivElement): string;

declare function fn(x: HTMLElement): number;

declare function fn(x: unknown): unknown;

var myElem: HTMLDivElement;

var x = fn(myElem); // x: string
```



详见：
https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html


### 简单组合

简单的组合, 一个名字, 多种含义.

```ts
// 文件 A
export var Bar: { a: Bar };
export interface Bar {
  count: number;
}

// 文件 B
import { Bar } from "./foo";
let x: Bar = Bar.a;
console.log(x.count);
// 此时 x 即使用了 Bar 的声明, 也使用了 Bar 的初始值
```

### 高级组合

有些种类的声明可以在多个声明中组合。例如 `classC { }` 和 `interface C { }` 可以同时存在，并且都为C类型贡献属性。

```ts
interface Foo {
  x: number;
}
interface Foo {
  y: number;
}
let a: Foo = {}; // 省略
console.log(a.x + a.y);
// 常用的用法 类似函数重载
```

在 class 中也可以这样:

```ts
class Foo {
  x: number;
}
interface Foo {
  y: number;
}
let a: Foo = {};
console.log(a.x + a.y);
```

#### 命名空间组合

```ts
class C {}
namespace C {
  export let x: number;
}
let y = C.x; // OK

// or
class C {}
namespace C {
    export interface D {}
}
let y: C.D; // OK
```

通过此方案可扩展三方库

## 在 JS 中使用类型校验

众所周知，在 JS 中使用 jsdoc 也可被 ts 识别到类型， 并且有他的提示

```js
/** @type {number} */
var x;

x = 0; // OK
x = true // 但是也不会报错
```

如果在文件的顶部加上说明：

`@ts-check`

```js

// @ts-check

/** @type {number} */
var x;

x = 0; // OK
x = false; // Not OK
```

这样在编译时也会有 ts 的报错提醒，在 js 与 ts 共存的项目，或者 js 正在转 ts 项目中较为适用
## 类型仓库

在 npm 中有很多支持类型的库， 这里我推荐 [type-fest](https://github.com/sindresorhus/type-fest) 类似的还有很多，按情况使用



这是合并两个类型使用的

```ts
import type {Merge} from 'type-fest';

interface Foo {
	[x: string]: unknown;
	[x: number]: unknown;
	foo: string;
	bar: symbol;
}

type Bar = {
	[x: number]: number;
	[x: symbol]: unknown;
	bar: Date;
	baz: boolean;
};

export type FooBar = Merge<Foo, Bar>;
// => {
// 	[x: string]: unknown;
// 	[x: number]: number;
// 	[x: symbol]: unknown;
// 	foo: string;
// 	bar: Date;
// 	baz: boolean;
// }
```


这是控制至少有一个需要填写的参数

```ts
import type {RequireAtLeastOne} from 'type-fest';

type Responder = {
	text?: () => string;
	json?: () => string;
	secure?: boolean;
};

const responder: RequireAtLeastOne<Responder, 'text' | 'json'> = {
	json: () => '{"message": "ok"}',
	secure: true
};
```

## 类型体操 挑战

在自己把握对于 ts 有足够认知之后，这里介绍下 [type-challenges](https://github.com/type-challenges/type-challenges)

>本项目意在于让你更好的了解 TS 的类型系统，编写你自己的类型工具，或者只是单纯的享受挑战的乐趣！我们同时希望可以建立一个社区，在这里你可以提出你在实际环境中遇到的问题，或者帮助他人解答疑惑 - 这些问题也可能被选中成为题库的一部分！


对于此感兴趣可以参与下， 论实用性的话，个人体感是在生产开发中，出现的概率微乎其微，最多使用类型库即可兼容


引用:

- https://jkchao.github.io/typescript-book-chinese/#why
- https://www.typescriptlang.org/docs/
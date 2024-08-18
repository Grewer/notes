
本文主要针对实际工作中的场景，来介绍 ts 的使用

## 复用函数的类型

在定义好一个函数之后， 如

```ts
function(params: {id: number; name: string}): {count:number;}[]{
	// 省略...
	return [{count:1}];
}

```

在 ts 高阶函数的作用下，可以直接获取函数的参数和返回值类型



## 接口请求
// ReturnType
// Parameters

https://jkchao.github.io/typescript-book-chinese/typings/generices.html#%E9%85%8D%E5%90%88-axios-%E4%BD%BF%E7%94%A8

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
    return Ax.get<ResponseData<User>>('/user/get')
        .then(res => res.data)
        .catch(err => console.error(err));
}
```




## 导入类型

```ts
const data: import('./data').data
```

## 函数重载的问题:

https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html


## 三方库类型

https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-plugin-d-ts.html


## 组合

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

## 类型仓库

type-fest 类似

## 类型体操 挑战

github 的类型挑战




TODO 


any是基本类型，使用any时ts不会做类型检查，any也经常被用于官方类型中（例如：上面例子中的response.json()类型被TypeScript团队定义为Promise<any>类型）
ts不会对any类型做类型检查，任何对any类型值的变更也不会被检查，这时候定位问题变得很困难（就和js 运行一样），只有当运行时的赋值和预期的一致的时候才不会出错。

https://segmentfault.com/a/1190000042227498
TypeScript鸭子类型（duck-typing） http://www.srcmini.com/3478.html

引用:

- https://jkchao.github.io/typescript-book-chinese/#why
- https://www.typescriptlang.org/docs/
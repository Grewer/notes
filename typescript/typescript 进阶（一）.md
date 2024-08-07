## 前言

本文主要记录个人在使用 typescript 时的一些用法，介绍 typescript 。建议在阅读前先了解 typescript 的基础语法。

### 互斥键的类型

在 ts 官网的联合类型文档中有这样一种情况:

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; x: number }
  | { kind: "triangle"; x: number; y: number };
 
function area(s: Shape) {
  if (s.kind === "circle") {
    return Math.PI * s.radius * s.radius;
  } else if (s.kind === "square") {
    return s.x * s.x;
  } else {
    return (s.x * s.y) / 2;
  }
}
```

在此种情况下 ts 可以正常判断这两种类型的联合, 但是我们这样判断:

```ts
function area(s: Shape) {
  if (s.radius) { // if 中判断修改
    return Math.PI * s.radius * s.radius;
  } else if (s.kind === "square") {
    return s.x * s.x;
  } else {
    return (s.x * s.y) / 2;
  }
}
```
[点此在线查看](https://www.typescriptlang.org/play?#code/C4TwDgpgBAygFgQ0lAvAKClAPlA3lAawEsA7AEwC4oAiAYyICdaAbCagbigYTKIFcAzlRJ8AtgCMIDKAF8M2PIVKUaAgI58EDNpwAewsZOlzMOfMXJVqwBkQQkA5qw5R9UERKmcQBz8fYYaABmfCS0wEQA9iRQWhAIABRCsIiQAJR48kRBUEkAdNy8ghn4APSlUNlQgLRygCRKgLWmgHfygJym8pjawHwMMQCyCMBweQAKAJJQAFRQAgU8-AITUzNFAgGYMlAQzALQVfkWZKgoKKoacdQlbVwQnd2LugvTuquyG1vQuJcdXTH595PTIAyFQATM85DIgA)

或者是这样, 没有 type 的情况:

```ts
type Shape =
  | { radius: number, cal: ()=>number}
  | { x: number }


function area(s: Shape) {
    if(s.cal){
        return s.cal()
    }else{
        return s.x * s.x;
    }
}
```
[点此在线查看](https://www.typescriptlang.org/play?#code/C4TwDgpgBAygFgQ0lAvAKClAPlA3lAJwQBMBLAVwGcAuKAO3IFsAjCAgGigGMEAbWgBQBKFAD4GLNgF8M2PFAAetCawJQZaNADNydLsFIB7OlAQEICATViJIQvLMyktVgHQ9eQ3I8y-zwcgITSnc+YR8pCF5KCG9feMIIAKCoEIUoACpU1wUAbgi0KSA)

这里就会报如下的错误:

```
Property 'cal' does not exist on type 'Shape'.
  Property 'cal' does not exist on type '{ x: number; }'.
```

ts 在联合类型中, 我们直接通过 `.` 获取的属性, 是必须在所有子类型中共有的

这里我们有 2 种结局方案

1. 使用 `in` 操作符

```ts
type Shape =
    | { radius: number, cal: ()=>number}
    | { x: number }


function area(s: Shape) {
    if ('cal' in s) {
        return s.cal()
    } else {
        return s.x * s.x;
    }
}
```
[点此在线查看](https://www.typescriptlang.org/play?ssl=12&ssc=2&pln=1&pc=1#code/C4TwDgpgBAygFgQ0lAvAKClAPlA3lAJwQBMBLAVwGcAuKAO3IFsAjCAgGigGMEAbWgBQBKFAD4GLNgF8M2PFAAetCawJQZaNADNydLsFIB7OlAQEICATViJIQvLMyktUAQHIevN1FInK93EdMYPNgcgI-ADpPYSCpKAheSmhA4LTCCDCIqEpIhSgAKhy8gG44tCkgA)

2. 使用特殊的类型库来包装


## 函数类型

有时候函数我们也会当做对象来使用:

```ts
interface IFN {
    (): number;
    name: string
}

const a: IFN = () => {
    //...
    return 1
}

a.name = 'test'
```

同样地, 会有一些特殊的函数, 如 `Date`, 他有多套不同的函数:

```ts
new Date(1656953943886)
// Tue Jul 05 2022 00:59:03 GMT+0800 (中国标准时间)
// Date 对象

new Date('2022-12-1')
// Thu Dec 01 2022 00:00:00 GMT+0800 (中国标准时间)
// 也是 Date 对象

// ...
```

在 ts 的声明中他是这样被描述的

```ts
interface DateConstructor {
    new(): Date;
    new(value: number | string): Date;
    new(year: number, month: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): Date;
    (): string;
    readonly prototype: Date;
    parse(s: string): number;
    UTC(year: number, month: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): number;
    now(): number;
}

```


## 字面量类型

```ts
// @errors: 2345
declare function handleRequest(url: string, method: "GET" | "POST"): void;
// ---cut---
const req = { url: "https://example.com", method: "GET" };
handleRequest(req.url, req.method);
```
[点此在线查看](https://www.typescriptlang.org/play?#code/PTAEAEFMCdoe2gZwFygEwGYAsBWAsAFAAmkAxgDYCG0koAZgK4B2pALgJZxOgAWlTRcpABKkAI4NIiVgAoG0cqmnR2TAOYAaUAFtIrHnCKoARAHEAogBVjoAD6hjABQDyAZWsBKVADc47IgDchCCgALThpAys4aGEpFzSoDRioAC8oADeoPKKDjysrAAOKCCQAB6U2oVCAHTx2sZauvqGJhbWoAC+QQR8AkKiElKyyTU5WqPNBkQeAUA)

### 解决方案

1. 使用泛型:

```ts
// Change 1:
const req = { url: "https://example.com", method: "GET" as "GET" };
// Change 2
handleRequest(req.url, req.method as "GET");
```

2. `as const`

```ts
const req = { url: "https://example.com", method: "GET" } as const;
handleRequest(req.url, req.method);
```

此例子在官网文档中也有提到: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html

## 对象


### 重新映射

通过对象 as 重新映射出类型:

```ts
type Getters<Type> = {
    [Property in keyof Type as `get${Capitalize<string & Property>}`]: () => Type[Property]
};
 
interface Person {
    name: string;
    age: number;
    location: string;
}
 
type LazyPerson = Getters<Person>;

// type LazyPerson = {
//  getName: () => string;
//  getAge: () => number;
//  getLocation: () => string;
// }
```

[点此在线查看](https://www.typescriptlang.org/play?ssl=2&ssc=38&pln=2&pc=48#code/C4TwDgpgBA4hzAgJwM4B4Aq4ID4oF4oBvAKCnKgG0AFJAe0iVCgEsA7KAawhDoDMoWSFACGKKAAMA5vAAkRAMIiwLYCIA2LAF4Q0KYEnZSoAMii0GyUDgC+EgLoAuKAAoAlATxCINeo1D2JDYA3CQk7IhIfCIAxtDUyCh0HKQUUGwiALYQzvqGbFKhaSIyzmwArpkARshFFOp0MSLALMm5BkahNmGgwgAyIlogCajJBLDwkegjSWw4oQD0CxQAegD8QA)

### 映射中添加条件判断:

```ts
type ExtractPII<Type> = {
  [Property in keyof Type]: Type[Property] extends { pii: true } ? true : false;
};
 
type DBFields = {
  id: { format: "incrementing" };
  name: { type: string; pii: true };
};
 
type ObjectsNeedingGDPRDeletion = ExtractPII<DBFields>;

// type ObjectsNeedingGDPRDeletion = {
//     id: false;
//     name: true;
// }
```

[点此在线查看](https://www.typescriptlang.org/play#code/C4TwDgpgBAogHsATgQwMbAAoEksB4Aq4EAfFALxQDeAUFFANoaID2kioUAlgHZQDWEEMwBmUQpAC6ALjFFGLNqAlQICCNwAmAZypQwnTjKQBXaAF8oAfignoM4cgA2WiAG5qZ99VCQoAEQAhADFOCEdtcipaLg0ZSihhZkQAW2RgGQAiHlRECGT1YB4AcwyoT2juZHy4myIZLSRi1z0DI0RTMvdy7yIoAHkAIwArCHQtADkICA1igHE-DAAlPzCIQuZeCngkNEwcXECQsO1idwB6M7ooAD1LIA)

## 枚举

### 静态枚举

```ts
const enum ITypeEnums {
    Input ,
    Select
}

// 普通枚举:
 
enum ITypeEnums {
    Input ,
    Select
}
```

经过编译后:

```ts
var ITypeEnums2;
(function (ITypeEnums2) {
    ITypeEnums2[ITypeEnums2["Input"] = 0] = "Input";
    ITypeEnums2[ITypeEnums2["Select"] = 1] = "Select";
})(ITypeEnums2 || (ITypeEnums2 = {}));
```

很明显的是静态枚举消失了

这是 ts 为了避免在访问枚举值时额外的生成代码的代价

### 静态枚举的编译

```ts
const enum ITypeEnums {
    Input ,
    Select
}

let types = [
  ITypeEnums.Input,
  ITypeEnums.Select
];

const type: ITypeEnums.Input = 1
```

```ts
let types = [
    0 /* ITypeEnums.Input */,
    1 /* ITypeEnums.Select */
];
const type = 1;
```

### 枚举的选择

什么情况下选择枚举, 而什么情况下会选择对象

在一般情况下, 我们使用静态对象就够了:

```ts
const enum EDirection {
  Up,
  Down,
  Left,
  Right,
}
 
const ODirection = {
  Up: 0,
  Down: 1,
  Left: 2,
  Right: 3,
} as const

let a = ODirection.Up
// 提示 Up: 0
```


对状态进行多种判断时, 我们用到枚举的情况会更多(尤其是静态枚举)

```ts

const enum EDirection {
    Up,
    Down,
    Left,
    Right,
}

const getStatus = (status: EDirection) => {
    switch(status){
        case EDirection.Up:
            return 'success'
        case EDirection.Down:
            return 'fail'
        default:
            return null
    }
}
```

编译之后的结果:

```ts
const getStatus = (status) => {
    switch (status) {
        case 0 /* EDirection.Up */:
            return 'success';
        case 1 /* EDirection.Down */:
            return 'fail';
        default:
            return null;
    }
};
```

[点击在线查看](https://www.typescriptlang.org/play?#code/FAYw9gdgzgLgBAUwgVwLZwKIBECWAnBEGHSOAb2DjgFUAHAGkrizAHcJGqAZBAMxk5wASjgDmACwHAAvpVCRYcUQhgBlGAEMYyKHAC8cABSwtOgFyZcBIiQgBKfQD5yTKKxwwQ445u1Q7FFRUIBpQCJb4hMSQAHR0FkxBQQTaeBBwAORQyCAgCFBQGYlwIWER1tEQMSzsZsVJKchpmbwaOAA2RUkAJnwayO0wdUkNKk3pKO3tTLKywEA)

比较下非静态枚举的编译:

```ts
var EDirection;
(function (EDirection) {
    EDirection[EDirection["Up"] = 0] = "Up";
    EDirection[EDirection["Down"] = 1] = "Down";
    EDirection[EDirection["Left"] = 2] = "Left";
    EDirection[EDirection["Right"] = 3] = "Right";
})(EDirection || (EDirection = {}));
const getStatus = (status) => {
    switch (status) {
        case EDirection.Up:
            return 'success';
        case EDirection.Down:
            return 'fail';
        default:
            return null;
    }
};
```

通过此种静态枚举的方案来判断类型, 比较 `Object['name']` 的方式和普通枚举的方式来说, 
性能更好, 可维护性也更高

### 有静态方法的枚举

你可以使用 `enum` + `namespace` 的声明的方式向枚举类型添加静态方法。

**这里的枚举只支持普通枚举**

```ts

enum EDirection {
  Up,
  Down,
  Left,
  Right,
}


namespace EDirection {
  export function go(type: EDirection) {
    switch (type) {
      case EDirection.Up:
      case EDirection.Down:
        return false;
      default:
        return true;
    }
  }
}

EDirection.go(EDirection.Down)
```

搭配使用可以在状态的基础上, 作出各种变化和判断方法

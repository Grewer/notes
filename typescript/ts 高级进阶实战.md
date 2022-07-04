## 前言
本文主要讲述有关 typescript 的高级用法及知识点, 在阅读之前最好有 ts 的基础


## 类型

逆变、协变、双向协变和不变




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


这里我们需要做特殊处理:

// TODO


## 函数类型

在 react 库中常用的一种用法是这样的:

```tsx
const a = (props) => {
    //...
    return <div></div>
}

a.defaultProps = {
    key: 'id'
}

```



## 文字类型

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

### 静态枚举
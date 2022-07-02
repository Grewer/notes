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

这里就会报这样的错误:

```
Property 'cal' does not exist on type 'Shape'.
  Property 'cal' does not exist on type '{ x: number; }'.
```

ts 在联合类型中, 我们直接通过 `.` 获取的属性, 是必须在所有子类型中共有的


这里我们需要做特殊处理:


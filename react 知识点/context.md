createContext:


```typescript jsx
import { REACT_PROVIDER_TYPE, REACT_CONTEXT_TYPE } from "shared/ReactSymbols"

import type {ReactContext} from "shared/ReactTypes"

export function createContext<T>(
  defaultValue: T,
  calculateChangedBits: ?(a: T, b: T) => number,
): ReactContext<T> {
  if (calculateChangedBits === undefined) {
    calculateChangedBits = null;
  }

  const context: ReactContext<T> = {
    $$typeof: REACT_CONTEXT_TYPE,
    _calculateChangedBits: calculateChangedBits,
    _currentValue: defaultValue,
    _currentValue2: defaultValue,
    _threadCount: 0,
    Provider: (null: any),
    Consumer: (null: any),
  }

  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    _context: context
  }

  context.Consumer = context;

  return context
}

```
context 的创建就是这样, 直接创建对象
需要注意的是 `context`, `context.Provider` 都是一个组件

---

`useContext` 就是基于  `readContext` 的实现

readContext:


```typescript jsx
export function readContext<T>(
  context: ReactContext<T>,
  observedBits: void | number | boolean,
): T {
  let contextItem = {
    context: ((context: any): ReactContext<mixed>),
    observedBits: resolvedObservedBits,
    next: null,
  };

  if (lastContextDependency === null) {
    // This is the first dependency for this component. Create a new list.
    lastContextDependency = contextItem;
    currentlyRenderingFiber.contextDependencies = {
      first: contextItem,
      expirationTime: NoWork,
    };
  } else {
    // Append a new context item.
    lastContextDependency = lastContextDependency.next = contextItem;
  }
}

return isPrimaryRenderer ? context._currentValue : context._currentValue2;
}
```


参考:
- https://xie.infoq.cn/article/d56577c78e76508722e37025f

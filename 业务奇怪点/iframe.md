## iframe 性能问题

### 场景
在微前端 iframe 的架构下, 如果 dom 过多, 在使用 modal 的时候

### 现象
出现 dom 显示错乱(包括但不限于, dom背景部分消失, 点击按钮失败, 卡住等)

### 猜测
可能是性能的问题, Chrome 将 iframe 的资源调度降级, 导致问题的出现

### 解决方案

在 modal 中使用 css 加速, 即 `transform` 即可正常显示
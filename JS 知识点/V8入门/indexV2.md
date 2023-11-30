## 环境搭建


这里先说下我的环境：
- 系统： Mac Monterey 12.6.8
- Xcode: 14.2
- Python: 3.11.6

## 由源码构建 V8

首先我们需要一个工具 [`depot_tools`](https://commondatastorage.googleapis.com/chrome-infra-docs/flat/depot_tools/docs/html/depot_tools_tutorial.html#_setting_up)

执行指令克隆：

```
$ git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
```

再在配置文件里添加环境变量, 因为我使用的是 zsh, 所以在 `~/.zshrc` 中添加

```
$ export PATH=/path/to/depot_tools:$PATH
```


## 引用

- https://blog.csdn.net/I_can_/article/details/124086670
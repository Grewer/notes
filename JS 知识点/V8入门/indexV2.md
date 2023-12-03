## 环境搭建


这里先说下我的环境：
- 系统： Mac Monterey 12.6.8
- Xcode: 14.2
- Python: 3.11.6

> 建议全程指令都在FQ工具下进行

## 由源码构建 V8

首先我们需要一个工具 [`depot_tools`](https://commondatastorage.googleapis.com/chrome-infra-docs/flat/depot_tools/docs/html/depot_tools_tutorial.html#_setting_up)

执行指令克隆，这里我是在文件夹 `/Users/apple/Sites/demo/depot_tools` 下执行的

```zsh
$ git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
```

再在配置文件里添加环境变量（假设我们克隆的地址是 `/path/`）, 因为我使用的是 zsh, 所以在 `~/.zshrc` 中添加 （如果你使用的是原生的终端 `bash`，则在 `~/.bashrc` 中添加）

```zsh
$ export PATH=/path/depot_tools:$PATH
```

这里根据我们刚刚克隆的地址，添加：

```zsh
export PATH=/Users/apple/Sites/demo/depot_tools:$PATH
```

最后配置让配置生效：

```zsh
source ~/.zshrc 
```

如果你当前是 Windows 系统， 可查看[此文档](https://commondatastorage.googleapis.com/chrome-infra-docs/flat/depot_tools/docs/html/depot_tools_tutorial.html#_setting_up)了解注意事项。


## 引用

- https://blog.csdn.net/I_can_/article/details/124086670
- https://commondatastorage.googleapis.com/chrome-infra-docs/flat/depot_tools/docs/html/depot_tools_tutorial.html#_setting_up
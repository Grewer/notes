## 环境搭建

这里先说下我的环境：
- 系统： Mac Monterey 12.6.8
- Xcode: 14.2
- Python: 3.11.6 （不要使用 2.x 版本！）

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


现在新建文件夹，开始拉取仓库：

```zsh
mkdir ~/v8
cd ~/v8
fetch v8
```

整个仓库大小至少有 1G，时间会比较长，这里比较推荐的做法是在官方镜像直接下载：
https://github.com/v8/v8

之前再切到 main 分支，更新下代码：
```zsh
git checkout main
git pull
```

更新依赖库，运行指令：
```zsh
gclient sync
```

还是在当前目录，运行指令，进行编译：
```zsh
tools/dev/gm.py x64.release
```

我们可以将 gm.py 作为一个快捷指令：
```bash
// 同上面讲述的环境添加的添加方法在 ~/.zshrc 中添加下面一行，再使用 source 指令即可
alias gm=/Users/apple/Sites/demo/v8/v8/tools/dev/gm.py
```

这样我们就可以编译了：
```bash
gm x64.release
```

注意**这里的编译需要花费较长的时间**，我的电脑性能一般，花了 2 个小时左右。

编译成功的显示：
![[截屏2023-12-20 01.40.05.png]]

进入文件夹：`/out/x64.release` ,  生成文件如下

```
├── args.gn
├── build.ninja
├── build.ninja.d
├── build.ninja.stamp
├── bytecode_builtins_list_generator
├── d8
├── gen
├── gen-regexp-special-case
├── icudtl.dat
├── mksnapshot
├── obj
├── snapshot_blob.bin
├── toolchain.ninja
├── torque
├── v8_build_config.json
└── v8_features.json
```

执行指令 `d8` , 之后可运行 js 代码，就像 Chrome 的控制台那样：

![[截屏2023-12-22 02.44.39.png]]

当然我们也可以执行一个 js 文件  
新建文件 `demo.js`

```js
function foo(num){
	var bar = 2;
	return Math.pow(num, bar)
}

console.log(foo(10))
```

运行结果：
![[截屏2023-12-28 02.12.32.png]]


官方还有一种手动编译的方案即使用 `GN`  和 `ninja` 来手动编译， 这是具体使用方式[https://v8.js.cn/docs/build-gn/#generate-build-files](https://v8.js.cn/docs/build-gn/#generate-build-files)

相对 gm 来说， 编译更加繁琐了，需要使用 `GN` 去生成 `ninja` 文件，再生成 `makefile`，最后才是编译



## 遇到的问题

### xcode-select 

```
xcode-select: error: tool 'xcodebuild' requires Xcode, but active developer directory '/Library/Developer/CommandLineTools' is a command line tools instance
```

解决方案：

首先确认自己已经下载了 Xcode

```zsh
file /Applications/Xcode.app/Contents/Developer
```

![[截屏2023-12-17 01.47.21.png]]

如果存在则执行以下指令:

```zsh
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

输入密码后回车即可


相关链接：
https://stackoverflow.com/questions/17980759/xcode-select-active-developer-directory-error

### 其他问题

> 这些问题是从网上类似博客里找到的，给大伙提供帮助

报错：

```bash
ImportError: cannot import name zip_longest
```


原因就是 python 版本不对，py3是 `zip\_longest` 库，py2下是 `izip\_longest`。

[这里是具体的解决方案](https://blog.csdn.net/I_can_/article/details/124086670)


```zsh
urllib.error.URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate (_ssl.c:1108)
```

解决：执行以下文件即可
![[Pasted image 20231220013843.png]]


## 调试

#### gdb 

> `gdb`是一款功能强大的开源调试器，用于帮助开发人员诊断和修复程序中的错误。通过设置断点、查看变量、回溯调用栈等功能，`gdb`使得在程序执行过程中定位问题变得更加容易。它支持多线程调试和提供宏调试功能，帮助开发人员有效地分析和解决复杂的软件错误，提高调试效率。


> 本文只讲述 mac 的安装, 如果已安装，请跳转到配置

1. **使用 Homebrew 安装 `gdb`：** 安装 `gdb` 的最新版本：
    
    `brew install gdb`
    
2. **配置 Code Signing（签名）：** 由于 SIP 限制，你需要配置 `gdb` 的代码签名，以便在调试时绕过权限问题。执行以下命令：
    
    `echo "set startup-with-shell off" >> ~/.gdbinit`
    
3. **创建签名文件：** 在终端中执行以下命令：
    
    `codesign -s gdb-cert /usr/local/bin/gdb`
    
    注意：这里的 `gdb-cert` 是你的证书名称，可以替换为你自己的证书名称。如果没有证书，你可能需要先创建一个。
    
4. **启动 `gdb`：** 在终端中启动 `gdb`：
    
    `gdb`

如有问题可参考此[文章](https://blog.csdn.net/qq_33154343/article/details/104784641)

#### lldb

> LLDB 是 LLVM 编译器基础上构建的调试器，主要用于 macOS 和其他支持 LLVM 的平台。作为 Xcode 的一部分，它支持多种调试功能，包括断点设置、单步执行、变量查看等。LLDB 提供强大的命令行界面，用于调试本地和远程程序。其灵活性和性能使其成为开发者在分析和修复代码中的问题时的重要工具。

目前来说更加推荐使用这个，在安装 Xcode 后，就应该已经拥有 LLDB。

如果没有则需要设置一下环境变量：

```zsh
// 将 `/path/to/XcodeCommandLineTools` 替换为实际的 Xcode 命令行工具路径。
export PATH="/path/to/XcodeCommandLineTools/bin:$PATH"
```


运行以下命令来验证是否可以找到 LLDB：

```zsh
lldb --version
```

如果一切正常，应该能够看到 LLDB 的版本信息。


### 进入调试

在源代码中插入如下代码进行调试：

```js
%DebugPrint(x); 打印变量 x 的相关信息
%SystemBreak(); 抛出中断，令 gdb 在此处断点
```

以我们刚刚的 demo.js 为例子

```js
%SystemBreak();
function foo(num){
	var bar = 2;
	return Math.pow(num, bar)
}

console.log(foo(10));  

%DebugPrint(foo);
%SystemBreak();
```

> 这两条代码并非原有的语法，在执行时需添加参数 “--allow-natives-syntax”， 否则会提示 “SyntaxError: Unexpected token '%'”

**更多关于 V8 语法的知识，可查看[源码](https://github.com/v8/v8/blob/main/src/runtime/runtime.h)获取**

![[截屏2024-01-06 02.06.10.png]]

如上图所示

1. 进入调试工具
	 `lldb v8`
2. 我们需要运行指令来调试对应的文件：
```zsh
r --allow-natives-syntax /Users/apple/Sites/demo/v8/v8/out/x64.release/demo.js
```
3. 输入 `continue` 继续， 可以看到 `foo(10)`  的打印结果，同时可以看到打印的 foo, 最后再次进入断点
![[截屏2024-01-11 01.26.12.png]]
4. 一直执行，看到 `Process xxx exited` 即是程序运行完毕
![[截屏2024-01-11 01.28.40.png]]

在 `lldb` 中还存在许多其他的命令： 如 `step`, `next`, `print` 等，来执行单步调试、查看变量等操作。

**更多请查看[官网](https://lldb.llvm.org/man/lldb.html#lldb-the-debugger)**

## 总结

在本文中，我们着手构建V8环境，并确保其成功编译。透过调试指令，我们能够在V8运行时提取必要的信息并将其输出。这是学习V8引擎过程中的关键步骤。
在随后的文章中，我们将深入研究V8，并探讨相关主题。如在环境搭建、编译或调试过程中遇到具体问题，请随时提出，我将提供更详细的信息和指导。

## 引用

- https://blog.csdn.net/I_can_/article/details/124086670
- https://commondatastorage.googleapis.com/chrome-infra-docs/flat/depot_tools/docs/html/depot_tools_tutorial.html#_setting_up
- https://github.com/ErodedElk/Chaos-me-JavaScript-V8/blob/master/Chapter1-%E7%8E%AF%E5%A2%83%E9%85%8D%E7%BD%AE.md
GO 入门介绍

Go 是一种编译型语言，可以将源码生成机器码，运行速度快，它内置了高效的并发支持，你可以用它写解释器、编译器、服务器程序等等

## 安装下载

在[这里](https://go.dev/learn/)下载 go 的最新版本，跟着提示安装即可，完成后执行`go version`命令可以检测是否安装成功

## Hello, World!

新建一个`hello`文件夹，创建一个`hello.go`文件，复制下面的代码到文件中

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

保存并执行`go run .`命令，就可以在控制台看到`Hello, World!`，我们第一个 go 程序就完成了。解释下这段代码

`package main`用于声明一个包。什么是包呢，你可以把它理解为代码的组织方式。在写程序时，我们不是将所有代码写在一个文件中，那样就难以维护了，通常会将实现不同功能的代码按照包来划分，一个包可能包含一个或多个文件，通过`package module_name`声明的文件都是属于同一个包，这样我们就可以像搭积木一样，通过组合不同的包，来简单快速的实现想要的功能

`import "fmt"`导入了一个叫 fmt 的包，它来自[go 语言标准库](https://pkg.go.dev/std)，也就是官方帮我们实现好的包，你可以直接引用

`func main` 定义了一个函数，main 包下的 main 函数比较特殊，它是程序执行的入口。`go run .`会首先将我们的源码文件编译成二进制文件，然后执行这个二进制文件

 `fmt.Println(...) `语句用于向控制台打印文字

## 工具

我们已经了解了基本的 go 程序的结构，接下来介绍一些常用的工具与命令

`go run .`命令用于编译并执行源码文件

`go build`命令用于编译源码文件，生成的二进制文件名会去掉源码文件的 .go 后缀，也可以用 -o 参数自定义输出的文件名

`go env` 命令用于显示当前 Go 环境变量的值，例如：

- `GOROOT`: 指定 Go 的安装目录以及标准库包的位置
- `GOPATH`: 指定 Go 工作区目录，它包含 3 个子目录
  - src：存储源代码，实际开发中一般以 git 项目来划分
  - pkg：存放编译后的包文件
  - bin：存放编译后的可执行文件，是在计算机硬件上运行的机器码指令
- `GOBIN`: 指定 Go 可执行文件的安装目录

`go get`命令用于下载和安装外部依赖包，获取的代码是真实的本地存储仓库，而不仅仅只是复制源文件

`go install`命令用于编译并安装依赖包

`go mod` 命令用于创建和管理 go module

### Debug

这里介绍三种 debug 的方式

1. 你可以使用第三方工具 Delve 进行 debug，我们使用上面介绍的命令安装它`go install github.com/go-delve/delve/cmd/dlv@latest`下载并安装它，install 命令会将编译的包保存在 $GOPATH/pkg 目录下，可执行文件保存在 $GOPATH/bin 目录下。如果你在 $GOPATH/src 下，现在可以使用`~/go/bin/dlv version` 检查是否安装成功，如果你想在全局都可以执行 dlv 命令，那么需要在环境变量中添加，例如，在 Mac ~/.zshrc 添加 `export PATH=$PATH:~/go/bin`，现在可以在任意位置直接执行`dlv version`检查是否安装成功

2. 当然也可以使用 VSCode 自带的 debug 方式，设置断点，然后执行

   <img src="/Users/neo/Desktop/vscode.png" alt="vscode_debug" style="zoom:25%;" />

3. 对于小的项目，我们可以直接使用 fmt.Println 向控制台打印信息查看是否与我们的期望相符

## 包

包时一种组织代码的方式，通过将相关的特性的代码放在一个包中，便于维护、更新和代码重用

在每个Go语言源文件的开头都必须有包声明语句`package name`，包声明语句的主要目的是确定当前包被其它包导入时默认的标识符（也称为包名）

每个包是由一个全局唯一的字符串所标识的导入路径定位，导入路径的具体含义是由构建工具来解释的，通过`import ("package_name")`的方式导入包，在代码中默认会以包名最后一个 / 后的字符作为对包的引用，例如：

```go
import (
  "fmt"
  "golang.org/x/net/html"
  _ "encoding/json" // 有些包我们用不到，但是需要下面的初始化函数
)

func main() {
  z := html.NewTokenizer(r)
  fmt.Println(z)
}
```

包的初始化首先是解决包级变量的依赖顺序，然后按照包级变量声明出现的顺序依次初始化

```go
var a = b + c // a 第三个初始化, 为 3
var b = f()   // b 第二个初始化, 为 2, 通过调用 f (依赖c)
var c = 1     // c 第一个初始化, 为 1

func f() int { return c + 1 }
```

如果包中含有多个 .go 源文件，它们将按照发给编译器的顺序进行初始化，Go语言的构建工具首先会将 .go 文件根据文件名排序，然后依次调用编译器编译

每个包可以定义多个 init 函数，在程序开始执行时按照它们声明的顺序被自动调用

<img src="/Users/neo/Desktop/init.png" alt="init" style="zoom:33%;" />

每个包在解决依赖的前提下，以导入声明的顺序初始化，每个包只会被初始化一次，初始化工作是自下而上进行的，main包最后被初始化
# Webpack 基础

在开发中我们经常用 webpack 打包我们的项目，从而更好的组织和整合 js 代码、css、及图片等静态资源

可以使用命令行工具 `webpack --entry=xxx` 开始打包的过程，也可以创建一个配置文件进行配置

我们先从基本使用开始，再简单实现下打包过程

## 基本使用介绍

首先，创建 webpack.config.js 文件，并配置相应的 package.json 的 script 命令

webpack 从入口文件开始，根据其依赖的模块或其它资源递归的进行打包工作

```javascript
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const StylelintPlugin =  require('stylelint-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
    entry: {
        main: path.resolve(__dirname, './src/index.js')
    },
    output: {
        path: path.resolve(__dirname, 'dist/'),
        publicPath: '/',
        filename: '[name]@[chunkhash].js'
    },
    watch: true,
    watchOptions: {
        ignored: '**/node_modules',
        aggregateTimeout: 300,
        poll: 1000
    },
    devtool: "source-map",
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    {
                        loader: 'less-loader',
                        options: {
                            sourceMap: true
                        }
                    },
                ]
            },
            {
                test: /\.(png|jpe?g|pdf)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 1024 * 3,
                        name: '[name].[ext]',
                        outputPath: 'images',
                    }
                }
            },
            {
                test: /\.(jsx?)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    targets:{
                                        edge:"17",
                                        firefox:"60"
                                    },
                                    // 按需注入，入口文件不需要import "@babel/polyfill(window.Promis方式注入)")，[entry(在入口文件import "@babel/polyfill")|usage(不引入)|false]
                                    useBuiltIns:"usage",
                                    corejs:2
                                }
                            ],
                            [
                                "@babel/preset-react",
                            ]
                        ]
                    }
                }
            }
        ]
    },
    plugins: [
        new BundleAnalyzerPlugin(),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './public/index.html')
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css'
        }),
        new StylelintPlugin({
            configFile: './stylelintrc.json'
        })
    ],
    optimization: {
        usedExports: true,
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendors:{
                    test: /[\\/]node_module[\\/]/,
                    priority: -10,
                },
                default:{
                    minChunks:2,
                    priority:-20,
                    reuseExistingChunk:true
                }
            }
        }
    },
    devServer:{
        open: true,
        hot: "only",
        port: 888,
        proxy:{
            "/": "http://localhost:8080"
        }
    },
}

```

一般来说我们可以按照 js、css、静态资源（图片、字体）、优化的思路进行配置，对上面的配置进行个简要说明：
1. 首先配置入口（entry）和出口（output），即打包开始的地方和输出的位置

2. 接下来考虑对不同资源的处理（module），需要根据资源的类型匹配相应的 loader 进行处理，因为 webpack 只知道如何处理 js 文件不知道如何处理 css 等文件

3. 对 js 文件需要考虑浏览器兼容性，所以这里用 babel 对目标浏览器转换 es6 语法

4. 对图片、字体可以用 url-loader 或 file-loader 处理

5. 对 css、less 文件，调用 mini-css-extract-plugin 抽离出单独的样式文件，并用 css-loader、less-loader 解析文件内容

6. 为了避免没从手动在 html 文件中引用打包出的 js、css 文件，我们可以给个 html 模板并调用 HtmlWebpackPlugin 插件，它可以根据模板内容自动引用打包好的资源文件

7. 在开发模式中，使用 devServer 可以帮我们实时看到打包的效果，而不需要每次重新编译，webpack-dev-server 同样可以配置代理服务器来处理跨域问题

8. watch 和 watchOptions 可以在文件有变动时重新打包，不必与 devServer 共同工作，功能是一样的

## 打包原理

根据官网的介绍，我们考虑下实现打包的思路

1. 读取配置文件，拿到打包入口

2. 编译入口文价内容，找出依赖项

3. 根据依赖项的类型，调用相应的 loader 处理

4. 递归 2 到 3 的过程，并输出最终内容

首先，搭个项目框架

```javascript
├─core
├─example
│  ├─build
│  └─src
│      └─exam 
|  ├─webpack.config.js      
├─loders
└─plugins
```

core 文件夹保存核心代码，example 是我们的例子也是配置文件的位置

根据 Node API，我们要实现一个 webpack 函数，参数为 配置对象和回调函数

```javascript
const webpack = require('webpack');

webpack({
  // [配置对象](/configuration/)
}, (err, stats) => { // [Stats Object](#stats-object)
  if (err || stats.hasErrors()) {
    // [在这里处理错误](#error-handling)
  }
  // 处理完成
});
```

所以在 core 文件夹中创建 webpack.js，这个文件主要做了下面几件事

1. 合并命令行参数到配置对象中

2. 创建并返回 Compiler 实例对象

3. 调用执行 plugins 数组中每一个插件

```javascript
const Compiler = require('./compiler')
const path = require('path')

function webpack(options) {
    // npx webpack --mode=xxxx
    const _mergeOptions = mergeOptions(options)

    const compiler = new Compiler(_mergeOptions)

    const plugins = options.plugins

    if(plugins && Array.isArray(plugins)) {
        plugins.forEach(plugin => {
            if (typeof plugin === 'function') {
                plugin.call(compiler, compiler)
            } else {
                plugin.apply(compiler)
            }
        });
    }

    return compiler
}

function mergeOptions(options) {
    const result = {}
    process.argv.slice(2).forEach(argv => {
        const [key, value] = argv.split('=')
        if (key && value) {
            result[key] = value
        }
    })

    return {...options, ...result}
}

module.exports = webpack
```

创建 compiler.js 文件存放 Compiler 类，实现编译功能

```javascript
const { SyncHook } = require('tapable')

class Compiler {
    constructor(options) {
        this.options = options
        this.hook = {
            run : new SyncHook(),
            emit : new SyncHook(),
            done : new SyncHook(),
        }
    }
}

module.exports = Compiler
```

保存 options 并初始化生命周期 hook，接下来实现 run 方法，从入口开始执行编译过程

1. 首先需要在开始编译前执行注册的 run 钩子

2. 其次获得入口地址，并根据入口地址开始编译

3. 在后续编译过程中，我们需要一个统一的地址来处理文件，所以将 entry 地址替换成相对 rootPath 的地址

```javascript
class Compiler {
    constructor(options){
        // other code
        this.rootPath = options.context || process.cwd()
        this.entry = new Set()
    }

    run(callback) {
        this.hooks.run.call()

        const entry = this.getEntry()

        this.buildEntry(entry)
    }

    buildEntry(entry) {
        Object.keys(entry).forEach(name => {
            const entryPath = entry[name]
            const entryObj = this.buildModule(entryPath)
            this.entrys.add({entryName: name, ...entryObj})
        })
    }
    
    getEntry() {
        let optionsEntry = Object.create(null)
        const { entry } = this.options
        if (typeof entry === 'string') {
            optionsEntry['main'] = entry
        } else {
            optionsEntry = entry
        }
        
        Object.keys(optionsEntry).forEach((key) => {
            optionsEntry[key] = path.relative(this.rootPath, optionsEntry[key])
        })

        return optionsEntry
    }
}

```

编译的主要功能通过 buildModule 函数实现，其主要功能为

1. 读取文件内容

2. 调用对应 loader 处理

3. 编译文件内容

4. 递归处理依赖

```javascript
const extensions = ['.js', '.ts']
function extensionPath(p, rootPath) {
    // 是目录就找 index.js
    // 是文件就加后缀名
    const stats = fs.statSync(p)

    if (stats.isFile()) {
        return p
    }
    
    if (stats.isDirectory()) {
        const defaultPath = path.resolve(p, './index.js')
        const indexStats = fs.statSync(defaultPath)
        if (indexStats.isFile()) {
            return path.relative(rootPath, defaultPath)
        }
    }

    let testPath = ''
    for(let i = 0; i < extensions.length; i++) {
        testPath = p + extensions[i]
        if (fs.existsSync(testPath) && fs.statSync(testPath)) {
            return testPath
        }
    }

    throw new Error('can not find file')
}

class Compiler() {
    buildModule(modulePath) {
        // modulePath 可能没有后缀名
        const extPath = extensionPath(modulePath, this.rootPath)
        // 1. 读取文件内容
        const originSourceCode = this.sourceCode = fs.readFileSync(extPath, 'utf-8')
        this.moduleCode = originSourceCode
        // 2. loader 处理
        this.handleModule(extPath)
        // 3. 编译模块
        const module = this.handleCompiler(extPath)

        // 4. 编译依赖
        module.depends.forEach(d => {
            this.buildModule(d)
        })

        return module
    }
}
```

此处 extensionPath 主要考虑传入的 modulePath 是目录或者文件名后缀不全的情况

实现对 loader 支持的 handleModule 函数，主要就是拿到与 test 匹配的 loaders，倒序调用

```javascript
class Compiler {
    handleModule(modulePath) {
        const rules = this.options.module.rules
        if (Array.isArray(rules)) {
            rules.forEach(rule => {
                if (rule.test.test(modulePath)) {
                    const loaders = rule?.use ? rule.use : [rule.loader]
                    for(let i = loaders.length - 1; i > 0; i--) {
                        const loader = require(loaders[i])
                        this.moduleCode = loader(this.moduleCode)
                    }
                }
            })
        }
    }
}
```

接着实现编译文件的 handleCompiler 函数，这里借助 babel 简化处理过程，babel 可将源码编译成 ast 抽象语法树，我们可以从抽象语法树中获知当前模块的依赖模块，将编译后的模块存入 this.modules 中，此处有 2 个注意事项

1. 需要 toUnixPath 将 \ 替换成 / 统一处理，否则 babel 在处理过程中会加上转义符 \ 会变成 \\，而且我们转成绝对路径时会同时包含 \ / 导致无法处理

2. 对获得的依赖，需要将相对路径统一转换成相对 rootPath 的路径，方便后续处理

3. buildModule 增加对依赖的处理，这样就可以进行递归编译了

```javascript
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const transformFromAst = require('@babel/core').transformFromAst

function toUnixPath(p) {
    return p.replace(/\\/g, '/')
}

class Compiler {
    constructor(options) {
        // other code
        this.modules = new Set()
    }

    buildModule(modulePath) {
        // other code
        // 递归处理依赖
        module.depends.forEach(d => {
            this.buildModule(d)
        })

        return module
    }

    handleCompiler(moduleName) {
        const rootPath = this.rootPath
        const dirName = path.dirname(moduleName)

        // 已编译过直接返回
        const findModule = this.module?.values()?.find(m => m.id === module.id)
        if (findModule) {
            return findModule
        }

        const module = {
            id: toUnixPath(moduleName),
            depends: new Set(),
            moduleCode: this.moduleCode,
        }

        const ast = parser.parse(this.moduleCode, { sourceType : 'module' })

        traverse(ast, {
            ImportDeclaration({ node }) {
                // 将引用路径替换成相对 rootPath 的路径
                const dependPath = node.source.value
                // 将 dependPath 解析成绝对路径， 再转化成相对 rootPath 路径
                const resolvePath = path.resolve(dirName, dependPath)
                const relativePath = path.relative(rootPath, resolvePath)
                module.depends.add(extensionPath(relativePath, rootPath))
                node.source.value = toUnixPath(extensionPath(relativePath, rootPath))
            }
        })

        // 将 import 转成 require
        const { code } = transformFromAst(ast, null, {
            presets: ['@babel/preset-env']
        })

        module.moduleCode = code

        this.modules.add(module)

        return module
    }
}
```

现在我们的 this.modules 中保存了所有编译后的模块及其依赖项，可以输出最终内容了

1. 首先根据 this.entrys 获得所有入口模块

2. 根据 webpack 最终打包的结果可以看到，实际生成到最终文件的就是一个立即执行函数，内部通过 __webpack_modules__ 保存了所有模块的代码

3. 执行 require 函数即是从入口模块开始执行所有代码

4. 注意输出最终内容前后要调用相应的生命周期钩子

```javascript
class Compiler {
    run(callback) {
        // other code
        // 生成文件内容
        this.buildOutput(callback)
    }

    buildOutput() {
        const entrys = this.entrys
        const modules = this.modules
        const { path: outputPath = path.resolve(this.rootPath, './dist'), filename } = this.options.output

        this.hooks.emit.call();

        // 目录不存在则创建目录
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath)
        }
        
        entrys.forEach(entry => {
            const outputPosition = path.resolve(outputPath, filename.replace('[name]', entry.entryName))
            // 写入 webpackbootst 内容
            const fileContent = `
                (() => {
                    "use strict"
                    var __webpack_modules__ = ({
                        ${[...modules.values()].map(m => {
                            const moduleId = m.id
                            const code = m.moduleCode
                            return `
                                '${moduleId}': ((module, exports, require) => {
                                    ${code}
                                })
                            `
                        })}
                    })

                    var __webpack_module_cache__ = {};
                    function require(moduleId){

                        var cachedModule = __webpack_module_cache__[moduleId];
                        if (cachedModule !== undefined) {
                            return cachedModule.exports;
                        }

                        var module = __webpack_module_cache__[moduleId] = {
                            exports: {}
                        }

                        __webpack_modules__[moduleId](module, module.exports, require)

                        return module.exports
                    }
                    require('${entry.id}')
                })()
            `
            
            fs.writeFileSync(outputPosition, fileContent, 'utf-8')
        })

        this.hooks.done.call();

        callback(null, {
            entrys: this.entrys,
            modules: this.modules
        })
    }
}
```

由上面代码可知，loader 函数即使接受源代码并返回处理后源码的函数，plugin 是实现了 apply 方法的类或者函数

至此，我们完成了 webpack 打包的基本过程

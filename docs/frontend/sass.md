# Sass

## Sass 基本使用

### 变量

同 css 变量声明一样，sass 也分全局变量与局部变量，在规则块 {...} 之外声明的是全局变量，在规则块中声明的是局部变量

当用 $ 声明了变量，变量还没有生效，只有引用它时才会生效，任何 css 属性标准值存在的位置都可以引用变量：

```sass
$font-color: #F90;// 变量名可用 - 或 _ 分隔，sass编译时自动统一
$border-color: #FFF;

div {
  $width: 100px;// 局部变量
  width: $width;
  color: $font-color;
  border: 1px solid $border-color;
}

//编译后
div {
  width: 100px;
  color: #F90;
  border: 1px solid #FFF;
}
```

### 嵌套规则

为了简化 css 中重复写选择器的问题，sass 提供了嵌套的语法

转化成 css 时从外向内，如果有嵌套的选择器，就将外层选择器（#content）+ 空格再放到内层（article 、aside ）选择器之前，即默认组合成子选择器：

```css
// css 中重复重复写选择器
#content { border: 1px solid #FFF }
#content article h1 { color: #333 }
#content article p { margin-bottom: 1.4em }
#content aside { background-color: #EEE }

// sass 中嵌套写法，可包含属性和规则块
#content {
	border: 1px solid #FFF
  article {
    h1 { color: #333 }
    p { margin-bottom: 1.4em }
  }
  aside { background-color: #EEE }
}
```

如果要给外层选择器（#conten）添加伪类如 :hover 以上嵌套规则就不再适用了。为此 sass 提供父选择器标识符 $ ，在嵌套规则内碰到 $ 时，会直接用父选择器替换，而不是追加：

```css
// sass
#content {
	border: 1px solid #FFF;
  aside { 
  	background-color: #EEE
    body.ie $ { background-color: #DDD }
  }
  $:hover { border-color: blue }
}

// 编译成css
#content { border: 1px solid #FFF }
#content:hover { border-color: blue }
#content aside { background-color: #EEE }
body.ie #content aside { background-color: #DDD }
```

对于组合选择器，、>、+、~上述规则同样适用：

```css
// sass
nav, aside {
  $ + a { color: blue }
}

// css
nav + a, aside + a { color: blue }
```

sass 不仅支持选择器嵌套，同样支持嵌套属性，将属性从 - 处断开：

```css
// scss
nav {
  border {
  	styled: solid;
    width: 1px;
    color: red;
  }
}

// css
nav {
	border-styled: solid;
  border-width: 1px;
  border-color: red;
}
```

### 导入sass文件
不同于 css 的 @import 规则，sass 在生成 css 文件时就会将导入文件合并到一个文件中，无需返额外下载请求

可以将 sass 文件分散到多个文件中，专门为 @import 命令导入使用，不生成独立的 css 文件，这样的文件称为局部文件，约定文件名以 `_` 开头的文件为局部文件，导入时可以不加开头的 `_`

为了便于导入者修改局部 sass 文件中的某些值，可以给变量后面加上 `!default` 标签，这样导入者如果声明了相同的变量，就可以覆盖局部变量的默认值：

```javascript
// _font-color.scss
$font-color: #F90 !default;

// content.scss
@import 'font-color';
$font-color: #FFF;
div { color: $font-color;// #FFF }
```

不同于 css，sass 中可以将 @import 命令放入规则块 {...} 内，这样当导入时，局部文件被插入到规则块内相应位置，不会全局生效：

```css
// _font-color.scss
aside { backgroun-color: #F90 }

// content.css
div { @import "font-color" }// 相当于 div { aside { backgroun-color: #F90 }}
```

sass 同样支持原生的 css @import，当存在以下 3 种情况时，会生成原生的方式

1. 被导入文件的名字以 .css 结尾

2. 被导入文件的名字是一个 URL 地址（比如 http://www.sass.hk/css/css.css），由此可用谷歌字体 API 提供的相应服务

3. 被导入文件的名字是 CSS 的 url() 值

### 混合器 mixin

当需要几处相似的样式，并且是大段的重用样式的代码，声明变量的方式就无法支持这种情况了。可以用 @mixin 声明一个混合器，当在其它地方引用（@include）这个混合器，就会将混合器内的内容插入到相应位置：

```javascript
// 混合器不同于类，一般用来描述展示性的样式
@mixin rounded-corners {
  -moz-border-radius: 5px;
  -webkit-border-radius: 5px;
  border-radius: 5px;
}
// 不仅包括属性，也可以包括选择器规则
@mixin font-color {
  color: #F90;
 	p { color: #FFF }
  $:hover { color: #F13 }
}

div {
	width: 50px;
  height: 50px;
  border: 1px solid red;
  @include rounded-corners;// rounded-corners 的内容插入到这里
  @include font-color;
}
```

混合器还可以根据参数来生成不同的样式：

```javascript
@mixin link-colors($normal, $hover, $visited: #F90) {// 设置 $visited 的默认值
  color: $normal;
  &:hover { color: $hover; }
  &:visited { color: $visited; }
}

a {
  @include link-colors(blue, red);// 未传第3个参数，$visited使用默认值
  /*或者 @include link-colors($normal: blue,$visited: green,$hover: red); 指定每个参数具体值*/
}
```

混合器中的内容可以是动态的。在混合器中用 @content 预先占位，这样在导入混合器时，@include 后的内容会替换 @content 的内容

```javascript
// sass
$color: white;
@mixin colors($color: blue) {
  background-color: $color;
  @content;
  border-color: $color;
}
.colors {
  // { color: $color; } 块用于替换@content
  // 注意这里的变量作用域是@include所在的块，而不是@mixin定义的块
  @include colors { color: $color; }
}

// 生成的css
.colors {
	background-color: blue;
  color: white;
  border-color: blue;
}
```

### 选择器继承

选择器继承可以用来减少重复，即一个选择器可以继承另一个选择器所有样式，通过 @extends 实现

继承应该是建立在语义化的关系上。当一个元素拥有的类（比如说 .seriousError ）表明它属于另一个类（比如说 .error ），这时使用继承再合适不过了。任何 css 规则都可以继承其他规则，几乎任何 css 规则也都可以被继承

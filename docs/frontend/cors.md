# 跨域资源共享

## 浏览器同源策略

限制一个源（A URL）的文档和其脚本与另一个源（B URL）的资源交互。出于安全性考虑，浏览器不能拿到与当前页面非同源的资源（协议、域名、端口号有一个不同，就是非同源）

请求非同源地址，会带来以下限制：

1. 无法读取非同源网页的 Cookie、LocalStorage 和 IndexedDB

2. 无法接触非同源网页的 DOM

3. 无法向非同源地址发送 AJAX 请求

## 解决方案

1. 针对相同主域名，多个页面设置相同的 document.domain 属性，以共享 cookie

2. 父子窗口通过 window.postMessage 通信

3. 内容安全策略：CSP（设置 Content-Security-Policy 头）控制用户代理（浏览器）可以获取哪些资源

4. JSONP，利用 script 标签可以跨域的特点，在 src 属性中请求数据，缺点是只有 get 请求

5. CORS（cross-origin resource sharing）跨域资源共享，是由浏览器及服务器参与的，基于HTTP头的验证，进而传输数据的一种机制。

## CORS

首先看一下请求分类，浏览器将请求分为简单请求、复杂请求，简单请求需同时满足以下条件：

  a. 请求方法是以下三种方法之一：HEAD、GET、POST

  b. HTTP的头信息不超出以下几种字段：Accept、Accept-Language、Content-Language、Last-Event-ID

  c. Content-Type 只限于 application/x-www-form-urlencoded、multipart/form-data、text/plain
  
  d. 请求中没有使用 ReadableStream 对象

CORS 怎么生效的？浏览器发送请求给服务端，如果响应头不包含 Access-Control-Allow-Origin，那么浏览器就会将返回的结果抛弃

简单请求，服务器只需要根据请求头的 Origin：url 字段判断是否在响应头添加Access-Control-Allow-Origin 字段，即可控制浏览器请求的内容

由于请求不带 Cookie 和 token 等身份凭证信息，所以要发送认证信息，需要设置 XHR 对象withCredentials=true，且服务器不得设置 Access-Control-Allow-Origin 的值为 * 。“同时，Cookie依然遵循同源政策，只有用服务器域名设置的Cookie才会上传，其他域名的Cookie并不会上传，且（跨源）原网页代码中的document.cookie也无法读取服务器域名下的Cookie。”

复杂请求，如PUT、DELETE，会先发送预检请求 OPTION，发送包含 Access-Control-Request-Method、Access-Control-Request-Headers 头告诉服务器正式请求的方法和自定义头部信息，服务器基于从预检请求获得的信息来判断，是否接受接下来的实际请求

接下来验证一下解决方案1~4：

1、针对相同主域名，多个页面设置相同的document.domain属性，以共享cookie


参考：
1. http://www.ruanyifeng.com/blog/2016/04/cors.html
2. https://blog.csdn.net/qq_38128179/article/details/84956552
3. https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS

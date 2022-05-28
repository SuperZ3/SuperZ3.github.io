# 浏览器缓存

缓存可以提升访问资源的速度，减轻服务器压力

## 缓存位置

按缓存的位置分类，资源可以存放在 memory cache、disk cache 中

1. memory cache：读取速度快，存储周期短，容量小

2. disk cache： 读取速度慢，存储周期长，容量大

## HTTP 缓存

HTTP 缓存分为强缓存和协商缓存

+ 强缓存：客户端先访问缓存看资源是否存在，存在直接返回，否则请求服务器。（cache-control，expires）

+ 协商缓存：客户端发送请求到服务器，服务器根据相应字段判断资源是否修改。如果未修改，则直接返回 304 告诉浏览器使用缓存资源，否则返回更新资源

1. Expires：表示资源过期时间，为一个绝对时间，`Expires: Thu, 10 Nov 2017 08:45:11 GMT` 当超过时间后浏览器重新请求资源。如果客户端本地时间修改，有可能导致缓存失效

2. Cache-Control：同样表示资源过期时间，但是是相对时间，常用值：

    - max-age：最大有效期，相对于请求的时间
    - public：响应可被任何对象（包括代理服务器、客户端等）缓存
    - private：只能被单个用户缓存，代理服务器不能缓存
    - no-store：不使用任何缓存
    - no-cache：使用缓存内容前与服务器进行协商缓存验证

3. Last-Modified & If-Modified-Since：浏览器请求资源时，服务器会响应一个 Last-Modified 字段，值为资源修改时间，浏览器会存储这个时间。下次请求时，浏览器将时间赋给 If-Modified-Since 字段，服务器拿到值后与资源修改时间对比，一致则直接返回 304 状态，告诉浏览器使用缓存，否则返回新的资源并更新 Last-Modified 的值。缺点是不知道资源是否确实更改过

4. Etag & If-None-Match：Etag 一般为资源的摘要，如果摘要变了，说明资源确实有修改。否则返回 304
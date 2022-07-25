# WebSocket

[WebSocket](https://datatracker.ietf.org/doc/html/rfc6455) 用来在客户端与服务器间建立一个双工链接以实现双向的数据通信，它属于 OSI 中的应用层部分

本篇文章目的是实现简版的 websocket 接口，以理解 websocket 通信过程，接口规范参考[这里](https://websockets.spec.whatwg.org/#the-websocket-interface)实现

## 1. 打开一个握手

建立 websocket 需要接收 url、protocols、client

1. 给定一个 url，如果以 ws 开头，采用 http 协议，否则采用 https 协议
2. 创建一个请求对象 request（参考之前文章），并设置 Upgrade、Connection、Sec-WebSocket-Key、Sec-WebSocket-Version、Sec-WebSocket-Protocol、Sec-WebSocket-Extensions 请求头

```javascript
const r = new Request({
    url,
    client,
    'service-workers': 'none',
    referrer: 'no-referrer',
    mode: 'websocket',
    credentials: 'include',
    cache: 'no-store',
    redirect: 'error'
})
const h = new Headers()
h.add('Upgrade', 'websocket') // 我们希望切换到 websockket 协议
h.add('Connection', 'Upgrade') // 带有 Upgrade 就必须带有 Connection 头
const magic = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11' // 用来校验服务器返回的 key
function getRandomStr(n = 16) {
    const code = '0123456789abcdefghigklmnopqrstuvwxyz'
    let result = ''
    const codeLen = code.length
    for (let i = 0; i < n; i++) {
        result += = code[Math.floor(Math.random() * codeLen)]
    }
    return result
}
const rand = window.btoa(getRandomStr())
// Base64 编码的 16 字节（byte）随机字符
// js 字符串用 unit-16 存储，所以这里直接取 16 个字符
h.add('Sec-WebSocket-Key', rand)
h.add('Sec-WebSocket-Version', 13) // websocket 版本，规范给出的是 13
h.add('Sec-WebSocket-Protocol', 'chat') // 客户端支持的子协议的列表
```

3. 通过 Fetch 发送请求，对于请求结果：
    - 如果网络错误或者 statusCode 不是 101，让 websocket 失败

## 2. WebSocket 接口

websocket 像 XHR 一样包含 4 种状态-- CONNECTING（0）、OPEN（1）、CLOSING（2）、CLOSED（3）

```javascript
class MWebsocket {
    public CONNECTION = 0
    public OPEN = 1
    public CLOSING = 2
    public CLOSED = 3
    public readyState = 0
    public bufferAmount
    constructor(public readonly url, public protocols = []){
        let urlRecord = URL.parse(url)
        
    }
    
    onopen = () => {}
    onerror = () => {}
    onclose = () => {}
    onmessage = () => {}

    send = (data) => {}
}
```

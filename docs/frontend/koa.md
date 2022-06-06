# Koa

Koa 是一个轻量级的 Web 框架，让我们更简单编写应用，我们看下它的实现原理

```javascript
const http = require('http')
const Cookies = require('cookies')
const COOKIE = Symbol.for('#cookie')
const context = {
    onError(err) {
        this.res.status = 505
        this.res.end(err)
    },

    get cookies() {
        if (!this[COOKIE]) {
            this[COOKIE] = new Cookies(this.req, this.res, {
                keys: this.app.keys,
                secure: this.request.secure
            })
        }

        return this[COOKIE]
    },

    set cookies(val) {
        this[COOKIE] = val
    }
}
// 请求对象
const request = {
    get header() {
        return this.req.headers
    },
    set header(val) {
        this.req.headers = val
    },

    get url() {
        return this.req.url
    },
    set url (val) {
        this.req.url = val
    },
}
// 响应对象
const response = {
    get header() {
        return this.res.getHeaders()
    },
    get status() {
        return this.res.statusCode
    },
    get body() {
        return this._body
    },
    set body(val) {
        this._body = val 
    }
}

function Koa() {
    this.middleWare = []
    this.context = Object.create(context)
    this.request = Object.create(request)
    this.response = Object.create(response)
}

Koa.prototype.listen = function (...args) {{
    const server = http.createServer(this.callback())
    return server.listen(...args)
}}

Koa.prototype.use = function (fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!')
    this.middleWare.push(fn)
    return this
}

Koa.prototype.createContext = function (req, res) {
    // 对每一个连接，创建一个上下文
    const context = Object.create(this.context)
    const request = context.request = Object.create(this.request)
    const response = context.response = Object.create(this.response)

    context.app = request.app = response.app = this
    context.req = request.req = response.req = req
    context.res = request.res = response.res = res
    request.ctx = response.ctx = context
    request.response = response
    response.request = request
    context.originalUrl = request.originalUrl = req.url
    context.state = {}
    return context
}

Koa.prototype.handleRequest = function (ctx, fnMiddleWare) {
    const onerror = err => ctx.onError(err)
    const handleResponse = () => respond(ctx)

    return fnMiddleWare(ctx).then(onResponse).catch(onerror)
}

Koa.prototype.callback = function () {
    const fn = compose(this.middleWare)
    return function handleRequest(req, res) {
        const ctx = this.createContext(req, req)
        return this.handleRequest(ctx, fn)
    }
}

function compose(middleWares) {
    if (!Array.isArray(middleWares)) throw new TypeError('Middleware stack must be an array!')

    return function (ctx, next) {
        let index = -1
        return dispatch(0)
        function dispatch(i) {
            index = i
            const fn = middleWares[i]
            if (i === middleWares.length) fn = next
            if (!fn) return Promise.resolve()
            try {
                return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)))
            } catch (err) {
                return Promise.reject(err)
            }
        }
    }
}

function responsed(ctx) {
    const res = ctx.res
    let body = ctx.body
    const code = res.statusCode

    if(statuses.empty[code]) {
        ctx.body = null
        return res.end()
    }

    return res.end(JSON.stringify(body))
}
```

Koa 的核心原理可以用上述代码概括，洋葱模型即是 compose 函数部分实现的

实际使用时，我们先创建 Koa 实例，并注册多个中间件处理函数

当监听到请求到来时，对每个请求，都会创建一个 context 实例，包含我们自定义的请求响应对象，和 req、res 对象，每次请求都会执行一编中间件函数


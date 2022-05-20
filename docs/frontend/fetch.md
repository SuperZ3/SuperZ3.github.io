# 网络请求 API 与 Axios

利用 XHR 和 Fetch API 可以在不刷新网页情况下更新页面内容，Axios 是对网络请求 API 的封装，让我们可以方便的在浏览器和 Node 端执行网络请求

## XmlHttpRequest 与 Fetch 基本使用

XHR 对象只需按照固定顺序调用相应方法，即可发送非跨域请求

```javascript
let xhr = new XMLHttpRequest()
// 准备发送请求，默认异步
xhr.open(method, url, asyncrous)
// 设置请求头
xhr.setRequestHeader('MyHeader', 'MyValue')
xhr.onreadystateChange = () => {
    try {
        // readyState 为 4 时，代表收到响应
        if (xhr.readyState === 4) {
            // 获取响应头
            const responseHeader = xhr.getResponseHeader('MyHeader')

            // 最好检查 status，statusText 不准确
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                console.log('success', xhr.responseText)
            } else {
                console.log('failed')
            }
        }
    } catch(r) {
        // 超时
        console.log(r)
    }
}

// 进度事件：loadstart，progress，err，abort，load 用来介入资源请求过程
// load 事件，在接收响应完成后触发，相当于 readystate === 4
xhr.onload = () => {
    console.log(xhr.status)
}

// 请求过程中不断触发
xhr.onprogress = (event) => {
    console.log(event.lengthComputed)
}

// 设置超时时间
xhr.timeout = 1000
// 超时回调，超时情况下，readyState 仍然变为 4，但是访问 status 会报错，所以需要 try 包裹
xhr.ontimeout = () => {
    console.log('request out date')
}
// 发送请求体
xhr.send(data)

setTimeout(() => {
    // 取消请求
    xhr.abort()
    xhr = null
}, 1000)
```

Fetch 相较于 XHR 更加灵活

```javascript
const abortController = new AbortController()

fetch(
    url, 
    {
        method: 'POST',
        body: '请求体',
        mode: 'cors',
        // 如何获取缓存
        cache: 'no-cache',
        // 是否发送 cookie
        credentials: 'same-origin',
        headers: new Headers({'MyHeader', 'MyValue'}),
        signal: abortController.signal
        // ... other options
    }).then(
        response => {
            console.log(response.url)
            // 只要发生了请求，不论 500 还是 404，都触发 response 函数 
            console.log(response.status)
            // 只有请求成功时，为 true
            console.log(response.ok)
        },
        err => {
            // 违反 CORS、无网络链接、服务器没有响应
            console.log(err)
        }
    )

// 中断请求
setTimeout(() => abortController.abort, 10)
```

## Fetch 实现

Fetch 提供了对 Request 和 Response 对象的通用定义，用 Promise 和 XHR 可以实现简单的 Fetch API

首先我们做下功能划分：
1. fetch 函数：构建 Request 实例，发起 XHR 请求，返回 Response 结果
2. Request 类：存储请求需要的属性及方法
3. Response 类： 存储响应的状态和方法
4. Body 类：为 Request 和 Response 提供操作请求/响应体的方法
5. Headers 类：封装对请求/响应头的增删改查方法

```javascript
const CREDENTIALS = {
    omit: 'omit',
    sameOrigin: 'same-origin',
    include: 'include'
}

const METHODS = ['GET', 'POST', 'DELETE', 'HEAD', 'OPTIONS']

function consumed(ins) {
    if (ins.bodyUsed) {
        return Promise.reject(new TypeError('already used'))
    }

    ins.bodyUsed = true
}

function readBlobAsText(blob) {
    const reader = new FileReader()
    reader.readAsText(blob, 'utf-8')
    return new Promise((resolve, reject) => {
        reader.onload = () => {
            resolve(reader.result)
        }

        reader.onerror = () => {
            reject(reader.error)
        }
    })
}

function holdHeaders(headers) {
    const result = {}
    const headerArr = headers.trim().split('\r\n')
    headerArr.forEach(line => {
        const parts = line.split(': ')
        const name = parts.shift()
        const value = parts.join(': ')
        result[name] = value
    })
    return result
}

// 1. 根据 options 构建 request 对象
// 2. 构建 xhr 对象发起请求
// 3. 注册 load 事件返回 response 对象
function fetch(input, options) {
    return new Promise((resolve, reject) => {
        const request = new Request(input, options)

        if (options.signal && options.signal.aborted) {
            reject(new Error('fetch aborted'))
        }

        const xhr = new XMLHttpRequest()
        function abortXHR() {
            xhr.abort()
            xhr = null
        }
        xhr.onload = () => {
            const options = {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: new Headers(holdHeaders(xhr.getAllResponseHeaders())),
                url: xhr.responseURL
            }

            const body = xhr.response
            resolve(new Response(body, options))
        }
        xhr.onerror = () => {
            reject(new Error('fetch failed'))
        }
        xhr.ontimeout = () => {
            reject(new Error('timeouted'))
        }
        xhr.onabort = () => {
            reject(new Error('aborted'))
        }
        xhr.open(request.method, request.url)
        // 处理请求头
        request.headers.forEach((value, name) => {
            xhr.setRequestHeader(name, value)
        })

        // 处理凭据
        if (request.credentials === CREDENTIALS.omit) {
            xhr.withCredentials = false
        } else if (request.credentials === CREDENTIALS.include) {
            xhr.withCredentials = true
        }

        // 处理信号
        if (request.signal) {
            request.signal.addEventListener('abort', abortXHR)

            request.signal.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    xhr.removeEventListener('abort')
                }
            }
        }

        xhr.send(request._bodyInit === undefined ? null : request._bodyInit)
    })
}

// 构建请求对象，设置 url、headers、method...
// 处理请求体
function Request(input, options) {
    const body = options.body || {}
    // init 可能是字符串或 Request 实例
    if (input instanceof Request) {
        if (input.bodyUsed) {
            throw new Error('already used')
        }

        this.url = input.url
        this.credentials = input.credentials
        this.method = input.method
        this.mode = input.mode
        this.signal = input.signal
        if (!options.headers) {
            this.headers = new Headers(input.headers)
        }
        if (!body && input._bodyInit !== null) {
            body = input._bodyInit
            input.bodyUsed = true
        }
    } else {
        this.url = typeof init === 'string' && !!init.trim() ? init : location.href
    }

    this.credentials = options?.credentials || this.credentials || 'same-origin'
    this.method = options?.method || this.method || METHODS[0]
    this.mode = options?.mode || this.mode || null
    this.signal = options?.signal || this.signal || new AbortController().signal
    if (options.headers || !this.headers) {
        this.headers= new Headers(options.headers)
    }

    if ((this.method === METHODS[0] || this.methods === METHODS[3]) && body) {
        throw new Error(`${this.method} can't with body`)
    }

    this._initBody(body)
}

// 构建响应对象，设置 status、headers、url
// 处理响应体
function Response(body, options) {
    this.status = options.status
    this.statusText = options.statusText
    this.ok = this.status >= 200 && this.status < 300
    this.url = options.url || ''
    this.type = 'default'

    this._initBody(body)
}

// 解析请求/响应体
// 定义 text()、blob()、json() 等方法
function Body(body) {
    this.bodyUsed = false
    this._bodyInit = body

    this._initBody = function(body) {
        this.bodyUsed = this.bodyUsed
        // 根据 body 的类型，赋值给不同的属性方便后续处理
        // String，Blob，URLSearchParams
        if (!body) {
            this._bodyText = ''
        } else if (typeof body === 'string') {
            this._bodyText = body
        } else if (Blob.prototype.isPrototypeOf(body)) {
            this._bodyBlob = body
        } else if (URLSearchParams.prototype.isPrototypeOf(body)) {
            this._bodyText = body.toString()
        } else {
            this.bodyText = body = Object.prototype.toString.call(body)
        }

        // 设置 content-type
        if (!this.headers.get('content-type')) {
            if (typeof body === 'string') {
                this.headers.set('content-type', 'text/plain;charset=UTF-8')
            } else if (Blob.prototype.isPrototypeOf(body) && body.type) {
                this.headers.set('content-type', body.type)
            } else if (URLSearchParams.prototype.isPrototypeOf(body)) {
                this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
            }
        }
    }

    // 调用时将 bodyUsed 设置为 true
    // 将 blob、urlsearchparmas 都按照 string 输出
    this.text = function() {
        const rejected = consumed(this)
        if (rejected) {
            return rejected
        }

        if (this._bodyBlob) {
            return readBlobAsText(this._bodyBlob)
        } else {
            return Promise.resolve(this._bodyText)
        }
    }
    // 同上，但是按照 blob 输出
    this.blob = function() {
        const rejected = consumed(this)
        if (rejected) {
            return rejected
        }

        if (this._bodyBlob) {
            return Promise.resolve(this._bodyBlob)
        } else {
            return Promise.resolve(new Blob([this._bodyText]))
        }
    }
    
    this.json = function() {
        return this.text().then(JSON.parse)
    }

    return this
}

// 将 Body 挂到 Request 和 Response 上
Body.call(Request.prototype)
Body.call(Response.prototype)

// 响应头构建方法, 类似 map 对象
function Headers(headers) {
    // headers 可能为数组、Headers 实例、对象
    this.map = {}
    if (headers instanceof Headers) {
        headers.forEach(header => {
            this.append(header, headers[header])
        }, this)
    } else if (Array.isArray(headers)) {
        headers.forEach(header => {
            this.append(header[0], header[1])
        }, this)
    } else if(headers) {
        Reflect.ownKeys(headers).forEach((header) => {
            this.append(header, headers[header])
        }, this)
    }
}

Headers.prototype.forEach = function(callback, thisArg) {
    const map = this.map
    for (let header in map) {
        callback.call(thisArg, map[header], header)
    }
}

function normalizeValue(v) {
    if (typeof v !== 'string') {
        v = String(v)
    }

    return v
}

Headers.prototype.append = function (name, value) {
    const n = normalizeValue(name)
    const v = normalizeValue(value)
    const oldValue = this.map[n]
    this.map[n] = oldValue ? oldValue + ',' + v : v
}

Headers.prototype.delete = function (name) {
    return delete this.map[normalizeValue(name)]
}

Headers.prototype.has = function (name) {
    return normalizeValue(name) in this.map
}

Headers.prototype.set = function (name, value) {
    const n = normalizeValue(name)
    const v = normalizeValue(value)
    this.map[n] = v
}

Headers.prototype.get = function (name) {
    return this.map[normalizeValue(name)]
}

Headers.prototype.keys = function () {
    const result = []
    for(let header in this.map) {
        result.push(header)
    }
    return result
}

Headers.prototype.values = function () {
    const result = []
    const map = this.map
    for(let header in map) {
        result.push(map[header])
    }
    return result
}
```

## AXIOS 实现

AXIOS 可以用来在浏览器和 NODE 端发起网络请求，这里我们实现请求主体以及拦截器和取消请求

1. 请求主体和上面封装的 Fetch 基本流程无大致区别

2. 拦截器其实就是在请求前后清空注册的回调函数

3. 取消请求可以用上面的 signal 或者配置 CancelToken 实例，CancelToken 就是对发布订阅的应用，与 Fetch 一样，都是在发布的时候调用 xhr.abort 方法

```javascript
// 拦截器
function InterceptorManager() {
    this.handlers = []
}

InterceptorManager.prototype.use = function (fulfilled, rejected, options) {
    this.handlers.push({
        fulfilled,
        rejected,
        synchronous: options ? options.synchronous : false
    })
}

function Axios(config) {
    this.defaults = config
    this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
    }
}

// 请求时实际执行的方法
Axios.prototype.request = function (configOrUrl, config) {
    if (typeof configOrUrl === 'string') {
        config = config || {}
        config.url = configOrUrl
    } else {
        config = config || {}
    }

    config = {...this.defaults, ...config}

    if (config.method) {
        config.method = config.method.toLowerCase()
    } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase()
    } else {
        config.method = 'get'
    }

    const requestInterceptorChain = []
    let synchronousInterceptor = true
    this.interceptor.request.forEach(interceptor => {
        const { fulfilled, rejected } = interceptor

        synchronousInterceptor = synchronousInterceptor && interceptor.synchronous

        requestInterceptorChain.unshift(fulfilled, rejected)
    })

    const responseInterceptorChain = []
    this.interceptor.response.forEach(interceptor => {
        const { fulfilled, rejected } = interceptor
        
        responseInterceptorChain.push(fulfilled, rejected)
    })

    let promise

    // 异步拦截器
    if (!synchronousInterceptor) {
        let requestChain = [dispatchRequest, undefined]

        requestChain = [...requestInterceptorChain, ...requestChain, ...responseInterceptorChain]
        promise = Promise.resolve(config)
        while(requestChain.length) {
            promise = promise.then(requestChain.shift(), requestChain.shift())
        }

        return promise
    }

    let newConfig = config
    while(requestInterceptorChain.length) {
        const fulfilled = requestInterceptorChain.shift()
        const rejected = requestInterceptorChain.shift()
        try {
            newConfig = fulfilled(newConfig)
        } catch(err) {
            rejected(err)
            break
        }
    }

    try {
        promise = dispatchRequest(newConfig)
    } catch(err) {
        return Promise.reject(err)
    }

    while(responseInterceptorChain.length) {
        promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift())
    }

    return promise
}

function handleTransform(fns, data, headers) {
    const context = defaults
    fns.forEach(fn => {
        data = fn.call(context, data, headers)
    })

    return data
}

function dispatchRequest(config) {
    config.headers = config.headers || {}
    // 转换请求体
    config.data = handleTransform(defaults.transformRequest, config.data, config.headers)

    return xhrAdapter(config)
            .then(response => {
                    response.data = handleTransform(defaults.transformResponse, response.data, response.headers)
                    return response
                }, 
                reason => Promise.reject(reason)
            )
}

function handleHeaders(headers) {
    const result = {}
    const headerArr = headers.trim().split('\r\n')
    headerArr.forEach(line => {
        const parts = line.split(': ')
        const name = parts.shift()
        const value = parts.join(': ')
        result[name] = value
    })
    return result
}

function xhrAdapter(config) {
    return new Promise((resolve, reject) => {
        const requestData = config.data || null
        const requestHeaders = config.headers

        let xhr = new XMLHttpRequest()
        xhr.open(config.method, config.url, true)
        xhr.timeout = config.timeout

        function handleLoadend() {
            if (!xhr) {
                return
            }

            const responseData = xhr.responseText || xhr.response
            const responseHeaders = handleHeaders(xhr.getAllResponseHeaders() || {})
            var response = {
                data: responseData,
                status: xhr.status,
                statusText: xhr.statusText,
                headers: responseHeaders,
                config: config,
            };

            if (config.validateStatus(xhr.status)) {
                resolve(response)
            } else {
                reject(new Error(`failed status: ${xhr.status}`))
            }

            xhr = null
        }

        function handleXHRFailed(message) {
            reject(new Error(message))
            xhr = null
        }

        if ('loadend' in xhr) {
            xhr.onloadend = handleLoadend
        } else {
            xhr.onreadystatechange = function () {
                if (xhr.status === 4) {
                    handleLoadend()
                }
            }
        }

        xhr.onabort = () => handleXHRFailed('xhr aborted')
        xhr.ontimeout = () => handleXHRFailed('xhr timeouted')
        xhr.onerror = () => handleXHRFailed('xhr error')

        if ('setRequestHeader' in xhr) {
            requestHeaders.forEach((header, name) => {
                xhr.setRequestHeader(name, header)
            })
        }

        if (config.withCredentials !== undefined) {
            xhr.withCredentials = !!config.withCredentials
        }

        if (config.cancelToken) {
            function onCanceled(cancel) {
                if (!xhr) {
                    return
                }

                reject(cancel || new Error('failed'))
                xhr.abort()
                xhr = null
            }

            config.cancelToken.subscribe(onCanceled)
        }

        if ((config.method === 'GET' || config.method === 'HEAD') && !!requestData) {
            handleXHRFailed(`${config.method} can not have data`)
        }

        xhr.send(requestData)
    })
}

function CancelToken (executor) {
    let resolvePromise
    this.promise = new Promise(resolve => {
        resolvePromise = resolve
    })
    let token = this
    this.promise.then(cancel => {
        if (!token._listener) {
            return
        }

        token._listener.forEach(listener => {
            listener(cancel)
        })
        token._listener = null
    })

    executor(message => {
        if (token.reason) return

        token.reason = new Error(`abort ${message}`)
        resolvePromise(token.reason)
    })
}

CancelToken.prototype.subscribe = function (listener) {
    if (this.reason) {
        listener(this.reason)
        return
    }

    if (this._listener) {
        this._listener.push(listener)
    } else {
        this._listener = [listener]
    }
}

CancelToken.source = function () {
    let cancel
    const token = new CancelToken(function (c) {
        cancel = c
    })
    return {
        token,
        cancel
    }
}

const defaults = {
    adapter: xhrAdapter,
    transformRequest: [function(data, headers) {
        // data 可能为 text、blob、urlsearchparams
        if (typeof data === 'string') {
            this.headers['Content-Type'] = 'text/plain;charset=utf-8'
        } else if (typeof data === 'object') {
            this.headers['Content-type'] = 'application/json'
            data = JSON.stringify(data)
        } else if (URLSearchParams.prototype.isPrototypeOf(data)) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'
            data = data.toString()
        } else if (Blob.prototype.isPrototypeOf(data)) {
            this.headers['Content-type'] = data.type
        }

        return data
    }],
    transformResponse: [function(data) {
        if (this.responseType === 'json') {
            data = JSON.parse(data)
        }

        return data
    }],
    timeout: 0,
    validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
    },
}

function bind(fn, thisArg) {
    return function() {
        const arr = new Array(arguments.length)
        for (let i = 0; i < arguments.length; i++) {
            arr[i] = arguments[i]
        }

        fn.apply(thisArg, arr)
    }
}

function extend(target, source, thisArg) {
    Object.keys(source).forEach(key => {
        const v = source[key]
        if (typeof v === 'function') {
            target[key] = v.bind(thisArg)
        } else {
            target[key] = v
        }
    })
}

function createInstance(defaultConfig) {
    const context = new Axios(defaultConfig)
    const instance = bind(Axios.prototype.request, context)
    // 继承原型和上下文属性及方法
    extend(instance, Axios.prototype, context)
    extend(instance, context)

    instance.create = function(config) {
        return createInstance({...defaults, ...config})
    }
    return instance
}

const axios = createInstance(defaults)
axios.CancelToken = CancelToken
```



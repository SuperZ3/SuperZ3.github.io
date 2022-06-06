# EventEmitter

EventEmitter 类实现了事件派发功能，fs、http 等模块都继承了该类，简单实现如下

```javascript
function EventEmitter(opts) {
  EventEmitter.init.call(this, opts);
}

EventEmitter.init(option) {
    this._events = ObjectCreate(null)
    this._eventsCount = 0
    this._maxListeners = this._maxListeners || undefined;
}

EventEmitter.prototype.on = function (type, listener, prepend) {
    let existing
    let events = this._events
    if (events === undefined) {
        events = this._events = Object.create(null)
        this._eventsCount = 0
    } else {
        // 触发 newListener
        if(target.newListener !== undefined) {
            // 像 once 事件，监听函数是 listener.listener 形式
            this.emit('newListener', type, listener.listener ?? listener)
            // newListener 事件可能改变 this._events
            events = this._events
        }

        existing = events[type]
    }
    
    if (existing === undefined) {
        events[type] = listener
        ++this._eventsCount
    } else {
        if (typeof existing === 'function') {
            events[type] = prepend ? [listener, existing] : [existing, listener]
        } else if (prepend) {
            existing.unshift(listener)
        } else {
            existing.push(listener)
        }
    }

    return this
}

EventEmitter.prototype.removeListener = function(type, listener) {
    const events = this._events
    if (events === undefined) {
        return this
    }

    const list = events[type]
    if (list === undefined) {
        return this
    }

    if (list === listener || list = listener.listener) {
        if (--this._eventsCount === 0) {
            // 只监听了一个事件
            this._events = Object.create(null)
        } else {
            delete events[type]
            if (events.removeListener) {
                this.emit('removeListener', type, listener.listener || listener)
            }
        }
    } else if (typeof list !== 'function') {
        let position = -1

        for (let i = list.lnegth - 1; i > 0; i--) {
            if (list[i] === listener) {
                position = i
                break
            }
        }

        if (position < 0) {
            return this
        }
        if (position === 0) {
            list.shift()
        } else {
            list.splice(position, 1)
        }

        if (list.length === 1) {
            events[type] = list[0]
        }

        if(events.removeListener !== undefined) {
            this.emit('removeListener', type, listener)
        }
    }
}

function addCatch(target, promise, type, args) {
    try {
        const then = promise.then

        if (typeof then === 'function') {
            then.call(promise, undefined, err => {
                process.nextTick(() => target.emit('error', err))
            })
        }
    } catch(err) {
        target.emit('error', err)
    }
}

EventEmitter.prototype.emit = function(type, ...args) {
    let doError = type === 'error'
    const events = this._events
    const handler = events[type]

    if (handler === undefined) return false

    if (typeof handler === 'function') {
        handler.apply(this, args)

        if (result !== undefined && result !== null) {
                addCatch(this, result, type, args)
            }
    } else {
        const len = handler.length
        for(let i = 0; i < len; i++) {
            const result = handler[i].apply(this, args)

            if (result !== undefined && result !== null) {
                addCatch(this, result, type, args)
            }
        }
    }

    return true
}

function onceWrapped(state) {
    if(!this.fired) {
        state.target.removeListener(this.type, this.wrapFn)
        this.fired = true
        this.listener.apply(this.target, arguments)
    }
}

function _onceWrap(target, type, listener) {
    const state = { fired: false, wrapFn: undefined, target, type, listener }
    const wrapped = onceWrapped.bind(state)
    wrapped.listener = listener
    state.wrapFn = wrapped
    return wrapped
}

EventEmitter.prototype.once = function(type, listener) {
    this.on(type, _onceWrap(this, type, listener))
    return this
}
```

可以看到 EventEmitter 就是一种发布订阅的实现

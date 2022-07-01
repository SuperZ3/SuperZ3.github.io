# 侦听器

Watch 接收一个回调函数，仅在数据 source 变化时执行回调函数，可以监听单一数据源也可以监听多个数据源

## 追踪数据变化

effect 函数可以响应数据的变化，用函数 getter 将 source 包裹起来放到 effect 中访问一下，就可以将 effect 收集到数据中（注意源码用的 ReactiveEffect 类，此处用 effect 简化处理）

source 可能为：
1. ref、array、function：在 getter 中访问对应的值或遍历 source或执行 source 收集 effect，
2. reactive：在 getter 中访问 source，同时设置 deep = true，每层属性都收集 effect

```javascript
// 访问对象的每个属性或值
function trverse(value, seen) {
    if (!isObject(value)) return value
    seen = seen || new Set()
    seen.add(value)
    if (isRef(value)) {
        traverse(value.value, seen)
    } else if (isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            traverse(value[i], seen)
        }
    } else if (isSet(value) || isMap(value)) {
        value.forEach((v: any) => {
            traverse(v, seen)
        })
    } else if (isPlainObject(value)) {
        for (const key in value) {
            traverse((value as any)[key], seen)
        }
    }
    return value
}
function watch(source, cb, { immediate, deep, flush }) {
    const instance = currentInstance
    let getter
    // source: ref、reactive、array、function
    if (isRef(source)) {
        getter = () => source.value
    } else if (isReactive(source)) {
        getter = () => source
    } else if (isArray(source)) {
        getter = () => {
            source.map(s => {
                if (isRef(s)) {
                    return s.value
                } else if (isReactive(s)) {
                    return traverse(s)
                } else if (isFunction(s)) {
                    return s()
                }
            })
        }
    } else if (isFunction(source)) {
        getter = () => source()
    }

    if (cb && deep) {
        const baseGetter = getter
        getter = () => trverse(baseGetter())
    }

    const effect = effect(getter, {
        lazy: true,
        scheduler
    })
}
```

## 响应数据变化

当数据 source 发生变化就会调用 scheduler，此时需要重新计算新的值，通过新老值的对比来判断能否调用 cb

对于 reactive 对象，进入 scheduler 时说明有属性的更新，此时不能通过判断前后两次值不相等来调用 cb，因为监控的是 reactive 对象不是属性，用 deep 来强制 cb 执行

对于数组也是如此，如果内部有 reactive 对象元素，当它发生改变时也要强制 cb 执行。如果内部有 ref 对象，需要循环数组来对比 ref 的值

```javascript
let isMultiSource = false
let forceTrigger = false
// if (isReactive(source)) {
//     deep = true
// } else if (isArray(source)) {
//     isMultiSource = true
//     forceTrigger = source.some(isReactive)
// }
let oldValue = isMultiSource ? [] : {}
const job = () => {
    if (cb) {
        const newValue = effect()
        if (
            deep ||
            forceTrigger ||
            (isMultiSource 
                ? newValue.some((s, i) => hasChanged(s, oldValue[i])) 
                : hasChanged(newValue, oldValue))
        ) {
            cb(newValue, oldValue)
            oldValue = newValue
        }
    }
}
```

## 优化更新频率

同前面讲的一样，不能直接将 job 赋给 scheduler，否则频繁更新浪费性能，这里同样将 job 推入一个队列中统一执行

watcher 需要在 render 之前执行

```javascript
let scheduler = () => queuePreFlushCb(job)

// 以下函数不属于 watch api，参见前面组件创建的文章
let pendingPreFlushCbs = []
let preFlushIndex = 0
function queuePreFlushCb(cb: SchedulerJob) {
  queueCb(cb, pendingPreFlushCbs, preFlushIndex)
}

function flushJobs(seen) {
  flushPreFlushCbs(seen)
  // queue.sort ...
}
```

## 存储上一次的值 & 添加清理

如果传入了 immediate 需要立即执行一次 cb 也即 job，否则的话应该调用 getter 函数得到初始值以便于下次对比

```javascript
if (cb) {
    if (immediate) {
        job()
    } else {
        oldValue = getter()
    }
}
```

还记得之前讲的依赖和副作用的双向收集吗？在执行 `effect(cb)` 的回调 cb 之前，会调用 cleanupEffect，将 effect 从所有收集它的属性中删除，所以此处只需要给我们的 effect 添加一个 stop 方法，内部执行 cleanupEffect 即可

然后让 watch 返回一个清理函数，终极版 watch 就完成啦

```javascript
function watch() {
    // other code
    return () => {
        effect.stop()
    }
}
function effect(fn) {
    // other code
    _effect.stop = function() {
        cleanupEffect(this)
    }
    // const runner = _effect.bind(_effect)
}
```
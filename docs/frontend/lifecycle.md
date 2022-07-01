# 生命周期钩子 Composition

Vue 3 采用 Composition API 的方式组织代码，在 setup 函数中调用相应 API 方法如 onMounted、onBeforeUpdate 即可注册生命周期函数

前面讲了组件挂载和更新流程，这里实现 onBeforeMount、onMounted、onBeforeUpdated、onUpdated 四个钩子

在 setup 执行时会执行钩子函数，此时可以收集回调函数保存在 instance 中，这样执行钩子函数时就可以拿到实例

```javascript
let currentInstance = null
function getCurrentInstance() {
    return currentInstance
}
function setCurrentInstance(v) {
    currentInstance = v
}
function setupStatefulComponent(instance) {
    if (setup) {
        // other code
        getCurrentInstance(instance)
        pauseTracking()
        const setupResult = setup(instance.props, setupContext)
        resetTracking()
        setCurrentInstance(null)
    }
}
```

上面执行 setup 前设置了 currentInstance，所以 `onBeforeMount(cb)` 如果直接将 cb 放到 instance 上会有问题：当 cb 执行时如果内部使用了 instance，指向可能出错，所以需要将 cb 包裹后在放到 instance 上

```javascript
const enum LifecycleHooks {
  BEFORE_CREATE = 'bc',
  CREATED = 'c',
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
  BEFORE_UPDATE = 'bu',
  UPDATED = 'u',
  BEFORE_UNMOUNT = 'bum',
  UNMOUNTED = 'um',
  DEACTIVATED = 'da',
  ACTIVATED = 'a',
  RENDER_TRIGGERED = 'rtg',
  RENDER_TRACKED = 'rtc',
  ERROR_CAPTURED = 'ec',
  SERVER_PREFETCH = 'sp'
}
const injectHook = (type, hook, target) => {
    if (target) {
        const hooks = target[type] || (target[type] = [])
        const wrappedHook = () => {
            if (target.isUnMounted) return
            pauseTracking()
            setCurrentInstance(target)
            const res = hook()
            setCurrentInstance(null)
            resetTracking()
            return res
        }
        hooks.push(wrappedHook)
        return wrappedHook
    }
}

const createHook = lifeCycle => 
                        (hook, target = currentInstance) => 
                            injectHook(lifecycle, hook, target)

const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)
const onMounted = createHook(LifecycleHooks.MOUNTED)
const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE)
const onUpdated = createHook(LifecycleHooks.UPDATED)
```

接下来在对应位置执行生命周期函数，注意 updated 和 mounted 钩子，前面讲过 `instance.render` 会放到队列 queue 中，在微任务队列中统一执行，所以这里同样要将钩子的回调放到一个队列中，在 job 后清理

```javascript
const invokeArrayFns = (fns, arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg)
  }
}
const componentUpdateFn = () => {
    if (!instance.isMounted) {
        const { bm, m } = instance
        if (bm) {
            invokeArrayFns(bm)
        }
        // const subTree = ...
        // initialVNode.el = subTree.el
        if (m) {
            queuePostFlushCb(m)
        }
        // instance.isMounted = true
    } else {
        const { bu, u } = instance
        if (bu) {
          invokeArrayFns(bu)
        }
        // const nextTree = instance.render.call(proxyToUse, proxyToUse)
        // patch(prevTree, nextTree, hostParentNode(prevTree.el))
        if (u) {
          queuePostFlushCb(u)
        }
    }
}
const pendingPostFlushCbs = []
let postFlushIndex = 0
function queuePostFlushCb(cb) {
    queue(cb, pendingPostFlushCbs, postFlushIndex)
}
function queue(cb, pendingQueue, index) {
    pendingQueue.push(...cb)
    queueFlush()
}

function flushJobs() {
    try { /*...*/} finally {
        flushPostFlushCbs(seen)
        isFlushing = false
    }
}
function flushPostFlushCbs(seen) {
    if (pendingPostFlushCbs.length) {
        pendingPostFlushCbs.sort((a, b) => getId(a) - getId(b))
        pendingPostFlushCbs.forEach(cb => cb())
        postFlushIndex = 0
    }
}
```


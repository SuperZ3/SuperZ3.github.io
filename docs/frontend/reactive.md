# 响应式基础

## 1. reactive、effect

reactive 用来将对象转换为响应式的，所谓响应式，即是在对象属性发生变化时得到通知，从而完成某些操作

。。。。。。长文预警。。。。。。

### 1.1 属性拦截

这在 Vue2 中通过 defineProperty，在 Vue3 中通过 Proxy 实现的，实现方式都是在访问属性时收集需要执行的操作，在属性发生变化时，取出收集的操作依次执行

```javascript
const reactiveMap = new WeakMap()
const isObject = (o) => (o !== null && typeof o === 'object')
const hasOwn = (target, key) => Object.hasOwn(target, key)
function reactive(target) {
    return createReactiveObject(target, reactiveMap)
}
function createGetter() {
    return function get(target, key, receiver) {
        const res = Reflect.get(target, key, receiver)
        track(target, key)
        if (isObject(res)) {
            return reactive(res)
        }
        return res
    }
}
function createSetter() {
    return function set(target, key, value, receiver) {
        const oldValue = target[key]
        const result = Reflect.set(target, key, value, receiver)
        if (oldValue !== value) {
            trigger(target, key, value, oldValue)
        }
        return result
    }
}
function deleteProperty(target, key) {
    const hadKey = hasOwn(target, key)
    const oldValue = target[key]
    const result = Reflect.deleteProperty(target, key)
    if (result && hadKey) {
        trigger(target, key, undefined, oldValue)
    }
    return result
}
const get = createGetter()
const set = createSetter()
const reactiveHandlers = {
    get,
    set,
    deleteProperty
}
function createReactiveObject(target, proxyMap) {
    if (!isObject(target)) return target

    const existing = proxyMap.get(target)
    if (existing) return existing

    const proxy = new Proxy(target, reactiveHandlers)
    proxyMap.set(target, proxy)
    return proxy
}
```

### 1.2 依赖收集 & 副作用 effect

上述代码实现了属性的追踪，接下来考虑下依赖的收集（track）和触发（trigger），同时实现 effect，对属性变化做出反应

+ effect(callback)：
    - 将回调函数 callback，收集到其内部使用的属性对应的 dep 中
    - effect 可能会有嵌套情况，需要保存上一层 effect，在当前层执行完后，继续执行上层
    - 在每次 track 前要执行必要的清理，否则会重复添加相同的 effect

```javascript
const targetMap = new WeakMap()
let activeEffect
function track(target, key) {
    if (activeEffect) {
        let depsMap = targetMap.get(target)
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()))
        }
        let dep = depsMap.get(key)
        if (!dep) {
            depsMap.set(key, (dep = new Set()))
        }
        if (!dep.has(activeEffect)) {
            // 做双向收集，方便后续清理 dep
            dep.add(activeEffect)
            activeEffect.deps.push(dep)
        }
    }
}
function trigger(target, key, newValue, oldValue) {
    const depsMap = targetMap.get(target)
    if (!depsMap) return

    const effects = new Set()
    const deps = depsMap.get(key)
    for (const dep of deps) {
      if (dep) {
        effects.add(dep)
      }
    }
    effects.forEach(effect => effect())
}

function cleanupEffect(target) {
    const { deps } = target
    // 双向清空
    if (deps?.length) {
        deps.forEach(dep => {
            dep.delete(target)
        })
        deps.length = 0
    }
}
function effect(fn, options = null) {
    const _effect = function () {
        this.deps = []
        let parent = undefined
        try {
            parent = activeEffect
            activeEffect = this
            cleanupEffect(this)
            return fn()
        } finally {
            activeEffect = parent
            parent = undefined
        }
    }

    if (options) {
        _effect.options = options
    }
    const runner = _effect.bind(_effect)
    
    if (!options || !options.lazy) {
        runner()
    }
    return runner
}
```

注意，这里使用的是函数形式的 _effect 包裹 fn，源码中将此段逻辑封装到了[类](https://github.com/vuejs/core/blob/main/packages/reactivity/src/effect.ts#L178)里

### 1.3 处理数组

接下来考虑对数组的处理，考虑下面的情况，当添加没有使用过的数组项时，需要触发副作用，但是，由于没有使用过，所以副作用并不会被新的索引收集

```javascript
const obj = [1,2]
const p = reactive(obj) 
effect(() => {
    console.log(`p ${p}`)
})
setTimeout(() => {
    p[100] = 10
}, 1000)
// 报错，trigger 时，索引 100 的依赖是 undefined
```

对之前的代码做下改造，增加对数组的处理，注意几点：

1. 当在 effect 中使用 push 等方法时，需要暂停依赖收集，因为 push 同时会访问 length 属性，导致 effect 死循环
2. 数组新增项目时，新增索引没有依赖，此时可以触发 length 依赖代替该索引的依赖

从 createGetter 开始，处理数组

```javascript
const enum TriggerOpTypes {
  SET = 'set',
  ADD = 'add',
  DELETE = 'delete',
  CLEAR = 'clear'
}

let shouldTrack = true
const trackStack = []

const isArray = (obj) => Object.prototype.toString.call(obj) === '[object Array]'
const isIntegerKey = (key) => (typeof key === 'string' && '' + parseInt(key, 10) === key)
const arrayInstrumentations = createArrayInstrumentations()

fuction createGetter(target, key) {
    return function get(target, key, receiver) {
        // other code
        if (isArray(target) && hasOwn(arrayInstrumentations, key)) {
            return Reflect.get(arrayInstrumentations, key, receiver)
        }
        // other code
        return res
    }
}
function createArrayInstrumentations() {
    const instrumentations = {}
    ;['pop', 'shift', 'unshift', 'push', 'splice'].forEach(key => {
        instrumentations[key] = function(...args) {
            // issue #2137，如果在 effect 中用 push，length 改变会导致循环调用 effect
            pauseTracking()
            const res = this[key].apply(this, args)
            resetTracking()
            return res
        }
    })
    return instrumentations
}
function pauseTracking() {
    trackStack.push(shouldTrack)
    shouldTrack = false
}
function resetTracking() {
    const last = trackStack.pop()
    shouldTrack = last === undefined ? true : last 
}
function track(target, key) {
    if (shouldTrack && activeEffect) {
        // other code
    }
}
function createSetter() {
    return function set(target, key, value, receiver) {
        // other code
        const hadKey = 
            isArray(target) && isIntegerKey(key) ?
                Number(key) < target.length :
                hasOwn(target, key)
        // const result = ....
        if (!hadKey) {
            trigger(target, TriggerOpTypes.ADD, key, value)
        } else if (value !== oldValue) {
            trigger(target, TriggerOpTypes.SET, key, value, oldValue)
        }
        return result
    }
}
function trigger(target, type, key, newValue, oldValue) {
    const depsMap = targetMap.get(target)
    if (!depsMap) return
    const effects = new Set()
    const deps = []
    if (key === 'length' && isArray(target)) {
        depsMap.forEach((dep, key) => {
            // length 修改后的值小于某一个索引，相当于删除，要触发对应索引的依赖
            if (key === 'length' || key > newValue) {
                deps.push(dep)
            }
        })
    } else {
        if (key !== undefined) {
            deps.push(depsMap.get(key))
        }
        switch(type) {
            case TriggerOpTypes.ADD:
                if (isIntegerKey(key)) {
                    // 新增项目会导致 length 变化
                    deps.push(depsMap.get('length'))
                }
                break
            case TriggerOpTypes.SET:
                break
        }
    }
    deps.forEach(dep => {
        if (!!dep) {
            effects.add(...dep)
        }
    })
    effects.forEach(effect => effect())
}
```

### 1.4 其它响应式 API

接下来处理下其它响应式 API：

1. readonly：只读不可更改，也就不需要追踪副作用
2. shallowReactive：仅第一层做响应式处理
3. shallowReadonly：仅第一层不可更改

注意，嵌套的方式生成响应式对象需要特殊处理，假设有响应对象 `const r = readonly({})`：

1. 形如 `reactive(r)`，应该直接返回内部的响应式对象 r
2. 如果是 `readonly(r)`，应该返回内部响应式对象 r 的只读代理

```javascript
function createReactiveObject(target, isReadonly, baseHandlers, proxyMap) {
    // other code
    if (
        target[Reactiveflags.IS_RAW] && 
        !(isReadonly && target[Reactiveflags.IS_REACTIVE]) // Reactiveflags 见下文
    ) {
        return target
    }
    // other code
}
function createGetter(isReadonly = false, isShallow = false) {
    return get(target, key, receiver) {
        if (!isReadonly && isArray(target) && hasOwn(arrayInstrumentations, key)) {
            // return Reflect.get(...)
        }
        // const res = ....
        if (!isReadonly) {
            // track(...)
        }
        if (isShallow) {
            return res
        }
        if (isObject(target)) {
            return isReadonly ? readonly(res) : reactive(res)
        }
        return res
    }
}
const readonlyHandlers = {
    get: createGetter(true),
    set(target, key) {
        console.warn('can not set readonly')
        return true
    },
    deleteProperty(target, key) {
        console.warn('can not set readonly')
        return true
    }
}
const shallowReactiveHandlers = Object.assign(reactiveHandlers, {
    get: createGetter(false, true)
})
const shallowReadonlyHandlers = Object.assign(readonlyHandlers, {
    get: createGetter(true, true)
})
function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers, readonlyMap)
}
function shallowReactive(target) {
    return createReactiveObject(target, false, shallowReactiveHandlers, shallowReactiveMap)
}
function shallowReadonly(target) {
    return createReactiveObject(target, true, shallowReadonlyHandlers, shallowReadonlyMap)
}
```

接下来增加工具函数，toRaw、isReactive、isReadonly、markRaw，为此需要处理下 createGetter 函数：

- 对于 is 函数，可以访问一个特殊属性，如果是响应式的，则访问操作会被拦截，存在特殊属性则说明是响应式对象
- 对于 toRaw 为了获取原始对象，同样可以用一个特殊属性，如果检测到该属性存在，就把 createGetter 接收的原始对象参数返回
- 对于 markRaw 需要在对象上设置特殊属性告诉 createReactiveObject 不对其做响应式处理

```javascript
const enum ReactiveFlags = {
    SKIP = '__v_skip',
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly',
    IS_SHALLOW = '__v_isShallow',
    RAW = '__v_raw'
}
function createGetter(isReadonly = false, isShallow = false) {
    return get(target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactiveFlags.IS_REACTIVE) {
            return isReadonly
        } else if (key === ReactiveFlags.IS_SHALLOW) {
            return isShallow
        } else if (
            key === ReactiveFlags.RAW &&
            receiver === (
                isReadonly
                    ? isShallow
                        ? shallowReadonlyMap
                        : readonlyMap
                    : isShallow
                        ? shallowReacitveMap
                        : reactiveMap
            ).get(target)
        ) {
            return target
        }
        // other code
    }
}
// const v = readonly(reactive({})) -> isReactive(v) === true
function isReactive(v) {
    if (isReadonly(v)) {
        return isReactive(v[ReactiveFlags.RAW])
    }
    return !!(v && v[ReactiveFlags.IS_REACTIVE])
}
function isReadonly(v) {
    return !!(v && v[ReactiveFlags.IS_READONLY])
}
function isShallow(v) {
    return !!(v && v[ReactiveFlags.IS_SHALLOW])
}
function toRaw(o) {
    const raw = o[ReactiveFlags.RAW]
    return raw ? toRaw(raw) : raw
}
function createReactiveObject(target, isReadonly, baseHandlers, proxyMap) {
    // other code
    if (target[ReactiveFlags.RAW]) {
        return target
    }
}
function markRaw(v) {
    Object.defineProperty(v, ReactiveFlags.SKIP, { value: true })
    return v
}
```

## 2. refs

### 2.1 ref、toRef、toRefs

ref 接受一个值 v，返回一个响应式对象，并将 v 赋给该对象的 value 属性：

1. 响应式对象有唯一属性 value，所以要在访问 value 时收集依赖，设置时触发
2. 如果 v 是一个值，将其赋给 value 即可，如果是对象，将对象变为响应式再赋给 value

```javascript
function ref(v) {
    return createRef(v)
}
const isRef = v => !!v?.__v_isRef
const toReactive = v => (isObject(v) ? reactive(v) : v)
function createRef(v) {
    if (isRef(v)) {
        return v
    }
    return new RefImpl(v)
}
class RefImpl {
    public readonly __v_isRef = true
    constructor(v) {
        this._value = toReactive(v)
    }
    get value() {
        track(this, 'value')
        return this._value
    }
    set value(newValue) {
        const oldValue = this._value
        if (oldValue !== newValue) {
            trigger(this, TriggerOpTypes.SET, 'value', newValue, oldValue)
            this._value = toReactive(newValue)
        }
    }
}
```

toRef 为响应式对象上某个属性创建 ref 对象，通过该对象与源属性保持连接，相当于对源属性添加一层代理

这样读取或设置 ref.value 时，会直接操作响应式对象

```javascript
function toRef(target, key, defaultValue = undefined) {
    const v = target[key]
    return isRef(v) ? v : new ObjectRefImpl(target, key, defaultValue)
}
class ObjectRefImpl {
    public readonly __v_isRef = true
    constructor(public target, public key, public defaultValue) {}
    get value() {
        const v = this.target[this.key]
        return v === undefined ? defaultValue : v
    }
    set value(newValue) {
        this.target[this.key] = newValue
    }
}
```

toRefs 将响应式对象转化为普通对象返回，新对象每个属性都是指向源对象对应属性的 ref，这对于解构响应式对象属性有用

```javascript
// const r = reactive({
//     a: 1,
//     b: 2
// })
// const { a, b } = r // 直接解构将失去响应性，这里直接把对应的值赋给了 a、b
// const { a, b } = toRefs(r) // 使用 a.value、b.value，不会丢失响应性
function toRefs(target) {
    const result = isArray(target) ? [] : {}
    for (let key in target) {
        const v = target[key]
        result[key] = toRef(target, key, v)
    }
    return result
}
```

### 2.2 传递 ref 到 reactive

将 ref 赋给 reactive 的属性时，将自动解包 ref，表现为 reactive 的属性与 ref.value 是关联的，同时改变，可以在 createGetter、createSetter 中访问和设置 ref.value 即可将他们关联到一起

在数组中的 ref 项不需要解包

```javascript
function createGetter(isReadonly = false, isShallow = false) {
    return get(target, key, receiver) {
        // const res = ....
        if (isRef(res)) {
            const shouldUnRef = !isArray(target) || !isIntegerKey(key)
            return shouldUnRef ? res.value : res
        }
        // other code
    }
}
function createSetter() {
    return function set(target, key, value, receiver) {
        // const oldValue = target[key]
        if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
            oldValue.value = value
            return true
        }
    }
}
```

## 3. computed

computed 接收一个 getter 函数，返回不可变的响应式 ref 对象，或者接收一个带有 get、set 函数的对象，返回可写 ref 对象

1. 返回一个 ref 对象

2. 访问 ref.value 时，返回 getter 函数执行结果
    - 由于 getter 内部依赖的数据 x 变更时，getter 应再次执行，所以要把 getter 放到 effect 中

3. 当 x 不变时，多次访问 ref.value 应返回相同结果，即 computed 具有缓存值的特性
    - 我们设置一个 flag，当 flag === true 时就执行 effect 返回的 runner 函数，将得到值赋给 ref.value，然后令 flag = false，这样 x 不变而多次访问 ref.value 就不会执行 effect

    - 当 x 改变时，再次访问 ref.value 应该得到新的值，所以我们要在 x 改变时令 flag === true，改造下 effect 增加 scheduler，在 scheduler 内改变 flag

4. ref 是响应式对象，所以要在访问 ref.value 时收集依赖，在 scheduler 中触发依赖

```javascript
function effect(fn) {
    this.deps = []
    // const _effect = ...
    if (options) {
        _effect.options = options
    }
    const runner = _effect.bind(_effect)
    // if (!options || !options.lazy) ....
    return runner
}
function trigger(target, type, key, newValue, oldValue) {
    // other code
    effect.forEach(effect => {
        if (effect.options.scheduler) {
            effect.options.scheduler(effect)
        } else {
            effect()
        }
    })
}
function computed(fnOrObj) {
    let getter
    let setter
    if (typeof fnOrObj === 'function') {
        getter = fnOrObj
        setter = () => console.warn('can not set')
    } else {
        getter = fnOrObj.get
        setter = fnOrObj.set
    }
    return new ComputedRefImpl(getter, setter)
}
class ComputedRefImpl {
    public _dirty = true
    constructor(getter, public setter) {
        this._value = undefined
        this._effect = effect(
            getter, 
            {
                lazy: true,
                scheduler: () => {
                    if (!this._dirty) {
                        this._dirty = true
                        trigger(this, TriggerOpTypes.SET, 'value' )
                    }
                }
            }
        )
    }
    get value() {
        if (this._dirty) {
            this._value = this._effect()
            this._dirty = false
        }
        track(this, 'value')
        return this._value
    }
    set value(v) {
        this.setter(v)
    }
}
```

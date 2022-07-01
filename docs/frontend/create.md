# 组件创建及更新

vue 做的主要工作是将 template 模板或者 h 函数创建的视图插入到页面相应的位置，在数据更新时通知视图更新

## 1. 创建应用实例 app

使用 vue3 时首先通过 createApp 创建一个应用实例，调用 `app.mount(container)` 将组件插入 container 的位置

app 通过 createRenderer 创建，该方法可以针对不同平台创建不同渲染器，传入 rendererOptions 就可以创建针对 dom 操作的渲染器

```javascript
function patchEvent(el, key, prevValue, nextValue) {
    const invokers = el._vei || (el._vel = {})
    const existing = invokers[key]
    if (nextValue && existing) {
        existing.value = nextValue
    } else {
        if (nextValue) {
            const invoker = invokers[key] = (() => {
                const invoker = (e) => {
                    invoker.value(e)
                }
                invoker.value = nextValue
                return invoker
            })()
            el.addEventListener(key, invoker)
        } else {
            el.removeEventListener(key, nextValue, existing)
        }
    }
}
const patchProp = (el, key, preValue, nextValue) => {
    if (key === 'class') {
        el.className = nextValue
    } else if (key === 'style') {
        for (const key in nextValue) {
            el.style[key] = nextValue[key]
        }
    } else if (key.startsWith('on')) {
        key = key.slice(2).toLowerCase()
        patchEvent(el, key, prevValue, nextValue)
    } else {
        el[key] = value
    }
}
const nodOpts = {
    insert(child, parent, referenceNode) {
        parent.insertBefore(child, referenceNode)
    },
    remove(child) {
        const parent = child.parentNode
        if (parent) {
            parent.removeChild(child)
        }
    },
    createElement: tag => document.createElement(tag),
    createText: content => document.createTextNode(content),
    setText: (node, content) => node.nodeValue = content,
    setElementText: (el, content) => el.textContent = content,
    parentNode: node => node.parentNode,
    nextSibling: node => node.nextSibling,
    querySelector: selector => document.querySlector(selector),
    cloneNode: el => el.cloneNode(true)
}
let renderer
const rendererOptions = Object.assign({patchProp}, nodeOpts)
function ensureRenderer() {
    return renderer || createRenderer(rendererOptions)
}
// createApp 接收一个 rootComponent 和 rootProp
function createApp(...args) {
    const app = ensureRenderer().createApp(...args)
    const { mount } = app
    app.mount = (container) => {
        container = typeof container === 'string' 
            ? querySelector(container) 
            : container
        container.innerHTML = ''
        mount(container, false)
    }
    return app
}
```

接下来通过 createRenderer 创建渲染器，返回一个包含 createApp、render 方法的对象：

1. render 为渲染方法，用于将 vnode 转化成真实 dom 节点插入 container 中
2. createApp 创建应用实例，接收根组件、根属性，返回的实例包括 mixin、use、mount 等方法

```javascript
let uid = 0
let isMounted = false
function createAppAPI(render) {
    return function createApp(rootComponent, rootProps) {
        const app = {
            _uid: uid++,
            _component: rootComponent,
            _props: rootProp,
            _instance: null,
            _container: null,
            // 生成 vnode 交给 render 挂载
            mount(container) {
                if (!isMounted) {
                    const vnode = createVNode(rootComponent, rootProps)
                    render(vnode, container)
                    isMounted = true
                    app._container = container
                }
            }
        }
        return app
    }
}
function createRenderer(options) {
    const {
        insert: hostInsert,
        remove: hostRemove,
        createElement: hostCreateElement,
        createText: hostCreateText,
        setText: hostSetText,
        setElementText: hostSetElementText,
        parentNode: hostParentNode,
        nextSibling: hostNextSibling,
        cloneNode: hostCloneNode,
        patchProp: hostPatchProps
    } = options
    // 将 vnode 转化成真实 dom 挂到 container 上
    const render = (vnode, container) => {}
    return {
        render,
        createApp: createAppAPI(render)
    }
}
```

## 2. 创建 vnode
 
从根组件开始创建 vnode，接收的 rootComponent 的类型可能为组件、函数组件或字符串，返回的 vnode 是一个包含节点类型、属性、子节点等属性的对象

```javascript
const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 1 << 1,
  STATEFUL_COMPONENT = 1 << 2,
  TEXT_CHILDREN = 1 << 3,
  ARRAY_CHILDREN = 1 << 4,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}
function createVNode(type, props = null, children = null) {
    const shapeFlag = isString(type)
        ? ShapeFlags.ELEMENT
            : isObject(type)
                ? ShapeFlags.STATEFUL_COMPONENT
                    : isFunction(type)
                        ? ShapeFlags.FUNCTIONAL_COMPONENT
                            : 0

    return createBaseVNode(
        type,
        props,
        shapeFlag,
        children
    )
}
function createBaseVNode(type, props, shapeFlag, children) {
    const vnode = {
        __v_isVNode: true,
        type,
        props,
        key: props && props.key,
        children,
        component: null,
        el: null,
        shapeFlag,
    }
    normalization(vnode, children)
    return vnode
}
function normalization(vnode, children) {
    let type = 0 // 标志子节点类型
    if (children === null) {
        vnode.children = null
    } else if (isArray(children)) {
        type = ShapeFlags.ARRAY_CHILDREN
    } else {
        type = ShapeFlags.TEXT_CHILDREN
    }
    // 标志节点和子节点类型
    vnode.shapeFlag |= type
}
```

## 3. 渲染方法 render

有了 vnode 就可以调用 render 方法渲染，根据不同的 vnode 类型，调用相应的 processX 方法完成最终的挂载

假设上面的 rootComponent 是一个组件，则在此阶段调用 processComponent 进行挂载

挂载流程或者说组件初次渲染可以看作旧的 vnode 节点是 null 的更新过程，所以 render 根据新的 vnode 节点更新旧的 vnode 节点，然后再创建相应元素插入页面

```javascript
function createRenderer(options) {
    const processComponent = (n1, n2, container) => {
        if (n1 === null) {
            // 初始渲染流程
            mountComponent(n2, container)
        } else {
            // 更新流程
        }
    }
    const patch = (n1, n2, container) => {
        if (n1 === n2) {
            return
        }
        const { type, ref, shapeFlag } = n2
        if (shapeFlag & ShapeFlags.ELEMENT) {
            // type 是元素
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
            // type 是组件
            processComponent(n1, n2, container)
        }
    }
    // 将 vnode 转化成真实 dom 挂到 container 上
    const render = (vnode, container) => {
        patch(container._vnode || null, vnode, container)
        container._vnode = vnode 
    }
    return {
        render,
        createApp: createAppAPI(render)
    }
}
```

## 4. h 函数

在执行继续之前，先介绍下 h 函数，它通过封装 createVNode 来创建 vnode

在组件的 render 方法内，通常调用 h 函数来创建组件最终需要渲染的内容

```javascript
// 调用 h 的几种方式：
// 1. h(type)
// 2. h(type, { props: {...} })
// 3. h(type, [ h(type), ...] )
// 4. h(type, { props: {...} }, [ h(type), ... ])
// 5. h(type, Component)
// 其中 type 可能为：
// a. div、h 等标签名
// b. 组件 Component
// c. 函数式组件
function h(type, propsOrChildren = undefined, children = undefined) {
    const l = arguments.length
    if (l === 2) {
        if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
            if (isVNode(propsOrChildren)) {
                return createVNode(type, null, [propsOrChildren])
            }
            // 属性
            return createVNode(type, propsOrChildren)
        } else {
            // children
            return createVNode(type, null, propsOrChildren)
        }
    } else {
        if (l > 3) {
            children = Array.prototype.slice.call(arguments, 2)
        } else {
            if (l === 3 && isVNode(children)) {
                children = [children]
            }
        }
        return createVNode(type, propsOrChildren, children)
    }
}
```

## 5. 挂载组件 component

对组件的挂载主要在 mountComponent 方法中进行，首先处理组件实例，设置后面要用到的属性和方法，为挂载做准备：

1. 根据 vnode 创建组件实例 instance，添加 uid、props、render 等属性

2. 向 instance 添加 props、slots 等属性，设置 instance.render 为用户传入组件的 setup 函数返回值，或者组件的 render 方法

3. 执行第 2 步得到的 instance.render 函数开始挂载流程

```javascript
let uid = 0 // 这里的 uid 跟上面的不在同一个文件
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { ctx, setupState, props } = instance
        if (key[0] !== '$') {
            if (hasOwn(setupState, key)) {
                return setupState[key]
            } else if (hasOwn(data, key)) {
                return data[key]
            } else if (hasOwn(props, key)) {
                return props[key]
            } else if (hasOwn(ctx, key)) {
                return ctx[key]
            }
        }
    },
    set({ _: instance }, key, value) {
        const { ctx, setupState, props } = instance
        if (hasOwn(setupState, key)) {
            setupState[key] = value
            return true
        } else if (hasOwn(data, key)) {
            data[key] = value
            return true
        } else if (hasOwn(props, key)) {
            console.warn('props can not set')
            return false
        } else if (hasOwn(ctx, key)) {
            ctx[key] = value
            return true
        }
    }
}
function createRenderer(options) {
    // other code
    const mountComponent = (initialVNode, container) => {
        // 1. 创建组件实例
        const instance = initialVNode?.component || 
            (initialVNode.component = createComponentInstance(initialVNode))
        // 2. 处理 prop、slots、调用 setup、初始化 render
        setupComponent(instance)
        // 3. 执行 instance.render
        setupRenderEffect(
            instance,
            initialVNode,
            container,
        )
    }
    function createComponentInstance(vnode) {
        const instance = {
            uid: uid++,
            vnode,
            type: vnode.type,
            ctx: {},
            props: {},
            attrs: {},
            setupState: {},
            render: null,
            isMounted: false
        }
        instance.ctx = { _: instance }
        return instance
    }
    function setupComponent(instance) {
        const { props, children } = instance.vnode
        // 判断是否是状态组件
        const isStateful = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
        instance.props = props
        const setupResult = isStateful
            ? setupStatefulComponent(instance)
            : undefined

        return setupResult
    }
    function setupStatefulComponent(instance) {
        const Component = instance.type
        const { setup } = Component
        // 定义 render 中用的 proxy
        instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers)
        if (setup) {
            // 定义上下文传给 setup
            const setupContext = instance.setupContext = createSetupContext(instance)
            pauseTracking()
            const setupResult = setup(instance.props, setupContext)
            resetTracking()
            // 可能返回状态或者渲染函数
            handleSetupResult(instance, setupResult)
        } else {
            // 定义 proxy 传给 render
            finishComponentSetup(instance)
        }
    }
}
function createSetupContext(instance) {
    const expose = exposed => {
        instance.exposed = exposed || {}
    }
    return {
        get attrs() {
            return attrs || (attrs = new Proxy(instance.attrs, { 
                get(target,key) {
                    track(instance, '$attrs')
                    return target[key]
                }
            }))
        },
        slots: instance.slots,
        emit: instance.emit,
        expose
    }
}
function handleSetupResult(instance, setupResult) {
    if (isFunction(setupResult)) {
        // setup 返回函数，赋给 instance.render
        instance.render = setupResult
    } else if (isObject(setupResult)) {
        // setup 返回对象，说明是状态
        instance.setupState = setupResult
    }
    finishComponentSetup(instance)
}
function finishComponentSetup(instance) {
    const Component = instance.type
    // setup 返回状态时，采用用户定义的 render 函数 
    if(!instance.render) {
        instance.render = Component.render || (() => {})
    }
}
```

### 5.1 执行 instance.render

现在我们有了组件实例，就可以通过 `instance.render` 开始挂载流程

在 setupRenderEffect 中，执行 `instance.render` 得到子树，假设此时在 render 内返回 h 函数创建的元素节点 `h('div', { style: {color: 'red'}}, 'hello')` 后文用 ele 指代它

+ 在 patch 中用 processElement 处理元素节点：
    - 如果 ele 有子节点就先挂载子节点
    - 设置元素的属性
    - 将元素插入父节点（container）中

```javascript
const Text = Symbol('text')
function normalizeVNode(child) {
    if (typeof child === 'object') {
        return child
    } else {
        // string and number
        return createVNode(Text, null, String(child))
    }
}
function createRender(options) {
    // other code
    const mountChildren = (children, container, anchor) => {
        children.forEach(child => {
            child = normalizeVNode(child)
            patch(null, child, container)
        })
    }
    const processElement = (n1, n2, container) => {
        if (n1 === null) {
            // 创建元素
            let el
            const { type, props, shapeFlag } = n2
            el = n2.el = hostCreateElement(type)
            // 挂载子节点
            if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(el, n2.children)
            } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                mountChildren(n2.children, el)
            }
            // 设置属性
            if (props) {
                Object.keys(props).forEach(key => {
                    if (key !== 'value') {
                        hostPatchProp(el, key, null, props[key])
                    }
                })
            }
            // 插入
            hostInsert(el, container, null)
        } else {
            // 更新
        }
    }
    const processText = (n1, n2, container) => {
        if (n1 == null) {
            hostInsert(
                (n2.el = hostCreateText(n2.children)),
                container,
            )
        } else {
           // 更新
        }
    }
    const patch = (n1, n2, container) => {
        if (n1 === n2) {
            return
        }
        const { type, ref, shapeFlag } = n2
        switch(type) {
            case Text:
                processText(n1, n2, container)
                break
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // type 是元素
                    processElement(n1, n2, container)
                } else if (shapeFlag & ShapeFlags.COMPONENT) {
                    // type 是组件
                    processComponent(n1, n2, container)
                }
        }
    }
    const setupRenderEffect = (instance, initialVNode, container) => {
        const componentUpdateFn = () => {
            if (!instance.isMounted) {
                const { el, props } = initialVNode
                const proxyToUse = instance.proxy
                // 执行 render 获得子树
                const subTree = 
                    (instance.subTree = instance.render.call(proxyToUse, proxyToUse))
                patch(null, subTree, container)
                initialVNode.el = subTree.el
                instance.isMounted = true
            } else {
                // 更新
            }
        }
        // render 需要响应属性或状态的变化
        const update = instance.update = effect(componentUpdateFn)
        update.id = instance.uid // 后面更新时用到
    }
}
```

注意当 children 是数组（ `['hello', 'word']` ）时，如果将每个子元素都当作 TEXT_CHILDREN 处理，则后添加的 `'word'` 就会覆盖之前的 `'hello'`，所以，在此处创建一个虚拟的 Text 节点，将子元素作为虚拟节点的孩子处理

## 6. 更新流程

上面将 componentUpdateFn 放入了 effect，这样当用户提供的 render 内使用的数据改变时，会重新执行

### 6.1 准备，去掉无意义更新

首先考虑，如果频繁更改数据，componentUpdateFn 会无意义的重复多次执行，实际只需要最后一次的执行即可

可以用 Set 对 componentUpdateFn 去重，在微任务队列中统一执行所有收集的更新函数

```javascript
// example
// const App = {
//     setup() {
//         const state = reactive({ name:'zzz' })
//         setTimeout(() => {
//             state.name = 'zxy'
//             state.name = 'xyz'
//             state.name = 'zzz'
//         }, 1000)
//         return () => {
//             // 会执行多次
//             console.log(state.name)
//         }
//     }
// }
const queue = []
let flushIndex = 0
let currentPreFlushParentJob = null
let isFlushing = false
let isFlushPending = false
const setupRenderEffect = (instance, initialVNode, container) => {
    // other code
    instance.update = effect(componentUpdateFn, {
        sheduler: queueJob(instance.update)
    })
}
function queueJob(job) {
    if (!queue.length || !queue.includes(job)) {
        queue.push(job)
        queueFlush()
    }
}
function queueFlush() {
    if (!isFlushing && !isFlushPending) {
        isFlushPending = true
        currentFlushPromise = Promise.resolve().then(flushJobs)
    }
}
function flushJobs() {
    isFlushPending = false
    isFlushing = true
    // parent.id < child.id，更新时要先更新 parent 再更新 child
    queue.sort((a, b) => a.id - b.id)
    try {
        for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
            const job = queue[flushIndex]
            job && job()
        }
    } finally {
        flushIndex = 0
        queue.length = 0
        isFlushing = false
    }
}
```

### 6.2 元素更新

更新的流程就是再次调用 instance.render 得到新的树，通过 patch 新老两颗树，完成更新

```javascript
const componentUpdateFn = () => {
    if (!instance.isMounted) {
        // other code
    } else {
        const proxyToUse = instance.proxy
        const nextTree = instance.render.call(proxyToUse, proxyToUse)
        const prevTree = instance.subTree
        instance.subTree = nextTree
        patch(prevTree, nextTree, hostParentNode(prevTree.el))
    }
}
const patch = (n1, n2, container, anchor = null) => {
    // other code
    // 如果不是同一类型，删除旧节点，挂载新节点
    if (n1 && n1.type !== n2.type) {
        // 得到下一个节点
        anchor = hostNextSibling(n1.el)
        // 删除旧节点
        hostRemove(n1.el)
        n1 = null
    }
    // other code
}
```

当对元素进行更新时，需要更新它的属性和儿子，这里简化下属性更新，直接删除老属性中不存在的新属性

```javascript
const patchProps = (el, vnode, oldProps, newProps) => {
    if (oldProps !== newProps) {
        for (let key in newProps) {
            const next = newProps[key]
            const prev = oldProps[key]
            if (next !== prev) {
                hostPatchProp(el, key, prev, next)
            }
        }
        for (let key in oldProps) {
            if (!(key in newProps)) {
                hostPatchProp(el, key, oldProps[key], null)
            }
        }
    }
}
const processElement = (n1, n2, container) => {
    if (n1 === null) {
        // other code
    } else {
        const el = (n2.el = n1.el)
        const oldProps = n1.props
        const newProps = n2.props
        patchChildren(n1, n2, el)
        patchProps(el, n2, oldProps, newProps)
    }
}
```

+ 对于孩子的更新，children 有 3 种类型，分别是 text、array 或者没有（null），用 oldChildren 代表老的孩子，newChildren 代表新的孩子

    1. newChildren 是 text，那么设置 parent 的 textContent 为 newChildren 即可

    2. 如果 oldChildren 不是 array，挂载 newChildren 到 parent 即可

    3. 如果 newChildren 和 oldChildren 都是 array，说明有节点的复用和移位，需要进行 diff 比较

```javascript
const patchChildren = (n1, n2, container) => {
        const c1 = n1.children
        const prevShapeFlag = n1 ? n1.shapeFlag : 0
        const c2 = n2.children
        const { shapeFlag } = n2
        // children 的 3 种情况，textChildren、arrayChildren、no-children
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (c2 !== c1) {
                hostSetElementText(container, c2)
            }
        } else {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    // diff
                    patchKeyedChildren(c1, c2, container)
                } else {
                    // 没有新子节点，删除老的子节点
                    children.forEach(child => {
                        // TODO: 暂时只处理元素情况
                        hostRemove(child)
                    })
                }
            } else {
                // 上一个 children 是 text 或者 null
                // 新 children 是 array 或 null
                // 挂载新 children
                if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                    hostSetElementText(container, '')
                }
                if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    mountChildren(c2, container)
                }
            }
        }
    }
```

#### 6.2.1. diff

+ 策略是尽可能查找可以复用的节点：
    
    1. 从两端找相同节点，进行复用（更新属性、孩子等操作）

    2. 找完后如果 oldChildren 有剩余，需要删除；否则 newChildren 有剩余，需要挂载

    3. 剩下的节点对应位置的元素不全相同，说明发生了位置移动或者元素替换，用 toBePatched 代表需要操作的节点个数
        
        - 首先找到 oldChildren 和 newChildren 相同的节点进行复用
            - newIndexToOldIndexMap[i] = x 当 x !== 0 时表示 newChildren 中第 i 位节点在 oldChildren 中的序号是 x
            - 当 x === 0 时，表示 newChildren 中第 i 位几点未复用过

        - 根据 toBePatched 从后往前查找 newChildren
            - 如果是未复用的节点，说明是新增的节点，直接插入即可
            - 如果是复用过的节点 nodeI，尝试得到 newIndexToOldIndexMap 的最长递增子序列所有序号构成的数组 increaseArr，由于是从后往前查找，如果 nodeI 对应的序号在 increaseArr 中，说明跳过它即可，否则，需要插入它
          

```javascript
const patchKeyedChildren = (c1, c2, container) => {
        let i = 0
        const l2 = c2.length
        let e1 = c1.length - 1 // prev ending index
        let e2 = l2 - 1 // next ending index

        // 从头比较
        // (a b)
        // (a b) c
        while (i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = normalizeVNode(c2[i])
            if (n1.type === n2.type) {
                patch(n1, n2, container)
            } else {
                break
            }
            i++
        }
        // 从尾比较
        //   (a b)
        // c (a b)
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = normalizeVNode(c2[e2])
            if (n1.type === n2.type) {
                patch(n1, n2, container)
            } else {
                break
            }
            e1--
            e2--
        }
        // (a b)
        // (a b) c
        // i = 2, e1 = 1, e2 = 2
        // or
        //   (a b)
        // c (a b)
        // i = 0, e1 = -1, e2 = 0
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1
                const anchor = nextPos < l2 ? c2[nextPos].el : null
                while(i <= e2) {
                    patch(null, normalizeVNode(c2[i]), container, anchor)
                    i++
                }
            }
        }
        // (a b) c
        // (a b)
        // i = 2, e1 = 2, e2 = 1
        // or
        // a (b c)
        //   (b c)
        // i = 0, e1 = 0, e2 = 1
        else if (i > e2) {
            while (i <= e1) {
                hostRemove(c1[i])
                i++
            }
        }
        else {
            const s1 = i
            const s2 = i
            const keyToNewIndexMap = new Map()
            for (i = s2; i <= e2; i++) {
                const nextChild = (c2[i] = normalizeVNode(c2[i]))
                if (nextChild.key != null) {
                    keyToNewIndexMap.set(nextChild.key, i)
                }
            }
            let j
            let patched = 0
            const toBePatched = e2 - s2 + 1
            let moved = false
            let maxNewIndexSoFar = 0
            const newIndexToOldIndexMap = new Array(toBePatched).fill(0)
            for (i = s1; i <= e1; i++) {
                const prevChild = c1[i]
                if (patched >= toBePatched) {
                    hostRemove(prevChild)
                    continue
                }
                let newIndex
                for (j = s2; j <= e2; j++) {
                    if (
                        newIndexToOldIndexMap[j - s2] === 0 && prevChild.type === c2[i].type
                    ) {
                        newIndex = j
                        break
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(prevChild)
                } else {
                    newIndexToOldIndexMap[newIndex - s2] = i + 1
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex
                    } else {
                        moved = true
                    }
                    patch(prevChild, c2[newIndex], container, null)
                    patched++
                }
            }
            
            const increasingNewIndexSequence = moved
                ? getSequence(newIndexToOldIndexMap)
                : []
            j = increasingNewIndexSequence.length - 1
            for (i = toBePatched - 1; i >= 0; i--) {
                const newIndex = s2 + i
                const nextChild = c2[newIndex]
                const anchor = newIndex < l2 ? c2[newIndex + 1].el : null
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, anchor)
                } else if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        hostInsert(nextChild, container, anchor)
                    } else {
                        j--
                    }
                }
            }
        }
    }
```

#### 6.2.2. 最长递增子序列

LIS 代表最长递增子序列的长度

+ 给定一个数组 a = [..., x-1, x, x+1, ...]，这里有两种方法：

    1. 假设 a 是一个倒序数组，那么 LIS = 1，构建一个数组 dp 并填充 1，其中 dp[i] 表示 a 中第 i 位结尾的最长递增子序列长度
        - dp 满足 dp[i] = Max(dp[j]) + 1（0 <= j < i），即想要 a[i] 结尾的最长子序列，只需要它前面所有 dp 中最大的值加一即可

    2. dp[len] = m 表示 LIS 为 len 的序列结尾数字是 m，设初始 len = 1、dp[1] = a[0]
        - 从 i = 1 向后遍历 a，如果 a[i - 1] < a[i]，那么 len 加一即可
        - 如果 a[i - 1] > a[i]，那么在 dp 数组中找到唯一一个小于 a[i] 的数索引为 index，令 dp[index + 1] = a[i]

```javascript
// 1. 线性规划
// function getSequence(arr) {
    // const dp = []
    // const len = arr.length
    // const result = []
    // for (let i = 0; i < len; i++) {
    //     dp[i] = 1
    //     const currentRes = []
    //     const current = arr[i]
    //     for (let j = 0; j < i; j++) {
    //         const compare = arr[j]
    //         if (compare >= current) {
    //             continue
    //         }
    //         const dpJ = dp[j]
    //         if (1 + dpJ > dp[i]) {
    //             currentRes.push(j)
    //             dp[i] = 1 + dpJ
    //         }
    //     }
    //     currentRes.push(i)
    //     result.push(currentRes)
    // }
    // let maxLen = 0
    // let final = null
    // result.forEach(arr => {
    //     const len = arr.length
    //     if (len > maxLen) {
    //         final = arr
    //         maxLen = len
    //     }
    // })
    // return final
//  }
// 2. 贪心 + 二分
    function getSequence(arr) {
        const length = arr.length
        if (!length) {
            return 0
        }
        let len = 1
        const dp = []
        dp[len] = arr[0]
        const result = [0]
        for(let i = 1; i < length; i++) {
            const current = arr[i]
            if (current > dp[len]) {
                result.push(i)
                dp[++len] = current
            } else {
                let l = 1, r = len, pos = 0
                while (l <= r) {
                    const mid = (l + r) >> 1
                    if (dp[mid] < current) {
                        pos = mid
                        l = mid + 1
                    } else {
                        r = mid - 1
                    }
                }
                dp[pos + 1] = current
            }
        }
        return result
    }
```

### 6.3 组件更新

对于组件更新，如果父组件传递属性给子组件，当属性改变时，需要让子组件更新，如果子组件的 render 函数中使用了这个属性，则子组件会再次更新，所以需要在可以更新时（shouldUpdateComponent 返回 true），去除重复更新

```javascript
const processText = (n1, n2, container) => {
    if (n1 == null) {
        // other code
    } else {
        const el = (n2.el = n1.el!)
            if (n2.children !== n1.children) {
            hostSetText(el, n2.children)
        }
    }
}
const shouldUpdateComponent = (preVnode, nextVnode) => {
    const { props: prevProps, children: prevChildren } = prevVNode
    const { props: nextProps, children: nextChildren} = nextVNode
    if (preChildren || nextChildren) {
        if (!nextChildren) {
            return true
        }
    }
    if (prevProps === nextProps) {
        return false
    }
    if (!prevProps) {
        return !!nextProps
    }
    if (!nextProps) {
        return true
    }
    const nextKeys = Object.keys(nextProps)
    if (nextKeys.length !== Object.keys(prevProps)) {
        return true
    }
    for (let i = 0, l = nextKeys.length; i < l; i++) {
        const key = nextKeys[i]
        if (prevProps[key] !== nextProps[key]) {
            return true
        }
    }
    return false
}
function invalidateJob(job) {
    const i = queue.indexOf(job)
    if (i > flushIndex) { // 尚未处理到 job，删除 job，因为后续我们会手动调用
        queue.splice(i, 1)
    }
}
const updateComponent = (n1, n2) => {
    // 拿到组件实例
    const instance = (n2.component = n1.component)
    if (shouldUpdateComponent(n1, n2)) {
        // TODO: Watch 待处理
        instance.next = n2
        // 去掉重复的更新
        invalidateJob(instance.update)
        instance.update()
    } else {
        // 不需要更新，直接复制
        n2.el = n1.el
        instance.vnode = n2
    }
}
const processComponent = (n1, n2, container) => {
    if (n1 === null) {
        mountComponent(n2, container)
    } else {
        updateComponent(n1, n2)
    }
}
```

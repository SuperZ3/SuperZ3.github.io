# VUEX

vuex 是一个状态管理库，集中存储和分发状态的变更

![images](./images/vuex.png)

+ 以上图为例，看下单项数据流是如何运转的
    1. vuex 提供了 state 给组件使用
    2. 当组件需要状态进行变更时，用 dispatch 派发一个动作 action，告诉 vuex 要修改状态了
    3. action 可以是异步的，只需要通过 commit 提交 mutation 修改最终的 state
    4. mutation 用来实际更改 state，必须是同步的，这样我们才能知道什么时候修改了 state

首先，需要一个创建 store 的方法 `function createStore(options) { return new Store(options) }` 

## State

用户传入的 state 是一个对象，我们需要将它转换成响应式的，以实现 state 变化时更新视图

```javascript
function initState(target, state = {}) {
    target._state = reactive({
        data: state
    })
}
class Store {
    constructor(options = {}) {
        this._state = null

        initState(this, options?.state)
    }

    install (app) {
        app.config.globalProperties.$store = this
    }

    get state() {
        return this._state.data
    }
}
```

## Getters

getters 类似 computed，当内部使用的属性 x 变化时，返回新的值

我们遍历用户传入的 getters，将它们逐一挂到 store.getters 上，在页面上访问属性时返回 getter 函数执行结果，由于 x 是响应式的，变化时会更新视图，相当于再次访问 getters 的属性，就返回了新的结果

getter 的执行应该只依赖于 x，而不是只要视图更新就重新执行，所以我们要将 getter 放到 computed 中

```javascript
const computedCache = {}
function forEach(obj, fn) {
    if (!!obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => fn(obj[key], key))
    }
}
function initGetters(target, getters) {
    forEach(getters, (getter, key) => {
        computedCache[key] = computed(() => getter(target.state))
        Object.defineProperty(target.getters, key, {
            get: () => computedCache[key].value
        })
    })
}
class Store {
    constructor(options = {}) {
        this.getters = Object.create(null)
        initGetters(this, options?.getters)
    }
}
```

## Mutations && Actions

对于 mutations 只要将其存储到 store 上就行

对于 actions 要将结果处理成 promise

```javascript
function initMutations(target, mutations = {}) {
    forEach(mutations, (mutation, type) => {
        const entry = target._mutations[type] || (target._mutations[type] = [])
        entry.push((payload) => {
            mutation.call(target, target.state, payload)
        })
    })
}
function initActions(target, actions = {}) {
    forEach(actions, (action, type) => {
        const entry = target._actions[type] || (target._actions[type] = [])
        entry.push((payload) => {
            const res = action.call(target, {
                dispatch: target.dispatch,
                commit: target.commit,
                state: target.state
            }, payload)
            
            if (typeof res?.then !== 'function') {
                return res
            } else {
                return Promise.resolve(res)
            }
        })
    })
}
class Store {
    constructor(options = {}) {
        this._actions = Object.create(null)
        this._mutations = Object.create(null)

        initMutations(this, options?.mutations)
        initActions(this, options?.actions)
    }
}
```

## dispatch && commit

在 store 中找到对应的 actions、mutations 执行即可，由于这两个方法可能会在其它地方作为函数调用，为了保证 this 的正确指向，需要在 constructor 中绑定下 this

```javascript
class Store {
    constructor(options = {}) {
        this.commit = this.commit.bind(this)
        this.dispatch = this.dispatch.bind(this)
    }

    commit(type, payload) {
        const entry = this._mutations[type]
        if (!entry) return
        entry.forEach(handler => handler(payload))
    }

    dispatch(type, payload) {
        const entry = this._actions[type]
        if (!entry) return

        const result = entry.length > 1
            ? Promise.all(entry.map(handler => handler(payload)))
            : entry[0](payload)

        return result
    }
}
```
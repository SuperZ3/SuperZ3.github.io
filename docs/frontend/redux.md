# Redux

Redux 是一个应用状态管理的库，它可以将状态管理的逻辑抽离出来，方便不同组件对公共状态的使用，使状态的变化可以预测

react-redux 是供 react 使用的辅助库，基本的 redux 只包括状态的管理逻辑，而 react-redux 提供了 provide、connect 等组件或方法，让状态在组件中更容易使用

不同于 vuex 的响应式更新，react-redux 采用发布订阅的方式，在状态改变时通知当前组件更新

## store

redux 的 store 包括内部存储状态的 state，以及通知状态变更的 dispatch、注册订阅的 subscribe 方法组成

通过调用 reducer 获得默认的 state 的值

```javascript
const  ActionTypes = {
    INIT: 'infinity'
}

export function createStore(reducer, enhancer) {
    if (typeof enhancer === 'function') {
        return enhancer(createStore)(reducer)
    }
    let currentReducer = reducer
    let currentState = undefined
    let currentListeners = []
    let isDispatching = false

    const getState = () => currentState

    function dispatch(action) {
        if (isDispatching) {
            throw new Error('Reducers may not dispatch actions.')
        }

        try {
            isDispatching = true
            currentState = currentReducer(currentState, action)
        } finally {
            isDispatching = false
        }

        currentListeners.forEach(listener => listener())

        return action
    }

    function subscribe(listener) {
        if (isDispatching) {
            throw new Error('You may not call store.subscribe() while the reducer is executing. ')
        }

        currentListeners.push(listener)
        return () => {
            const index = currentListeners.indexOf(listener)
            currentListeners.splice(index, 1)
        }
    }

    dispatch({ type: ActionTypes.INIT })

    return {
        getState,
        dispatch,
        subscribe
    }
}
```

## 插件

为了使用多个 state，可以使用 combineReducers 将多个 reducer 组合成一个 reducer

插件是对现有 dispatch 方法的增强，通过将多个中间件函数收敛成一个新 dispatch 函数的方式，在不同插件间传递 action ，以在改变状态前做相应的处理

最终对状态的修改还是通过 dispatch 一个 action 来实现的，这是一个同步操作

对于异步操作，这里实现了 thunk 插件，它允许 action 是一个函数

```javascript
function combineReducers(reducers) {
    return (state = {}, action) => {
        const nextState = {}
        let hasChanged = false
        Object.keys(reducers).forEach(key => {
            const oldState = state[key]
            const newState = (nextState[key] = reducers[key](state, action))
            hasChanged = oldState !== newState
        })
        return hasChanged ? nextState : state
    }
}

function compose(...funcs) {
    if (funcs.length === 0) {
        return (args) => args
    }
    if (funcs.length === 1) {
        return funcs[0]
    }
    return funcs.reduce((a, b) => (...args) => a(b(...args)))
}

export function applyMiddleware(...middleWares) {
    return (createStore) => (...args) => {
        const store = createStore(...args)
        
        let { dispatch, getState } = store

        const middlewareAPI = {
            getState: getState,
            dispatch: (...args) => dispatch(...args),
        }

        const chain = middleWares.map(middleWare => middleWare(middlewareAPI))
        dispatch = compose(...chain)(dispatch)

        return {
            ...store,
            dispatch
        }
    }
}

function logger({ getState }) {
    return next => action => {
        const state = getState()
        console.log(state)
        return next(action)
    }
}

function thunk({ dispatch, getState }) {
    return next => action => {
        if (typeof acton === 'function') {
            return action(dispatch, getState)
        }
        return next(action)
    }
}
```

## redux-saga

redux-saga 使用 generator 语法来管理异步操作，它可以将嵌套回调函数式的异步任务管理拆成同步式的操作

还记得之前的 co 函数吗？它可以自动执行 generatior，不再需要我们关注异步结束的时机

```javascript
function co(generator, arg) {
    return new Promise((resolve, reject) => {
        const gen = generator(arg)
        onFulfilled()
        function onFulfilled(res) {
            res = gen.next(res)
            next(res)
        }
        function next(res) {
            if (res.done) return resolve(res.value)
            return Promise.resolve(res.value).then(onFulfilled, onReject)
        }
        function onReject(err) {
            return reject(err)
        }
    })
}
```

先来看下 redux-saga 的使用流程

1. 通过 watcher saga 监听 action
2. 当前派发的 action 是我们注册过的 action 时，通知 worker saga 执行异步操作并更新状态
3. takeEvery 用来注册需要监听的 action，call 负责调用异步操作，put 负责派发状态的更改

```javascript
// import {call, put, takeEvery} from 'redux-saga/effects'
import {call, put, takeEvery} from '../../t-redux'
// 异步操作
let baseAge = 18
function fetchAgeAPI() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(baseAge++)
        }, 3000);
    })
}
// worker saga
function * fetchAge() {
    try {
        const age = yield call(fetchAgeAPI)
        yield put({ type:'ADD_AGE', payload: age })
    } catch(err) {
        yield put({ type:'FETCH_FILED', payload: err.message })
    }
}
// watcher saga
function * ageSaga() {
    yield takeEvery('FETCH_AGE', fetchAge)
}
export default ageSaga
```

不难看出，这是一个发布订阅流程：

1. 实现 takeEvery 来订阅 worker saga，在 actionToSaga 中将其与 action 一一对应
2. 实现 runSaga 让 watcher saga 开始工作，订阅 action 并注册其内部所有 worker saga
3. 实现插件 sagaMiddleware，当需要一个异步操作时，比如上面的 `dispatch({type: FETCH_AGE})` ，如果之前订阅了这个 action，就拿出它所对应的 worker saga 执行，这里用 co 来自动执行 generator
4. call 就是将异步的结果包裹成 promise 让 co 可以统一处理 

```javascript
const actionToSaga = new Map()
export function takeEvery(actionType, workerSaga) {
    let sagas = actionToSaga.get(actionType)
    if (!sagas) {
        actionToSaga.set(actionType, (sagas = new Set()))
    }
    sagas.add(workerSaga)
}

function runSaga(saga) {
    const interor = saga()
    let result = interor.next()
    while(!result.done) {
        result = interor.next()
    }
}

let _ref2 = null

export function call(asyncFn, payload) {
    return new Promise((resolve, reject) => {
        try {
            const res = asyncFn(payload)
            resolve(res)
        } catch (error) {
            reject(error)
        }
    })
}

export function put(action) {
    const { dispatch } = _ref2
    return dispatch(action)
}

function runWorker(worker, action) {
    co(worker, action)
}

function execute(action) {
    const sagas = actionToSaga.get(action.type)
    if (sagas) {
        sagas.forEach(worker => {
            runWorker(worker, action)   
        })
    }
}

export function createSageMiddlerWare() {
    function sagaMiddleware(_ref) { 
        _ref2 = _ref
        return next => action => {
            const result = next(action)
            execute(action)
            return result
        }
    }

    sagaMiddleware.run = function (saga) {
        return runSaga(saga)
    }
    return sagaMiddleware
}
```
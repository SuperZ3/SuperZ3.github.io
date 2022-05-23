# Generator

Generator 函数提供了一种异步编程解决方案，可以让我们像写同步代码一样组织代码，我们先从基本使用开始，再研究下如何实现 Generator 的机制

## 迭代器

迭代器是一个统一的接口，可以被 `for...of`、`...` 等采用来实现遍历操作，可以简单实现为返回有 next 方法对象的函数，凡是部署了 Symbol.iterator 属性的对象都可以视为可遍历对象

```javascript
const o = {
    [Symbol.iterator]: function() {
        let count = 0
        return {
            next: function() {
                let done = count > 5
                return {
                    done,
                    value: done ? count : count++
                }
            }
        }
    }
}
console.log([...o]) // [0,1,2,3,4,5]
```

## 基本使用

当调用 Generator 函数时，返回一个迭代器。调用迭代器的 next 方法即开始函数的执行过程直到遇到 yield 或 return 操作符，此时会返回一个对象，对象的 value 是 yield 后表达式的值。当再次调用 next 方法时，会从上次函数暂停的地方恢复执行。

```javascript
function* gen() {
    const a = yield 'hello'
    console.log(a)
    try {
        yield 'something'
    } catch(err) {
        console.log(err)
        const c = yield 'still'
    }

    yield 'continue'
    return 'world'
}

const g = gen()
g.next() 
// { value: 'hello', done: false }
g.next('A')
// A
// { value: 'something', done: false }
g.throw('WRONG')
// WRONG
// { value: 'still', done: false }
g.next()
// { value: 'continue, done: false }
g.next()
// { value: 'world', done: true}
```

有了 Generator，我们可以写出比回调函数和 Promise 更优雅的异步代码

```javascript
const { readFile } = require('fs')
// 回调式
readFile('test.txt', (_, data1) => {
    readFile('test2.txt', (_, data2) => {
        console.log(data1 + data2)
    })
})
// Promise
function read(path) {
    return new Promise(resolve => {
        readFile(path, (_, data) => resolve(data))
    })
}
let data = ''
read('test.txt')
    .then(data => {data += data;return read('test2.txt')})
    .then(data => data += data)

// Generator
function *gen() {
    yield readFile('test.txt', (_, data) => getData(data))
    yield readFile('test2.txt', (_, data) => getData(data))
}

function getData(d) {
    const { value, done } = g.next()
    console.log(d + value.data)
}

const g = gen()
g.next()
```

此处虽然没有摆脱对回调的依赖，但是将嵌套的逻辑拆成了顺序的逻辑，更方便理解。但是手动执行 next 略显繁琐，可以借助 co 库实现自动执行

```javascript
function co(gen) {
    const ctx = this
    return new Promise((resolve, reject) => {
        if (typeof gen === 'function') gen = gen.call(ctx)
        if (!gen && typeof gen.next !== 'function') resolve(gen)

        onFulfilled()
        function onFulfilled(res) {
            try {
                const res = gen.next(res)
            } catch(e) {
                return reject(e)
            }

            next(res)
            return null
        }

        function onRejected(err) {
            let ret
            try {
                ret = gen.throw(err)
            } catch(e) {
                return reject(e)
            }
            next(ret)
        }

        function next(v) {
            if (v.done) return resolve(v.value)
            const value = toPromise.call(ctx, v.value)
            if (value && isPromise(value)) return value.then(onFulfilled, onRejected)
            return onRejected('need Promise')
        }
    })
}
```

## Generator 实现

考虑我们自定义 Generator 需要实现的一些功能：

1. 需要返回一个迭代器，调用迭代器会在函数上次暂停的地方开始执行

2. 需要一个全局的 context 来保存状态，实现函数内外部的数据交换，由于 Generator 可重复调用，每次调用产生的迭代器彼此独立，所以 context 对于每次执行，要有个独立的实例

3. 需要一个 switch case 结构，根据调用 next 时传入的标志，决定从哪个位置开始执行

```javascript
function* gen() {
    const a = yield 'result1'
    console.log(a)
    yield 'result2'
}

const context = {
    sign: 0,
    value: undefined,
    message: undefined,
    done: false,
    stop() {
        this.done = true
    }
}

function wrapFn(fn) {
    const _context = Object.assign({}, context)
    return {
        next(m) {
            _context.message = m
            const value = fn(_context)
            return {
                value,
                done: _context.done
            }
        }
    }
}

function gen() {
    var a
    return wrapFn(function innerGen(_context) {
        switch (_context.sign) {
            case 0:
                _context.sign = 1
                return 'result1'
            case 1:
                _context.sign = 2
                a = _context.message
                console.log(_context.message)
                return 'result2'
            case 2:
            case 'end':
                return _context.stop()
        }
    })
}

```

1. 首先，我们将 Generator 转换成 innerGen 函数的形式，将 yield 用 switch case 结构替换

2. 当调用 next 时，即是重新执行 innerGen 的过程

3. 用 _context.sign 标志函数执行的位置

4. 当有数据传入时，用 _context.message 保存

这样，就模拟了 Generator 的执行过程

## Async 实现

了解了 Generator 的执行过程，我们在考虑下 Async 的实现，Async 可以理解为带有自动执行器的 Generator，执行 Async 返回一个 Promise，会等待 Async 内部所有 await 执行后，才会变成 fulfilled 或 rejected 状态

```javascript
function async(gen) {
    return new Promise((resolve, reject) => {
        let g
        try {
            g = gen()
        } catch(e) {
            return reject(e)
        }
        if (!g || typeof g.next !== 'function') return resolve(g)

        next()
        
        function next(v) {
            try {
                const { value, done } = g.next(v)

                if (done) return resolve(value)
                Promise.resolve(value).then(_v => next(_v), _r => reject(_r)) 
            } catch(e) {
                reject(e)
                return
            }
        }
    })
}
```

# 浏览器事件循环与任务

## 浏览器事件循环

在介绍 event loop 之前，再看一下浏览器架构：

1. 浏览器进程：负责各种 I/O 交互、子进程管理、资源存储等

2. 网路进程：负责网络资源加载

3. 渲染进程：负责页面渲染、javascript 执行等

其中由渲染进程的主线程负责处理各种任务如渲染（解析 dom、布局...）、javascript 执行、网络请求等等

主线程一次只能处理一个任务，而且各个任务的执行时间各不相同。为了保证按顺序逐一处理各种事件，引入了消息队列（或称任务队列）和事件循环（event loop）的机制，事件循环负责从消息队列中每次拿出一个任务交给主线程执行，而由 I/O 操作、网络请求、文件读写等操作产生的事件，只需要按顺序依次放入消息队列即可

![image](./images/browser/task.png)

上述操作保证了执行不会混乱，但是消息队列无法处理需要延迟一段时间后再执行的任务（如 settimeout）。针对这种情况，可以再维护一个延迟队列（实际应该是 hash map 结构）存放延时的任务，在处理一个任务（task）后，会检查延迟队列是否有到期任务（task），如果有则取出执行

```javascript
void ProcessTimerTask(){
  //从delayed_incoming_queue中取出已经到期的定时器任务
  //依次执行这些任务
}

TaskQueue task_queue；
void ProcessTask();
bool keep_running = true;
void MainTherad(){
  for(;;){
    //执行消息队列中的任务
    Task task = task_queue.takeTask();
    ProcessTask(task);
    
    //执行延迟队列中的任务
    ProcessDelayTask()

    if(!keep_running) //如果设置了退出标志，那么直接退出线程循环
        break;
  }
}
```

在保证了按顺序执行和延迟执行后，如果在执行一个任务时，发现一个需要立即处理的事件e该怎么办呢？我们不能将它放入消息队列，因为会将它排到 task n 后面；如果用 settimeout(fn，0)，那么当 fn 里再次产生需要立即处理的事件 e 时，两次 e 事件中间可能插入很多浏览器添加的网络、I/O 等其它任务

为了在执行一个任务过程中，处理需要立即执行的操作（或者说命令），而不打断当前任务的继续执行（假设此时正在渲染页面，若需要网络请求的结果，则需当前渲染之后，再执行）。引入了微任务（micro task）的概念，V8 引擎在执行 javascript 代码时，会产生全局执行上下文，同时会在内部维护一个微任务队列。在 javascript 执行结束，准备退出全局上下文，调用栈为空时，会检查微任务队列，依次执行微任务直到队列为空，javascript 执行任务结束，主线程开始执行下一个任务

任务与微任务分类：

| 任务（task/micro task） | 微任务（micro task） |
| --- | --- |
| setTimeout | Mutation Observer |
| setInterval | Promise.[then | catch | finally] |
| I/O操作如鼠标点击 | process.nextTick |
| setImmediate | queueMicrotask |
| script（整体代码块） ||
| 渲染页面 ||

注意：

1. setTimeout、setInterval 维护在延迟队列中，同样属于任务（task），但是会在一个任务结束后，判断延迟队列中是否有到期的定时器，有的话就全部执行。而不是创建了定时器，就将其排到消息队列

2. 对于event（假设监听了一个 click 事件）：

    - 如果是由web api自动触发（例如点击鼠标）回调函数执行，此时会将 click 事件包装成一个任务放入消息队列，在这个任务中，会按照事件冒泡依次将事件的回调函数放入 JS 调用栈执行

    - 如果是由程序触发（script：elemen.click()）回调函数执行，则会将 script 放入 JS 调用栈，事件回调函数按照冒泡的顺序同步触发，所有函数执行完，才算 element.click() 执行结束

接下来按照 Promise A+ 规范实现一下Promise，规范说明，Promise只有三种状态：pending、reject、fullfield，且只能从pending转化为fullfield和reject，不能颠倒。当状态改变时，会调用之前注册在then或catch中的回调函数

## Node 事件循环

Node 做为 JavaScript 运行时，由 libuv 的 uv_run 函数实现了事件循环机制

在执行 Node 程序时，先执行所有同步代码，然后进入事件循环，事件循环结束意味着 Node 执行结束

![image](./images/browser/node.png)

事件循环分为不同阶段（phase），每个阶段都有一个回调队列：

1. 定时器（timer）阶段：处理 setTimeout 和 setInterval，定时器是以最小堆实现的，最快过期的节点是根节点。在每轮事件循环开始的时候都会缓存当前的时间，用这个缓存的时间查找到期的 timer 回调执行

2. pending 阶段：执行上一轮循 Poll IO 阶段没有执行的回调函数。（例如数据写入成功，tcp 连接失败等操作的回调）

3. poll IO 阶段：此阶段有 2 个任务，一是计算需要阻塞的时间并等待 IO 事件，二是执行回调队列（poll queue）中的回调。事件循环进入此阶段，会阻塞等待 IO 事件，在阻塞期间如果有到期的 timer 回调，则返回到定时器阶段，或者如果有 setimmediate 回调，则进入到 check 阶段执行 immediate 回调。否则处理 IO 时间回调

4. check 阶段：处理 setImmediate，Poll IO 若为空，同时有 immediate 任务，则执行 immediate 任务。

5. close callback 阶段：执行一些清理函数

设置 setTimeout 为 0，Node 会自动将其时间改为 1，所以 setTimeout(cb,0) 和 setImmediate(cb) 执行顺序，主要取决于 setTimeout 注册 cb 到执行 cb 期间，系统操作的耗时。但是如果将其都注册到 IO 操作的回调函数中，则由上面对 Poll IO 的描述可知，IO 操作结束后 setImmediate 一定会先执行

```javascript
// test.js start
  setTimeout(() => {
      console.log('setTimeout')
  }, 0);

  setImmediate(() => {
      console.log('setImmediate')
  })
// 输出顺序不定
// test.js end

// test.js start
  const fs = require('fs')

  fs.open('./test.html',(err, fd) => {
      setTimeout(() => {
          console.log('setTimeout')
      }, 0);

      setImmediate(() => {
          console.log('setImmediate')
      })
  })
// 先输出 setTimeout 后输出 setImmediate
// test.js end
```

上面第一次执行 node test.js，输出顺序取决于 timer 阶段和 check 阶段系统间隔是否大于 1ms，第二次执行，由于是在 poll IO 阶段注册的回调函数，setTimeout 被注册到下轮循环中，setImmediate 被注册到下个阶段，所以 IO 操作结束后，先执行 setImmediate

process.nextTick 不属于 event loop 的一部分。在任何阶段调用 nextTick 注册的回调函数，会放入一个队列中，并在 event loop 进入下一阶段前，全部取出执行

```javascript
setTimeout(() => {
    console.log('setTimeout')
    process.nextTick(() => {
        console.log('timeout nextTick 1')
        process.nextTick(() => {
            console.log('timeout nextTick 2')
        })
    })
}, 0);

setImmediate(() => {
    console.log('setImmediate')
    process.nextTick(() => {
        console.log('immediate nextTick 1')
    })
})

// setTimeout
// timeout nextTick 1
// timeout nextTick 2  
// setImmediate        
// immediate nextTick 1
```

Node 16 后微任务表现和浏览器中一致，即在每个任务执行后如果微任务队列非空，则清空微任务队列：

```javascript
setTimeout(() => {
    console.log('t-1')
    Promise.resolve()
        .then(() => {console.log('t-1 p-1')})
        .then(() => {console.log('t-1 p-2')})
    process.nextTick(() => {
        console.log('t-1 next-1')
    })
}, 0)

setTimeout(() => {
    console.log('t-2')
    Promise.resolve()
        .then(() => {console.log('t-2 p-1')})
        .then(() => {console.log('t-2 p-2')})
    process.nextTick(() => {
        console.log('t-2 next-1')
    })
}, 0)

// t-1
// t-1 next-1
// t-1 p-1
// t-1 p-2
// t-2
// t-2 next-1
// t-2 p-1
// t-2 p-2
```

参考：
1. https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/?utm_source=html5weekly
2. https://time.geekbang.org/column/article/134456


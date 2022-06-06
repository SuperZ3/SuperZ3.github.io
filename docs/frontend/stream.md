# Stream

Stream 类提供了对流（字节流）数据的处理操作，有 4 种基本类型：可读流、可写流、转换流、双工流

```javascript
const Stream = module.exports = require('internal/streams/legacy').Stream;
Stream.Readable = require('internal/streams/readable');
Stream.Writable = require('internal/streams/writable');
Stream.Duplex = require('internal/streams/duplex');
Stream.Transform = require('internal/streams/transform');
```

Stream 基类继承了 events 类

```javascript
const EE = require('events');

function Stream(opts) {
  EE.call(this, opts);
}
ObjectSetPrototypeOf(Stream.prototype, EE.prototype);
ObjectSetPrototypeOf(Stream, EE);
```

Stream 基类定义了 pipe 方法，用于将可读流读取的数据发送到可写流中

```javascript
// dest 代表可写流
// options: { end: true }，读取结束时结束写入
Stream.prototype.pipe = function(dest, options) {
    const source = this;
    function ondata(chunk) {
      // 可写流缓冲区写满，暂停读取
      if (dest.writable && dest.write(chunk) === false && source.pause) 
          source.pause()
    }
    function ondrain() {
      // 可写流缓冲区清空，继续读取
      if (source.readable && source.resume)
          source.resume()
    }
    source.on('data', ondata);
    dest.on('drain', ondrain);

    // dest._isStdio 是 true 表示目的流是标准输出或标准错误（见 process/stdio.js）
    // 可读流触发 end、close 事件时，关闭可写流
    let didOnEnd = false;
    function onend() {
      if (didOnEnd) return;
      didOnEnd = true;
      dest.end();
    }
    function onclose() {
      if (didOnEnd) return;
      didOnEnd = true;
      if (typeof dest.destroy === 'function') dest.destroy();
    }

    if (!dest._isStdio && (!options || options.end !== false)) {
      source.on('end', onend);
      source.on('close', onclose);
    }

    function onerror(er) {
      cleanup();
      if (EE.listenerCount(this, 'error') === 0) {
          this.emit('error', er);
      }
    }

    // 为可读流、可写流注册 error 事件，清除上面添加的事件
    prependListener(source, 'error', onerror);
    prependListener(dest, 'error', onerror);

    function cleanup() {
      source.removeListener('data', ondata);
      dest.removeListener('drain', ondrain);

      source.removeListener('end', onend);
      source.removeListener('close', onclose);

      source.removeListener('error', onerror);
      dest.removeListener('error', onerror);

      source.removeListener('end', cleanup);
      source.removeListener('close', cleanup);

      dest.removeListener('close', cleanup);
    }

    source.on('end', cleanup);
    source.on('close', cleanup);

    dest.on('close', cleanup);
    // 将 dest 添加到可读流目标时，传入源
    dest.emit('pipe', source);

    // 链式调用
    return dest;
};
```

## 1. 可读流

可读流是流数据的来源，所有可读流都继承了 stream.Readable 类

```javascript
ObjectSetPrototypeOf(Readable.prototype, Stream.prototype);
ObjectSetPrototypeOf(Readable, Stream);

/*
  options: {
      highWaterMark: Number,
      read: Function, // stream._read() 方法的实现
      destory: Function, // stream.distory() 方法的实现
      construct: Function, // stream._construct() 方法的实现
      signal: AbortSignal, // 表示可能取消的信号。
  }
*/
function Readable(options) {
  if (!(this instanceof Readable))
    return new Readable(options);

  // 检测是否是双工流
  const isDuplex = this instanceof Stream.Duplex;

  this._readableState = new ReadableState(options, this, isDuplex);

  if (options) {
    if (typeof options.read === 'function')
      this._read = options.read;

    if (typeof options.destroy === 'function')
      this._destroy = options.destroy;

    if (typeof options.construct === 'function')
      this._construct = options.construct;
  }

  Stream.call(this, options);
}
```

Readable 定义了 _readableState 属性，并从 options 中拿到 _read、_destroy 方法，ReadableState 如下：

```javascript
function ReadableState(options, stream, isDuplex) {
  // 是否双工流
  if (typeof isDuplex !== 'boolean')
    isDuplex = stream instanceof Stream.Duplex;
  // 是否开启了对象模式
  this.objectMode = !!(options && options.objectMode);
    // 对双工流，设置读端模式
  if (isDuplex)
    this.objectMode = this.objectMode ||
      !!(options && options.readableObjectMode);
  // 每次从可读流中读取的数据量，默认 16 字节，对象模式默认 16 个
  this.highWaterMark = options ?
    getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex) :
    getDefaultHighWaterMark(false);
  // 读取的数据存储的地方
  this.buffer = new BufferList();
  this.length = 0;
  // 流有流动模式、暂停模式
  // null 表示未开始流动，不产生数据
  // true 表示正在流动，应该生成数据并触发对应事件
  // false 表示停止流动，但仍然产生数据
  this.flowing = null;
  // 流是否已经结束  
  this.ended = false;
  // 是否触发过 end 事件了 
  this.endEmitted = false;
  // 是否正在读取数据
  this.reading = false;
  // 'data'、'readable' 事件是否立即执行，false 为立即执行
  this.sync = true;
  // 是否需要读取数据
  this.needReadable = false;
  // 是否触发了 readable 事件  
  this.emittedReadable = false;
  // 是否监听了 readable 事件 
  this.readableListening = false;
  // 是否正在执行 resume 的过程  
  this.resumeScheduled = false;
  // 是否已经触发了 error 事件
  this.errorEmitted = false;
  // 销毁一个流时，触发 close 事件
  this.emitClose = !options || options.emitClose !== false;
  // 流读取结束，执行销毁
  this.autoDestroy = !options || options.autoDestroy !== false;
  // 流是否已经销毁
  this.destroyed = false;
  // 数据编码格式
  this.defaultEncoding = (options && options.defaultEncoding) || 'utf8';
  // 数据编码器，用于 String 和 Buffer 数据转换
  this.decoder = null;
  this.encoding = null;
  if (options && options.encoding) {
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}
```

### 1.1 readable、data 事件

readable 和 data 事件都属于消费数据的方式，实际使用一种即可，同时使用时，以 readable 事件为主：

  - 添加 readable 事件会将 flowing = false，同时不断的触发 readable 事件，回调函数内调用 read() 读取到数据时，会触发 data 事件

  - 添加 data 事件同时 flowing !== false 且 flowing !== true 时，令 flowing = !readableListening，即根据是否添加了 readable，决定是否开始流动

注意，readable 事件不同于 data 事件，只在第一次添加数据到缓存区和全部添加到缓存区后触发

```javascript
Readable.prototype.on = function(ev, fn) {
  const res = Stream.prototype.on.call(this, ev, fn);
  const state = this._readableState;

  if (ev === 'data') {
    state.readableListening = this.listenerCount('readable') > 0;
    // 添加 data 事件时：
    // 1. flowing === false，说明流暂停流动，但是会继续产生数据到缓存区，等待 read 或 push 方法调用 data 事件触发后续动作
    // 2. flowing === true，说明正在流动当中，什么都不用不做，等待其它方法触发 data 事件即可
    // 3. flowing === null，说明未开始流动，令 flowing = !readableListening，在 nextTick 中调用 read 方法
    if (state.flowing !== false)
      this.resume();
  } else if (ev === 'readable') {
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.flowing = false;
      state.emittedReadable = false;
      if (state.length) {
        emitReadable(this);
      } else if (!state.reading) {
        // 开始读取数据
        process.nextTick(nReadingNextTick, this);
      }
    }
  }
  return res;
};

function nReadingNextTick(self) {
  self.read(0);
}

function emitReadable(stream) {
  const state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    state.emittedReadable = true;
    process.nextTick(emitReadable_, stream);
  }
}

function emitReadable_(stream) {
  const state = stream._readableState;
  // 流没有被销毁，产生了数据或者读完了，触发 readable 事件
  if (!state.destroyed && !state.errored && (state.length || state.ended)) {
    stream.emit('readable');
    state.emittedReadable = false;
  }

  // 非流动模式，没有读完并且已经读到的数据量小于 highWaterMark，需要再次触发 readable 事件
  state.needReadable =
    !state.flowing &&
    !state.ended &&
    state.length <= state.highWaterMark;
  flow(stream);
}

function flow(stream) {
  const state = stream._readableState;
  while (state.flowing && stream.read() !== null);
}
```

### 1.2 push 添加数据

读取数据的前提是在 Readable._read() 中用 push 添加数据到缓存区（BufferList）中

```javascript
Readable.prototype.push = function(chunk, encoding) {
  return readableAddChunk(this, chunk, encoding, false);
  function readableAddChunk(stream, chunk, encoding, addToFront) {
    const state = stream._readableState;
  
    if (chunk === null) {
      state.reading = false;
      // 触发 readable 事件
      onEofChunk(stream, state);
    } else if (state.objectMode || (chunk && chunk.length > 0)) {
      state.reading = false;
      addChunk(stream, state, chunk, false);
    } else if (!addToFront) {
      state.reading = false;
      maybeReadMore(stream, state);
    }
  
    // 是否可以添加更多数据
    return !state.ended &&
      (state.length < state.highWaterMark || state.length === 0);
  }
};

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync &&
      stream.listenerCount('data') > 0) {
    // 流动模式，没有缓存的数据，立即触发 data 事件
    state.dataEmitted = true;
    stream.emit('data', chunk);
  } else {
    // 将数据推入缓存区
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront)
      state.buffer.unshift(chunk);
    else
      state.buffer.push(chunk);
    // 触发 readable 事件
    if (state.needReadable)
      emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function maybeReadMore(stream, state) {
  if (!state.readingMore && state.constructed) {
    state.readingMore = true;
    process.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  // 读取的数据小于 highWaterMark 
  // 或者，流动模式且尚未读取数据
  while (!state.reading && !state.ended &&
         (state.length < state.highWaterMark ||
          (state.flowing && state.length === 0))) {
    const len = state.length;
    // 开始读取缓存区内容
    stream.read(0);
    if (len === state.length)
      break;
  }
  state.readingMore = false;
}
```

push 根据条件选择立即触发 data 事件，还是将数据推入缓存区，如果没到 highWaterMark 则继续读取更多数据

### 1.3 read 读取数据

read 的作用：

1. 读取缓存区的数据，返回给用户

2. 调用用户定义的 _read 方法

```javascript
Readable.prototype.read = function(n) {
  n = parseInt(n)
  const state = this._readableState;
  const nOrig = n;

  n = howMuchToRead(n, state);

  // 读完了，结束
  if (n === 0 && state.ended) {
    if (state.length === 0)
      endReadable(this);
    return null;
  }

  let doRead = state.needReadable;

  // 如果缓存区数据小于 highWaterMark，需要触发 radable 事件
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
  }

  if (state.ended || state.reading || state.destroyed || state.errored ||
      !state.constructed) {
    doRead = false;
  } else if (doRead) {
    state.reading = true;
    state.sync = true;
    // 当前缓存区为空，需要触发 readable 事件
    if (state.length === 0)
      state.needReadable = true;

    // 调用我们定义的 _read 方法
    try {
      this._read(state.highWaterMark);
    } catch (err) {
      errorOrDestroy(this, err);
    }

    state.sync = false;
    // 重新计算 n 的大小，因为上面的 _read 方法会调用 push 往缓存区推入更多数据
    if (!state.reading)
      n = howMuchToRead(nOrig, state);
  }

  let ret;
  if (n > 0) 
    // 从缓存区拿到数据
    ret = fromList(n, state);
  else
    ret = null;

  // 触发 data 事件
  if (ret !== null && !state.errorEmitted && !state.closeEmitted) {
    state.dataEmitted = true;
    this.emit('data', ret);
  }

  return ret;
};
```

### 1.3 pipe 连接可读可写流

pipe 提供了一种自动管理流的方式，不断的将可读流读取到的数据写入可写流中。由下面代码可以看到：

1. pipe 用 data 事件开始可读流的流动

2. 当可写流无法继续写入时，就暂停流动，同时注册可写流 drain 事件处理函数

3. 当可写流可以继续写入时，用 resume 恢复读取

这里只筛选了主要的逻辑，原代码不完全等同于 stream.pipe 方法

```javascript
Readable.prototype.pipe = function(dest, pipeOpts) {
  const src = this;
  const state = this._readableState;

  state.pipes.push(dest);

  let ondrain;
  // 开始流动
  src.on('data', ondata);
  function ondata(chunk) {
    const ret = dest.write(chunk);
    if (ret === false) {
      pause();
    }
  }

  function pause() {
    // cleanUp：清除 dest 的 finish、drain、close等，清除 source 的 data、end 等
    if (!cleanedUp) {
      src.pause();
    }
    if (!ondrain) {
      ondrain = pipeOnDrain(src, dest);
      dest.on('drain', ondrain);
    }
  }

  if (dest.writableNeedDrain === true) {
    if (state.flowing) {
      pause();
    }
  } else if (!state.flowing) {
    // 如果没有开始，在这里开始
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src, dest) {
  return function pipeOnDrainFunctionResult() {
    const state = src._readableState;
    if (src.listenerCount('data')) {
      src.resume();
    }
  };
}
```

// TODO writable

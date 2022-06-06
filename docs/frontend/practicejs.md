# JS 练习

## 新建实例

```javascript
function _new(Fn, ...args) {
  const instance = {};

  instance.__proto__ = Fn.prototype;

  //instance.constructor(...args);
	Fn.call(this, ...args);
  
  return instance;
}
```

## 实例判断

```javascript
function _instanceof(target,origin) {
  while(target) {
      if(target.__proto__===origin.prototype) {
         return true
      }
      target = target.__proto__
  }
  return false
}
```

## 数组方法

```javascript
function _map(callback,thisArg) {
    if (typeof callback !== 'function' || !(this instanceof Array)) {
        return;
    }

    const len = this.length;
    if (!len) {
        return this;
    }
    const newArr = [];
    for (let i = 0; i < len; i++ ) {
        newArr.push(callback.call(thisArg,this[i],i,this));
    }
    return newArr
}
```

```javascript
function _reduce(callback,initValue) {
    if (typeof callback !== 'function' || !(this instanceof Array)) {
        return;
    }

    const len = this.length;
    if (!len) {
        return this;
    }
    let totalValue = initValue !== void 0 ? initValue : this[0];
  	let i = initValue !== void 0 ? 0 : 1;
    for (; i < len; i++ ) {
        totalValue = callback(totalValue,this[i],i,this);
    }
    return totalValue
 }
```

```javascript
function _flat(level = 1) {
  const arr = this;
  const result = [];	

  function excute(array, excuteLevel) {
    const len = array.length;
    for (let i = 0; i < len; i++) {
      let currentLevel = excuteLevel;
      if (array[i] instanceof Array && currentLevel > 0) {
        currentLevel--;
        excute(array[i], currentLevel);
        continue;
      }

      result.push(array[i]);
    }
  }

  excute(arr, level);

  return result;
}
```

## 函数方法

```javascript
function _apply(thisArg, args) {
  const fn = this;

  thisArg.__proto__.fn = fn;

  thisArg.fn(...args);

  delete thisArg.__proto__.fn;
}
```

```javascript
function _bind(thisArg, ...outerArgs) {
  const fn = this;

  if (typeof fn !== "function") {
    throw new Error("bind need function");
  }

  function result(...innerArgs) {
    if (this instanceof result) {
      // 构造函数调用
      fn.apply(this, [...outerArgs, ...innerArgs]);
    } else {
      // 函数调用
      fn.apply(thisArg, [...outerArgs, ...innerArgs]);
    }
  }
  result.prototype = fn.prototype;
  return result;
}
```

## 深克隆

```javascript
const ObjectType = (type) => {
  const typelist = {
    "[object Object]": {},
    "[object Array]": [],
    //"[object Map]"
    //"[object Set]"
    //...
  };
  return typelist[type];
};

const _cloneDeep = (target, source) => {
  const keys = Reflect.ownKeys(source);

  keys.forEach((key) => {
    const value = source[key];
    if (typeof value !== "object" || value === null) {
      target[key] = value;
    } else {
      const valueType = Object.prototype.toString.call(value);
      const newTarget = ObjectType(valueType);
      target[key] = _cloneDeep(newTarget, value);
    }
  });

  return target;
}
```

## 节流防抖

1. 防抖：在 n 秒时间内，函数只会触发一次，如果期间被触发，则重新计时。

```javascript
function debounce(fn, time, immediate) {
  let timer = null;

  return function () {
    const _this = this;
    const args = arguments;

    clearTimeout(timer);

    if(immediate && timer === null) {
        fn.apply(_this, args);
        timer = 0;
        return;
    }

    timer = setTimeout(() => {
      fn.apply(_this, args);
    }, time);
  };
}
```

2. 节流：在 n 秒内，事件只执行一次，如果期间被触发，也不会响应事件

```javascript
function throttle(fn, time) {
  let timer = null;

  return function () {
    const _this = this;
    const args = arguments;

    if (timer) {
      return;
    }
    
    timer = setTimeout(() => {
      fn.apply(_this, args);
      timer = null;
    }, time);
  };
}
```

or

```javascript
function throttle(fn, time) {
  let startTime = Date.now();

  return function () {
    const _this = this;
    const args = arguments;
    const nowTime = Date.now();

    if (nowTime - startTime >= time) {
      fn.apply(_this, args);
      startTime = nowTime;
    }
  };
}
```


# Jest 使用

1. 基本测试：

```javascript
test(testName,testFn => {
    Expect(statement).matchers(value)
})
```

2. 异步测试：jest 需要在处理下一个测试前知道异步操作什么时候完成，有 4 种处理方式。

```javascript
// 需要测试的函数
function asyncFn(cb) {
    setTimeout(() => {
        cb('complete')
    }, 1000)
}

function asyncPromise(beError) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if(beError) {
                console.log(beError)
                reject('error');
            }else {
                resolve('complete');
            }
        }, 1000);
    })
}

// 方式1：回调函数
// 用回调函数接收异步数据，用done()告诉jest这个异步操作结束的时间点
// 不用done(), jest执行到test块底部直接退出
test(testName,(done) => {    
  const callback = ( data ) => {       
    try {             
      expect( data ).toBe(somthing);             
      done();        
    }catch(err){              
      done(err);        
    }    
  }    
  asyncFn(callback);
})

// 方式2：如果异步函数用的是promise，一定要将prmoise返回出去，
// 2.1: then/catch方式
test(testName,() => {
  // promise成功
  return asyncPromise().then( data => expect(data).toBe('complete'));
  // promise失败，必须添加assertions，否则测试不会失败
  expect.assertions(1);
  return asyncPromise('error').catch(e => expect(e).toMatch('error'));
})
// 2.2: .resolves/.rejects方式
test(testName, () => {
  // promise成功
  return expect(asyncPromise()).resolves.toBe('complete');
   // promise失败
  return expect(asyncPromise()).rejects.toMatch('error');
});

// 方式3：Async/Await
test(testName, async () => {
  // 测试成功情况
  const data = await asyncPromise();
  expect(data).toBe('complete');
  // 测试失败情况
  expect.assertions(1);
  try {
    await fetchData();
  } catch (e) {
    expect(e).toMatch('error');
  }
});

// 方式4： 混合Async/Await以及.resolves/.rejects
test(testName, async () => {
  // 测试成功情况
	await expect(asyncPromise()).resolves.toBe('complete');
	// 测试失败情况
  await expect(asyncPromise()).rejects.toMatch('error');
})
```

3. 拦截测试: 
    - 3.1 beforeEach/afterEach：
```javascript
let count = 0;
function sum() {
    return count % 2 === 0 ? `even:${count}` : `odd:${count}`;
}

// beforeEach/afterEach: 每个测试执行前/后，执行操作，同异步操作可接收done也可返回promise
beforeEach(() => {
    count++;
})

// beforeAll/afterAll: 所有测试 开始/结束 前执行一次
beforeAll(() => {
		count++;
})

// beforeEach: 每个test执行前执行，count依次为1,2，2个测试均通过
// beforeAll: 所有test执行前执行一次，count为1，仅第一个测试通过
test('count is odd', () => {
    expect(sum()).toBe(`odd:${count}`)
})
test('count is even', () => {
    expect(sum()).toBe(`even:${count}`)
}) 
```

    - 3.2 作用域：beforeAll/beforeEach 对整个测试文件内所有测试生效，可以用 describe 块分割测试，在每个 describe 内的 beforeAll/beforeEach 只对该块生效
```javascript
beforeAll(() => console.log('1 - beforeAll'));
afterAll(() => console.log('1 - afterAll'));
beforeEach(() => console.log('1 - beforeEach'));
afterEach(() => console.log('1 - afterEach'));
test('', () => console.log('1 - test'));
describe('Scoped / Nested block', () => {
  beforeAll(() => console.log('2 - beforeAll'));
  afterAll(() => console.log('2 - afterAll'));
  beforeEach(() => console.log('2 - beforeEach'));
  afterEach(() => console.log('2 - afterEach'));
  test('', () => console.log('2 - test'));
});

// 1 - beforeAll
// 	1 - beforeEach
// 		1 - test
// 	1 - afterEach
// 	2 - beforeAll
// 	1 - beforeEach
// 		2 - beforeEach
// 			2 - test
// 		2 - afterEach
// 	1 - afterEach
// 	2 - afterAll
// 1 - afterAll
``` 
    - 3.3 执行顺序： 在一个测试文件中，先执行完所有describe函数，在执行每个测试

```javascript
describe('outer', () => {
    console.log('describe outer-a');
  
    describe('describe inner 1', () => {
      console.log('describe inner 1');
      test('test 1', () => {
        console.log('test for describe inner 1');
        expect(true).toEqual(true);
      });
    });
  
    console.log('describe outer-b');
  
    test('test 1', () => {
      console.log('test for describe outer');
      expect(true).toEqual(true);
    });
  
    describe('describe inner 2', () => {
      console.log('describe inner 2');
      test('test for describe inner 2', () => {
        console.log('test for describe inner 2');
        expect(false).toEqual(false);
      });
    });
  
    console.log('describe outer-c');
});
'describe outer-a'
'describe inner 1'
'describe outer-b'
'describe inner 2'
'describe outer-c'
'test for describe inner 1'
'test for describe outer'
'test for describe inner 2'
```

- 3.4 test.only：唯一的测试，不与其它测试相互影响

4. 模拟函数：模拟函数调用、参数调用、构造函数实例化、并允许配置测试时的返回值

- 测试函数

```javascript
// 待测试函数
function forEach(items, callback) {
  for (let index = 0; index < items.length; index++) {
    callback(items[index]);
  }
}

// mock一个函数，并检查mock's的状态，确保回调函数按我们期待的方式调用
const mockCallback = jest.fn(x => x + 1);
forEach([0,1], mockCallback);

// mock函数被调用2次
expect(mockCallback.mock.calls.length).toBe(2);
```

- .mock 属性：保存模拟函数的 this、传参、返回值等
- 模拟返回值：可以用来在测试期间注入返回值

```javascript
const myMock = jest.fn(x => x + 1);
console.log(myMock(0));// > undefined

myMock.mockReturnValueOnce(10).mockReturnValueOnce('x').mockReturnValue(true);
console.log(myMock(), myMock(), myMock(), myMock());// 10 x true true
```

- 模拟模块调用：不必真正执行模块API，通过jest.mock()模拟模块，并通过mockResolvedValue注入API的返回值

```javascript
import axios from 'axios';

class Users {
  static all() {
    return axios.get('/users.json').then(resp => resp.data);
  }
}

jest.mock('axios');

test('should fetch users', () => {
  const users = [{name: 'Bob'}];
  const resp = {data: users};
  axios.get.mockResolvedValue(resp);
  
  // axios.get.mockImplementation(() => Promise.resolve(resp))

  return Users.all().then(data => expect(data).toEqual(users));
});
```

- 模拟模块的一部分

```javascript
// index.js
export const foo = 'foo';
export const bar = () => 'bar';
export default () => 'baz';

// index.test.js
import defaultExport, {bar, foo} from '../foo-bar-baz';

jest.mock('../foo-bar-baz', () => {
  const originalModule = jest.requireActual('../foo-bar-baz');// 拿到原模块

  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn(() => 'mocked baz'),
    foo: 'mocked foo',
  };
});

test('should do a partial mock', () => {
  const defaultExportResult = defaultExport();
  expect(defaultExportResult).toBe('mocked baz');
  expect(defaultExport).toHaveBeenCalled();

  expect(foo).toBe('mocked foo');
  expect(bar()).toBe('bar');
});
```

- 替换模拟函数

```javascript
// 方法1：jest.fn
const myMockFn = jest.fn(cb => cb(null, true));

myMockFn((err, val) => console.log(val));

// 方法2：mockImplementation
// index.js
const fn = () => {console.log('index')}
export default fn;

// index.test.js
import fn from './index';
jest.mock('./index');

fn.mockImplementation(() => console.log(42));
test('tt', () => {
    fn() // 42
})
```

5. 快照 Snapshot：可用于测试 API、UI、日志、错误消息等，以 react 组件测试为例，用渲染器生成一个序列化的值作为快照

```javascript
// yarn test
// 创建__snapshots__文件夹保存生成的序列化值
import React from 'react';
import renderer from 'react-test-renderer';

function Link({page, children}) {
  return <a href={page}>{children}</a>
}

it('renders correctly', () => {
  const tree = renderer
    .create(<Link page="http://www.facebo.com">Facebook</Link>)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

// 对于对象，如果有动态生成的属性，每次测试会失败
// 可以在matcher里指定值的类型,matcher里的值会在测试前代替对象的值，保存起来
it('renders correctly', () => {
  const tree = {
  	date: new Date(),
    age: 12
  }
  expect(tree).toMatchSnapshot({
  	date: expect.any(Date),
    age: 12
  });
});
```

+ 最佳实践：
    1. 将测试作为代码对待，保证测试是短小的、功能专一的
    2. 测试的输出应该是纯的，相同输入测试结果应该相同，假设组件用到了 Date.now()，应该将其转化为 mock 函数 Date.now = jest.fn(() => 1)，以保证每次运行不会影响测试结果

6. time 模拟：jest 提供追踪 timer 函数功能

```javascript
function timerGame(callback) {
  console.log('Ready....go!');
  setTimeout(() => {
    console.log("Time's up -- stop!");
    callback && callback();
  }, 1000);
}

jest.useFakeTimers();// 告诉jest使用mock的timer函数
jest.spyOn(global, 'setTimeout');// 追踪global.setTimeout()

test('waits 1 second before ending the game', () => {
  timerGame();

  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
});

test('回调函数被执行',() => {
	const callback = jest.fn();
  timerGame(callback);
  
  expect(callback).not.toBeCalled();
  // 快进到timer回调函数执行后
  jest.runAllTimers();
  
  // 对于timers调用自己生成的死循环
  // 用jest.runOnlyPendingTimers()，保证只执行第一次的循环，后面不执行
  
  // 快进指定的时间
  // jest.advanceTimersByTime(1000);
  
  // 清除排队的所有timers
  // jest.clearAllTimers();
  
  expect(callback).toBeCalled();
  expect(callback).toHaveBeenCalledTimes(1)
})
```

7. Manual mock：通过假数据模拟功能

    - 普通模块：在模块（例如 user.js）同层目录创建 `__mocks__/user.js`，并在调用时用 jest.mock（userPath）指明使用的模拟模块
    - node 模块：在根目录下创建同名 `__mocks__/moduleName` 文件进行 mock

8. 模拟 class 类实现的四种方式：

```javascript
// 方法1. 自动模拟：将类的构造函数和方法用mock function替代，以追踪对构造函数和类方法的调用，箭头函数除外
    // add.js
    class Add {
      constructor() {
        this.name = 'add';
      }

      getName(newName) {
        return this.name = newName;
      }
    }

    export default Add;
    // add.test.js
    import Add from './add.js';
    jest.mock('./add.js');// Add类构造函数和方法均被替换了

    beforeEach(() => {
      // 清除所有对构造函数和方法的调用
      Add.mockClear();
    });

    it('检查实例及方法是否正确调用', () => {
      // Show that mockClear() is working:
      expect(Add).not.toHaveBeenCalled();

      const addInstance = new Add();
      // Add构造函数被调用
      expect(Add).toHaveBeenCalledTimes(1);

      const mockGetName = addInstance.getName;
      mockGetName('new_add');
      const mockAddInstance = Add.mock.instances[0];

      expect(addInstance).toEqual(mockAddInstance);
      expect(mockGetName.mock.calls[0][0]).toEqual('new_add');
    });

// 方法2：在同级目录下创建__mocks__/className，在其中模拟class实现
    // __mocks__/Add.js
    export const mockGetName = jest.fn(name => name);
    const mock = jest.fn().mockImplementation(() => {
      return { getName: mockGetName }
    })
    export default mock

    // Add.test.js
    import Add, { mockGetName } from './Add';
    jest.mock('./Add');

    beforeEach(() => {
      Add.mockClear();
      mockGetName.mockClear();
    });

    it('检查实例及方法是否正确调用 manual mock', () => {
      const addInstance = new Add();
      addInstance.getName('new_add');
      expect(mockGetName).toHaveBeenCalledWith('new_add');
    });

// 方法3： jest.mock(path, moduleFactory)模块工厂方式，
    // 为了模拟构造函数，moduleFactory必须返回一个函数
    // jest.mock会向var变量一样提升到顶部，对于const、let变量必须以'mock'开头
    // Add.test.js
    import Add from './add';
    const mockGetName = jest.fn();
    jest.mock('./add', () => {
      return jest.fn().mockImplementation(() => {
        return {getName: mockGetName};
      });
    });

// 方法4：用mockImplementation() /mockImplementationOnce()替换上述mock实现，让我们有机会在不同的测试中定义不同的mock实现;
    // add.test.js
    import Add from './Add';
    jest.mock('./Add');

    describe('Add 抛出错误', () => {
      beforeAll(() => {
        Add.mockImplementation(() => {
          return {
            getName: () => {
              throw new Error('Test error');
            },
          };
        });
      });

      it('getName 应该抛出错误', () => {
        const addInstance = new Add();
        expect(() => addInstance.getName()).toThrow();
      });
    });

// 注意对于方法2、方法3来说，我们用jest.fn().mockImplementation(() => {})方式用其mock构造函数
// 如果我们用普通函数，是无法追踪的
		import Add from './add';
    const mockGetName = jest.fn();
    jest.mock('./user', () => {
      return function (){
        return {getName: mockGetName};
      };
    });

		it('检查实例是否被调用', () => {
      new Add();
      expect(Add).toHaveBeenCalled();
    });
```

# CommonJS

Node 支持 CommonJS 和 ESModule 两种加载模块的方式，下面看下 CommonJS 加载流程

当我们用 node 命令加载一个模块时，首先拿到绝对路径交给 Module._load 执行

```javascript
// 1. lib/interal/main/run_main_module
// 2. lib/interal/modules/run_main
function executeUserEntryPoint(main = process.argv[1]) {
    // 拿到绝对路径      
    const resolvedMain = resolveMainPath(main);
    const useESMLoader = shouldUseESMLoader(resolvedMain);
    if (useESMLoader) {
        runMainESM(resolvedMain || main);
    } else {
        // Cjs
        Module._load(main, null, true);
    }
}
```

```javascript
Module._load = function(request, parent, isMain) {
  let relResolveCacheIdentifier
    // 处理 unix、windows 路径兼容性，拿到绝对路径
  const filename = Module._resolveFilename(request, parent, isMain);
  // 以核心模块的方式引用，直接返回内置模块
  if (StringPrototypeStartsWith(filename, 'node:')) {
    const id = StringPrototypeSlice(filename, 5);
    const module = loadNativeModule(id, request);
    if (!module?.canBeRequiredByUsers) {
      throw new ERR_UNKNOWN_BUILTIN_MODULE(filename);
    }

    return module.exports;
  }
    // 类是否加载过
  const cachedModule = Module._cache[filename];
  if (cachedModule !== undefined) {
    // parent.children 中没有 cacheModule，追加
    updateChildren(parent, cachedModule, true);
    if (!cachedModule.loaded) {
      const parseCachedModule = cjsParseCache.get(cachedModule);
      if (!parseCachedModule || parseCachedModule.loaded)
        return getExportsForCircularRequire(cachedModule);
      parseCachedModule.loaded = true;
    } else {
      return cachedModule.exports;
    }
  }
    // 先找同名内置模块
  const mod = loadNativeModule(filename, request);
  if (mod?.canBeRequiredByUsers) return mod.exports;

  /*
  function Module(id = '', parent) {
    // 绝对路径作为 id
    this.id = id;
    this.path = path.dirname(id);
    this.exports = {};
    moduleParentCache.set(this, parent);
    updateChildren(parent, this, false);
    this.filename = null;
    // 是否加载过
    this.loaded = false;
    this.children = [];
    }
  */
  const module = cachedModule || new Module(filename, parent);
    // 是否是根模块，我们 node ***.** 命令的模块
  if (isMain) {
    process.mainModule = module;
    module.id = '.';
  }

  Module._cache[filename] = module;
  if (parent !== undefined) {
    relativeResolveCache[relResolveCacheIdentifier] = filename;
  }

  let threw = true;
  try {
    module.load(filename);
    threw = false;
  } finally {
    if (threw) {
      delete Module._cache[filename];
      if (parent !== undefined) {
        delete relativeResolveCache[relResolveCacheIdentifier];
        const children = parent?.children;
        if (ArrayIsArray(children)) {
          const index = ArrayPrototypeIndexOf(children, module);
          if (index !== -1) {
            ArrayPrototypeSplice(children, index, 1);
          }
        }
      }
    } else if (module.exports &&
               !isProxy(module.exports) &&
               ObjectGetPrototypeOf(module.exports) ===
                 CircularRequirePrototypeWarningProxy) {
      ObjectSetPrototypeOf(module.exports, ObjectPrototype);
    }
  }

  return module.exports;
};
```

加载模块的逻辑就是执行 module.load

```javascript
Module.prototype.load = function(filename) {
  this.filename = filename;
  this.paths = Module._nodeModulePaths(path.dirname(filename));

  const extension = findLongestRegisteredExtension(filename);
  // Module._extensions: { .js: fn, .json: fn, .node: fn }，包含 3 个加载函数
  Module._extensions[extension](this, filename);
  this.loaded = true;
};

Module._extensions['.js'] = function(module, filename) {
  // 读取文件内容并缓存
  const cached = cjsParseCache.get(module);
  let content;
  if (cached?.source) {
    content = cached.source;
    cached.source = undefined;
  } else {
    content = fs.readFileSync(filename, 'utf8');
  }
  module._compile(content, filename);
};

let wrap = function(script) {
  return Module.wrapper[0] + script + Module.wrapper[1];
};

const wrapper = [
  '(function (exports, require, module, __filename, __dirname) { ',
  '\n});',
];

function wrapSafe(filename, content, cjsModuleInstance) {
  if (patched) {
    const wrapper = Module.wrap(content);
    return vm.runInThisContext(wrapper, {
      filename,
      lineOffset: 0,
      displayErrors: true,
      importModuleDynamically: async (specifier) => {
        const loader = asyncESM.esmLoader;
        return loader.import(specifier, normalizeReferrerURL(filename));
      },
    });
  }
}

Module.prototype._compile = function(content, filename) {
    let moduleURL;
    let redirects;

    const compiledWrapper = wrapSafe(filename, content, this);

    let inspectorWrapper = null;
    const dirname = path.dirname(filename);
    const require = makeRequireFunction(this, redirects);
    let result;
    const exports = this.exports;
    const thisValue = exports;
    const module = this;

    result = ReflectApply(compiledWrapper, thisValue, [exports, require, module, filename, dirname]);

    return result;
};
```

可以总结模块加载过程如下：

1. 拿到模块绝对路径
2. 如果以 `node:` 方式引入，或者已经缓存过模块则直接返回。否则创建 Module 实例，进入加载过程
    - 根据后缀名读取文件内容
    - 用 wrapper 包裹，放入 vm.runInThisContext 中执行


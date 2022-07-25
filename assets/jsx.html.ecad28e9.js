import{c as n}from"./app.9dca4400.js";import{_ as s}from"./plugin-vue_export-helper.21dcd24c.js";const a={},p=n(`<h1 id="react-todo" tabindex="-1"><a class="header-anchor" href="#react-todo" aria-hidden="true">#</a> React TODO</h1><p>\u8001\u7684 React \u67B6\u6784\u91C7\u7528\u9012\u5F52\u7684\u65B9\u5F0F\u66F4\u65B0\u5B50\u7EC4\u4EF6\uFF0C\u5982\u679C\u9012\u5F52\u7684\u66F4\u65B0\u65F6\u95F4\u8D85\u8FC7 16 ms\uFF0C\u9875\u9762\u5C31\u53EF\u80FD\u51FA\u73B0\u5361\u987F\uFF0CReact 16 \u5C06\u9012\u5F52\u7684\u66F4\u65B0\u53D8\u4E3A\u53EF\u4E2D\u65AD\u3001\u5728\u6D4F\u89C8\u5668\u7A7A\u95F2\u65F6\u95F4\u6BB5\u6267\u884C\u7684\u66F4\u65B0</p><p>React 16 \u7684\u67B6\u6784\u53EF\u4EE5\u5206\u4E3A\uFF1A</p><ul><li>Scheduler\uFF08\u8C03\u5EA6\u5668\uFF09\uFF1A\u8C03\u5EA6\u4EFB\u52A1\u4F18\u5148\u7EA7</li><li>Reconciler\uFF08\u534F\u8C03\u5668\uFF09\uFF1A\u627E\u51FA\u53D8\u5316\u7684\u7EC4\u4EF6</li><li>Render\uFF08\u6E32\u67D3\u5668\uFF09\uFF1A\u5C06\u53D8\u5316\u7684\u7EC4\u4EF6\u6E32\u67D3\u5230\u9875\u9762\u4E0A</li></ul><p>\u8FD9\u4E2A\u6587\u6863\u7684\u7EC8\u6781\u76EE\u6807\u662F\u5B9E\u73B0\u4E00\u4E2A\u5177\u5907\u57FA\u672C\u529F\u80FD\u7684 react\uFF0C\u5B9E\u73B0\u5305\u62EC\u7EC4\u4EF6\u7684\u521B\u5EFA\u4E0E\u66F4\u65B0\u3001\u4E8B\u4EF6\u7CFB\u7EDF\u3001hook \u51FD\u6570\u7B49\u529F\u80FD\uFF0C\u6682\u65F6\u4E0D\u5305\u62EC Scheduler</p><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token comment">// Address: \u6E90\u7801\u5730\u5740</span>
<span class="token comment">// Equal: \u53D8\u91CF x \u6307\u5411\u67D0\u4E00\u51FD\u6570 fn</span>
<span class="token comment">// TODO: \u5F85\u5B8C\u5584\u5185\u5BB9</span>
</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><h2 id="jsx" tabindex="-1"><a class="header-anchor" href="#jsx" aria-hidden="true">#</a> JSX</h2><p>\u65B0\u7684 JSX \u8F6C\u6362\u4E0D\u4F1A\u5C06 JSX \u8F6C\u6362\u4E3A React.createElement\uFF0C\u800C\u662F\u81EA\u52A8\u4ECE React \u7684 package \u4E2D\u5F15\u5165\u65B0\u7684\u5165\u53E3\u51FD\u6570\u5E76\u8C03\u7528</p><p>\u5F53\u521B\u5EFA\u7EC4\u4EF6\u65F6\u4F1A\u8C03\u7528\u4E0B\u9762 JSX \u51FD\u6570\uFF0C\u5C06\u7EC4\u4EF6\u653E\u5230 element \u5BF9\u8C61\u7684 type \u4E0A</p><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">const</span> <span class="token constant">RESERVED_PROPS</span> <span class="token operator">=</span> <span class="token punctuation">{</span>
  key<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
  ref<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
  __self<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
  __source<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span>
<span class="token keyword">function</span> <span class="token constant">JSX</span><span class="token punctuation">(</span><span class="token parameter">type<span class="token punctuation">,</span> config</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">let</span> propName
    <span class="token keyword">const</span> props <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
    <span class="token keyword">let</span> key <span class="token operator">=</span> <span class="token keyword">null</span>
    <span class="token keyword">let</span> ref <span class="token operator">=</span> <span class="token keyword">null</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>key <span class="token keyword">in</span> config<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        key <span class="token operator">=</span> <span class="token string">&#39;&#39;</span> <span class="token operator">+</span> config<span class="token punctuation">.</span>key
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ref <span class="token keyword">in</span> config<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        ref <span class="token operator">=</span> config<span class="token punctuation">.</span>ref
    <span class="token punctuation">}</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span>propName <span class="token keyword">in</span> config<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>config<span class="token punctuation">.</span><span class="token function">hasOwnProperty</span><span class="token punctuation">(</span>propName<span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span> 
            <span class="token operator">!</span><span class="token constant">RESERVED_PROPS</span><span class="token punctuation">.</span><span class="token function">hasOwnProperty</span><span class="token punctuation">(</span>propName<span class="token punctuation">)</span>
        <span class="token punctuation">)</span> <span class="token punctuation">{</span>
            props<span class="token punctuation">[</span>propName<span class="token punctuation">]</span> <span class="token operator">=</span> config<span class="token punctuation">[</span>propName<span class="token punctuation">]</span>
        <span class="token punctuation">}</span>  
    <span class="token punctuation">}</span>
    <span class="token keyword">const</span> childrenLength <span class="token operator">=</span> arguments<span class="token punctuation">.</span>length <span class="token operator">-</span> <span class="token number">2</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>childrenLength <span class="token operator">===</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        props<span class="token punctuation">.</span>children <span class="token operator">=</span> children<span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>childrenLength <span class="token operator">&gt;</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> childArray <span class="token operator">=</span> <span class="token function">Array</span><span class="token punctuation">(</span>childrenLength<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> childrenLength<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            childArray<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> arguments<span class="token punctuation">[</span>i <span class="token operator">+</span> <span class="token number">2</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        props<span class="token punctuation">.</span>children <span class="token operator">=</span> childArray<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token function">ReactElement</span><span class="token punctuation">(</span>
        type<span class="token punctuation">,</span>
        key<span class="token punctuation">,</span>
        ref<span class="token punctuation">,</span>
        <span class="token keyword">null</span><span class="token punctuation">,</span>
        <span class="token keyword">null</span><span class="token punctuation">,</span>
        <span class="token keyword">null</span><span class="token punctuation">,</span>
        props<span class="token punctuation">,</span>
    <span class="token punctuation">)</span>
<span class="token punctuation">}</span>
<span class="token keyword">const</span> <span class="token function-variable function">ReactElement</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token parameter">type<span class="token punctuation">,</span> key<span class="token punctuation">,</span> ref<span class="token punctuation">,</span> self<span class="token punctuation">,</span> source<span class="token punctuation">,</span> owner<span class="token punctuation">,</span> props</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> element <span class="token operator">=</span> <span class="token punctuation">{</span>
    $$<span class="token keyword">typeof</span><span class="token operator">:</span> <span class="token constant">REACT_ELEMENT_TYPE</span><span class="token punctuation">,</span>
    type<span class="token operator">:</span> type<span class="token punctuation">,</span>
    key<span class="token operator">:</span> key<span class="token punctuation">,</span>
    ref<span class="token operator">:</span> ref<span class="token punctuation">,</span>
    props<span class="token operator">:</span> props<span class="token punctuation">,</span>
    <span class="token comment">// \u8BB0\u5F55\u8C01\u521B\u5EFA\u7684\u8FD9\u4E2A element</span>
    _owner<span class="token operator">:</span> owner<span class="token punctuation">,</span>
  <span class="token punctuation">}</span>
  <span class="token keyword">return</span> element
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br></div></div><h2 id="\u6839\u8282\u70B9" tabindex="-1"><a class="header-anchor" href="#\u6839\u8282\u70B9" aria-hidden="true">#</a> \u6839\u8282\u70B9</h2><p>\u6211\u4EEC\u9700\u8981\u5C06 react \u521B\u5EFA\u7684\u89C6\u56FE\u6E32\u67D3\u5230\u9875\u9762\u7684\u6839\u8282\u70B9\u4E2D\uFF0C\u901A\u8FC7 <code>ReactDom.createRoot(document.getElementById(&#39;root&#39;))</code> \u521B\u5EFA\u6839\u8282\u70B9</p><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token comment">// Address: react\\packages\\react-dom\\src\\client\\ReactDOMRoot.js</span>
<span class="token keyword">const</span> ConcurrentRoot <span class="token operator">=</span> <span class="token number">1</span>
<span class="token keyword">function</span> <span class="token function">createRoot</span><span class="token punctuation">(</span><span class="token parameter">container<span class="token punctuation">,</span> options</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> root <span class="token operator">=</span> <span class="token function">createContainer</span><span class="token punctuation">(</span>container<span class="token punctuation">,</span> ConcurrentRoot<span class="token punctuation">)</span>
  <span class="token comment">// \u8BA9 container \u7684\u7279\u6B8A\u5C5E\u6027 __reactContainer$ \u6307\u5411 root.current</span>
  <span class="token comment">// markContainerAsRoot(root.current, container);</span>
  <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">ReactDOMRoot</span><span class="token punctuation">(</span>root<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">ReactDOMRoot</span><span class="token punctuation">(</span><span class="token parameter">internalRoot</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>_internalRoot <span class="token operator">=</span> internalRoot<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token class-name">ReactDOMRoot</span><span class="token punctuation">.</span>prototype<span class="token punctuation">.</span><span class="token function-variable function">render</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token parameter">children</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> root <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span>_internalRoot
  <span class="token function">updateContainer</span><span class="token punctuation">(</span>children<span class="token punctuation">,</span> root<span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token comment">// Address: react\\packages\\react-reconciler\\src\\ReactFiberReconciler.js</span>
<span class="token keyword">function</span> <span class="token function">createContainer</span><span class="token punctuation">(</span><span class="token parameter">containerInfo<span class="token punctuation">,</span> tag</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> initialChildren <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  <span class="token keyword">return</span> <span class="token function">createFiberRoot</span><span class="token punctuation">(</span>containerInfo<span class="token punctuation">,</span> tag<span class="token punctuation">,</span> initialChildren<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token comment">// Address: react\\packages\\react-reconciler\\src\\ReactFiberRoot.new.js</span>
<span class="token keyword">export</span> <span class="token keyword">function</span> <span class="token function">createFiberRoot</span><span class="token punctuation">(</span><span class="token parameter">containerInfo<span class="token punctuation">,</span> tag<span class="token punctuation">,</span> initialChildren</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> root <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">FiberRootNode</span><span class="token punctuation">(</span>containerInfo<span class="token punctuation">,</span> tag<span class="token punctuation">)</span>

  <span class="token keyword">const</span> uninitializedFiber <span class="token operator">=</span> <span class="token function">createHostRootFiber</span><span class="token punctuation">(</span>tag<span class="token punctuation">)</span>
  root<span class="token punctuation">.</span>current <span class="token operator">=</span> uninitializedFiber<span class="token punctuation">;</span>
  uninitializedFiber<span class="token punctuation">.</span>stateNode <span class="token operator">=</span> root<span class="token punctuation">;</span>

  <span class="token keyword">const</span> initialState <span class="token operator">=</span> <span class="token punctuation">{</span>
    element<span class="token operator">:</span> initialChildren
  <span class="token punctuation">}</span>
  uninitializedFiber<span class="token punctuation">.</span>memoizedState <span class="token operator">=</span> initialState<span class="token punctuation">;</span>

  <span class="token function">initializeUpdateQueue</span><span class="token punctuation">(</span>uninitializedFiber<span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> root<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">FiberRootNode</span><span class="token punctuation">(</span><span class="token parameter">containerInfo<span class="token punctuation">,</span> tag</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>tag <span class="token operator">=</span> tag
  <span class="token keyword">this</span><span class="token punctuation">.</span>containerInfo <span class="token operator">=</span> containerInfo
  <span class="token keyword">this</span><span class="token punctuation">.</span>pendingChildren <span class="token operator">=</span> <span class="token keyword">null</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>current <span class="token operator">=</span> <span class="token keyword">null</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>finishedWork <span class="token operator">=</span> <span class="token keyword">null</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>memoizedUpdaters <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token comment">// Address: react\\packages\\react-reconciler\\src\\ReactWorkTags.js</span>
<span class="token keyword">export</span> <span class="token keyword">const</span> FunctionComponent <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token keyword">export</span> <span class="token keyword">const</span> ClassComponent <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
<span class="token keyword">export</span> <span class="token keyword">const</span> HostRoot <span class="token operator">=</span> <span class="token number">3</span><span class="token punctuation">;</span> 
<span class="token keyword">export</span> <span class="token keyword">const</span> HostComponent <span class="token operator">=</span> <span class="token number">5</span><span class="token punctuation">;</span>
<span class="token keyword">export</span> <span class="token keyword">const</span> HostText <span class="token operator">=</span> <span class="token number">6</span><span class="token punctuation">;</span>

<span class="token comment">// Address: react\\packages\\react-reconciler\\src\\ReactFiber.new.js</span>
<span class="token keyword">export</span> <span class="token keyword">function</span> <span class="token function">createHostRootFiber</span><span class="token punctuation">(</span><span class="token parameter">tag</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">let</span> mode<span class="token punctuation">;</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>tag <span class="token operator">===</span> ConcurrentRoot<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    mode <span class="token operator">=</span> ConcurrentMode<span class="token punctuation">;</span>
  <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
    mode <span class="token operator">=</span> NoMode<span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token keyword">return</span> <span class="token function">createFiber</span><span class="token punctuation">(</span>HostRoot<span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">,</span> mode<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> <span class="token function-variable function">createFiber</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token parameter">tag<span class="token punctuation">,</span> pendingProps<span class="token punctuation">,</span> key<span class="token punctuation">,</span> mode</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">FiberNode</span><span class="token punctuation">(</span>tag<span class="token punctuation">,</span> pendingProps<span class="token punctuation">,</span> key<span class="token punctuation">,</span> mode<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">FiberNode</span><span class="token punctuation">(</span><span class="token parameter">tag<span class="token punctuation">,</span> pendingProps<span class="token punctuation">,</span> key<span class="token punctuation">,</span> mode</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token comment">// Instance</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>tag <span class="token operator">=</span> tag<span class="token punctuation">;</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>key <span class="token operator">=</span> key<span class="token punctuation">;</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>elementType <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>type <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>stateNode <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>

  <span class="token comment">// Fiber</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>return <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>child <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>sibling <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>index <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>ref <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>pendingProps <span class="token operator">=</span> pendingProps<span class="token punctuation">;</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>memoizedProps <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>updateQueue <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>memoizedState <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>mode <span class="token operator">=</span> mode<span class="token punctuation">;</span>

  <span class="token comment">// Effects</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>flags <span class="token operator">=</span> NoFlags<span class="token punctuation">;</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>subtreeFlags <span class="token operator">=</span> NoFlags<span class="token punctuation">;</span>
  <span class="token keyword">this</span><span class="token punctuation">.</span>alternate <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token comment">// Address: react\\packages\\react-reconciler\\src\\ReactFiberClassUpdateQueue.new.js</span>
<span class="token keyword">export</span> <span class="token keyword">function</span> <span class="token function">initializeUpdateQueue</span><span class="token punctuation">(</span><span class="token parameter">fiber</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> queue <span class="token operator">=</span> <span class="token punctuation">{</span>
    baseState<span class="token operator">:</span> fiber<span class="token punctuation">.</span>memoizedState<span class="token punctuation">,</span>
    firstBaseUpdate<span class="token operator">:</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
    lastBaseUpdate<span class="token operator">:</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
    shared<span class="token operator">:</span> <span class="token punctuation">{</span>
      pending<span class="token operator">:</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
      lanes<span class="token operator">:</span> NoLanes<span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    effects<span class="token operator">:</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">;</span>
  fiber<span class="token punctuation">.</span>updateQueue <span class="token operator">=</span> queue<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br><span class="line-number">72</span><br><span class="line-number">73</span><br><span class="line-number">74</span><br><span class="line-number">75</span><br><span class="line-number">76</span><br><span class="line-number">77</span><br><span class="line-number">78</span><br><span class="line-number">79</span><br><span class="line-number">80</span><br><span class="line-number">81</span><br><span class="line-number">82</span><br><span class="line-number">83</span><br><span class="line-number">84</span><br><span class="line-number">85</span><br><span class="line-number">86</span><br><span class="line-number">87</span><br><span class="line-number">88</span><br><span class="line-number">89</span><br><span class="line-number">90</span><br><span class="line-number">91</span><br><span class="line-number">92</span><br><span class="line-number">93</span><br><span class="line-number">94</span><br><span class="line-number">95</span><br><span class="line-number">96</span><br><span class="line-number">97</span><br><span class="line-number">98</span><br><span class="line-number">99</span><br><span class="line-number">100</span><br><span class="line-number">101</span><br><span class="line-number">102</span><br><span class="line-number">103</span><br><span class="line-number">104</span><br><span class="line-number">105</span><br><span class="line-number">106</span><br><span class="line-number">107</span><br><span class="line-number">108</span><br><span class="line-number">109</span><br><span class="line-number">110</span><br><span class="line-number">111</span><br><span class="line-number">112</span><br><span class="line-number">113</span><br><span class="line-number">114</span><br></div></div><p>\u4E0A\u9762\u4EE3\u7801\u4E3B\u8981\u505A\u4E86 3 \u4EF6\u4E8B\uFF1A</p><ol><li>\u521B\u5EFA\u6839\u8282\u70B9 <code>FiberRootNode</code> \uFF0C\u5C06\u6302\u8F7D\u7684\u76EE\u6807\u5143\u7D20\u4FDD\u5B58\u5728\u8282\u70B9\u7684 <code>containerInfo</code> \u5C5E\u6027\u4E2D</li><li>\u521B\u5EFA\u6839 Fiber <code>HostRootFiber</code>\uFF0C\u6807\u8BB0 tag \u662F 3</li><li>\u5C06\u6839\u8282\u70B9\u7684 current \u6307\u5411 <code>HostRootFiber</code>\uFF0C\u7528\u6839 Fiber \u7684 stateNode \u4FDD\u5B58\u6839\u8282\u70B9</li></ol><h2 id="render" tabindex="-1"><a class="header-anchor" href="#render" aria-hidden="true">#</a> render</h2><p>\u8C03\u7528\u4E0A\u9762\u7684 render \u65B9\u6CD5\u4F20\u5165\u5165\u53E3\u7EC4\u4EF6\u5373\u5F00\u59CB\u6E32\u67D3\u6D41\u7A0B</p><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token comment">// Address: react\\packages\\react-reconciler\\src\\ReactFiberReconciler.new.js</span>
<span class="token keyword">function</span> <span class="token function">updateContainer</span><span class="token punctuation">(</span><span class="token parameter">element<span class="token punctuation">,</span> container<span class="token punctuation">,</span> parentComponent<span class="token punctuation">,</span> callback</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> current <span class="token operator">=</span> container<span class="token punctuation">.</span>current <span class="token comment">// HostRootFiber</span>
  <span class="token comment">// TODO: update \u6682\u65F6\u597D\u50CF\u7528\u4E0D\u5230</span>
    <span class="token comment">//   const update = createUpdate(eventTime, lane);</span>
    <span class="token comment">//   update.payload = {element};</span>
    <span class="token comment">//   callback = callback === undefined ? null : callback;</span>
    <span class="token comment">//   if (callback !== null) {</span>
    <span class="token comment">//     update.callback = callback;</span>
    <span class="token comment">//   }</span>

  <span class="token keyword">const</span> root <span class="token operator">=</span> <span class="token function">enqueueUpdate</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> update<span class="token punctuation">,</span> lane<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">return</span> lane<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">enqueueUpdate</span><span class="token punctuation">(</span><span class="token parameter">fiber<span class="token punctuation">,</span> update<span class="token punctuation">,</span> lane</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> updateQueue <span class="token operator">=</span> fiber<span class="token punctuation">.</span>updateQueue<span class="token punctuation">;</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>updateQueue <span class="token operator">===</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// \u7EC4\u4EF6\u5378\u8F7D\u4E86\uFF0C\u6CA1\u6709 updateQueue</span>
    <span class="token keyword">return</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  <span class="token keyword">const</span> sharedQueue <span class="token operator">=</span> updateQueue<span class="token punctuation">.</span>shared<span class="token punctuation">;</span>
  <span class="token keyword">return</span> <span class="token function">enqueueConcurrentClassUpdate</span><span class="token punctuation">(</span>fiber<span class="token punctuation">,</span> sharedQueue<span class="token punctuation">,</span> update<span class="token punctuation">,</span> lane<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token comment">// Address: react\\packages\\react-reconciler\\src\\ReactFiberConcurrentUpdates.new.js</span>
<span class="token keyword">export</span> <span class="token keyword">function</span> <span class="token function">enqueueConcurrentClassUpdate</span><span class="token punctuation">(</span><span class="token parameter">fiber<span class="token punctuation">,</span> queue<span class="token punctuation">,</span> update<span class="token punctuation">,</span> lane</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">let</span> node <span class="token operator">=</span> fiber<span class="token punctuation">;</span>
  <span class="token keyword">let</span> parent <span class="token operator">=</span> node<span class="token punctuation">.</span>return<span class="token punctuation">;</span>
  <span class="token keyword">while</span> <span class="token punctuation">(</span>parent <span class="token operator">!==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    node <span class="token operator">=</span> parent<span class="token punctuation">;</span>
    parent <span class="token operator">=</span> node<span class="token punctuation">.</span>return<span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  <span class="token keyword">return</span> node<span class="token punctuation">.</span>tag <span class="token operator">===</span> HostRoot <span class="token operator">?</span> node<span class="token punctuation">.</span>stateNode <span class="token operator">:</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br></div></div><p>render \u53EF\u4EE5\u7406\u89E3\u4E3A\u60F3\u6D4F\u89C8\u5668\u6CE8\u518C\u4E86\u4E00\u4E9B\u4EFB\u52A1\uFF0CScheduler \u4F1A\u5728\u6D4F\u89C8\u5668\u7A7A\u95F2\u65F6\u6267\u884C\u8FD9\u4E9B\u4EFB\u52A1</p><ul><li>Attention\uFF1A \u6B64\u5904\u5E76\u975E\u5168\u90E8\u6D41\u7A0B\uFF0C\u5F85\u540E\u7EED\u8865\u5145</li></ul><h2 id="\u534F\u8C03" tabindex="-1"><a class="header-anchor" href="#\u534F\u8C03" aria-hidden="true">#</a> \u534F\u8C03</h2><p>\u5F53\u6D4F\u89C8\u5668\u7A7A\u95F2\u65F6\uFF0C\u5F00\u59CB\u534F\u8C03\u8FC7\u7A0B</p><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">let</span> workInProgressRoot <span class="token operator">=</span> <span class="token keyword">null</span>
<span class="token comment">// Address\uFF1Areact\\packages\\react-reconciler\\src\\ReactFiberWorkLoop.new.js</span>
<span class="token keyword">function</span> <span class="token function">performConcurrentWorkOnRoot</span><span class="token punctuation">(</span><span class="token parameter">root<span class="token punctuation">,</span> didTimeout</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token function">renderRootSync</span><span class="token punctuation">(</span>root<span class="token punctuation">,</span> lanes<span class="token punctuation">)</span>

  <span class="token function">ensureRootIsScheduled</span><span class="token punctuation">(</span>root<span class="token punctuation">,</span> <span class="token function">now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>root<span class="token punctuation">.</span>callbackNode <span class="token operator">===</span> originalCallbackNode<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// The task node scheduled for this root is the same one that&#39;s</span>
    <span class="token comment">// currently executed. Need to return a continuation.</span>
    <span class="token keyword">return</span> <span class="token function">performConcurrentWorkOnRoot</span><span class="token punctuation">.</span><span class="token function">bind</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> root<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  <span class="token keyword">return</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">renderRootSync</span><span class="token punctuation">(</span><span class="token parameter">root<span class="token operator">:</span> FiberRoot<span class="token punctuation">,</span> lanes<span class="token operator">:</span> Lanes</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> prevExecutionContext <span class="token operator">=</span> executionContext<span class="token punctuation">;</span>
  executionContext <span class="token operator">|=</span> RenderContext<span class="token punctuation">;</span>
  <span class="token keyword">const</span> prevDispatcher <span class="token operator">=</span> <span class="token function">pushDispatcher</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token comment">// If the root or lanes have changed, throw out the existing stack</span>
  <span class="token comment">// and prepare a fresh one. Otherwise we&#39;ll continue where we left off.</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>workInProgressRoot <span class="token operator">!==</span> root <span class="token operator">||</span> workInProgressRootRenderLanes <span class="token operator">!==</span> lanes<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>enableUpdaterTracking<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>isDevToolsPresent<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> memoizedUpdaters <span class="token operator">=</span> root<span class="token punctuation">.</span>memoizedUpdaters<span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>memoizedUpdaters<span class="token punctuation">.</span>size <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
          <span class="token function">restorePendingUpdaters</span><span class="token punctuation">(</span>root<span class="token punctuation">,</span> workInProgressRootRenderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
          memoizedUpdaters<span class="token punctuation">.</span><span class="token function">clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token comment">// At this point, move Fibers that scheduled the upcoming work from the Map to the Set.</span>
        <span class="token comment">// If we bailout on this work, we&#39;ll move them back (like above).</span>
        <span class="token comment">// It&#39;s important to move them now in case the work spawns more work at the same priority with different updaters.</span>
        <span class="token comment">// That way we can keep the current update and future updates separate.</span>
        <span class="token function">movePendingFibersToMemoized</span><span class="token punctuation">(</span>root<span class="token punctuation">,</span> lanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    workInProgressTransitions <span class="token operator">=</span> <span class="token function">getTransitionsForLanes</span><span class="token punctuation">(</span>root<span class="token punctuation">,</span> lanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">prepareFreshStack</span><span class="token punctuation">(</span>root<span class="token punctuation">,</span> lanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token keyword">if</span> <span class="token punctuation">(</span>enableSchedulingProfiler<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">markRenderStarted</span><span class="token punctuation">(</span>lanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token keyword">do</span> <span class="token punctuation">{</span>
    <span class="token keyword">try</span> <span class="token punctuation">{</span>
      <span class="token function">workLoopSync</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span>thrownValue<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token function">handleError</span><span class="token punctuation">(</span>root<span class="token punctuation">,</span> thrownValue<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span> <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">resetContextDependencies</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  executionContext <span class="token operator">=</span> prevExecutionContext<span class="token punctuation">;</span>
  <span class="token function">popDispatcher</span><span class="token punctuation">(</span>prevDispatcher<span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">if</span> <span class="token punctuation">(</span>workInProgress <span class="token operator">!==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// This is a sync render, so we should have finished the whole tree.</span>
    <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">Error</span><span class="token punctuation">(</span>
      <span class="token string">&#39;Cannot commit an incomplete root. This error is likely caused by a &#39;</span> <span class="token operator">+</span>
        <span class="token string">&#39;bug in React. Please file an issue.&#39;</span><span class="token punctuation">,</span>
    <span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token keyword">if</span> <span class="token punctuation">(</span>__DEV__<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>enableDebugTracing<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token function">logRenderStopped</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>

  <span class="token keyword">if</span> <span class="token punctuation">(</span>enableSchedulingProfiler<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">markRenderStopped</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token comment">// Set this to null to indicate there&#39;s no in-progress render.</span>
  workInProgressRoot <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  workInProgressRootRenderLanes <span class="token operator">=</span> NoLanes<span class="token punctuation">;</span>

  <span class="token keyword">return</span> workInProgressRootExitStatus<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">workLoopSync</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token comment">// Already timed out, so perform work without checking if we need to yield.</span>
  <span class="token keyword">while</span> <span class="token punctuation">(</span>workInProgress <span class="token operator">!==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">performUnitOfWork</span><span class="token punctuation">(</span>workInProgress<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">performUnitOfWork</span><span class="token punctuation">(</span><span class="token parameter">unitOfWork<span class="token operator">:</span> Fiber</span><span class="token punctuation">)</span><span class="token operator">:</span> <span class="token keyword">void</span> <span class="token punctuation">{</span>
  <span class="token comment">// The current, flushed, state of this fiber is the alternate. Ideally</span>
  <span class="token comment">// nothing should rely on this, but relying on it here means that we don&#39;t</span>
  <span class="token comment">// need an additional field on the work in progress.</span>
  <span class="token keyword">const</span> current <span class="token operator">=</span> unitOfWork<span class="token punctuation">.</span>alternate<span class="token punctuation">;</span>

  <span class="token keyword">let</span> next<span class="token punctuation">;</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>enableProfilerTimer <span class="token operator">&amp;&amp;</span> <span class="token punctuation">(</span>unitOfWork<span class="token punctuation">.</span>mode <span class="token operator">&amp;</span> ProfileMode<span class="token punctuation">)</span> <span class="token operator">!==</span> NoMode<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">startProfilerTimer</span><span class="token punctuation">(</span>unitOfWork<span class="token punctuation">)</span><span class="token punctuation">;</span>
    next <span class="token operator">=</span> <span class="token function">beginWork</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> unitOfWork<span class="token punctuation">,</span> subtreeRenderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">stopProfilerTimerIfRunningAndRecordDelta</span><span class="token punctuation">(</span>unitOfWork<span class="token punctuation">,</span> <span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
    next <span class="token operator">=</span> <span class="token function">beginWork</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> unitOfWork<span class="token punctuation">,</span> subtreeRenderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token function">resetCurrentDebugFiberInDEV</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  unitOfWork<span class="token punctuation">.</span>memoizedProps <span class="token operator">=</span> unitOfWork<span class="token punctuation">.</span>pendingProps<span class="token punctuation">;</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>next <span class="token operator">===</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// If this doesn&#39;t spawn new work, complete the current work.</span>
    <span class="token function">completeUnitOfWork</span><span class="token punctuation">(</span>unitOfWork<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
    workInProgress <span class="token operator">=</span> next<span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  ReactCurrentOwner<span class="token punctuation">.</span>current <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">updateHostRoot</span><span class="token punctuation">(</span><span class="token parameter">current<span class="token punctuation">,</span> workInProgress<span class="token punctuation">,</span> renderLanes</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token function">pushHostRootContext</span><span class="token punctuation">(</span>workInProgress<span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">if</span> <span class="token punctuation">(</span>current <span class="token operator">===</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">Error</span><span class="token punctuation">(</span><span class="token string">&#39;Should have a current fiber. This is a bug in React.&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token keyword">const</span> nextProps <span class="token operator">=</span> workInProgress<span class="token punctuation">.</span>pendingProps<span class="token punctuation">;</span>
  <span class="token keyword">const</span> prevState <span class="token operator">=</span> workInProgress<span class="token punctuation">.</span>memoizedState<span class="token punctuation">;</span>
  <span class="token keyword">const</span> prevChildren <span class="token operator">=</span> prevState<span class="token punctuation">.</span>element<span class="token punctuation">;</span>
  <span class="token function">cloneUpdateQueue</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> workInProgress<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">processUpdateQueue</span><span class="token punctuation">(</span>workInProgress<span class="token punctuation">,</span> nextProps<span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">,</span> renderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> nextState<span class="token operator">:</span> RootState <span class="token operator">=</span> workInProgress<span class="token punctuation">.</span>memoizedState<span class="token punctuation">;</span>
  <span class="token keyword">const</span> root<span class="token operator">:</span> FiberRoot <span class="token operator">=</span> workInProgress<span class="token punctuation">.</span>stateNode<span class="token punctuation">;</span>
  <span class="token function">pushRootTransition</span><span class="token punctuation">(</span>workInProgress<span class="token punctuation">,</span> root<span class="token punctuation">,</span> renderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">if</span> <span class="token punctuation">(</span>enableCache<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> nextCache<span class="token operator">:</span> Cache <span class="token operator">=</span> nextState<span class="token punctuation">.</span>cache<span class="token punctuation">;</span>
    <span class="token function">pushCacheProvider</span><span class="token punctuation">(</span>workInProgress<span class="token punctuation">,</span> nextCache<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>nextCache <span class="token operator">!==</span> prevState<span class="token punctuation">.</span>cache<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token comment">// The root cache refreshed.</span>
      <span class="token function">propagateContextChange</span><span class="token punctuation">(</span>workInProgress<span class="token punctuation">,</span> CacheContext<span class="token punctuation">,</span> renderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>

  <span class="token comment">// Caution: React DevTools currently depends on this property</span>
  <span class="token comment">// being called &quot;element&quot;.</span>
  <span class="token keyword">const</span> nextChildren <span class="token operator">=</span> nextState<span class="token punctuation">.</span>element<span class="token punctuation">;</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>supportsHydration <span class="token operator">&amp;&amp;</span> prevState<span class="token punctuation">.</span>isDehydrated<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// This is a hydration root whose shell has not yet hydrated. We should</span>
    <span class="token comment">// attempt to hydrate.</span>

    <span class="token comment">// Flip isDehydrated to false to indicate that when this render</span>
    <span class="token comment">// finishes, the root will no longer be dehydrated.</span>
    <span class="token keyword">const</span> overrideState<span class="token operator">:</span> RootState <span class="token operator">=</span> <span class="token punctuation">{</span>
      element<span class="token operator">:</span> nextChildren<span class="token punctuation">,</span>
      isDehydrated<span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
      cache<span class="token operator">:</span> nextState<span class="token punctuation">.</span>cache<span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>
    <span class="token keyword">const</span> updateQueue<span class="token operator">:</span> UpdateQueue<span class="token operator">&lt;</span>RootState<span class="token operator">&gt;</span> <span class="token operator">=</span> <span class="token punctuation">(</span>workInProgress<span class="token punctuation">.</span>updateQueue<span class="token operator">:</span> any<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// \`baseState\` can always be the last state because the root doesn&#39;t</span>
    <span class="token comment">// have reducer functions so it doesn&#39;t need rebasing.</span>
    updateQueue<span class="token punctuation">.</span>baseState <span class="token operator">=</span> overrideState<span class="token punctuation">;</span>
    workInProgress<span class="token punctuation">.</span>memoizedState <span class="token operator">=</span> overrideState<span class="token punctuation">;</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>workInProgress<span class="token punctuation">.</span>flags <span class="token operator">&amp;</span> ForceClientRender<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token comment">// Something errored during a previous attempt to hydrate the shell, so we</span>
      <span class="token comment">// forced a client render.</span>
      <span class="token keyword">const</span> recoverableError <span class="token operator">=</span> <span class="token function">createCapturedValueAtFiber</span><span class="token punctuation">(</span>
        <span class="token keyword">new</span> <span class="token class-name">Error</span><span class="token punctuation">(</span>
          <span class="token string">&#39;There was an error while hydrating. Because the error happened outside &#39;</span> <span class="token operator">+</span>
            <span class="token string">&#39;of a Suspense boundary, the entire root will switch to &#39;</span> <span class="token operator">+</span>
            <span class="token string">&#39;client rendering.&#39;</span><span class="token punctuation">,</span>
        <span class="token punctuation">)</span><span class="token punctuation">,</span>
        workInProgress<span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token keyword">return</span> <span class="token function">mountHostRootWithoutHydrating</span><span class="token punctuation">(</span>
        current<span class="token punctuation">,</span>
        workInProgress<span class="token punctuation">,</span>
        nextChildren<span class="token punctuation">,</span>
        renderLanes<span class="token punctuation">,</span>
        recoverableError<span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>nextChildren <span class="token operator">!==</span> prevChildren<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">const</span> recoverableError <span class="token operator">=</span> <span class="token function">createCapturedValueAtFiber</span><span class="token punctuation">(</span>
        <span class="token keyword">new</span> <span class="token class-name">Error</span><span class="token punctuation">(</span>
          <span class="token string">&#39;This root received an early update, before anything was able &#39;</span> <span class="token operator">+</span>
            <span class="token string">&#39;hydrate. Switched the entire root to client rendering.&#39;</span><span class="token punctuation">,</span>
        <span class="token punctuation">)</span><span class="token punctuation">,</span>
        workInProgress<span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token keyword">return</span> <span class="token function">mountHostRootWithoutHydrating</span><span class="token punctuation">(</span>
        current<span class="token punctuation">,</span>
        workInProgress<span class="token punctuation">,</span>
        nextChildren<span class="token punctuation">,</span>
        renderLanes<span class="token punctuation">,</span>
        recoverableError<span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
      <span class="token comment">// The outermost shell has not hydrated yet. Start hydrating.</span>
      <span class="token function">enterHydrationState</span><span class="token punctuation">(</span>workInProgress<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>enableUseMutableSource<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> mutableSourceEagerHydrationData <span class="token operator">=</span>
          root<span class="token punctuation">.</span>mutableSourceEagerHydrationData<span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>mutableSourceEagerHydrationData <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
          <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> mutableSourceEagerHydrationData<span class="token punctuation">.</span>length<span class="token punctuation">;</span> i <span class="token operator">+=</span> <span class="token number">2</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">const</span> mutableSource <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>mutableSourceEagerHydrationData<span class="token punctuation">[</span>
              i
            <span class="token punctuation">]</span><span class="token operator">:</span> any<span class="token punctuation">)</span><span class="token operator">:</span> MutableSource<span class="token operator">&lt;</span>any<span class="token operator">&gt;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">const</span> version <span class="token operator">=</span> mutableSourceEagerHydrationData<span class="token punctuation">[</span>i <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
            <span class="token function">setWorkInProgressVersion</span><span class="token punctuation">(</span>mutableSource<span class="token punctuation">,</span> version<span class="token punctuation">)</span><span class="token punctuation">;</span>
          <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
      <span class="token punctuation">}</span>

      <span class="token keyword">const</span> child <span class="token operator">=</span> <span class="token function">mountChildFibers</span><span class="token punctuation">(</span>
        workInProgress<span class="token punctuation">,</span>
        <span class="token keyword">null</span><span class="token punctuation">,</span>
        nextChildren<span class="token punctuation">,</span>
        renderLanes<span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">;</span>
      workInProgress<span class="token punctuation">.</span>child <span class="token operator">=</span> child<span class="token punctuation">;</span>

      <span class="token keyword">let</span> node <span class="token operator">=</span> child<span class="token punctuation">;</span>
      <span class="token keyword">while</span> <span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// Mark each child as hydrating. This is a fast path to know whether this</span>
        <span class="token comment">// tree is part of a hydrating tree. This is used to determine if a child</span>
        <span class="token comment">// node has fully mounted yet, and for scheduling event replaying.</span>
        <span class="token comment">// Conceptually this is similar to Placement in that a new subtree is</span>
        <span class="token comment">// inserted into the React tree here. It just happens to not need DOM</span>
        <span class="token comment">// mutations because it already exists.</span>
        node<span class="token punctuation">.</span>flags <span class="token operator">=</span> <span class="token punctuation">(</span>node<span class="token punctuation">.</span>flags <span class="token operator">&amp;</span> <span class="token operator">~</span>Placement<span class="token punctuation">)</span> <span class="token operator">|</span> Hydrating<span class="token punctuation">;</span>
        node <span class="token operator">=</span> node<span class="token punctuation">.</span>sibling<span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
    <span class="token comment">// Root is not dehydrated. Either this is a client-only root, or it</span>
    <span class="token comment">// already hydrated.</span>
    <span class="token function">resetHydrationState</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>nextChildren <span class="token operator">===</span> prevChildren<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">return</span> <span class="token function">bailoutOnAlreadyFinishedWork</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> workInProgress<span class="token punctuation">,</span> renderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token function">reconcileChildren</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> workInProgress<span class="token punctuation">,</span> nextChildren<span class="token punctuation">,</span> renderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  <span class="token keyword">return</span> workInProgress<span class="token punctuation">.</span>child<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br><span class="line-number">72</span><br><span class="line-number">73</span><br><span class="line-number">74</span><br><span class="line-number">75</span><br><span class="line-number">76</span><br><span class="line-number">77</span><br><span class="line-number">78</span><br><span class="line-number">79</span><br><span class="line-number">80</span><br><span class="line-number">81</span><br><span class="line-number">82</span><br><span class="line-number">83</span><br><span class="line-number">84</span><br><span class="line-number">85</span><br><span class="line-number">86</span><br><span class="line-number">87</span><br><span class="line-number">88</span><br><span class="line-number">89</span><br><span class="line-number">90</span><br><span class="line-number">91</span><br><span class="line-number">92</span><br><span class="line-number">93</span><br><span class="line-number">94</span><br><span class="line-number">95</span><br><span class="line-number">96</span><br><span class="line-number">97</span><br><span class="line-number">98</span><br><span class="line-number">99</span><br><span class="line-number">100</span><br><span class="line-number">101</span><br><span class="line-number">102</span><br><span class="line-number">103</span><br><span class="line-number">104</span><br><span class="line-number">105</span><br><span class="line-number">106</span><br><span class="line-number">107</span><br><span class="line-number">108</span><br><span class="line-number">109</span><br><span class="line-number">110</span><br><span class="line-number">111</span><br><span class="line-number">112</span><br><span class="line-number">113</span><br><span class="line-number">114</span><br><span class="line-number">115</span><br><span class="line-number">116</span><br><span class="line-number">117</span><br><span class="line-number">118</span><br><span class="line-number">119</span><br><span class="line-number">120</span><br><span class="line-number">121</span><br><span class="line-number">122</span><br><span class="line-number">123</span><br><span class="line-number">124</span><br><span class="line-number">125</span><br><span class="line-number">126</span><br><span class="line-number">127</span><br><span class="line-number">128</span><br><span class="line-number">129</span><br><span class="line-number">130</span><br><span class="line-number">131</span><br><span class="line-number">132</span><br><span class="line-number">133</span><br><span class="line-number">134</span><br><span class="line-number">135</span><br><span class="line-number">136</span><br><span class="line-number">137</span><br><span class="line-number">138</span><br><span class="line-number">139</span><br><span class="line-number">140</span><br><span class="line-number">141</span><br><span class="line-number">142</span><br><span class="line-number">143</span><br><span class="line-number">144</span><br><span class="line-number">145</span><br><span class="line-number">146</span><br><span class="line-number">147</span><br><span class="line-number">148</span><br><span class="line-number">149</span><br><span class="line-number">150</span><br><span class="line-number">151</span><br><span class="line-number">152</span><br><span class="line-number">153</span><br><span class="line-number">154</span><br><span class="line-number">155</span><br><span class="line-number">156</span><br><span class="line-number">157</span><br><span class="line-number">158</span><br><span class="line-number">159</span><br><span class="line-number">160</span><br><span class="line-number">161</span><br><span class="line-number">162</span><br><span class="line-number">163</span><br><span class="line-number">164</span><br><span class="line-number">165</span><br><span class="line-number">166</span><br><span class="line-number">167</span><br><span class="line-number">168</span><br><span class="line-number">169</span><br><span class="line-number">170</span><br><span class="line-number">171</span><br><span class="line-number">172</span><br><span class="line-number">173</span><br><span class="line-number">174</span><br><span class="line-number">175</span><br><span class="line-number">176</span><br><span class="line-number">177</span><br><span class="line-number">178</span><br><span class="line-number">179</span><br><span class="line-number">180</span><br><span class="line-number">181</span><br><span class="line-number">182</span><br><span class="line-number">183</span><br><span class="line-number">184</span><br><span class="line-number">185</span><br><span class="line-number">186</span><br><span class="line-number">187</span><br><span class="line-number">188</span><br><span class="line-number">189</span><br><span class="line-number">190</span><br><span class="line-number">191</span><br><span class="line-number">192</span><br><span class="line-number">193</span><br><span class="line-number">194</span><br><span class="line-number">195</span><br><span class="line-number">196</span><br><span class="line-number">197</span><br><span class="line-number">198</span><br><span class="line-number">199</span><br><span class="line-number">200</span><br><span class="line-number">201</span><br><span class="line-number">202</span><br><span class="line-number">203</span><br><span class="line-number">204</span><br><span class="line-number">205</span><br><span class="line-number">206</span><br><span class="line-number">207</span><br><span class="line-number">208</span><br><span class="line-number">209</span><br><span class="line-number">210</span><br><span class="line-number">211</span><br><span class="line-number">212</span><br><span class="line-number">213</span><br><span class="line-number">214</span><br><span class="line-number">215</span><br><span class="line-number">216</span><br><span class="line-number">217</span><br><span class="line-number">218</span><br><span class="line-number">219</span><br><span class="line-number">220</span><br><span class="line-number">221</span><br><span class="line-number">222</span><br><span class="line-number">223</span><br><span class="line-number">224</span><br><span class="line-number">225</span><br><span class="line-number">226</span><br><span class="line-number">227</span><br><span class="line-number">228</span><br><span class="line-number">229</span><br><span class="line-number">230</span><br><span class="line-number">231</span><br><span class="line-number">232</span><br><span class="line-number">233</span><br><span class="line-number">234</span><br><span class="line-number">235</span><br><span class="line-number">236</span><br><span class="line-number">237</span><br><span class="line-number">238</span><br><span class="line-number">239</span><br><span class="line-number">240</span><br><span class="line-number">241</span><br><span class="line-number">242</span><br><span class="line-number">243</span><br><span class="line-number">244</span><br><span class="line-number">245</span><br></div></div><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token comment">// react\\packages\\react-reconciler\\src\\ReactFiberBeginWork.new.js</span>
<span class="token keyword">function</span> <span class="token function">beginWork</span><span class="token punctuation">(</span>
  <span class="token parameter">current<span class="token operator">:</span> Fiber <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  workInProgress<span class="token operator">:</span> Fiber<span class="token punctuation">,</span>
  renderLanes<span class="token operator">:</span> Lanes<span class="token punctuation">,</span></span>
<span class="token punctuation">)</span><span class="token operator">:</span> Fiber <span class="token operator">|</span> <span class="token keyword">null</span> <span class="token punctuation">{</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>current <span class="token operator">!==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> oldProps <span class="token operator">=</span> current<span class="token punctuation">.</span>memoizedProps<span class="token punctuation">;</span>
    <span class="token keyword">const</span> newProps <span class="token operator">=</span> workInProgress<span class="token punctuation">.</span>pendingProps<span class="token punctuation">;</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>
      oldProps <span class="token operator">!==</span> newProps <span class="token operator">||</span>
      <span class="token function">hasLegacyContextChanged</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">||</span>
      <span class="token comment">// Force a re-render if the implementation changed due to hot reload:</span>
      <span class="token punctuation">(</span>__DEV__ <span class="token operator">?</span> workInProgress<span class="token punctuation">.</span>type <span class="token operator">!==</span> current<span class="token punctuation">.</span>type <span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">)</span>
    <span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token comment">// If props or context changed, mark the fiber as having performed work.</span>
      <span class="token comment">// This may be unset if the props are determined to be equal later (memo).</span>
      didReceiveUpdate <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
      <span class="token comment">// Neither props nor legacy context changes. Check if there&#39;s a pending</span>
      <span class="token comment">// update or context change.</span>
      <span class="token keyword">const</span> hasScheduledUpdateOrContext <span class="token operator">=</span> <span class="token function">checkScheduledUpdateOrContext</span><span class="token punctuation">(</span>
        current<span class="token punctuation">,</span>
        renderLanes<span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>
        <span class="token operator">!</span>hasScheduledUpdateOrContext <span class="token operator">&amp;&amp;</span>
        <span class="token comment">// If this is the second pass of an error or suspense boundary, there</span>
        <span class="token comment">// may not be work scheduled on \`current\`, so we check for this flag.</span>
        <span class="token punctuation">(</span>workInProgress<span class="token punctuation">.</span>flags <span class="token operator">&amp;</span> DidCapture<span class="token punctuation">)</span> <span class="token operator">===</span> NoFlags
      <span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// No pending updates or context. Bail out now.</span>
        didReceiveUpdate <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token function">attemptEarlyBailoutIfNoScheduledUpdate</span><span class="token punctuation">(</span>
          current<span class="token punctuation">,</span>
          workInProgress<span class="token punctuation">,</span>
          renderLanes<span class="token punctuation">,</span>
        <span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>current<span class="token punctuation">.</span>flags <span class="token operator">&amp;</span> ForceUpdateForLegacySuspense<span class="token punctuation">)</span> <span class="token operator">!==</span> NoFlags<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// This is a special case that only exists for legacy mode.</span>
        <span class="token comment">// See https://github.com/facebook/react/pull/19216.</span>
        didReceiveUpdate <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token comment">// An update was scheduled on this fiber, but there are no new props</span>
        <span class="token comment">// nor legacy context. Set this to false. If an update queue or context</span>
        <span class="token comment">// consumer produces a changed value, it will set this to true. Otherwise,</span>
        <span class="token comment">// the component will assume the children have not changed and bail out.</span>
        didReceiveUpdate <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
    didReceiveUpdate <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">getIsHydrating</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span> <span class="token function">isForkedChild</span><span class="token punctuation">(</span>workInProgress<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token comment">// Check if this child belongs to a list of muliple children in</span>
      <span class="token comment">// its parent.</span>
      <span class="token comment">//</span>
      <span class="token comment">// In a true multi-threaded implementation, we would render children on</span>
      <span class="token comment">// parallel threads. This would represent the beginning of a new render</span>
      <span class="token comment">// thread for this subtree.</span>
      <span class="token comment">//</span>
      <span class="token comment">// We only use this for id generation during hydration, which is why the</span>
      <span class="token comment">// logic is located in this special branch.</span>
      <span class="token keyword">const</span> slotIndex <span class="token operator">=</span> workInProgress<span class="token punctuation">.</span>index<span class="token punctuation">;</span>
      <span class="token keyword">const</span> numberOfForks <span class="token operator">=</span> <span class="token function">getForksAtLevel</span><span class="token punctuation">(</span>workInProgress<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token function">pushTreeId</span><span class="token punctuation">(</span>workInProgress<span class="token punctuation">,</span> numberOfForks<span class="token punctuation">,</span> slotIndex<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>

  <span class="token comment">// Before entering the begin phase, clear pending update priority.</span>
  <span class="token comment">// TODO: This assumes that we&#39;re about to evaluate the component and process</span>
  <span class="token comment">// the update queue. However, there&#39;s an exception: SimpleMemoComponent</span>
  <span class="token comment">// sometimes bails out later in the begin phase. This indicates that we should</span>
  <span class="token comment">// move this assignment out of the common path and into each branch.</span>
  workInProgress<span class="token punctuation">.</span>lanes <span class="token operator">=</span> NoLanes<span class="token punctuation">;</span>

  <span class="token keyword">switch</span> <span class="token punctuation">(</span>workInProgress<span class="token punctuation">.</span>tag<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">case</span> IndeterminateComponent<span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token keyword">return</span> <span class="token function">mountIndeterminateComponent</span><span class="token punctuation">(</span>
        current<span class="token punctuation">,</span>
        workInProgress<span class="token punctuation">,</span>
        workInProgress<span class="token punctuation">.</span>type<span class="token punctuation">,</span>
        renderLanes<span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">case</span> LazyComponent<span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token keyword">const</span> elementType <span class="token operator">=</span> workInProgress<span class="token punctuation">.</span>elementType<span class="token punctuation">;</span>
      <span class="token keyword">return</span> <span class="token function">mountLazyComponent</span><span class="token punctuation">(</span>
        current<span class="token punctuation">,</span>
        workInProgress<span class="token punctuation">,</span>
        elementType<span class="token punctuation">,</span>
        renderLanes<span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">case</span> FunctionComponent<span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token keyword">const</span> Component <span class="token operator">=</span> workInProgress<span class="token punctuation">.</span>type<span class="token punctuation">;</span>
      <span class="token keyword">const</span> unresolvedProps <span class="token operator">=</span> workInProgress<span class="token punctuation">.</span>pendingProps<span class="token punctuation">;</span>
      <span class="token keyword">const</span> resolvedProps <span class="token operator">=</span>
        workInProgress<span class="token punctuation">.</span>elementType <span class="token operator">===</span> Component
          <span class="token operator">?</span> unresolvedProps
          <span class="token operator">:</span> <span class="token function">resolveDefaultProps</span><span class="token punctuation">(</span>Component<span class="token punctuation">,</span> unresolvedProps<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token keyword">return</span> <span class="token function">updateFunctionComponent</span><span class="token punctuation">(</span>
        current<span class="token punctuation">,</span>
        workInProgress<span class="token punctuation">,</span>
        Component<span class="token punctuation">,</span>
        resolvedProps<span class="token punctuation">,</span>
        renderLanes<span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">case</span> ClassComponent<span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token keyword">const</span> Component <span class="token operator">=</span> workInProgress<span class="token punctuation">.</span>type<span class="token punctuation">;</span>
      <span class="token keyword">const</span> unresolvedProps <span class="token operator">=</span> workInProgress<span class="token punctuation">.</span>pendingProps<span class="token punctuation">;</span>
      <span class="token keyword">const</span> resolvedProps <span class="token operator">=</span>
        workInProgress<span class="token punctuation">.</span>elementType <span class="token operator">===</span> Component
          <span class="token operator">?</span> unresolvedProps
          <span class="token operator">:</span> <span class="token function">resolveDefaultProps</span><span class="token punctuation">(</span>Component<span class="token punctuation">,</span> unresolvedProps<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token keyword">return</span> <span class="token function">updateClassComponent</span><span class="token punctuation">(</span>
        current<span class="token punctuation">,</span>
        workInProgress<span class="token punctuation">,</span>
        Component<span class="token punctuation">,</span>
        resolvedProps<span class="token punctuation">,</span>
        renderLanes<span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">case</span> HostRoot<span class="token operator">:</span>
      <span class="token keyword">return</span> <span class="token function">updateHostRoot</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> workInProgress<span class="token punctuation">,</span> renderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">case</span> HostComponent<span class="token operator">:</span>
      <span class="token keyword">return</span> <span class="token function">updateHostComponent</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> workInProgress<span class="token punctuation">,</span> renderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">case</span> HostText<span class="token operator">:</span>
      <span class="token keyword">return</span> <span class="token function">updateHostText</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> workInProgress<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">case</span> SuspenseComponent<span class="token operator">:</span>
      <span class="token keyword">return</span> <span class="token function">updateSuspenseComponent</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> workInProgress<span class="token punctuation">,</span> renderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">case</span> HostPortal<span class="token operator">:</span>
      <span class="token keyword">return</span> <span class="token function">updatePortalComponent</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> workInProgress<span class="token punctuation">,</span> renderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">case</span> ForwardRef<span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token keyword">const</span> type <span class="token operator">=</span> workInProgress<span class="token punctuation">.</span>type<span class="token punctuation">;</span>
      <span class="token keyword">const</span> unresolvedProps <span class="token operator">=</span> workInProgress<span class="token punctuation">.</span>pendingProps<span class="token punctuation">;</span>
      <span class="token keyword">const</span> resolvedProps <span class="token operator">=</span>
        workInProgress<span class="token punctuation">.</span>elementType <span class="token operator">===</span> type
          <span class="token operator">?</span> unresolvedProps
          <span class="token operator">:</span> <span class="token function">resolveDefaultProps</span><span class="token punctuation">(</span>type<span class="token punctuation">,</span> unresolvedProps<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token keyword">return</span> <span class="token function">updateForwardRef</span><span class="token punctuation">(</span>
        current<span class="token punctuation">,</span>
        workInProgress<span class="token punctuation">,</span>
        type<span class="token punctuation">,</span>
        resolvedProps<span class="token punctuation">,</span>
        renderLanes<span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">case</span> Fragment<span class="token operator">:</span>
      <span class="token keyword">return</span> <span class="token function">updateFragment</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> workInProgress<span class="token punctuation">,</span> renderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">case</span> Mode<span class="token operator">:</span>
      <span class="token keyword">return</span> <span class="token function">updateMode</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> workInProgress<span class="token punctuation">,</span> renderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">case</span> Profiler<span class="token operator">:</span>
      <span class="token keyword">return</span> <span class="token function">updateProfiler</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> workInProgress<span class="token punctuation">,</span> renderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">case</span> ContextProvider<span class="token operator">:</span>
      <span class="token keyword">return</span> <span class="token function">updateContextProvider</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> workInProgress<span class="token punctuation">,</span> renderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">case</span> ContextConsumer<span class="token operator">:</span>
      <span class="token keyword">return</span> <span class="token function">updateContextConsumer</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> workInProgress<span class="token punctuation">,</span> renderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">case</span> MemoComponent<span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token keyword">const</span> type <span class="token operator">=</span> workInProgress<span class="token punctuation">.</span>type<span class="token punctuation">;</span>
      <span class="token keyword">const</span> unresolvedProps <span class="token operator">=</span> workInProgress<span class="token punctuation">.</span>pendingProps<span class="token punctuation">;</span>
      <span class="token comment">// Resolve outer props first, then resolve inner props.</span>
      <span class="token keyword">let</span> resolvedProps <span class="token operator">=</span> <span class="token function">resolveDefaultProps</span><span class="token punctuation">(</span>type<span class="token punctuation">,</span> unresolvedProps<span class="token punctuation">)</span><span class="token punctuation">;</span>
      resolvedProps <span class="token operator">=</span> <span class="token function">resolveDefaultProps</span><span class="token punctuation">(</span>type<span class="token punctuation">.</span>type<span class="token punctuation">,</span> resolvedProps<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token keyword">return</span> <span class="token function">updateMemoComponent</span><span class="token punctuation">(</span>
        current<span class="token punctuation">,</span>
        workInProgress<span class="token punctuation">,</span>
        type<span class="token punctuation">,</span>
        resolvedProps<span class="token punctuation">,</span>
        renderLanes<span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">case</span> SimpleMemoComponent<span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token keyword">return</span> <span class="token function">updateSimpleMemoComponent</span><span class="token punctuation">(</span>
        current<span class="token punctuation">,</span>
        workInProgress<span class="token punctuation">,</span>
        workInProgress<span class="token punctuation">.</span>type<span class="token punctuation">,</span>
        workInProgress<span class="token punctuation">.</span>pendingProps<span class="token punctuation">,</span>
        renderLanes<span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">case</span> IncompleteClassComponent<span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token keyword">const</span> Component <span class="token operator">=</span> workInProgress<span class="token punctuation">.</span>type<span class="token punctuation">;</span>
      <span class="token keyword">const</span> unresolvedProps <span class="token operator">=</span> workInProgress<span class="token punctuation">.</span>pendingProps<span class="token punctuation">;</span>
      <span class="token keyword">const</span> resolvedProps <span class="token operator">=</span>
        workInProgress<span class="token punctuation">.</span>elementType <span class="token operator">===</span> Component
          <span class="token operator">?</span> unresolvedProps
          <span class="token operator">:</span> <span class="token function">resolveDefaultProps</span><span class="token punctuation">(</span>Component<span class="token punctuation">,</span> unresolvedProps<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token keyword">return</span> <span class="token function">mountIncompleteClassComponent</span><span class="token punctuation">(</span>
        current<span class="token punctuation">,</span>
        workInProgress<span class="token punctuation">,</span>
        Component<span class="token punctuation">,</span>
        resolvedProps<span class="token punctuation">,</span>
        renderLanes<span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">case</span> SuspenseListComponent<span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token keyword">return</span> <span class="token function">updateSuspenseListComponent</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> workInProgress<span class="token punctuation">,</span> renderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">case</span> ScopeComponent<span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>enableScopeAPI<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token function">updateScopeComponent</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> workInProgress<span class="token punctuation">,</span> renderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
      <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">case</span> OffscreenComponent<span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token keyword">return</span> <span class="token function">updateOffscreenComponent</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> workInProgress<span class="token punctuation">,</span> renderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">case</span> LegacyHiddenComponent<span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>enableLegacyHidden<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token function">updateLegacyHiddenComponent</span><span class="token punctuation">(</span>
          current<span class="token punctuation">,</span>
          workInProgress<span class="token punctuation">,</span>
          renderLanes<span class="token punctuation">,</span>
        <span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
      <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">case</span> CacheComponent<span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>enableCache<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token function">updateCacheComponent</span><span class="token punctuation">(</span>current<span class="token punctuation">,</span> workInProgress<span class="token punctuation">,</span> renderLanes<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
      <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">case</span> TracingMarkerComponent<span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>enableTransitionTracing<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token function">updateTracingMarkerComponent</span><span class="token punctuation">(</span>
          current<span class="token punctuation">,</span>
          workInProgress<span class="token punctuation">,</span>
          renderLanes<span class="token punctuation">,</span>
        <span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
      <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br><span class="line-number">72</span><br><span class="line-number">73</span><br><span class="line-number">74</span><br><span class="line-number">75</span><br><span class="line-number">76</span><br><span class="line-number">77</span><br><span class="line-number">78</span><br><span class="line-number">79</span><br><span class="line-number">80</span><br><span class="line-number">81</span><br><span class="line-number">82</span><br><span class="line-number">83</span><br><span class="line-number">84</span><br><span class="line-number">85</span><br><span class="line-number">86</span><br><span class="line-number">87</span><br><span class="line-number">88</span><br><span class="line-number">89</span><br><span class="line-number">90</span><br><span class="line-number">91</span><br><span class="line-number">92</span><br><span class="line-number">93</span><br><span class="line-number">94</span><br><span class="line-number">95</span><br><span class="line-number">96</span><br><span class="line-number">97</span><br><span class="line-number">98</span><br><span class="line-number">99</span><br><span class="line-number">100</span><br><span class="line-number">101</span><br><span class="line-number">102</span><br><span class="line-number">103</span><br><span class="line-number">104</span><br><span class="line-number">105</span><br><span class="line-number">106</span><br><span class="line-number">107</span><br><span class="line-number">108</span><br><span class="line-number">109</span><br><span class="line-number">110</span><br><span class="line-number">111</span><br><span class="line-number">112</span><br><span class="line-number">113</span><br><span class="line-number">114</span><br><span class="line-number">115</span><br><span class="line-number">116</span><br><span class="line-number">117</span><br><span class="line-number">118</span><br><span class="line-number">119</span><br><span class="line-number">120</span><br><span class="line-number">121</span><br><span class="line-number">122</span><br><span class="line-number">123</span><br><span class="line-number">124</span><br><span class="line-number">125</span><br><span class="line-number">126</span><br><span class="line-number">127</span><br><span class="line-number">128</span><br><span class="line-number">129</span><br><span class="line-number">130</span><br><span class="line-number">131</span><br><span class="line-number">132</span><br><span class="line-number">133</span><br><span class="line-number">134</span><br><span class="line-number">135</span><br><span class="line-number">136</span><br><span class="line-number">137</span><br><span class="line-number">138</span><br><span class="line-number">139</span><br><span class="line-number">140</span><br><span class="line-number">141</span><br><span class="line-number">142</span><br><span class="line-number">143</span><br><span class="line-number">144</span><br><span class="line-number">145</span><br><span class="line-number">146</span><br><span class="line-number">147</span><br><span class="line-number">148</span><br><span class="line-number">149</span><br><span class="line-number">150</span><br><span class="line-number">151</span><br><span class="line-number">152</span><br><span class="line-number">153</span><br><span class="line-number">154</span><br><span class="line-number">155</span><br><span class="line-number">156</span><br><span class="line-number">157</span><br><span class="line-number">158</span><br><span class="line-number">159</span><br><span class="line-number">160</span><br><span class="line-number">161</span><br><span class="line-number">162</span><br><span class="line-number">163</span><br><span class="line-number">164</span><br><span class="line-number">165</span><br><span class="line-number">166</span><br><span class="line-number">167</span><br><span class="line-number">168</span><br><span class="line-number">169</span><br><span class="line-number">170</span><br><span class="line-number">171</span><br><span class="line-number">172</span><br><span class="line-number">173</span><br><span class="line-number">174</span><br><span class="line-number">175</span><br><span class="line-number">176</span><br><span class="line-number">177</span><br><span class="line-number">178</span><br><span class="line-number">179</span><br><span class="line-number">180</span><br><span class="line-number">181</span><br><span class="line-number">182</span><br><span class="line-number">183</span><br><span class="line-number">184</span><br><span class="line-number">185</span><br><span class="line-number">186</span><br><span class="line-number">187</span><br><span class="line-number">188</span><br><span class="line-number">189</span><br><span class="line-number">190</span><br><span class="line-number">191</span><br><span class="line-number">192</span><br><span class="line-number">193</span><br><span class="line-number">194</span><br><span class="line-number">195</span><br><span class="line-number">196</span><br><span class="line-number">197</span><br><span class="line-number">198</span><br><span class="line-number">199</span><br><span class="line-number">200</span><br><span class="line-number">201</span><br><span class="line-number">202</span><br><span class="line-number">203</span><br><span class="line-number">204</span><br><span class="line-number">205</span><br><span class="line-number">206</span><br><span class="line-number">207</span><br><span class="line-number">208</span><br><span class="line-number">209</span><br><span class="line-number">210</span><br><span class="line-number">211</span><br><span class="line-number">212</span><br><span class="line-number">213</span><br><span class="line-number">214</span><br><span class="line-number">215</span><br><span class="line-number">216</span><br><span class="line-number">217</span><br><span class="line-number">218</span><br><span class="line-number">219</span><br><span class="line-number">220</span><br><span class="line-number">221</span><br><span class="line-number">222</span><br><span class="line-number">223</span><br><span class="line-number">224</span><br><span class="line-number">225</span><br><span class="line-number">226</span><br><span class="line-number">227</span><br><span class="line-number">228</span><br><span class="line-number">229</span><br><span class="line-number">230</span><br><span class="line-number">231</span><br><span class="line-number">232</span><br><span class="line-number">233</span><br><span class="line-number">234</span><br><span class="line-number">235</span><br><span class="line-number">236</span><br><span class="line-number">237</span><br><span class="line-number">238</span><br><span class="line-number">239</span><br></div></div><p>------------------------------- \u8C03\u5EA6------------</p><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token comment">// react\\build\\node_modules\\scheduler\\cjs\\scheduler.development.js</span>
<span class="token keyword">var</span> <span class="token function-variable function">performWorkUntilDeadline</span> <span class="token operator">=</span> <span class="token keyword">function</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>scheduledHostCallback <span class="token operator">!==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">var</span> currentTime <span class="token operator">=</span> exports<span class="token punctuation">.</span><span class="token function">unstable_now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    startTime <span class="token operator">=</span> currentTime<span class="token punctuation">;</span>
    <span class="token keyword">var</span> hasTimeRemaining <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>

    <span class="token keyword">var</span> hasMoreWork <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>

    <span class="token keyword">try</span> <span class="token punctuation">{</span>
      <span class="token comment">// Link: scheduledHostCallback -&gt; flushWork</span>
      hasMoreWork <span class="token operator">=</span> <span class="token function">scheduledHostCallback</span><span class="token punctuation">(</span>hasTimeRemaining<span class="token punctuation">,</span> currentTime<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>hasMoreWork<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">schedulePerformWorkUntilDeadline</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        isMessageLoopRunning <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
        scheduledHostCallback <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
    isMessageLoopRunning <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">function</span> <span class="token function">flushWork</span><span class="token punctuation">(</span><span class="token parameter">hasTimeRemaining<span class="token punctuation">,</span> initialTime</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  isHostCallbackScheduled <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>

  <span class="token keyword">if</span> <span class="token punctuation">(</span>isHostTimeoutScheduled<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// We scheduled a timeout but it&#39;s no longer needed. Cancel it.</span>
    isHostTimeoutScheduled <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
    <span class="token function">cancelHostTimeout</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  isPerformingWork <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
  <span class="token keyword">var</span> previousPriorityLevel <span class="token operator">=</span> currentPriorityLevel<span class="token punctuation">;</span>

  <span class="token keyword">try</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>enableProfiling<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">try</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token function">workLoop</span><span class="token punctuation">(</span>hasTimeRemaining<span class="token punctuation">,</span> initialTime<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span>error<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>currentTask <span class="token operator">!==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
          <span class="token keyword">var</span> currentTime <span class="token operator">=</span> exports<span class="token punctuation">.</span><span class="token function">unstable_now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
          <span class="token function">markTaskErrored</span><span class="token punctuation">(</span>currentTask<span class="token punctuation">,</span> currentTime<span class="token punctuation">)</span><span class="token punctuation">;</span>
          currentTask<span class="token punctuation">.</span>isQueued <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token keyword">throw</span> error<span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
      <span class="token keyword">return</span> <span class="token function">workLoop</span><span class="token punctuation">(</span>hasTimeRemaining<span class="token punctuation">,</span> initialTime<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>
    currentTask <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
    currentPriorityLevel <span class="token operator">=</span> previousPriorityLevel<span class="token punctuation">;</span>
    isPerformingWork <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">workLoop</span><span class="token punctuation">(</span><span class="token parameter">hasTimeRemaining<span class="token punctuation">,</span> initialTime</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">var</span> currentTime <span class="token operator">=</span> initialTime<span class="token punctuation">;</span>
  <span class="token function">advanceTimers</span><span class="token punctuation">(</span>currentTime<span class="token punctuation">)</span><span class="token punctuation">;</span>
  currentTask <span class="token operator">=</span> <span class="token function">peek</span><span class="token punctuation">(</span>taskQueue<span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">while</span> <span class="token punctuation">(</span>currentTask <span class="token operator">!==</span> <span class="token keyword">null</span> <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span><span class="token punctuation">(</span>enableSchedulerDebugging <span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>currentTask<span class="token punctuation">.</span>expirationTime <span class="token operator">&gt;</span> currentTime <span class="token operator">&amp;&amp;</span> <span class="token punctuation">(</span><span class="token operator">!</span>hasTimeRemaining <span class="token operator">||</span> <span class="token function">shouldYieldToHost</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token comment">// This currentTask hasn&#39;t expired, and we&#39;ve reached the deadline.</span>
      <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">var</span> callback <span class="token operator">=</span> currentTask<span class="token punctuation">.</span>callback<span class="token punctuation">;</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> callback <span class="token operator">===</span> <span class="token string">&#39;function&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      currentTask<span class="token punctuation">.</span>callback <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
      currentPriorityLevel <span class="token operator">=</span> currentTask<span class="token punctuation">.</span>priorityLevel<span class="token punctuation">;</span>
      <span class="token keyword">var</span> didUserCallbackTimeout <span class="token operator">=</span> currentTask<span class="token punctuation">.</span>expirationTime <span class="token operator">&lt;=</span> currentTime<span class="token punctuation">;</span>
      <span class="token comment">// Link: callback -&gt; performConcurrentWorkOnRoot</span>
      <span class="token keyword">var</span> continuationCallback <span class="token operator">=</span> <span class="token function">callback</span><span class="token punctuation">(</span>didUserCallbackTimeout<span class="token punctuation">)</span><span class="token punctuation">;</span>
      currentTime <span class="token operator">=</span> exports<span class="token punctuation">.</span><span class="token function">unstable_now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

      <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> continuationCallback <span class="token operator">===</span> <span class="token string">&#39;function&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        currentTask<span class="token punctuation">.</span>callback <span class="token operator">=</span> continuationCallback<span class="token punctuation">;</span>
      <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>

        <span class="token keyword">if</span> <span class="token punctuation">(</span>currentTask <span class="token operator">===</span> <span class="token function">peek</span><span class="token punctuation">(</span>taskQueue<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
          <span class="token function">pop</span><span class="token punctuation">(</span>taskQueue<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
      <span class="token punctuation">}</span>

      <span class="token function">advanceTimers</span><span class="token punctuation">(</span>currentTime<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
      <span class="token function">pop</span><span class="token punctuation">(</span>taskQueue<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    currentTask <span class="token operator">=</span> <span class="token function">peek</span><span class="token punctuation">(</span>taskQueue<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span> <span class="token comment">// Return whether there&#39;s additional work</span>


  <span class="token keyword">if</span> <span class="token punctuation">(</span>currentTask <span class="token operator">!==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
    <span class="token keyword">var</span> firstTimer <span class="token operator">=</span> <span class="token function">peek</span><span class="token punctuation">(</span>timerQueue<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>firstTimer <span class="token operator">!==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token function">requestHostTimeout</span><span class="token punctuation">(</span>handleTimeout<span class="token punctuation">,</span> firstTimer<span class="token punctuation">.</span>startTime <span class="token operator">-</span> currentTime<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br><span class="line-number">72</span><br><span class="line-number">73</span><br><span class="line-number">74</span><br><span class="line-number">75</span><br><span class="line-number">76</span><br><span class="line-number">77</span><br><span class="line-number">78</span><br><span class="line-number">79</span><br><span class="line-number">80</span><br><span class="line-number">81</span><br><span class="line-number">82</span><br><span class="line-number">83</span><br><span class="line-number">84</span><br><span class="line-number">85</span><br><span class="line-number">86</span><br><span class="line-number">87</span><br><span class="line-number">88</span><br><span class="line-number">89</span><br><span class="line-number">90</span><br><span class="line-number">91</span><br><span class="line-number">92</span><br><span class="line-number">93</span><br><span class="line-number">94</span><br><span class="line-number">95</span><br><span class="line-number">96</span><br><span class="line-number">97</span><br><span class="line-number">98</span><br><span class="line-number">99</span><br><span class="line-number">100</span><br><span class="line-number">101</span><br><span class="line-number">102</span><br><span class="line-number">103</span><br><span class="line-number">104</span><br><span class="line-number">105</span><br><span class="line-number">106</span><br><span class="line-number">107</span><br><span class="line-number">108</span><br><span class="line-number">109</span><br><span class="line-number">110</span><br><span class="line-number">111</span><br><span class="line-number">112</span><br></div></div>`,26);function e(t,o){return p}var r=s(a,[["render",e]]);export{r as default};

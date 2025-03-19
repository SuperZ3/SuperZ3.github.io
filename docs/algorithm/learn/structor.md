# 数据结构

## HashMap

HashMap 可以理解为一种特殊的数组，可以通过 key 在 O(1) 的时间找到对应的 value，key 可以是数字、字符串等多种不可变类型

关键是用于转化 key 的 hash 函数：
1. 它需要将任意长度的 key 转换成固定长度的输出（索引）
2. 对于相同的 key，输出必须相同
3. 函数的复杂度是 O(1)

hash 函数存在将多个 key 映射成同一个索引的情况，通常使用 拉链法、线性探查法 处理冲突的情况

![hash-conflict](./conflict.png)

1. 拉链法：底层数组存储一个链表，遇到冲突时，就在已有的链表值后接一个新的节点
2. 线性探查法：遇到冲突时，向后查找直到遇到一个空位置

如果底层数组已经装了太多的 key-value 对，那么冲突的概率就会增大，为此，引入"负载因子"的概念，即 `size/table.length`，可以发现，拉链法实现的哈希表，负载因子可以无限大，线性探查法实现的负载因子不会超过 1

为了简化处理，下面使用 int 类型的 key 实现 hashMap，如果 key 不存在，返回 -1，hash 函数的实现就是简单的 % 运算

### 拉链法

```go
package main

// container/list 是标准库实现的双向链表
import (
	"container/list"
)

const Default_Cap = 5

type Node struct {
	key int
	val int
}

type ChainMap struct {
	size float64
	table []*list.List
}

func NewChainMap(capacity int) ChainMap {
	initCap := max(capacity, Default_Cap)
	return ChainMap{
		size: 0,
		// 由链表构成的类二维数组结构
		table: make([]*list.List, initCap),
	}
}

// 增/改数据
func (cm *ChainMap) put(key, val int) {
	index := cm.hash(key)
	if cm.table[index] == nil {
		cm.table[index] = list.New()
		cm.table[index].PushBack(Node{key, val})
		cm.size++
		if cm.size >= float64(len(cm.table)) * 0.75 {
			cm.resize(len(cm.table) * 2)
		}
		return
	}

	for n := cm.table[index].Front(); n != nil; n = n.Next() {
		node := n.Value.(Node)
		if node.key == key {
			n.Value = Node{
				key: node.key,
				val: val,
			}
			return
		}
	}
	
	cm.table[index].PushBack(Node{key, val})
	cm.size++
	if cm.size >= float64(len(cm.table)) * 0.75 {
		cm.resize(len(cm.table) * 2)
	}
}

func (cm *ChainMap) get(key int) int {
	index := cm.hash(key)
	if cm.table[index] == nil {
		return -1
	}
	for n := cm.table[index].Front(); n != nil; n = n.Next() {
		node := n.Value.(Node)
		if node.key == key {
			return node.val
		}
	}
	return -1
}

func (cm *ChainMap) remove(key int) {
	index := cm.hash(key)
	if cm.table[index] == nil {
		return
	}

	for n := cm.table[index].Front(); n != nil; n = n.Next() {
		node := n.Value.(Node)
		if node.key == key {
			cm.table[index].Remove(n)
			cm.size--
			if cm.size < float64(len(cm.table)) * 0.125 {
				cm.resize(int(float64(len(cm.table)) * 0.25))
			}
			return
		}
	}
}

func (cm *ChainMap) hash(key int) int {
	return key % len(cm.table)
}

func (cm *ChainMap) resize(n int) {
	cap := max(n, Default_Cap)
	newTable := make([]*list.List, cap)
	copy(newTable, cm.table)
	cm.table = newTable
}

func (cm *ChainMap) keys() []int {
	keys := make([]int, 0)
	for i := 0; i < len(cm.table); i++ {
		if cm.table[i] != nil {
			for n := cm.table[i].Front(); n != nil; n = n.Next() {
				node := n.Value.(Node)
				keys = append(keys, node.key)
			}
		}
	}
	return keys
}
```

可以看到实现较为简单，只需检测相应 index 位置是否已经有值了，将新值追加或添加到链表的指定位置，并判断是否需要更新底层数组

### 线性探查法

线性探查法主要是找到数组中空的位置插入元素，这里会用到环形数组的技巧，如果是从数组靠后的位置插入元素，并且负载因子没有使数组扩容，那说明下一个位置可能需要从数组头部开始查找`index = (index + 1) % table.length`保证了会循环遍历数组

需要注意的是，删除元素时，不能简单的将后面的元素向前移动位置，这会导致 get 方法查找数据错误，这里使用的办法是将后面的元素调用 put 重新插入

```go
package main

type LineNode struct {
	key int
	val int
}

type LinearProbingHashMap struct {
	size float64
	table []*LineNode
}

func NewLinearProbingHashMap(cap int) LinearProbingHashMap {
	initCap := max(cap, Default_Cap)
	return LinearProbingHashMap{
		size: 0,
		table: make([]*LineNode, initCap),
	}
}

func (lm *LinearProbingHashMap) put(key, val int) {
	index := lm.getKeyIndex(key)
	lm.table[index] = &LineNode{
		key,
		val,
	}
	lm.size++
	if lm.size >= float64(len(lm.table)) * 0.75 {
		lm.resize(len(lm.table) * 2)
	}
}

func (lm *LinearProbingHashMap) get(key int) int {
	index := lm.getKeyIndex(key)
	if lm.table[index] == nil {
		return -1
	}
	return lm.table[index].val
}

// remove 要删除对应位置的值
// 为了保证数组连续性，需要将后面的元素重新插入对应的位置
// 删除之前先将 size--，因为 put 会做 size++
func (lm *LinearProbingHashMap) remove(key int) {
	index := lm.getKeyIndex(key)
	if lm.table[index] == nil {
		return
	}

	lm.size--
	if lm.size < float64(len(lm.table)) * 0.125 {
		lm.resize(int(float64(len(lm.table)) * 0.25))
	}

	lm.table[index] = nil
	index = (index + 1) % len(lm.table)

	for lm.table[index] != nil {
		temp := lm.table[index]
		lm.table[index] = nil
		
		lm.size--
		lm.put(temp.key, temp.val)
		index = (index + 1) % len(lm.table)
	}
}

func (lm *LinearProbingHashMap) hash(key int) int {
	return key % len(lm.table)
}

// 根据 key 查找可用的 index
// 如果 key 已经存在，直接返回 index 用于修改 val
// 否则，通过环形数组的方式查找下一个可用的空位置
// 注意新增或删除需要扩缩容，防止死循环
func (lm *LinearProbingHashMap) getKeyIndex(key int) int {
	index := lm.hash(key)
	for lm.table[index] != nil {
		if lm.table[index].key == key {
			return index
		}
		index = (index + 1) % len(lm.table)
	}
	return index
}

func (lm *LinearProbingHashMap) resize(n int) {
	newCap := max(n, Default_Cap)
	newMap := NewLinearProbingHashMap(newCap)
	for i := 0; i < len(lm.table); i++ {
		entry := lm.table[i]
		if entry != nil {
			newMap.put(entry.key, entry.val)
		}
	}
	lm = &newMap
}
```

测试用例

```go
package main

import "fmt"

func useMap() {
	// m := NewNewChainMap(5)
	m := NewLinearProbingHashMap(5)
	m.put(1, 1)
	m.put(3, 3)

	fmt.Printf("index 1-> %v \n", m.table[1])
	m.put(11, 11)
	m.put(21, 21)

	fmt.Printf("key 21-> %v \n", m.get(21))
	fmt.Printf("key 3-> %v \n", m.get(3))

	m.put(21, 66)
	fmt.Printf("key 21-> %v \n", m.get(21))

	m.remove(11)
	fmt.Printf("key 11-> %v \n", m.get(11))

	// fmt.Printf("keys -> %#v \n", m.keys())
}

func main() {
	useMap()
}
```

## 图

图由节点和边构成，可以将它看成一个特殊的多叉数，图有度的概念，就是节点相连的边的数量，在有向图中，根据指向的不同分为入度和出度

![graph](./graph.jpg)

节点 3 的入度是 3，出度是 2

图有两种实现方式：临接表、临接矩阵

![impl](./impl.png)

在临接表中，将每一个节点 x 相连的节点存放在列表中

在临接矩阵中，将每个节点 x 和与之相连的节点赋值 true

代码表示：

```go
// 邻接表
// graph[x] 存储 x 的所有邻居节点
var graph [][]int

// 邻接矩阵
// matrix[x][y] 记录 x 是否有一条指向 y 的边
var matrix [][]bool
```

假设节点数量是 V，边的数量是 E，那么临接表的空间复杂度是 O(V + E)，临接矩阵的空间复杂度是 O(V**2)

其它类型的图，可以由这个基本结构衍生出来，比如无向图，可以看成双向图，在存储时把 matrix[x][y] 和 matrix[y][x] 都设置成 true

接下来实现一下有向加权图

### 临接表

临接表的操作就是对二维 slice 的操作

```go
package main

type WeightedDigraph struct {
    graph [][]Edge
}

// 存储相邻节点及边的权重
type Edge struct {
    to     int
    weight int
}

func NewWeightedDigraph(cap int) *WeightedDigraph {
	graph := make([][]Edge, cap)
	return &WeightedDigraph{graph: graph}
}

func (wd *WeightedDigraph) AddEdge(from, to, weight int) {
	wd.graph[from] = append(wd.graph[from], Edge{to, weight})
}

func (wd *WeightedDigraph) RemoveEdge(from int, to int) {
	for i, t := range wd.graph[from] {
		if t.to == to {
			wd.graph[from] = append(wd.graph[from][:i], wd.graph[from][i + 1:]...)
			break
		}
	}
}

func (wd *WeightedDigraph) HasEdge(from int, to int) bool {
	for _, t := range wd.graph[from] {
		if t.to == to {
			return true
		}
	}
	return false
}

func (wd *WeightedDigraph) Weight(from int, to int) int {
	for _, t := range wd.graph[from] {
		if t.to == to {
			return t.weight
		}
	}
	return -1
}

func (wd *WeightedDigraph) Neighbors(v int) []Edge {
	return wd.graph[v]
}

func (wd *WeightedDigraph) Size() int {
	return len(wd.graph)
}
```

### 临接矩阵

```go
package main

type MatrixWeightedDigraph struct {
	graph [][]int
}

func NewMatrixWeightedDigraph(cap int) *MatrixWeightedDigraph {
	matrix := make([][]int, cap)
    for i := range matrix {
        matrix[i] = make([]int, cap)
    }
    return &MatrixWeightedDigraph{matrix}
}

func (md *MatrixWeightedDigraph) AddEdge(from, to, weight int) {
	md.graph[from][to] = weight
}

func (md *MatrixWeightedDigraph) RemoveEdge(from int, to int) {
	md.graph[from][to] = 0
}

func (md *MatrixWeightedDigraph) HasEdge(from int, to int) bool {
	return md.graph[from][to] != 0
}

func (md *MatrixWeightedDigraph) Weight(from int, to int) int {
	return md.graph[from][to]
}

func (md *MatrixWeightedDigraph) Neighbors(v int) []Edge {
	result := make([]Edge, 0)
	for i, to := range md.graph[v] {
		if to != 0 {
			result = append(result, Edge{to: i, weight: to})
		}
	}
	return result
}

func (md *MatrixWeightedDigraph) Size() int {
	return len(md.graph)
}
```

测试用例

```go
func main() {
	// graph := NewWeightedDigraph(3)
	graph := NewMatrixWeightedDigraph(3)
    graph.AddEdge(0, 1, 1)
    graph.AddEdge(1, 2, 2)
    graph.AddEdge(2, 0, 3)
    graph.AddEdge(2, 1, 4)

    fmt.Println(graph.HasEdge(0, 1)) // true
    fmt.Println(graph.HasEdge(1, 0)) // false

    for _, edge := range graph.Neighbors(2) {
        fmt.Printf("%d -> %d, weight: %d\n", 2, edge.to, edge.weight)
    }
    // 2 -> 0, weight: 3
    // 2 -> 1, weight: 4

    graph.RemoveEdge(0, 1)
    fmt.Println(graph.HasEdge(0, 1)) // false
}
```

### 图的遍历

图可以对节点和路径进行遍历，类似多叉树的遍历，有深度优先和广度优先两种方式

需要注意的是，记录访问过的节点或路径，防止死循环

#### 节点的深度优先遍历

用 visited 记录已经遍历过的节点

```go
func traverse(graph WeightedDigraph, s int, visited []bool) {
	if s < 0 || s >= len(graph) {
		return
	}

	if visited[s] {
		return
	}                  

	visited[s] = true
	fmt.Println("visit", s)
	for _, edge := range graph.Neighbors(s) {
		traverse(graph, edge.to, visited)
	}
}
```

时间复杂度是 O(E + V)，因为节点和边的数量不是一一对应的

### 节点的广度优先遍历

```go
func trvaverse(graph WeightedDigraph, s int) {
	visited := make([]int, graph.size())
	visited[s] = true
	q := []int{s}

	for len(q) > 0 {
		cur := q[0]
		q = append(q[:1], q[1:]...)
		fmt.Println("Visited %d", cur)

		for _, edge range graph.Nighbors(s) {
			if !visited[edge.to] {
				q = append(q, edge.to)
				visited[edge.to] = true
			}
		}
	}
}
```

### 路径的深度优先遍历

src 到 dest 到路径可能不止一条，需要用 onPath 记录已经在路径中的节点，避免重复访问节点

```go
var onPath []bool = make([]bool, graph.size())
var path []int

func traverse(graph WeightedDigraph, src int, dest int) {
	if src < 0 || src > graph.size() {
		return
	}

	if onPath[src] {
		return
	}

	onPath[src] = true
	path = path.append(src)
	if src == dest {
		fmt.Printf("fint path: %v \n", path)
	}
	for _, edge := range graph.Nighbors(src) {
		traverse(graph, edge.to, dest)
	}
	onPath[src] = false
	path = append(path[:len(path) - 1])
}
```

## 二叉堆

二叉堆是一种特殊的完全二叉树，这棵树上任意节点的值都大于等于（或小于等于）它的左右子树的值，前者是大顶堆后者是小顶堆，二叉堆的主要操作是下沉（sink）和上浮（swim），用于在插入和删除时动态维护二叉堆的性质

二叉堆的两个应用是优先级队列（一种特殊的队列，元素被赋予优先级，当访问队列元素时，具有最高优先级的元素最先出队）和堆排序

以小顶堆未例，当插入元素时，新元素可能大于也可能小于堆顶元素，所以，将新元素先插入完全二叉树底层最右侧，然后比较新元素和它的 parent，判断是否需要交换它们的位置，这个过程就是上浮（swim）

当删除堆顶元素时，把完全二叉树底层最右侧元素移到堆顶，此时堆顶元素可能比它的字节点大，为了维护小顶堆的性质，需要将它不断下沉（sink）

二叉堆是逻辑上的概念，实际代码实现时，通常用数组维护二叉堆的结构，方便在 O(1) 的时间找到完全二叉树底层元素

![heap](./heap.png)

这样对于任意一个节点 node，可以快速找到它的父节点和左右子节点

```go
func parent(index int) int {
	return (index - 1) / 2
}

func left(index int) int {
	return index * 2 + 1
}

func right(index int) int {
	return index * 2 + 2
}
```

首先我们将堆的常用操作抽象出一个接口

```go
package heap

type Interface interface {
	sort.Interface
	Push(x any)
	Pop() any
}

func Init(h Interface) {
	n := h.Len()
	for i := n / 2 - 1; i > 0; i-- {
		down(h, i, n)
	}
}

func Push(h Interface, x any) {
	h.Push(x)
	up(h, h.Len() - 1)
}

func Pop(h Interface) any {
	n := h.Len() - 1
	h.Swap(0, n)
	down(h, 0, n)
	return h.Pop()
}

func Remove(h Interface, i int) any {
	n := h.Len() - 1
	if i != n {
		h.Swap(i, n)
		if !down(h, i, n) {
			up(h, i)	
		}
	}
	return h.Pop()
}

func Fix(h Interface, i int) {
	if !down(h, i, h.Len()) {
		up(h, i)
	}
}

func down(h Interface, i, n int) bool {
	i0 := i
	for {
		j := i0 * 2 + 1
		if j >= n || j < 0 {
			break
		}

		if j1 := j + 1; j1 < n && h.Less(j1, j) {
			j = j1
		}

		if !h.Less(j, i0) {
			break
		}

		h.Swap(i0, j)
		i0 = j
	}
	return i0 > i
}

func up(h Interface, i int) {
	for {
		j := (i - 1) / 2
		if !h.Less(i, j) || i == j {
			break
		}

		h.Swap(i, j)
		i = j
	}
}
```

说明：
1. 通过接口的`h.Less(i, j)`方法，如果实现的是`return i < j`就是小顶堆，否则是大顶堆
2. Init 函数用于初始化堆结构，保证二叉堆的性质，即对于小顶堆，它的任意父节点都小于等于任意子节点。
3. Push 和 Pop 操作主要是通过 down 和 up 函数实现的
	- 2.1 up 方法用于将元素上浮到指定位置，通过逐个比较当前节点和父节点实现
	- 2.2 down 方法用于将元素下沉到指定位置，通过逐个比较当前节点和子  节点实现，这里返回布尔值用于在后续0 update 等操作中判断元素是应该下沉还是上浮
3. Remove 操作用于移除当前节点，可以看成 Pop 当前节点的操作
4. Fix 函数用于在节点的值或者权重发生改变时，维持二叉堆的性质

有了 heap 接口，接下来的优先级队列只要实现这个接口就可以了

```go
package pq

import "heap"

type Item81 - int
}

type PriorityQueue []*Item

func (pq PriorityQueue) Less(i, j int) bool {
	return pq[i].priority > pq[j].priority
}

func (pq PriorityQueue) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
	pq[i].index = i
	pq[j].index = j
}

func (pq PriorityQueue) Len() int {
	return len(pq)
}

func (pq *PriorityQueue) Push(x any) {
	n := len(*pq)
	item := x.(*Item)
	item.index = n
	*pq = append(*pq, item)
}

func (pq *PriorityQueue) Pop() any {
	old := *pq
	n := len(old) - 1
	x := old[n]
	old[n] = nil
	x.index = -1
	*pq = old[0:n]
	return x
}

func (pq *PriorityQueue) update(item *Item, value string, priority int) {
	item.value = value
	item.priority = priority
	heap.Fix(pq, item.index)
}

func Example_priorityQueue() {
	items := map[string]int{
		"banana": 3, "apple": 2, "pear": 4,
	}

	pq := make(PriorityQueue, len(items))
	i := 0
	for value, priority := range items {
		pq[i] = &Item{
			value:    value,
			priority: priority,
			index:    i,
		}
		i++
	}
	heap.Init(&pq)

	item := &Item{
		value:    "orange",
		priority: 1,
	}
	heap.Push(&pq, item)
	pq.update(item, item.value, 5)

	for pq.Len() > 0 {
		item := heap.Pop(&pq).(*Item)
		fmt.Printf("%.2d:%s ", item.priority, item.value)
	}
	// Output:
	// 05:orange 04:pear 03:banana 02:apple
}
```

注意：
1. 这里改变了 Less 方法，实现的是大顶堆，即高优先级的元素先出列
2. Pop 的时候，不仅要返回出队的元素，还要将之前的位置设置成 nil，让垃圾回收工作

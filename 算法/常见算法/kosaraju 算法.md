### 前言

以前学习了算法，但是因为没有记录下来，最近又要重新开始学习了，这次就将我的学习经历汇总成文章，记录下来。


> **科萨拉朱算法**（英语：Kosaraju's algorithm），也被称为**科萨拉朱—夏尔算法**，是一个在[线性时间](https://zh.wikipedia.org/wiki/%E7%B7%9A%E6%80%A7%E6%99%82%E9%96%93 "线性时间")内寻找一个[有向图](https://zh.wikipedia.org/wiki/%E5%9B%BE_(%E6%95%B0%E5%AD%A6) "图 (数学)")中的[强连通分量](https://zh.wikipedia.org/wiki/%E5%BC%BA%E8%BF%9E%E9%80%9A%E5%88%86%E9%87%8F "强连通分量")的算法。


首先我们需要知道几个概念

### 有向图

> 边为有方向的图称作**有向图**（英语：**directed graph**或**digraph**）。

有向图的一种比较严格的定义是这样的：一个二元组$G=(V,E)$，其中

- $V$是**节点**的集合；
- ${\displaystyle E\subseteq \{(x,y)\mid (x,y)\in V^{2}\wedge x\neq y\}}$是**边**（也称为有向边，英语：**directed edge**或**directed link**；或**弧**，英语：**arcs**）的集合，其中的元素是节点的有序对。

下图是一个简单的有向图：

![[有向图.png]]

### 强连通分量

有向图中，尽可能多的若干顶点组成的子图中，这些顶点都是相互可到达的，则这些顶点成为一个强连通分量。

![[截屏2024-02-05 02.39.27.png]]


其实求解强连通分量的算法并不止一种，除了**Kosaraju**之外还有大名鼎鼎的**Tarjan**算法可以用来求解。但相比**Tarjan**算法，**Kosaraju**算法更加==直观==，更加==容易理解==。

### DFS 生成树

先来了解 **DFS 生成树**，我们以下面的有向图为例：

![[Pasted image 20240201021504.png]]

有向图的 DFS 生成树主要有 4 种边（不一定全部出现）：

1. 树边（tree edge）：示意图中以黑色边表示，每次搜索找到一个还没有访问过的结点的时候就形成了一条树边。
2. 反祖边（back edge）：示意图中以红色边表示（即 $7 \rightarrow 1$），也被叫做回边，即指向祖先结点的边。
3. 横叉边（cross edge）：示意图中以蓝色边表示（即 $9 \rightarrow 7$），它主要是在搜索的时候遇到了一个已经访问过的结点，但是这个结点 **并不是** 当前结点的祖先。
4. 前向边（forward edge）：示意图中以绿色边表示（即 $3 \rightarrow 6$），它是在搜索的时候遇到子树中的结点的时候形成的。


这是使用 js 实现的一个简单的 DFS：

```js
const depth1 = (dom, nodeList) => {
	dom.children.forEach((element) => {
		depth1(element, nodeList) 
	}) 
	nodeList.push(dom.name) 
}
```


我们考虑 DFS 生成树与强连通分量之间的关系。

如果结点  $u$  是某个强连通分量在搜索树中遇到的第一个结点，那么这个强连通分量的其余结点肯定是在搜索树中以 $u$ 为根的子树中。结点 $u$ 被称为这个强连通分量的根。

反证法：假设有个结点 $v$ 在该强连通分量中但是不在以 $u$ 为根的子树中，那么 $u$ 到 $v$ 的路径中肯定有一条离开子树的边。但是这样的边只可能是横叉边或者反祖边，然而这两条边都要求指向的结点已经被访问过了，这就和 $u$ 是第一个访问的结点矛盾了。得证。


###  Kosaraju 算法

该算法依靠两次简单的 DFS 实现：

第一次 DFS，选取任意顶点作为起点，遍历所有未访问过的顶点，并在回溯之前给顶点编号，也就是后序遍历。

第二次 DFS，对于反向后的图，以标号最大的顶点作为起点开始 DFS。这样遍历到的顶点集合就是一个强连通分量。对于所有未访问过的结点，选取标号最大的，重复上述过程。

两次 DFS 结束后，强连通分量就找出来了，Kosaraju 算法的时间复杂度为 $O(n+m)$ 。

这里利用下网上的算法，简单表示一下：

```python
N = 7
graph, rgraph = [[] for _ in range(N)], [[] for _ in range(N)]
used = [False for _ in range(N)]
popped = []


# 建图
def add_edge(u, v):
    graph[u].append(v)
    rgraph[v].append(u)


# 正向遍历
def dfs(u):
    used[u] = True
    for v in graph[u]:
        if not used[v]:
            dfs(v)
    popped.append(u)


# 反向遍历
def rdfs(u, scc):
    used[u] = True
    scc.append(u)
    for v in rgraph[u]:
        if not used[v]:
            rdfs(v, scc)
            
# 建图，测试数据         
def build_graph():
    add_edge(1, 3)
    add_edge(1, 2)
    add_edge(2, 4)
    add_edge(3, 4)
    add_edge(3, 5)
    add_edge(4, 1)
    add_edge(4, 6)
    add_edge(5, 6)


if __name__ == "__main__":
    build_graph()
    for i in range(1, N):
        if not used[i]:
            dfs(i)

    used = [False for _ in range(N)]
    # 将第一次dfs出栈顺序反向
    popped.reverse()
    for i in popped:
        if not used[i]:
            scc = []
            rdfs(i, scc)
            print(scc)
```

### 动画演示

![[0093-scc-kosaraju.gif]]

动画演示和标准的 `Kosaraju` 算法有点不一样：它是先 `DFS` 遍历顶点得到逆后序排序，然后再将有向图置为反向图，按照逆后序排序取出顶点，深度优先搜索反向图。结果和 `Kosaraju` 算法一致。

### 引用、推荐

- https://xie.infoq.cn/article/02144dc8c84e4b85cc9b27779
- https://zh.wikipedia.org/wiki/%E5%9B%BE_(%E6%95%B0%E5%AD%A6)#%E6%9C%89%E5%90%91%E5%9B%BE
- https://oi-wiki.org/graph/scc/#kosaraju-%E7%AE%97%E6%B3%95
- https://www.cnblogs.com/nullzx/p/6437926.html
- https://www.cnblogs.com/RioTian/p/14026585.html
- https://www.youtube.com/watch?v=TyWtx7q2D7Y
- https://www.youtube.com/watch?v=R6uoSjZ2imo
- https://redspider110.github.io/2018/08/22/0093-algorithms-scc-kosaraju/
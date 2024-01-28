
> **科萨拉朱算法**（英语：Kosaraju's algorithm），也被称为**科萨拉朱—夏尔算法**，是一个在[线性时间](https://zh.wikipedia.org/wiki/%E7%B7%9A%E6%80%A7%E6%99%82%E9%96%93 "线性时间")内寻找一个[有向图](https://zh.wikipedia.org/wiki/%E5%9B%BE_(%E6%95%B0%E5%AD%A6) "图 (数学)")中的[强连通分量](https://zh.wikipedia.org/wiki/%E5%BC%BA%E8%BF%9E%E9%80%9A%E5%88%86%E9%87%8F "强连通分量")的算法。


首先我们需要知道几个概念

### 有向图

> 边为有方向的图称作**有向图**（英语：**directed graph**或**digraph**）。

有向图的一种比较严格的定义是这样的：一个二元组![{\displaystyle G=(V,E)}](https://wikimedia.org/api/rest_v1/media/math/render/svg/644a8d85ee410b6159ca2bdb5dcb9097e2c8f182)，其中

- ![{\displaystyle V}](https://wikimedia.org/api/rest_v1/media/math/render/svg/af0f6064540e84211d0ffe4dac72098adfa52845)是**节点**的集合；
- ![{\displaystyle E\subseteq \{(x,y)\mid (x,y)\in V^{2}\wedge x\neq y\}}](https://wikimedia.org/api/rest_v1/media/math/render/svg/823ab5b54c62c1bd1bcbdc70b62c430c88ea0d6f)是**边**（也称为有向边，英语：**directed edge**或**directed link**；或**弧**，英语：**arcs**）的集合，其中的元素是节点的有序对。

下图是一个简单的有向图：

![[有向图.png]]

### 强连通分量

有向图中，尽可能多的若干顶点组成的子图中，这些顶点都是相互可到达的，则这些顶点成为一个强连通分量。

![[Pasted image 20240129024300.png]]

比如上面这张图当中的{1, 2, 3, 4}节点就可以被看成是一个强连通分量。

### DFS 生成树

在介绍 kosaraju 算法之前，先来了解 **DFS 生成树**，我们以下面的有向图为例：

## 引用

- https://xie.infoq.cn/article/02144dc8c84e4b85cc9b27779
- https://zh.wikipedia.org/wiki/%E5%9B%BE_(%E6%95%B0%E5%AD%A6)#%E6%9C%89%E5%90%91%E5%9B%BE
- https://oi-wiki.org/graph/scc/#kosaraju-%E7%AE%97%E6%B3%95
- https://www.cnblogs.com/nullzx/p/6437926.html
- https://www.cnblogs.com/RioTian/p/14026585.html
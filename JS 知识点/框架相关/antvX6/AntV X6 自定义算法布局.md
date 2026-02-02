## 概述

AntV X6 是蚂蚁集团开源的图可视化引擎，专注于图编辑、交互与渲染，布局（Layout）是其核心能力之一。X6 内置了多种经典布局（如树形、力导向、网格、环形等），但在实际业务中（如流程图、拓扑图、组织架构图等定制化场景），内置布局往往无法满足需求，因此**自定义布局**成为实现个性化图元素排布的关键能力。

---

## X6 内置布局系统

AntV X6 提供了灵活的布局机制，主要包括：

1. **内置布局算法** - 开箱即用的标准算法
2. **自定义布局** - 通过实现布局接口自定义算法
3. **第三方布局** - 集成 dagre、G6 等库的布局

### 内置布局类型

#### 1️⃣ 网格布局（Grid Layout）

**特点：**
- 将节点按行列排列
- 简洁规则，易于实现
- 适合展示表格式、矩阵式数据

**应用场景：**
- 数据表格展示
- 棋盘式分布
- 简单的网格数据

**算法原理：**
```typescript
// 按行列排列
row = index / cols
col = index % cols
x = col * colWidth
y = row * rowHeight
```

**配置参数：**
```typescript
{
  cols: 4,              // 列数
  colWidth: 200,        // 列宽
  rowHeight: 150,       // 行高
  marginX?: 20,         // 横向边距
  marginY?: 20          // 纵向边距
}
```

**优点：**
- ✅ 实现简单，性能好
- ✅ 节点排列规则，易于定位
- ✅ 适合大量节点的均匀分布

**缺点：**
- ❌ 无法体现节点之间的关系
- ❌ 边线交叉多，视觉复杂
- ❌ 不适合流程图等有逻辑关联的图

---

#### 2️⃣ 环形布局（Radial/Circular Layout）

**特点：**
- 节点围绕中心点圆形排列
- 支持多环层级结构
- 视觉效果良好，强调中心

**应用场景：**
- 中心辐射的组织结构
- 社交网络图
- 知识图谱的中心概念展示
- 树形结构的中心视图

**算法原理：**
```typescript
// 单环径向
angle = (2 * Math.PI / nodeCount) * index
x = centerX + radius * Math.cos(angle)
y = centerY + radius * Math.sin(angle)

// 多环径向
ringNumber = Math.floor(index / nodesPerRing)
radius = baseRadius + ringNumber * ringGap
```

**配置参数：**
```typescript
{
  center: { x: 400, y: 400 },  // 中心点
  radius: 300,                  // 半径
  startAngle?: 0,               // 起始角度
  ringGap?: 80,                 // 环间距（多环时）
  nodePerRing?: 8               // 每环节点数（多环时）
}
```

**变体：**

1. **单环布局** - 节点围绕单个圆形
2. **多环布局** - 按层级分布在多个圆形上（树形结构）
3. **螺旋布局** - 螺旋式排列，强调渐进关系

**优点：**
- ✅ 视觉效果华丽，强调中心
- ✅ 适合展示层级关系（多环）
- ✅ 节点均匀分布，易于选取
- ✅ 可视化清晰，交叉线少

**缺点：**
- ❌ 仅适合中等规模节点（过多会拥挤）
- ❌ 边线容易拥挤在中心
- ❌ 不适合表现复杂的逻辑流

---

#### 3️⃣ Dagre 分层布局（Hierarchical Layout）

**特点：**
- 将图分层排列，适合DAG（有向无环图）
- 自动处理边的交叉，降低视觉复杂度
- 广泛应用于流程图、组织架构等

**应用场景：**
- 流程图（订单流、审批流等）
- 组织架构图
- 类型系统、依赖图
- 数据流图
- 状态机

**算法原理：**

Dagre 是一个强大的图布局库，核心步骤：

1. **分层** - 根据节点依赖关系分配层级
2. **节点排序** - 同层节点排序，最小化边交叉
3. **坐标分配** - 计算每个节点的最终坐标

```
第1层：[开始] 
        ↓
第2层：[订单检查]
        ↓
第3层：[验证有效] 
       /  \
      ✓    ✗
     /      \
第4层: [库存检查]  [拒绝]
      ↓            ↓
第5层: [支付处理]  ↓
      ↓            ↓
第6层: [打包订单]  ↓
      ↓            ↓
第7层: [发货]     ↓
      ↓            ↓
第8层: [结束] ←────┘
```

**配置参数：**
```typescript
{
  rankdir: 'TB',    // 方向: TB(上下) | BT(下上) | LR(左右) | RL(右左)
  ranksep: 60,      // 层间距
  nodesep: 40,      // 同层节点间距
  marginX?: 50,     // 横向边距
  marginY?: 50      // 纵向边距
}
```

**支持的方向：**
- **TB** (Top → Bottom) - 默认，从上到下
- **BT** (Bottom → Top) - 从下到上
- **LR** (Left → Right) - 从左到右
- **RL** (Right → Left) - 从右到左

**优点：**
- ✅ 专为流程图设计，效果最佳
- ✅ 自动最小化边交叉，视觉清晰
- ✅ 支持多个方向，灵活适应
- ✅ 处理复杂图形能力强
- ✅ 广泛应用于各大可视化平台

**缺点：**
- ❌ 仅适用于DAG（无环图）
- ❌ 对于有环图需要特殊处理
- ❌ 需要安装 dagre 依赖

---

#### 4️⃣ 力导向布局（Force-Directed Layout）

**特点：**
- 将图的布局视为物理系统（弹簧+斥力）
- 自动调整位置使图达到平衡
- 产生自然、美观的布局

**应用场景：**
- 社交网络图
- 关系网络
- 知识图谱
- 通用的复杂图可视化

**算法原理：**

模拟物理系统中的力：
- **吸引力** - 相连节点相互吸引（如弹簧）
- **斥力** - 所有节点互相排斥（如同性电荷）

```
初始位置 → 计算力 → 更新位置 → 收敛 → 最终布局
```

**配置参数：**
```typescript
{
  center: { x: 0, y: 0 },    // 中心点
  clustering: boolean,        // 是否使用聚类
  nodeStrength: -30,         // 节点斥力强度（负数）
  edgeLength: 200,           // 边的目标长度
  edgeStrength: 0.1,         // 边的弹簧力强度
  iterations: 1000           // 迭代次数
}
```

**优点：**
- ✅ 布局美观自然
- ✅ 自动调整，无需手动配置复杂参数
- ✅ 能充分表现节点关系
- ✅ 适合通用的网络图

**缺点：**
- ❌ 计算量大，性能差（节点多时）
- ❌ 效果随机性强，结果不稳定
- ❌ 不适合有明确逻辑的流程
- ❌ 边交叉可能较多

---

#### 5️⃣ 树形布局（Tree Layout）

**特点：**
- 专为树形结构设计
- 支持多种树形方向
- 层次清晰，结构明确

**应用场景：**
- 组织机构树
- 文件目录树
- 决策树
- 类型继承树

**支持的方向：**
```
    TB (纵向)          LR (横向)
    
    ┌─ 父节点          父节点
   ┌┴─ 子节点1    ────┬──┐
   │└─ 子节点2         子1  子2
   └─ 子节点3
```

**配置参数：**
```typescript
{
  direction: 'TB',      // TB|BT|LR|RL
  getHeight: () => 40,  // 节点高度计算
  getWidth: () => 80,   // 节点宽度计算
  getVGap: () => 40,    // 纵向间距
  getHGap: () => 80     // 横向间距
}
```

**优点：**
- ✅ 为树形结构优化
- ✅ 层次结构清晰
- ✅ 性能好

**缺点：**
- ❌ 仅适用于树形结构
- ❌ 不能处理有环的图

---

## 布局算法对比表

| 算法 | 网格 | 环形 | Dagre | 力导向 | 树形 |
|------|------|------|--------|---------|------|
| **实现难度** | 极简 | 简单 | 复杂 | 很复杂 | 中等 |
| **性能** | 极好 | 优秀 | 优秀 | 差 | 优秀 |
| **节点数支持** | ≥1000 | 100-500 | 100-1000 | 10-100 | 1000+ |
| **流程图** | ❌ | ⭐ | ⭐⭐⭐ | ⚠️ | ✅ |
| **组织架构** | ❌ | ⭐⭐ | ⭐ | ⚠️ | ⭐⭐⭐ |
| **关系网络** | ❌ | ⭐ | ❌ | ⭐⭐⭐ | ❌ |
| **数据表格** | ⭐⭐⭐ | ❌ | ❌ | ❌ | ❌ |
| **边交叉少** | ❌ | ⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ |

---

## 实现自定义布局

### 基本接口

自定义布局需要实现如下接口：

```typescript
interface Layout {
  /**
   * 执行布局算法
   * @param graph - X6 的 Graph 实例
   * @param options - 配置参数
   */
  layout(graph: Graph, options?: any): Promise<void>
  
  /**
   * 停止布局
   */
  stop?(): void
  
  /**
   * 销毁资源
   */
  destroy?(): void
}
```

### 简单例子：随机布局

```typescript
export class RandomLayout {
  static layout(
    nodes: Cell[],
    options: { width: number; height: number }
  ): Record<string, { x: number; y: number }> {
    const { width = 1000, height = 800 } = options
    const positions: Record<string, { x: number; y: number }> = {}

    nodes.forEach((node) => {
      positions[node.id] = {
        x: Math.random() * width,
        y: Math.random() * height,
      }
    })

    return positions
  }
}
```

---

## Demo 项目

完整的自定义布局 Demo 包含五种实现，并在界面上提供布局切换与一键适配视图（Fit）功能。Demo 通过相同的数据结构（订单处理流程的节点与边）来比较不同布局效果，便于评估在业务流程图中的适用性。

**Demo 的布局切换流程：**
1. 清空现有节点与边
2. 重新添加同一份流程数据
3. 计算各布局的节点坐标
4. 写入坐标并执行 zoomToFit

**Demo 默认参数：**
- Grid：cols=4, colWidth=200, rowHeight=150
- Radial：center=(400,400), radius=300
- Dagre：rankdir=TB, ranksep=60, nodesep=40
- Force：center=(400,400), nodeStrength=-30, edgeLength=200, edgeStrength=0.1, iterations=500
- Tree：direction=TB, nodeGap=80, levelGap=100, root=start

### 1. CustomGridLayout
```typescript
// 特点：规则的网格排列
// 参数：cols（列数）, colWidth, rowHeight
CustomGridLayout.layout(nodes, { cols: 4, colWidth: 200, rowHeight: 150 })
```

### 2. CustomRadialLayout
```typescript
// 特点：圆形、多环、螺旋三种模式
// 参数：center（中心点）, radius（半径）
CustomRadialLayout.layout(nodes, { center: { x: 400, y: 400 }, radius: 300 })
CustomRadialLayout.layoutMultiRing(nodes, rootId, {...})
CustomRadialLayout.layoutSpiral(nodes, {...})
```

### 3. CustomDagreLayout
```typescript
// 特点：分层布局，最适合流程图
// 参数：rankdir（方向）, ranksep, nodesep
CustomDagreLayout.layout(nodes, edges, { rankdir: 'TB', ranksep: 60 })
```

### 4. CustomForceLayout
```typescript
// 特点：力导向，布局自然
// 参数：center, nodeStrength, edgeLength, edgeStrength, iterations
CustomForceLayout.layout(nodes, edges, {
  center: { x: 400, y: 400 },
  nodeStrength: -30,
  edgeLength: 200,
  edgeStrength: 0.1,
  iterations: 500,
})
```

### 5. CustomTreeLayout
```typescript
// 特点：树形层级结构，适合单向流程
// 参数：direction, nodeGap, levelGap
CustomTreeLayout.layout(nodes, edges, {
  direction: 'TB',
  nodeGap: 80,
  levelGap: 100,
}, 'start')
```

---

## 选型建议

### 🎯 按应用场景选择布局

**流程图 / 审批流 / 工作流**
→ **首选：Dagre** | 备选：树形（如果是单向树）

**组织机构 / 公司架构**
→ **首选：树形** | 备选：Dagre（横向）

**社交关系 / 知识图谱**
→ **首选：力导向** | 备选：环形（中心概念）

**数据仪表板 / 表格展示**
→ **首选：网格** | 其他不适用

**中心辐射 / 思维导图**
→ **首选：环形/树形** | 备选：Dagre（TB 模式）

---

## 常见问题

**Q: 自定义布局与内置布局的关系？**
> A: 自定义布局只是改变节点坐标的计算方式，不涉及 X6 的渲染、交互等核心功能。X6 仍然负责图的绘制、事件处理等。

**Q: 可以动态切换布局吗？**
> A: 完全可以。Demo 的做法是清空节点与边，重新添加同一份数据，再计算布局并更新节点坐标，最后使用 zoomToFit 适配视图：
> ```typescript
> graph.clearCells()
> graph.addNodes(nodes)
> graph.addEdges(edges)
> // 计算 positions 并 setPosition
> graph.zoomToFit({ padding: 50 })
> ```

**Q: 大规模数据（>1000 节点）如何选择？**
> A: 
> - 首选网格布局（性能最佳）
> - 如是流程图，考虑分组+局部 Dagre 布局
> - 避免力导向（会卡）
> - 考虑虚拟渲染（只渲染可见区域）

**Q: 如何处理有环图？**
> A: Dagre 不支持有环图。解决方案：
> - 检测并移除环
> - 使用力导向布局
> - 将环拆分为多个 DAG

---

## 参考资源

- [AntV X6 官方文档](https://x6.antv.vision/)
- [Dagre 官方](https://dagrejs.github.io/graphlib-dot/doc/index.html)
- [力导向布局原理](https://en.wikipedia.org/wiki/Force-directed_graph_drawing)
- [本项目 Demo](./demo/)

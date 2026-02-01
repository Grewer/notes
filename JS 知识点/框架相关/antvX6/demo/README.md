# AntV X6 Custom Layout Demo

这是一个展示 AntV X6 自定义布局算法的 React 演示项目。

## 功能特性

### 📐 自定义布局算法

1. **Grid Layout（网格布局）**
   - 按行列排列节点
   - 可配置列数和间距
   - 适合表格式数据展示
   - 性能最优（支持1000+节点）

2. **Radial Layout（径向布局）**
   - 节点围绕中心点圆形排列
   - 支持多环径向布局
   - 支持螺旋布局
   - 适合树形结构和中心辐射图

3. **Dagre Layout（有向无环图布局）**
   - 基于 dagre 库的分层布局
   - 支持 TB/BT/LR/RL 四个方向
   - 自动处理边交叉，最小化视觉复杂度
   - **最适合流程图、工作流、审批流**
   - 支持100-1000节点

4. **Force Layout（力导向布局）**
   - 基于物理模拟的布局算法
   - 节点间产生斥力，边产生吸引力
   - 自动平衡节点分布
   - 适合社交网络、关系图展示
   - 适合10-100节点的中等规模图

5. **Tree Layout（树形布局）**
   - 专为树形结构优化设计
   - 支持 TB/BT/LR/RL 四个方向
   - 层次结构清晰，上下对齐
   - 适合组织架构、文件树、决策树
   - 支持1000+节点

## 项目结构

```
demo/
├── src/
│   ├── layouts/
│   │   ├── CustomGridLayout.ts      # 网格布局实现
│   │   ├── CustomRadialLayout.ts    # 径向布局实现
│   │   ├── CustomDagreLayout.ts     # Dagre 分层布局实现
│   │   ├── CustomForceLayout.ts     # 力导向布局实现
│   │   └── CustomTreeLayout.ts      # 树形布局实现
│   ├── App.tsx                      # 主应用组件
│   ├── App.css                      # 样式
│   ├── main.tsx                     # 入口文件
│   └── index.css                    # 全局样式
├── index.html                       # HTML 模板
├── package.json                     # 依赖配置
├── vite.config.ts                   # Vite 配置
├── tsconfig.json                    # TypeScript 配置
└── README.md                        # 本文件
```

## 安装和运行

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发服务器

```bash
npm run dev
# 或
yarn dev
```

应用会自动在浏览器中打开，访问 `http://localhost:3000`

### 生产构建

```bash
npm run build
# 或
yarn build
```

### 预览生产构建

```bash
npm run preview
# 或
yarn preview
```

## 核心依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| `@antv/x6` | ^2.18.1 | 图可视化引擎 |
| `@antv/x6-react-shape` | ^2.18.1 | React 组件支持 |
| `dagre` | ^0.8.5 | 分层图布局 |
| `react` | ^18.2.0 | UI 框架 |
| `vite` | ^4.3.0 | 构建工具 |

## 使用示例

### 基础网格布局

```typescript
import { CustomGridLayout } from './layouts/CustomGridLayout'

const positions = CustomGridLayout.layout(nodes, {
  cols: 4,
  colWidth: 200,
  rowHeight: 150,
})
```

### 径向布局

```typescript
import { CustomRadialLayout } from './layouts/CustomRadialLayout'

const positions = CustomRadialLayout.layout(nodes, {
  center: { x: 400, y: 400 },
  radius: 300,
})
```

### Dagre 布局

```typescript
import { CustomDagreLayout } from './layouts/CustomDagreLayout'

const positions = CustomDagreLayout.layout(nodes, edges, {
  rankdir: 'TB',
  ranksep: 60,
  nodesep: 40,
})
```

## 自定义扩展

### 添加新布局算法

1. 在 `src/layouts/` 目录创建新文件
2. 实现布局算法，返回节点位置映射
3. 在 App.tsx 中导入并使用

```typescript
// src/layouts/CustomLayoutName.ts
export class CustomLayoutName {
  static layout(
    nodes: Cell[],
    options: LayoutOptions
  ): Record<string, { x: number; y: number }> {
    const positions: Record<string, { x: number; y: number }> = {}
    // 实现布局逻辑
    return positions
  }
}
```

### 修改图的配置

编辑 `App.tsx` 中的 Graph 初始化部分：

```typescript
const graph = new Graph({
  container: containerRef.current,
  grid: { size: 10, visible: true },
  panning: { enabled: true },
  mousewheel: { enabled: true, modifiers: 'ctrl' },
  // ... 其他配置
})
```

## 常见问题

### Q: 如何改变节点的大小和样式？

在 `App.tsx` 的 `initializeGraph` 函数中修改节点配置：

```typescript
const nodes = Array.from({ length: nodeCount }, (_, i) => ({
  // ...
  width: 100,    // 修改宽度
  height: 50,    // 修改高度
  attrs: {
    body: {
      fill: '#FF5722',  // 修改颜色
    },
  },
}))
```

### Q: 如何添加自定义节点类型？

在 X6 中注册自定义节点形状：

```typescript
graph.registerNode('custom-node', {
  inherit: 'rect',
  width: 100,
  height: 50,
  // ... 自定义属性
})
```

### Q: 性能优化建议

- 使用虚拟渲染处理大量节点
- 避免频繁重新渲染
- 使用 `graph.batch()` 批量更新

## 贡献指南

欢迎提交 PR 和 Issue！

## 许可证

MIT

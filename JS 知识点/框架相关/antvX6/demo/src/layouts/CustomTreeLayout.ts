import { Cell } from '@antv/x6'

interface TreeLayoutOptions {
  direction?: 'TB' | 'BT' | 'LR' | 'RL'  // 方向
  nodeGap?: number                        // 同层节点间距
  levelGap?: number                       // 层间距
}

/**
 * Custom Tree Layout
 * Arranges nodes in a hierarchical tree structure
 */
export class CustomTreeLayout {
  static layout(
    nodes: Cell[],
    edges: Cell[],
    options: TreeLayoutOptions = {},
    rootNodeId?: string
  ): Record<string, { x: number; y: number }> {
    const {
      direction = 'TB',
      nodeGap = 80,
      levelGap = 100,
    } = options

    const positions: Record<string, { x: number; y: number }> = {}

    if (nodes.length === 0) return positions

    // 构建邻接表和反向邻接表
    const children = new Map<string, string[]>()
    const parents = new Map<string, string>()

    nodes.forEach((node) => {
      children.set(node.id, [])
      parents.set(node.id, '')
    })

    edges.forEach((edge) => {
      const source = edge.getSourceNode()?.id
      const target = edge.getTargetNode()?.id

      if (source && target) {
        children.get(source)?.push(target)
        parents.set(target, source)
      }
    })

    // 找出根节点（没有父节点的节点）
    let root = rootNodeId || nodes[0].id
    for (const node of nodes) {
      if (!parents.get(node.id)) {
        root = node.id
        break
      }
    }

    // DFS 计算树的布局
    const levels = new Map<string, number>()
    const levelNodes = new Map<number, string[]>()

    const dfs = (nodeId: string, level: number) => {
      levels.set(nodeId, level)
      if (!levelNodes.has(level)) {
        levelNodes.set(level, [])
      }
      levelNodes.get(level)?.push(nodeId)

      children.get(nodeId)?.forEach((childId) => {
        dfs(childId, level + 1)
      })
    }

    dfs(root, 0)

    // 计算每个节点在其层中的索引和该层的总数
    const nodeIndexInLevel = new Map<string, number>()
    levelNodes.forEach((nodeList) => {
      nodeList.forEach((nodeId, index) => {
        nodeIndexInLevel.set(nodeId, index)
      })
    })

    // 根据方向计算坐标
    const baseX = 0
    const baseY = 0

    levelNodes.forEach((nodeList, level) => {
      const levelWidth = nodeList.length * nodeGap
      const startX = baseX - levelWidth / 2 + nodeGap / 2

      nodeList.forEach((nodeId, index) => {
        if (direction === 'TB') {
          positions[nodeId] = {
            x: startX + index * nodeGap,
            y: baseY + level * levelGap,
          }
        } else if (direction === 'BT') {
          positions[nodeId] = {
            x: startX + index * nodeGap,
            y: baseY - level * levelGap,
          }
        } else if (direction === 'LR') {
          positions[nodeId] = {
            x: baseX + level * levelGap,
            y: startX + index * nodeGap,
          }
        } else if (direction === 'RL') {
          positions[nodeId] = {
            x: baseX - level * levelGap,
            y: startX + index * nodeGap,
          }
        }
      })
    })

    return positions
  }

  /**
   * Compact tree layout - 紧凑树形布局
   * 优化节点位置，使树形结构更紧凑
   */
  static layoutCompact(
    nodes: Cell[],
    edges: Cell[],
    options: TreeLayoutOptions = {},
    rootNodeId?: string
  ): Record<string, { x: number; y: number }> {
    const {
      direction = 'TB',
      nodeGap = 60,
      levelGap = 100,
    } = options

    const positions: Record<string, { x: number; y: number }> = {}

    if (nodes.length === 0) return positions

    // 构建树结构
    const children = new Map<string, string[]>()
    const parents = new Map<string, string>()

    nodes.forEach((node) => {
      children.set(node.id, [])
      parents.set(node.id, '')
    })

    edges.forEach((edge) => {
      const source = edge.getSourceNode()?.id
      const target = edge.getTargetNode()?.id

      if (source && target) {
        children.get(source)?.push(target)
        parents.set(target, source)
      }
    })

    let root = rootNodeId || nodes[0].id
    for (const node of nodes) {
      if (!parents.get(node.id)) {
        root = node.id
        break
      }
    }

    // 递归计算每个节点的宽度和位置
    const nodeWidths = new Map<string, number>()
    const nodeXOffsets = new Map<string, number>()

    const calculateWidth = (nodeId: string): number => {
      const childIds = children.get(nodeId) || []
      if (childIds.length === 0) {
        nodeWidths.set(nodeId, nodeGap)
        return nodeGap
      }

      let totalWidth = 0
      childIds.forEach((childId) => {
        totalWidth += calculateWidth(childId)
      })

      nodeWidths.set(nodeId, Math.max(totalWidth, nodeGap))
      return nodeWidths.get(nodeId)!
    }

    const layout = (nodeId: string, x: number, y: number) => {
      positions[nodeId] = { x, y }

      const childIds = children.get(nodeId) || []
      if (childIds.length === 0) return

      const totalWidth = nodeWidths.get(nodeId) || nodeGap
      let startX = x - totalWidth / 2

      childIds.forEach((childId) => {
        const childWidth = nodeWidths.get(childId) || nodeGap
        const childX = startX + childWidth / 2
        const childY = direction === 'TB' || direction === 'BT'
          ? y + levelGap
          : x + levelGap

        if (direction === 'LR' || direction === 'RL') {
          layout(childId, childX, startX + childWidth / 2)
        } else {
          layout(childId, childX, childY)
        }

        startX += childWidth
      })
    }

    calculateWidth(root)
    if (direction === 'TB' || direction === 'BT') {
      layout(root, 0, direction === 'TB' ? 0 : 0)
    } else {
      layout(root, 0, 0)
    }

    return positions
  }
}

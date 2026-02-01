import { Cell } from '@antv/x6'

interface ForceLayoutOptions {
  center?: { x: number; y: number }
  nodeStrength?: number      // 节点斥力强度（负数）
  edgeLength?: number         // 边的目标长度
  edgeStrength?: number       // 边的弹簧力强度
  iterations?: number         // 迭代次数
  coulombDisScale?: number    // 库伦力衰减因子
}

/**
 * Custom Force-Directed Layout
 * Simulates physical forces between nodes
 */
export class CustomForceLayout {
  static layout(
    nodes: Cell[],
    edges: Cell[],
    options: ForceLayoutOptions = {}
  ): Record<string, { x: number; y: number }> {
    const {
      center = { x: 400, y: 400 },
      nodeStrength = -30,           // 负数表示排斥力
      edgeLength = 200,
      edgeStrength = 0.1,
      iterations = 500,
      coulombDisScale = 0.005,
    } = options

    // Initialize positions
    const positions: Record<string, { x: number; y: number }> = {}
    const velocity: Record<string, { x: number; y: number }> = {}

    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length
      positions[node.id] = {
        x: center.x + 150 * Math.cos(angle),
        y: center.y + 150 * Math.sin(angle),
      }
      velocity[node.id] = { x: 0, y: 0 }
    })

    // Build adjacency list for faster lookup
    const adjacencyList = new Map<string, Set<string>>()
    nodes.forEach((node) => {
      adjacencyList.set(node.id, new Set())
    })
    edges.forEach((edge) => {
      const source = edge.getSourceNode()?.id
      const target = edge.getTargetNode()?.id
      if (source && target) {
        adjacencyList.get(source)?.add(target)
        adjacencyList.get(target)?.add(source)
      }
    })

    // Simulation iterations
    for (let iter = 0; iter < iterations; iter++) {
      const forces: Record<string, { x: number; y: number }> = {}

      // Initialize forces
      nodes.forEach((node) => {
        forces[node.id] = { x: 0, y: 0 }
      })

      // Calculate repulsion forces (Coulomb's law)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i]
          const nodeB = nodes[j]
          const posA = positions[nodeA.id]
          const posB = positions[nodeB.id]

          const dx = posB.x - posA.x
          const dy = posB.y - posA.y
          const distance = Math.sqrt(dx * dx + dy * dy) + 0.01

          // Repulsion magnitude
          const force = coulombDisScale * nodeStrength / (distance * distance)

          const fx = (force * dx) / distance
          const fy = (force * dy) / distance

          forces[nodeA.id].x -= fx
          forces[nodeA.id].y -= fy
          forces[nodeB.id].x += fx
          forces[nodeB.id].y += fy
        }
      }

      // Calculate attraction forces (Hooke's law)
      edges.forEach((edge) => {
        const source = edge.getSourceNode()?.id
        const target = edge.getTargetNode()?.id

        if (source && target) {
          const posSource = positions[source]
          const posTarget = positions[target]

          const dx = posTarget.x - posSource.x
          const dy = posTarget.y - posSource.y
          const distance = Math.sqrt(dx * dx + dy * dy) + 0.01

          // Attraction magnitude
          const force = edgeStrength * (distance - edgeLength)

          const fx = (force * dx) / distance
          const fy = (force * dy) / distance

          forces[source].x += fx
          forces[source].y += fy
          forces[target].x -= fx
          forces[target].y -= fy
        }
      })

      // Update velocities and positions
      const dampingFactor = 0.9  // 阻尼因子，帮助收敛
      nodes.forEach((node) => {
        const force = forces[node.id]
        velocity[node.id].x = (velocity[node.id].x + force.x) * dampingFactor
        velocity[node.id].y = (velocity[node.id].y + force.y) * dampingFactor

        positions[node.id].x += velocity[node.id].x
        positions[node.id].y += velocity[node.id].y
      })

      // 检查是否收敛（所有速度都很小）
      if (iter > iterations * 0.5) {
        let maxVelocity = 0
        Object.values(velocity).forEach((v) => {
          const speed = Math.sqrt(v.x * v.x + v.y * v.y)
          maxVelocity = Math.max(maxVelocity, speed)
        })
        if (maxVelocity < 1) {
          break
        }
      }
    }

    return positions
  }

  /**
   * 获取图的统计信息
   */
  static getGraphStats(
    nodes: Cell[],
    edges: Cell[]
  ): {
    nodeCount: number
    edgeCount: number
    density: number
    avgDegree: number
  } {
    const nodeCount = nodes.length
    const edgeCount = edges.length
    const maxEdges = (nodeCount * (nodeCount - 1)) / 2
    const density = edgeCount / maxEdges

    let totalDegree = 0
    const degreeMap = new Map<string, number>()

    nodes.forEach((node) => {
      degreeMap.set(node.id, 0)
    })

    edges.forEach((edge) => {
      const source = edge.getSourceNode()?.id
      const target = edge.getTargetNode()?.id
      if (source) degreeMap.set(source, (degreeMap.get(source) || 0) + 1)
      if (target) degreeMap.set(target, (degreeMap.get(target) || 0) + 1)
    })

    degreeMap.forEach((degree) => {
      totalDegree += degree
    })

    return {
      nodeCount,
      edgeCount,
      density: parseFloat(density.toFixed(2)),
      avgDegree: parseFloat((totalDegree / nodeCount).toFixed(2)),
    }
  }
}

import { Cell } from '@antv/x6'

interface RadialLayoutOptions {
  center: { x: number; y: number }
  radius: number
  startAngle?: number
}

/**
 * Custom Radial Layout Algorithm
 * Arranges nodes in a circular/radial pattern
 */
export class CustomRadialLayout {
  static layout(
    nodes: Cell[],
    options: RadialLayoutOptions
  ): Record<string, { x: number; y: number }> {
    const { center, radius, startAngle = 0 } = options
    const positions: Record<string, { x: number; y: number }> = {}

    const angleSlice = (2 * Math.PI) / nodes.length

    nodes.forEach((node, index) => {
      const angle = startAngle + index * angleSlice
      const x = center.x + radius * Math.cos(angle)
      const y = center.y + radius * Math.sin(angle)

      positions[node.id] = { x, y }
    })

    return positions
  }

  /**
   * Multi-ring radial layout (good for hierarchical data)
   */
  static layoutMultiRing(
    nodes: Cell[],
    rootNodeId: string,
    options: RadialLayoutOptions & { ringGap: number; nodePerRing?: number }
  ): Record<string, { x: number; y: number }> {
    const { center, radius, startAngle = 0, ringGap = 80, nodePerRing = 8 } =
      options
    const positions: Record<string, { x: number; y: number }> = {}

    // Place root node at center
    positions[rootNodeId] = center

    // Place other nodes in rings
    let nodeIndex = 0
    let ring = 1

    nodes.forEach((node) => {
      if (node.id === rootNodeId) return

      const currentRingRadius = radius + (ring - 1) * ringGap
      const nodesInRing = ring === 1 ? nodePerRing : nodePerRing * ring

      if (nodeIndex >= nodesInRing * ring) {
        ring++
        nodeIndex = 0
      }

      const currentRing = Math.floor(nodeIndex / nodePerRing) + 1
      const angleSlice = (2 * Math.PI) / (nodePerRing * currentRing)
      const angle = startAngle + (nodeIndex % (nodePerRing * currentRing)) * angleSlice

      const x = center.x + currentRingRadius * Math.cos(angle)
      const y = center.y + currentRingRadius * Math.sin(angle)

      positions[node.id] = { x, y }
      nodeIndex++
    })

    return positions
  }

  /**
   * Spiral layout
   */
  static layoutSpiral(
    nodes: Cell[],
    options: RadialLayoutOptions & { spiralGap: number }
  ): Record<string, { x: number; y: number }> {
    const { center, radius, startAngle = 0, spiralGap = 30 } = options
    const positions: Record<string, { x: number; y: number }> = {}

    nodes.forEach((node, index) => {
      const angle = startAngle + (index / nodes.length) * 4 * Math.PI
      const r = radius * (index / nodes.length)

      const x = center.x + r * Math.cos(angle)
      const y = center.y + r * Math.sin(angle)

      positions[node.id] = { x, y }
    })

    return positions
  }
}

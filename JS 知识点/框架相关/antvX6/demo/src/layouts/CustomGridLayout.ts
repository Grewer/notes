import { Cell } from '@antv/x6'

interface GridLayoutOptions {
  cols: number
  colWidth: number
  rowHeight: number
}

/**
 * Custom Grid Layout Algorithm
 * Arranges nodes in a regular grid pattern
 */
export class CustomGridLayout {
  static layout(
    nodes: Cell[],
    options: GridLayoutOptions
  ): Record<string, { x: number; y: number }> {
    const { cols, colWidth, rowHeight } = options
    const positions: Record<string, { x: number; y: number }> = {}

    nodes.forEach((node, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols

      positions[node.id] = {
        x: col * colWidth,
        y: row * rowHeight,
      }
    })

    return positions
  }

  /**
   * Layout with custom spacing
   */
  static layoutWithSpacing(
    nodes: Cell[],
    options: GridLayoutOptions & { marginX: number; marginY: number }
  ): Record<string, { x: number; y: number }> {
    const { cols, colWidth, rowHeight, marginX = 20, marginY = 20 } = options
    const positions: Record<string, { x: number; y: number }> = {}

    nodes.forEach((node, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols

      positions[node.id] = {
        x: col * colWidth + marginX,
        y: row * rowHeight + marginY,
      }
    })

    return positions
  }
}

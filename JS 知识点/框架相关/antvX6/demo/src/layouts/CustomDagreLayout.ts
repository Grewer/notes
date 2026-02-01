import { Cell } from '@antv/x6'
import * as dagre from 'dagre'

interface DagreLayoutOptions {
  rankdir?: 'TB' | 'BT' | 'LR' | 'RL'
  ranksep?: number
  nodesep?: number
  marginX?: number
  marginY?: number
}

/**
 * Custom Dagre Layout Wrapper
 * Uses the dagre library for hierarchical layout with custom options
 */
export class CustomDagreLayout {
  static layout(
    nodes: Cell[],
    edges: Cell[],
    options: DagreLayoutOptions = {}
  ): Record<string, { x: number; y: number }> {
    const {
      rankdir = 'TB',
      ranksep = 60,
      nodesep = 40,
      marginX = 50,
      marginY = 50,
    } = options

    // Create a new directed graph
    const g = new dagre.graphlib.Graph()

    // Set default edge label and graph direction
    g.setGraph({
      rankdir,
      ranksep,
      nodesep,
      marginx: marginX,
      marginy: marginY,
    })
    g.setDefaultEdgeLabel(() => ({}))

    // Add nodes to graph with their dimensions
    nodes.forEach((node) => {
      g.setNode(node.id, {
        width: node.size?.width || 80,
        height: node.size?.height || 40,
      })
    })

    // Add edges to graph
    edges.forEach((edge) => {
      const source = edge.getSourceNode()?.id
      const target = edge.getTargetNode()?.id

      if (source && target) {
        g.setEdge(source, target)
      }
    })

    // Run dagre layout algorithm
    dagre.layout(g)

    // Extract positions from dagre layout
    const positions: Record<string, { x: number; y: number }> = {}

    g.nodes().forEach((nodeId) => {
      const node = g.node(nodeId)
      positions[nodeId] = {
        x: node.x - (node.width || 80) / 2,
        y: node.y - (node.height || 40) / 2,
      }
    })

    return positions
  }

  /**
   * Layout with custom node sizing
   */
  static layoutWithNodeSize(
    nodes: Cell[],
    edges: Cell[],
    nodeWidth: (node: Cell) => number,
    nodeHeight: (node: Cell) => number,
    options: DagreLayoutOptions = {}
  ): Record<string, { x: number; y: number }> {
    const {
      rankdir = 'TB',
      ranksep = 60,
      nodesep = 40,
      marginX = 50,
      marginY = 50,
    } = options

    const g = new dagre.graphlib.Graph()

    g.setGraph({
      rankdir,
      ranksep,
      nodesep,
      marginx: marginX,
      marginy: marginY,
    })
    g.setDefaultEdgeLabel(() => ({}))

    // Add nodes with dynamic sizing
    nodes.forEach((node) => {
      g.setNode(node.id, {
        width: nodeWidth(node),
        height: nodeHeight(node),
      })
    })

    // Add edges
    edges.forEach((edge) => {
      const source = edge.getSourceNode()?.id
      const target = edge.getTargetNode()?.id

      if (source && target) {
        g.setEdge(source, target)
      }
    })

    // Run layout
    dagre.layout(g)

    // Extract positions
    const positions: Record<string, { x: number; y: number }> = {}

    g.nodes().forEach((nodeId) => {
      const node = g.node(nodeId)
      positions[nodeId] = {
        x: node.x - node.width / 2,
        y: node.y - node.height / 2,
      }
    })

    return positions
  }

  /**
   * Get graph metrics
   */
  static getGraphMetrics(
    nodes: Cell[],
    edges: Cell[],
    options: DagreLayoutOptions = {}
  ): {
    width: number
    height: number
    nodeCount: number
    edgeCount: number
  } {
    const {
      rankdir = 'TB',
      ranksep = 60,
      nodesep = 40,
      marginX = 50,
      marginY = 50,
    } = options

    const g = new dagre.graphlib.Graph()

    g.setGraph({
      rankdir,
      ranksep,
      nodesep,
      marginx: marginX,
      marginy: marginY,
    })
    g.setDefaultEdgeLabel(() => ({}))

    nodes.forEach((node) => {
      g.setNode(node.id, {
        width: node.size?.width || 80,
        height: node.size?.height || 40,
      })
    })

    edges.forEach((edge) => {
      const source = edge.getSourceNode()?.id
      const target = edge.getTargetNode()?.id

      if (source && target) {
        g.setEdge(source, target)
      }
    })

    dagre.layout(g)

    const graphWidth = g.graph().width || 0
    const graphHeight = g.graph().height || 0

    return {
      width: graphWidth,
      height: graphHeight,
      nodeCount: nodes.length,
      edgeCount: edges.length,
    }
  }
}

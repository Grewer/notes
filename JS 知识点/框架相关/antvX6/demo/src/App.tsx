import React, { useEffect, useRef, useState } from 'react'
import { Graph } from '@antv/x6'
import { CustomGridLayout } from './layouts/CustomGridLayout'
import { CustomRadialLayout } from './layouts/CustomRadialLayout'
import { CustomDagreLayout } from './layouts/CustomDagreLayout'
import { CustomForceLayout } from './layouts/CustomForceLayout'
import { CustomTreeLayout } from './layouts/CustomTreeLayout'
import './App.css'

type LayoutType = 'grid' | 'radial' | 'dagre' | 'force' | 'tree'

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<Graph | null>(null)
  const [layoutType, setLayoutType] = useState<LayoutType>('grid')

  useEffect(() => {
    if (!containerRef.current) return

    // Register diamond shape as a custom node (only once)
    try {
      Graph.registerNode('diamond', {
        inherit: 'polygon',
        width: 80,
        height: 80,
        points: [[40, 0], [80, 40], [40, 80], [0, 40]],
      })
    } catch (e) {
      // Node already registered, ignore
    }

    // Initialize Graph
    const graph = new Graph({
      container: containerRef.current,
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
      grid: {
        size: 10,
        visible: true,
      },
      panning: {
        enabled: true,
      },
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: 'ctrl',
        minScale: 0.5,
        maxScale: 3,
      },
    })

    graphRef.current = graph

    // Initialize with default layout
    initializeGraph('grid')

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current && graphRef.current) {
        graphRef.current.resize(
          containerRef.current.offsetWidth,
          containerRef.current.offsetHeight
        )
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      graph.dispose()
    }
  }, [])

  const initializeGraph = (type: LayoutType) => {
    if (!graphRef.current) return

    const graph = graphRef.current
    graph.clearCells()

    // Create workflow nodes - 订单处理流程
    const nodes = [
      {
        id: 'start',
        shape: 'rect',
        label: '开始',
        width: 80,
        height: 40,
        attrs: {
          body: {
            fill: '#52C41A',
            stroke: '#389E0D',
            strokeWidth: 2,
          },
          label: {
            fill: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
          },
        },
      },
      {
        id: 'order-check',
        shape: 'rect',
        label: '订单检查',
        width: 90,
        height: 40,
        attrs: {
          body: {
            fill: '#1890FF',
            stroke: '#0050B3',
            strokeWidth: 2,
          },
          label: {
            fill: '#fff',
            fontSize: 12,
          },
        },
      },
      {
        id: 'validate',
        shape: 'diamond',
        label: '验证有效',
        width: 90,
        height: 60,
        attrs: {
          body: {
            fill: '#FAAD14',
            stroke: '#D48806',
            strokeWidth: 2,
          },
          label: {
            fill: '#fff',
            fontSize: 12,
          },
        },
      },
      {
        id: 'inventory-check',
        shape: 'rect',
        label: '库存检查',
        width: 90,
        height: 40,
        attrs: {
          body: {
            fill: '#1890FF',
            stroke: '#0050B3',
            strokeWidth: 2,
          },
          label: {
            fill: '#fff',
            fontSize: 12,
          },
        },
      },
      {
        id: 'stock-available',
        shape: 'diamond',
        label: '有货',
        width: 80,
        height: 60,
        attrs: {
          body: {
            fill: '#FAAD14',
            stroke: '#D48806',
            strokeWidth: 2,
          },
          label: {
            fill: '#fff',
            fontSize: 12,
          },
        },
      },
      {
        id: 'payment-process',
        shape: 'rect',
        label: '支付处理',
        width: 90,
        height: 40,
        attrs: {
          body: {
            fill: '#1890FF',
            stroke: '#0050B3',
            strokeWidth: 2,
          },
          label: {
            fill: '#fff',
            fontSize: 12,
          },
        },
      },
      {
        id: 'payment-success',
        shape: 'diamond',
        label: '支付成功',
        width: 90,
        height: 60,
        attrs: {
          body: {
            fill: '#FAAD14',
            stroke: '#D48806',
            strokeWidth: 2,
          },
          label: {
            fill: '#fff',
            fontSize: 12,
          },
        },
      },
      {
        id: 'package-order',
        shape: 'rect',
        label: '打包订单',
        width: 90,
        height: 40,
        attrs: {
          body: {
            fill: '#1890FF',
            stroke: '#0050B3',
            strokeWidth: 2,
          },
          label: {
            fill: '#fff',
            fontSize: 12,
          },
        },
      },
      {
        id: 'ship',
        shape: 'rect',
        label: '发货',
        width: 80,
        height: 40,
        attrs: {
          body: {
            fill: '#1890FF',
            stroke: '#0050B3',
            strokeWidth: 2,
          },
          label: {
            fill: '#fff',
            fontSize: 12,
          },
        },
      },
      {
        id: 'end',
        shape: 'rect',
        label: '结束',
        width: 80,
        height: 40,
        attrs: {
          body: {
            fill: '#FF4D4F',
            stroke: '#CF1322',
            strokeWidth: 2,
          },
          label: {
            fill: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
          },
        },
      },
      {
        id: 'reject',
        shape: 'rect',
        label: '拒绝',
        width: 80,
        height: 40,
        attrs: {
          body: {
            fill: '#FF7A45',
            stroke: '#D4380D',
            strokeWidth: 2,
          },
          label: {
            fill: '#fff',
            fontSize: 12,
          },
        },
      },
    ]

    // Create edges - workflow connections
    const edges = [
      // Main flow
      {
        source: 'start',
        target: 'order-check',
        label: '',
        attrs: {
          line: {
            stroke: '#1890FF',
            strokeWidth: 2,
            targetMarker: {
              name: 'classic',
              size: 8,
            },
          },
        },
      },
      {
        source: 'order-check',
        target: 'validate',
        attrs: {
          line: {
            stroke: '#1890FF',
            strokeWidth: 2,
            targetMarker: {
              name: 'classic',
              size: 8,
            },
          },
        },
      },
      {
        source: 'validate',
        target: 'inventory-check',
        label: '有效',
        attrs: {
          line: {
            stroke: '#52C41A',
            strokeWidth: 2,
            targetMarker: {
              name: 'classic',
              size: 8,
            },
          },
        },
      },
      {
        source: 'validate',
        target: 'reject',
        label: '无效',
        attrs: {
          line: {
            stroke: '#FF4D4F',
            strokeWidth: 2,
            targetMarker: {
              name: 'classic',
              size: 8,
            },
          },
        },
      },
      {
        source: 'inventory-check',
        target: 'stock-available',
        attrs: {
          line: {
            stroke: '#1890FF',
            strokeWidth: 2,
            targetMarker: {
              name: 'classic',
              size: 8,
            },
          },
        },
      },
      {
        source: 'stock-available',
        target: 'payment-process',
        label: '有货',
        attrs: {
          line: {
            stroke: '#52C41A',
            strokeWidth: 2,
            targetMarker: {
              name: 'classic',
              size: 8,
            },
          },
        },
      },
      {
        source: 'stock-available',
        target: 'reject',
        label: '缺货',
        attrs: {
          line: {
            stroke: '#FF4D4F',
            strokeWidth: 2,
            targetMarker: {
              name: 'classic',
              size: 8,
            },
          },
        },
      },
      {
        source: 'payment-process',
        target: 'payment-success',
        attrs: {
          line: {
            stroke: '#1890FF',
            strokeWidth: 2,
            targetMarker: {
              name: 'classic',
              size: 8,
            },
          },
        },
      },
      {
        source: 'payment-success',
        target: 'package-order',
        label: '成功',
        attrs: {
          line: {
            stroke: '#52C41A',
            strokeWidth: 2,
            targetMarker: {
              name: 'classic',
              size: 8,
            },
          },
        },
      },
      {
        source: 'payment-success',
        target: 'reject',
        label: '失败',
        attrs: {
          line: {
            stroke: '#FF4D4F',
            strokeWidth: 2,
            targetMarker: {
              name: 'classic',
              size: 8,
            },
          },
        },
      },
      {
        source: 'package-order',
        target: 'ship',
        attrs: {
          line: {
            stroke: '#1890FF',
            strokeWidth: 2,
            targetMarker: {
              name: 'classic',
              size: 8,
            },
          },
        },
      },
      {
        source: 'ship',
        target: 'end',
        attrs: {
          line: {
            stroke: '#1890FF',
            strokeWidth: 2,
            targetMarker: {
              name: 'classic',
              size: 8,
            },
          },
        },
      },
      {
        source: 'reject',
        target: 'end',
        attrs: {
          line: {
            stroke: '#FF7A45',
            strokeWidth: 2,
            targetMarker: {
              name: 'classic',
              size: 8,
            },
          },
        },
      },
    ]

    // Add nodes and edges
    graph.addNodes(nodes)
    graph.addEdges(edges)

    // Apply layout
    applyLayout(type)
  }

  const applyLayout = (type: LayoutType) => {
    if (!graphRef.current) return

    const graph = graphRef.current
    const nodes = graph.getNodes()
    const edges = graph.getEdges()

    let positions: Record<string, { x: number; y: number }> = {}

    switch (type) {
      case 'grid':
        positions = CustomGridLayout.layout(nodes, {
          cols: 4,
          colWidth: 200,
          rowHeight: 150,
        })
        break
      case 'radial':
        positions = CustomRadialLayout.layout(nodes, {
          center: { x: 400, y: 400 },
          radius: 300,
        })
        break
      case 'dagre':
        positions = CustomDagreLayout.layout(nodes, edges, {
          rankdir: 'TB',
          ranksep: 60,
          nodesep: 40,
        })
        break
      case 'force':
        positions = CustomForceLayout.layout(nodes, edges, {
          center: { x: 400, y: 400 },
          nodeStrength: -30,
          edgeLength: 200,
          edgeStrength: 0.1,
          iterations: 500,
        })
        break
      case 'tree':
        positions = CustomTreeLayout.layout(nodes, edges, {
          direction: 'TB',
          nodeGap: 80,
          levelGap: 100,
        }, 'start')
        break
    }

    // Apply positions to nodes
    Object.entries(positions).forEach(([nodeId, pos]) => {
      const node = graph.getCellById(nodeId)
      if (node) {
        node.setPosition(pos.x, pos.y)
      }
    })

    // Fit content after animation
    setTimeout(() => {
      graph.zoomToFit({ padding: 50 })
    }, 100)
  }

  const handleLayoutChange = (type: LayoutType) => {
    setLayoutType(type)
    applyLayout(type)
  }

  return (
    <div className="app-container">
      <div className="toolbar">
        <h1>AntV X6 Custom Layout Demo</h1>
        <div className="button-group">
          <button
            className={layoutType === 'grid' ? 'active' : ''}
            onClick={() => {
              setLayoutType('grid')
              initializeGraph('grid')
            }}
            title="Grid Layout"
          >
            Grid
          </button>
          <button
            className={layoutType === 'radial' ? 'active' : ''}
            onClick={() => {
              setLayoutType('radial')
              initializeGraph('radial')
            }}
            title="Radial Layout"
          >
            Radial
          </button>
          <button
            className={layoutType === 'dagre' ? 'active' : ''}
            onClick={() => {
              setLayoutType('dagre')
              initializeGraph('dagre')
            }}
            title="Dagre Hierarchical Layout"
          >
            Dagre
          </button>
          <button
            className={layoutType === 'force' ? 'active' : ''}
            onClick={() => {
              setLayoutType('force')
              initializeGraph('force')
            }}
            title="Force-Directed Layout"
          >
            Force
          </button>
          <button
            className={layoutType === 'tree' ? 'active' : ''}
            onClick={() => {
              setLayoutType('tree')
              initializeGraph('tree')
            }}
            title="Tree Layout"
          >
            Tree
          </button>
          <button
            className="fit-btn"
            onClick={() => {
              if (graphRef.current) {
                graphRef.current.zoomToFit({ padding: 50 })
              }
            }}
            title="Fit to view"
          >
            Fit
          </button>
        </div>
      </div>
      <div className="canvas" ref={containerRef} />
    </div>
  )
}

export default App

import type { Node, Edge } from 'ontology'
import type { AxisData } from '../types'
import { AXIS_COLORS, BORDER_COLORS } from '../config/visualization'

export interface CytoscapeNode {
  data: {
    id: string
    label: string
    originalId: string
    axisId: string
    graphId: string
    axisTitle: string
    description?: string
    properties?: any
    axis: AxisData
    originalNode: Node
    parent?: string
    isParent?: boolean
  }
  classes: string
  style: Record<string, any>
}

export interface CytoscapeEdge {
  data: {
    id: string
    source: string
    target: string
    label: string
    originalId: string
    axisId: string
    graphId: string
    axisTitle: string
    description?: string
    sourceOriginalId: string
    targetOriginalId: string
    axis: AxisData
    originalEdge: Edge
  }
  classes: string
  style: Record<string, any>
}

export function createCytoscapeNode(
  node: Node,
  axis: AxisData,
  // graphIndex: number,
  graphId: string
): CytoscapeNode {
  const colorIndex = 0 // graphIndex % AXIS_COLORS.length
  const nodeId = `${axis.id}-${graphId}-${node.id}`

  const parentId = node.meta?.parentId?.[0]
  const parentNodeId = parentId ? `parent-${parentId}` : undefined

  return {
    data: {
      id: nodeId,
      label: node.name,
      originalId: node.id,
      axisId: axis.id,
      graphId: graphId,
      axisTitle: axis.id,
      description: node.description,
      properties: node.properties,
      axis: axis,
      originalNode: node,
      ...(parentNodeId && { parent: parentNodeId })
    },
    classes: `axis-${axis.id} graph-${graphId}`,
    style: {
      'background-color': AXIS_COLORS[colorIndex],
      'border-color': BORDER_COLORS[colorIndex],
      'border-width': 2,
      'label': node.name,
      'font-size': '12px',
      'text-valign': 'center',
      'text-halign': 'center',
      'width': 40,
      'height': 40,
      'shape': 'ellipse'
    }
  }
}

export function createParentNode(parentId: string): CytoscapeNode {
  const nodeId = `parent-${parentId}`

  return {
    data: {
      id: nodeId,
      label: parentId,
      originalId: parentId,
      axisId: '',
      graphId: '',
      axisTitle: '',
      description: `Parent node: ${parentId}`,
      properties: [],
      axis: {} as AxisData,
      originalNode: {} as Node,
      isParent: true
    },
    classes: 'parent-node',
    style: {
      'background-color': '#f5f5f5',
      'border-color': '#bdbdbd',
      'border-width': 2,
      'label': parentId,
      'font-size': '14px',
      'text-valign': 'top',
      'text-halign': 'center',
      'shape': 'round-rectangle',
      'corner-radius': '10px',
      'padding': '20px'
    }
  }
}

export function createCytoscapeEdge(
  edge: Edge,
  axis: AxisData,
  // graphIndex: number,
  graphId: string
): CytoscapeEdge {
  const colorIndex = 0 // graphIndex % BORDER_COLORS.length
  const edgeId = `${axis.id}-${graphId}-${edge.id}`
  const sourceId = `${axis.id}-${graphId}-${edge.sourceId}`
  const targetId = `${axis.id}-${graphId}-${edge.targetId}`

  return {
    data: {
      id: edgeId,
      source: sourceId,
      target: targetId,
      label: edge.name,
      originalId: edge.id,
      axisId: axis.id,
      graphId: graphId,
      axisTitle: axis.id,
      description: edge.description,
      sourceOriginalId: edge.sourceId,
      targetOriginalId: edge.targetId,
      axis: axis,
      originalEdge: edge
    },
    classes: `axis-${axis.id} graph-${graphId}`,
    style: {
      'line-color': BORDER_COLORS[colorIndex],
      'target-arrow-color': BORDER_COLORS[colorIndex],
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'width': 2,
      'label': edge.name,
      'font-size': '10px',
      'text-rotation': 'autorotate',
      'text-margin-y': -10
    }
  }
}

export function transformAxesToCytoscapeElements(axis: AxisData): any[] {
  const allElements: any[] = []
  const parentNodes = new Map<string, any>()

  // First pass: collect all unique parent IDs across all axes and graphs
  axis.graphs.forEach((graph) => {
    graph.nodes.forEach(node => {
      if (node.meta?.parentId) {
        node.meta.parentId.forEach(parentId => {
          const parentKey = `parent-${parentId}`
          if (!parentNodes.has(parentKey)) {
            const parentNode = createParentNode(parentId)
            parentNodes.set(parentKey, parentNode)
          }
        })
      }
    })
  })

  // Add all parent nodes to elements first
  parentNodes.forEach(parentNode => {
    allElements.push(parentNode)
  })

  // Second pass: add child nodes and edges
  axis.graphs.forEach((graph) => {
    // Add child nodes for this graph
    const nodes = graph.nodes.map(node =>
      createCytoscapeNode(node, axis, graph.id)
    )
    allElements.push(...nodes)

    // Add edges for this graph
    const edges = graph.edges.map(edge =>
      createCytoscapeEdge(edge, axis, graph.id)
    )
    allElements.push(...edges)
  })

  return allElements
} 
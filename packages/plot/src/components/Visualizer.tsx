import React, { useEffect, useRef } from 'react'
import { Network } from 'vis-network/standalone'
import type { Node, Edge } from 'ontology'
import type { VisualizerProps, VisNetworkNode, VisNetworkEdge, AxisData } from '../types'
import { NoGraphs } from './NoGraphs'

// Color palette for different axes
const AXIS_COLORS = [
  '#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0', '#fce4ec',
  '#f1f8e9', '#e0f2f1', '#fafafa', '#fff8e1', '#f3e5f5'
];

const BORDER_COLORS = [
  '#1976d2', '#7b1fa2', '#388e3c', '#f57c00', '#c2185b',
  '#689f38', '#009688', '#757575', '#fbc02d', '#8e24aa'
];

export const Visualizer: React.FC<VisualizerProps> = ({
  axes,
  onNodeClick,
  onEdgeClick,
}) => {
  const networkRef = useRef<HTMLDivElement>(null)
  const networkInstance = useRef<Network | null>(null)

  // Convert ontology node to vis.js node with axis-specific styling
  const createVisNode = (node: Node, axis: AxisData, graphIndex: number, graphId: string): VisNetworkNode => {
    const colorIndex = graphIndex % AXIS_COLORS.length;
    const groupId = axis.id;
    
    // const noise: string = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    return {
      id: `${axis.id}-${graphId}-${node.id}`, // Ensure unique node IDs across axes and graphs
      label: node.name,
      title: createNodeTooltip(node, axis),
      color: {
        background: axis.color || AXIS_COLORS[colorIndex],
        border: BORDER_COLORS[colorIndex],
        highlight: {
          background: axis.color || AXIS_COLORS[colorIndex],
          border: BORDER_COLORS[colorIndex]
        }
      },
      font: {
        size: 14,
        color: '#333'
      },
      shape: 'dot',
      size: 20,
      group: groupId
    }
  }

  // Convert ontology edge to vis.js edge with axis-specific styling
  const createVisEdge = (edge: Edge, axis: AxisData, graphIndex: number, graphId: string): VisNetworkEdge => {
    const colorIndex = graphIndex % BORDER_COLORS.length;
    const groupId = axis.id;
    
    // const noise: string = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    return {
      id: `${axis.id}-${graphId}-${edge.id}`, // Ensure unique edge IDs across axes and graphs
      from: `${axis.id}-${graphId}-${edge.sourceId}`,
      to: `${axis.id}-${graphId}-${edge.targetId}`,
      label: edge.name,
      title: createEdgeTooltip(edge, axis),
      color: {
        color: BORDER_COLORS[colorIndex],
        highlight: BORDER_COLORS[colorIndex]
      },
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 1
        }
      },
      font: {
        size: 12,
        color: '#666'
      },
      group: groupId
    }
  }

  // Create tooltip for nodes
  const createNodeTooltip = (node: Node, axis: AxisData): string => {
    let tooltip = `<strong>${node.name}</strong><br/>`
    tooltip += `Axis: ${axis.title}<br/>`
    tooltip += `ID: ${node.id}<br/>`
    if (node.description) {
      tooltip += `Description: ${node.description}<br/>`
    }
    if (node.properties && node.properties.length > 0) {
      tooltip += `Properties: ${node.properties.length}`
    }
    return tooltip
  }

  // Create tooltip for edges
  const createEdgeTooltip = (edge: Edge, axis: AxisData): string => {
    let tooltip = `<strong>${edge.name}</strong><br/>`
    tooltip += `Axis: ${axis.title}<br/>`
    tooltip += `ID: ${edge.id}<br/>`
    tooltip += `From: ${edge.sourceId}<br/>`
    tooltip += `To: ${edge.targetId}<br/>`
    if (edge.description) {
      tooltip += `Description: ${edge.description}`
    }
    return tooltip
  }

  // Initialize or update the network
  useEffect(() => {
    if (!networkRef.current || axes.length === 0) return

    // Convert all axes data to vis.js format
    const allNodes: VisNetworkNode[] = [];
    const allEdges: VisNetworkEdge[] = [];
    const axisMap = new Map<string, AxisData>();
    const graphMap = new Map<string, { axis: AxisData; graph: any }>();

    axes.forEach((axis, axisIndex) => {
      if (axis.visible) {
        axisMap.set(axis.id, axis);
        
        axis.graphs.forEach((graph, graphIndex) => {
          if (graph.plotOptions?.visible !== false) {
            graphMap.set(graph.id, { axis, graph });
            
            // Add nodes for this graph
            const nodes = graph.nodes.map(node => createVisNode(node, axis, axisIndex, graph.id));
            allNodes.push(...nodes);
            
            // Add edges for this graph
            const edges = graph.edges.map(edge => createVisEdge(edge, axis, axisIndex, graph.id));
            allEdges.push(...edges);
          }
        });
      }
    });

    const data = {
      nodes: allNodes,
      edges: allEdges
    }

    const options = {
      physics: {
        enabled: true,
        stabilization: {
          enabled: true,
          iterations: 100
        },
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 200,
          springConstant: 0.04,
          damping: 0.09
        }
      },
      interaction: {
        hover: true,
        selectConnectedEdges: false
      },
      layout: {
        improvedLayout: true
      },
      groups: axes.reduce((acc, axis, index) => {
        if (axis.visible) {
          acc[axis.id] = {
            color: {
              background: axis.color || AXIS_COLORS[index % AXIS_COLORS.length],
              border: BORDER_COLORS[index % BORDER_COLORS.length]
            }
          };
        }
        return acc;
      }, {} as Record<string, any>)
    }

    // Destroy existing network
    if (networkInstance.current) {
      networkInstance.current.destroy()
    }

    // Create new network
    networkInstance.current = new Network(networkRef.current, data, options)

    // Add click event listener
    networkInstance.current.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        // Extract axis ID, graph ID, and node ID from the combined ID
        const parts = nodeId.split('-');
        if (parts.length >= 3) {
          const axisId = parts[0];
          const graphId = parts[1];
          const actualNodeId = parts.slice(2).join('-');
          const axis = axisMap.get(axisId);
          if (axis) {
            const graph = axis.graphs.find(g => g.id === graphId);
            if (graph) {
              const node = graph.nodes.find(n => n.id === actualNodeId);
              if (node) {
                onNodeClick(node, axisId, graph.id);
              }
            }
          }
        }
      } else if (params.edges.length > 0) {
        const edgeId = params.edges[0];
        // Extract axis ID, graph ID, and edge ID from the combined ID
        const parts = edgeId.split('-');
        if (parts.length >= 3) {
          const axisId = parts[0];
          const graphId = parts[1];
          const actualEdgeId = parts.slice(2).join('-');
          const axis = axisMap.get(axisId);
          if (axis) {
            const graph = axis.graphs.find(g => g.id === graphId);
            if (graph) {
              const edge = graph.edges.find(e => e.id === actualEdgeId);
              if (edge) {
                onEdgeClick(edge, axisId, graph.id);
              }
            }
          }
        }
      }
    })

    // Handle reset view event
    const handleResetView = () => {
      if (networkInstance.current) {
        networkInstance.current.fit()
      }
    }

    window.addEventListener('resetNetworkView', handleResetView)

    return () => {
      window.removeEventListener('resetNetworkView', handleResetView)
      if (networkInstance.current) {
        networkInstance.current.destroy()
        networkInstance.current = null
      }
    }
  }, [axes, onNodeClick, onEdgeClick])

  if (axes.length === 0) {
    return <NoGraphs />
  }

  return (
    <div className="visualization">
      <div ref={networkRef} className="network" />
    </div>
  )
} 
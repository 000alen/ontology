import React, { useEffect, useRef } from 'react'
import { Network } from 'vis-network/standalone'
import type { Node, Edge } from 'ontology'
import type { VisualizerProps, VisNetworkNode, VisNetworkEdge } from '../types'
import { NoGraphs } from './NoGraphs'

export const Visualizer: React.FC<VisualizerProps> = ({
  graph,
  onNodeClick,
  onEdgeClick,
}) => {
  const networkRef = useRef<HTMLDivElement>(null)
  const networkInstance = useRef<Network | null>(null)

  // Convert ontology node to vis.js node
  const createVisNode = (node: Node): VisNetworkNode => ({
    id: node.id,
    label: node.name,
    title: createNodeTooltip(node),
    color: {
      background: '#e3f2fd',
      border: '#1976d2',
      highlight: {
        background: '#bbdefb',
        border: '#0d47a1'
      }
    },
    font: {
      size: 14,
      color: '#333'
    },
    shape: 'dot',
    size: 20
  })

  // Convert ontology edge to vis.js edge
  const createVisEdge = (edge: Edge): VisNetworkEdge => ({
    id: edge.id,
    from: edge.sourceId,
    to: edge.targetId,
    label: edge.name,
    title: createEdgeTooltip(edge),
    color: {
      color: '#666',
      highlight: '#333'
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
    }
  })

  // Create tooltip for nodes
  const createNodeTooltip = (node: Node): string => {
    let tooltip = `<strong>${node.name}</strong><br/>`
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
  const createEdgeTooltip = (edge: Edge): string => {
    let tooltip = `<strong>${edge.name}</strong><br/>`
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
    if (!networkRef.current || !graph) return

    // Convert graph data to vis.js format
    const nodes = graph.nodes.map(createVisNode)
    const edges = graph.edges.map(createVisEdge)

    const data = {
      nodes: nodes,
      edges: edges
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
      }
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
        const nodeId = params.nodes[0]
        const node = graph.nodes.find(n => n.id === nodeId)
        if (node) {
          onNodeClick(node)
        }
      } else if (params.edges.length > 0) {
        const edgeId = params.edges[0]
        const edge = graph.edges.find(e => e.id === edgeId)
        if (edge) {
          onEdgeClick(edge)
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
  }, [graph, onNodeClick, onEdgeClick])

  if (!graph) {
    return <NoGraphs />
  }

  return (
    <div className="visualization">
      <div ref={networkRef} className="network" />
    </div>
  )
} 
import React from 'react'
import type { SidebarProps } from '../types'

export const Sidebar: React.FC<SidebarProps> = ({
  graph,
  highlightedNode,
  highlightedEdge,
}) => {
  if (!graph) {
    return (
      <div className="sidebar">
        <h3>Graph Details</h3>
        <p>Select a graph to see details</p>
      </div>
    )
  }

  return (
    <div className="sidebar">
      <h3>Graph Details</h3>
      
      <div className="graph-summary">
        <h4>Graph: {graph.id}</h4>
        <p><strong>Nodes:</strong> {graph.nodes.length}</p>
        <p><strong>Edges:</strong> {graph.edges.length}</p>
      </div>
      
      <h4>Nodes</h4>
      {graph.nodes.map(node => (
        <div
          key={node.id}
          className={`node-info ${highlightedNode?.id === node.id ? 'highlighted' : ''}`}
        >
          <h4>{node.name}</h4>
          <p><strong>ID:</strong> {node.id}</p>
          {node.description && (
            <p><strong>Description:</strong> {node.description}</p>
          )}
          {node.properties && node.properties.length > 0 && (
            <p><strong>Properties:</strong> {node.properties.map(p => p.name).join(', ')}</p>
          )}
        </div>
      ))}
      
      <h4>Edges</h4>
      {graph.edges.map(edge => (
        <div
          key={edge.id}
          className={`edge-info ${highlightedEdge?.id === edge.id ? 'highlighted' : ''}`}
        >
          <h4>{edge.name}</h4>
          <p><strong>ID:</strong> {edge.id}</p>
          <p><strong>From:</strong> {edge.sourceId} → <strong>To:</strong> {edge.targetId}</p>
          {edge.description && (
            <p><strong>Description:</strong> {edge.description}</p>
          )}
        </div>
      ))}
    </div>
  )
} 
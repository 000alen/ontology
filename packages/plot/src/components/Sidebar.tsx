import React from 'react'
import type { SidebarProps } from '../types'

export const Sidebar: React.FC<SidebarProps> = ({
  axis,
}) => {
  if (axis.graphs.length === 0) {
    return (
      <div className="sidebar">
        <h3>Axis Details</h3>
        <p>No axes available</p>
      </div>
    )
  }

  const totalGraphs = axis.graphs.length;
  const totalNodes = axis.graphs.reduce((sum, graph) =>
    sum + axis.graphs.reduce((graphSum, graph) => graphSum + graph.nodes.length, 0), 0
  );
  const totalEdges = axis.graphs.reduce((sum, graph) =>
    sum + graph.edges.length, 0
  );

  return (
    <div className="sidebar">
      <h3>Axis Details</h3>

      <div className="axis-summary">
        <h4>Overview</h4>
        <p><strong>Total Graphs:</strong> {totalGraphs}</p>
        <p><strong>Total Nodes:</strong> {totalNodes}</p>
        <p><strong>Total Edges:</strong> {totalEdges}</p>
      </div>

      <div key={axis.id} className="axis-section">
        <h4>
          Axis: {axis.id}
          <span className="axis-color" style={{
            // backgroundColor: axis.color,
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            display: 'inline-block',
            marginLeft: '8px',
            border: '1px solid #ccc'
          }}></span>
        </h4>
        <p><strong>Graphs:</strong> {axis.graphs.length}</p>

        {axis.graphs.map((graph, graphIndex) => (
          <div key={`${axis.id}-${graph.id}`} className="graph-section">
            <h5>Graph: {graph.id}</h5>
            <p><strong>Nodes:</strong> {graph.nodes.length}</p>
            <p><strong>Edges:</strong> {graph.edges.length}</p>

            <h6>Nodes</h6>
            {graph.nodes.map(node => (
              <div
                key={`${axis.id}-${graph.id}-${node.id}`}
                className={`node-info`}
              >
                <h6>{node.name}</h6>
                <p><strong>ID:</strong> {node.id}</p>
                <p><strong>Axis:</strong> {axis.id}</p>
                <p><strong>Graph:</strong> {graph.id}</p>
                {node.description && (
                  <p><strong>Description:</strong> {node.description}</p>
                )}
                {node.properties && node.properties.length > 0 && (
                  <p><strong>Properties:</strong> {node.properties.map(p => p.name).join(', ')}</p>
                )}
              </div>
            ))}

            <h6>Edges</h6>
            {graph.edges.map(edge => (
              <div
                key={`${axis.id}-${graph.id}-${edge.id}`}
                className={`edge-info`}
              >
                <h6>{edge.name}</h6>
                <p><strong>ID:</strong> {edge.id}</p>
                <p><strong>Axis:</strong> {axis.id}</p>
                <p><strong>Graph:</strong> {graph.id}</p>
                <p><strong>From:</strong> {edge.sourceId} → <strong>To:</strong> {edge.targetId}</p>
                {edge.description && (
                  <p><strong>Description:</strong> {edge.description}</p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
} 
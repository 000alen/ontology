import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { GalleryProps } from '../types'

export const Gallery: React.FC<GalleryProps> = ({
  axes,
  onSelectAxis,
}) => {
  const navigate = useNavigate()

  const handleSelectAxis = (index: number) => {
    onSelectAxis(index)
    navigate(`/graph/${axes[index].id}`)
  }

  if (axes.length === 0) {
    return (
      <div className="gallery-empty">
        <h2>No axes available</h2>
        <p>Use the ontology-plot library in your code to create axes and visualize graphs here.</p>
        <p>Example: <code>const axis = instance.createAxis(); axis.plot(yourGraph)</code></p>
      </div>
    )
  }

  return (
    <div className="gallery">
      <div className="gallery-header">
        <h2>Axis Gallery</h2>
        <p>Click on any axis to view its visualization</p>
      </div>

      <div className="gallery-grid">
        {axes.map((axis, index) => {
          const totalNodes = axis.graphs.reduce((sum, graph) => sum + graph.nodes.length, 0);
          const totalEdges = axis.graphs.reduce((sum, graph) => sum + graph.edges.length, 0);

          return (
            <div
              key={axis.id}
              className="gallery-card"
              onClick={() => handleSelectAxis(index)}
            >
              <div className="gallery-card-header">
                <h3>{axis.title}</h3>
                <span className="gallery-card-stats">
                  {axis.graphs.length} graphs • {totalNodes} nodes • {totalEdges} edges
                </span>
              </div>

              <div className="gallery-card-info">
                <div className="graph-count">
                  <span className="count-label">Graphs:</span>
                  <span className="count-value">{axis.graphs.length}</span>
                </div>
                <div className="node-count">
                  <span className="count-label">Nodes:</span>
                  <span className="count-value">{totalNodes}</span>
                </div>
                <div className="edge-count">
                  <span className="count-label">Edges:</span>
                  <span className="count-value">{totalEdges}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
} 
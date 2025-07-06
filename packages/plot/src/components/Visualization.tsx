import React from 'react'
import { Visualizer } from './Visualizer'
import { Sidebar } from './Sidebar'
import type { VisualizationProps } from '../types'

export const Visualization: React.FC<VisualizationProps> = ({
  axes,
  highlightedNode,
  highlightedEdge,
  setHighlightedNode,
  setHighlightedEdge,
  onClearAxes,
}) => {
  const handleNodeClick = (node: any, axisId: string, graphId: string) => {
    setHighlightedNode(node);
    setHighlightedEdge(null);
  };

  const handleEdgeClick = (edge: any, axisId: string, graphId: string) => {
    setHighlightedEdge(edge);
    setHighlightedNode(null);
  };

  return (
    <div className="container">
      <Visualizer
        axes={axes}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
      />
      
      <Sidebar
        axes={axes}
        highlightedNode={highlightedNode}
        highlightedEdge={highlightedEdge}
      />
    </div>
  )
} 
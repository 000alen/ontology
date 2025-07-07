import React from 'react'
import type { VisualizerProps } from '../types'
import { NoGraphs } from './NoGraphs'
import { useVisualizationData } from '../hooks/useVisualizationData'
import { useCytoscape } from '../hooks/useCytoscape'

export const Visualizer: React.FC<VisualizerProps> = ({ axis }) => {
  // Transform data for visualization
  const { elements, hasData } = useVisualizationData({ axis })
  
  // Cytoscape management
  const { containerRef } = useCytoscape({ elements })

  if (!hasData) {
    return <NoGraphs />
  }

  return (
    <div className="visualization">
      <div ref={containerRef} className="network" />
    </div>
  )
} 
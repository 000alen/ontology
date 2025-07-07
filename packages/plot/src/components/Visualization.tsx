import React from 'react'
import { Visualizer } from './Visualizer'
import { Sidebar } from './Sidebar'
import type { VisualizationProps } from '../types'

export const Visualization: React.FC<VisualizationProps> = ({
  axis,
}) => {
  return (
    <div className="container">
      <Visualizer axis={axis} />

      <Sidebar axis={axis} />
    </div>
  )
} 
import React from 'react'
import { Visualizer } from './Visualizer'
import { Sidebar } from './Sidebar'
import type { VisualizationProps } from '../types'

export const Visualization: React.FC<VisualizationProps> = ({
  axes,
}) => {
  return (
    <div className="container">
      <Visualizer axes={axes} />

      <Sidebar axes={axes} />
    </div>
  )
} 
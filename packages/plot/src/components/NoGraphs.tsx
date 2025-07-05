import React from 'react'
import type { NoGraphsProps } from '../types'

export const NoGraphs: React.FC<NoGraphsProps> = ({ 
  message = 'No graphs available' 
}) => {
  return (
    <div className="visualization">
      <div className="no-graphs">
        <h2>{message}</h2>
        <p>Use the ontology-plot library in your code to visualize graphs here.</p>
        <p>Example: <code>instance.plot(yourGraph)</code></p>
      </div>
    </div>
  )
} 
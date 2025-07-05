import React from 'react'
import type { HeaderProps } from '../types'

export const Header: React.FC<HeaderProps> = ({
  graphs,
  currentGraph,
  onSelectGraph,
  onRefresh,
  connectionStatus,
}) => {
  const handleGraphChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(event.target.value)
    if (!isNaN(index)) {
      onSelectGraph(index)
    }
  }

  const getGraphInfo = () => {
    if (currentGraph) {
      return `${currentGraph.nodes.length} nodes, ${currentGraph.edges.length} edges`
    }
    return 'No graph selected'
  }

  const getConnectionStatusIcon = () => {
    return connectionStatus === 'connected' ? '🟢' : '🔴'
  }

  const getConnectionStatusText = () => {
    return connectionStatus === 'connected' ? 'Connected' : 'Disconnected'
  }

  return (
    <div className="header">
      <h1>🎨 Ontology Graph Visualizer</h1>
      <div className="controls">
        <select
          className="graph-selector"
          value={currentGraph ? graphs.indexOf(currentGraph) : ''}
          onChange={handleGraphChange}
        >
          <option value="">Select a graph to visualize</option>
          {graphs.map((graph, index) => (
            <option key={graph.id} value={index}>
              {graph.id} ({graph.nodes.length} nodes, {graph.edges.length} edges)
            </option>
          ))}
        </select>
        
        <button className="btn" onClick={onRefresh}>
          Refresh
        </button>
        
        <button 
          className="btn" 
          onClick={() => {
            // This will be handled by the Visualizer component
            window.dispatchEvent(new CustomEvent('resetNetworkView'))
          }}
        >
          Reset View
        </button>
        
        <div className="info">
          <span>{getGraphInfo()}</span>
          <span className={`connection-status ${connectionStatus}`}>
            {getConnectionStatusIcon()} {getConnectionStatusText()}
          </span>
        </div>
      </div>
    </div>
  )
} 
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useConnectionStatus } from '../hooks/useSocket'
import type { HeaderProps } from '../types'

export const Header: React.FC<Omit<HeaderProps, 'connectionStatus'> & {
  axes: any[];
  onRefresh: () => void;
  onClearAxes: () => void;
}> = ({
  axes,
  onRefresh,
  onClearAxes,
}) => {
  const connectionStatus = useConnectionStatus()
  const navigate = useNavigate()
  const location = useLocation()

  const isGalleryView = location.pathname === '/'
  const isVisualizationView = location.pathname.startsWith('/graph')

  const handleToggleView = () => {
    if (isGalleryView) {
      // Go to visualization view
      navigate('/graph')
    } else {
      // Go to gallery view
      navigate('/')
    }
  }

  const getAxisInfo = () => {
    if (isGalleryView) {
      return `${axes.length} axes available`
    }
    if (axes.length > 0) {
      const totalGraphs = axes.reduce((sum, axis) => sum + axis.graphs.length, 0);
      const totalNodes = axes.reduce((sum, axis) => 
        sum + axis.graphs.reduce((graphSum, graph) => graphSum + graph.nodes.length, 0), 0
      );
      const totalEdges = axes.reduce((sum, axis) => 
        sum + axis.graphs.reduce((graphSum, graph) => graphSum + graph.edges.length, 0), 0
      );
      return `${axes.length} axes, ${totalGraphs} graphs, ${totalNodes} nodes, ${totalEdges} edges`
    }
    return 'No axes available'
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
        <button className="btn view-toggle" onClick={handleToggleView}>
          {isGalleryView ? '📊 View Axes' : '🖼️ Gallery'}
        </button>
        
        {isVisualizationView && (
          <>
            <button 
              className="btn" 
              onClick={() => {
                // This will be handled by the Visualizer component
                window.dispatchEvent(new CustomEvent('resetNetworkView'))
              }}
            >
              Reset View
            </button>
            
            <button 
              className="btn" 
              onClick={onClearAxes}
              style={{ backgroundColor: '#dc3545' }}
            >
              Clear All Axes
            </button>
          </>
        )}
        
        <button className="btn" onClick={onRefresh}>
          Refresh
        </button>
        
        <div className="info">
          <span>{getAxisInfo()}</span>
          <span className={`connection-status ${connectionStatus}`}>
            {getConnectionStatusIcon()} {getConnectionStatusText()}
          </span>
        </div>
      </div>
    </div>
  )
} 
import React from 'react'
import { Header } from './components/Header'
import { Visualizer } from './components/Visualizer'
import { Sidebar } from './components/Sidebar'
import { useSocket } from './hooks/useSocket'
import { useGraphs } from './hooks/useGraphs'
import './App.css'

const App: React.FC = () => {
  const socket = useSocket()
  const {
    graphs,
    currentGraph,
    selectGraph,
    loadGraphs,
    setCurrentGraph,
    highlightedNode,
    highlightedEdge,
    setHighlightedNode,
    setHighlightedEdge,
  } = useGraphs(socket)

  return (
    <div className="app">
      <Header
        graphs={graphs}
        currentGraph={currentGraph}
        onSelectGraph={selectGraph}
        onRefresh={loadGraphs}
        connectionStatus={socket?.connected ? 'connected' : 'disconnected'}
      />
      
      <div className="container">
        <Visualizer
          graph={currentGraph}
          onNodeClick={setHighlightedNode}
          onEdgeClick={setHighlightedEdge}
        />
        
        <Sidebar
          graph={currentGraph}
          highlightedNode={highlightedNode}
          highlightedEdge={highlightedEdge}
        />
      </div>
    </div>
  )
}

export default App 
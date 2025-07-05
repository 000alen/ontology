import type { Graph, Node, Edge } from 'ontology'

export interface GraphWithId extends Graph {
  id: string
}

export interface ConnectionStatus {
  connected: boolean
  status: 'connected' | 'disconnected'
}

export interface HeaderProps {
  graphs: GraphWithId[]
  currentGraph: GraphWithId | null
  onSelectGraph: (index: number) => void
  onRefresh: () => void
  connectionStatus: 'connected' | 'disconnected'
}

export interface VisualizerProps {
  graph: GraphWithId | null
  onNodeClick: (node: Node) => void
  onEdgeClick: (edge: Edge) => void
}

export interface SidebarProps {
  graph: GraphWithId | null
  highlightedNode: Node | null
  highlightedEdge: Edge | null
}

export interface NoGraphsProps {
  message?: string
}

export interface VisNetworkNode {
  id: string
  label: string
  title: string
  color: {
    background: string
    border: string
    highlight: {
      background: string
      border: string
    }
  }
  font: {
    size: number
    color: string
  }
  shape: string
  size: number
}

export interface VisNetworkEdge {
  id: string
  from: string
  to: string
  label: string
  title: string
  color: {
    color: string
    highlight: string
  }
  arrows: {
    to: {
      enabled: boolean
      scaleFactor: number
    }
  }
  font: {
    size: number
    color: string
  }
} 
import type { Graph, Node, Edge } from 'ontology'

export interface PlotOptions {
  color?: string;
  visible?: boolean;
}

export interface AxisData {
  id: string;
  title: string;
  color: string;
  visible: boolean;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  graphs: GraphWithId[];
}

export interface GraphWithId extends Graph {
  id: string;
  plotOptions?: PlotOptions;
}

export interface ConnectionStatus {
  connected: boolean
  status: 'connected' | 'disconnected'
}

export interface HeaderProps {
  axes: AxisData[]
  onRefresh: () => void
  connectionStatus: 'connected' | 'disconnected'
  onClearAxes: () => void
}

export interface VisualizerProps {
  axes: AxisData[]
  onNodeClick: (node: Node, axisId: string, graphId: string) => void
  onEdgeClick: (edge: Edge, axisId: string, graphId: string) => void
}

export interface VisualizationProps {
  axes: AxisData[]
  highlightedNode: Node | null
  highlightedEdge: Edge | null
  setHighlightedNode: (node: Node | null) => void
  setHighlightedEdge: (edge: Edge | null) => void
  onClearAxes: () => void
}

export interface SidebarProps {
  axes: AxisData[]
  highlightedNode: Node | null
  highlightedEdge: Edge | null
}

export interface NoGraphsProps {
  message?: string
}

export interface GalleryProps {
  axes: AxisData[]
  onSelectAxis: (index: number) => void
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
  group?: string
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
  group?: string
} 
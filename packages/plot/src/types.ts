import type { Graph, Node, Edge } from 'ontology'

export interface AxisData {
  id: string;
  graphs: GraphWithId[];
}

export interface GraphWithId extends Graph { }

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
}

export interface VisualizationProps {
  axes: AxisData[]
}

export interface SidebarProps {
  axes: AxisData[]
}

export interface NoGraphsProps {
  message?: string
}

export interface GalleryProps {
  axes: AxisData[]
}


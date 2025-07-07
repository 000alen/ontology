// Color palette for different axes
export const AXIS_COLORS = [
  '#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0', '#fce4ec',
  '#f1f8e9', '#e0f2f1', '#fafafa', '#fff8e1', '#f3e5f5'
];

export const BORDER_COLORS = [
  '#1976d2', '#7b1fa2', '#388e3c', '#f57c00', '#c2185b',
  '#689f38', '#009688', '#757575', '#fbc02d', '#8e24aa'
];

export const CYTOSCAPE_STYLES = [
  {
    selector: 'node',
    style: {
      'background-color': '#e3f2fd',
      'border-color': '#1976d2',
      'border-width': 2,
      'label': 'data(label)',
      'font-size': '12px',
      'text-valign': 'center',
      'text-halign': 'center',
      'width': 40,
      'height': 40,
      'shape': 'ellipse',
      'color': '#333',
      'text-outline-width': 2,
      'text-outline-color': '#fff'
    }
  },
  {
    selector: ':parent',
    style: {
      'text-valign': 'top',
      'text-halign': 'center',
      'shape': 'round-rectangle',
      'corner-radius': '10px',
      'padding': '20px',
      'background-color': '#f5f5f5',
      'border-color': '#bdbdbd',
      'border-width': 2,
      'font-size': '14px',
      'font-weight': 'bold',
      'color': '#666',
      'text-outline-width': 1,
      'text-outline-color': '#fff'
    }
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 4,
      'border-color': '#ff6b6b',
      'background-color': '#ffebee'
    }
  },
  {
    selector: 'edge',
    style: {
      'line-color': '#1976d2',
      'target-arrow-color': '#1976d2',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'width': 2,
      'label': 'data(label)',
      'font-size': '10px',
      'text-rotation': 'autorotate',
      'text-margin-y': -10,
      'color': '#666',
      'text-outline-width': 1,
      'text-outline-color': '#fff'
    }
  },
  {
    selector: 'edge:selected',
    style: {
      'line-color': '#ff6b6b',
      'target-arrow-color': '#ff6b6b',
      'width': 4
    }
  }
];

export const LAYOUT_CONFIG = {
  name: 'cose',
  animate: true,
  animationDuration: 1000,
  fit: true,
  padding: 30,
  nodeRepulsion: () => 400000,
  nodeOverlap: 10,
  idealEdgeLength: () => 100,
  edgeElasticity: () => 100,
  nestingFactor: 5,
  gravity: 80,
  numIter: 1000,
  initialTemp: 200,
  coolingFactor: 0.95,
  minTemp: 1.0
};

export const CYTOSCAPE_OPTIONS = {
  zoomingEnabled: true,
  userZoomingEnabled: true,
  panningEnabled: true,
  userPanningEnabled: true,
  boxSelectionEnabled: true,
  selectionType: 'single' as const,
  touchTapThreshold: 8,
  desktopTapThreshold: 4,
  autolock: false,
  autoungrabify: false,
  autounselectify: false,
  pixelRatio: 'auto' as const,
  motionBlur: true,
  motionBlurOpacity: 0.2,
  wheelSensitivity: 0.1,
  minZoom: 0.1,
  maxZoom: 10
}; 
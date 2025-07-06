import React, { useEffect, useRef } from 'react'
import cytoscape from 'cytoscape'
import type { Node, Edge } from 'ontology'
import type { VisualizerProps, AxisData } from '../types'
import { NoGraphs } from './NoGraphs'

// Color palette for different axes
const AXIS_COLORS = [
  '#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0', '#fce4ec',
  '#f1f8e9', '#e0f2f1', '#fafafa', '#fff8e1', '#f3e5f5'
];

const BORDER_COLORS = [
  '#1976d2', '#7b1fa2', '#388e3c', '#f57c00', '#c2185b',
  '#689f38', '#009688', '#757575', '#fbc02d', '#8e24aa'
];

export const Visualizer: React.FC<VisualizerProps> = ({
  axes,
  onNodeClick,
  onEdgeClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)

  // Convert ontology node to cytoscape node with axis-specific styling
  const createCytoscapeNode = (node: Node, axis: AxisData, graphIndex: number, graphId: string) => {
    const colorIndex = graphIndex % AXIS_COLORS.length;
    const nodeId = `${axis.id}-${graphId}-${node.id}`;
    
    return {
      data: {
        id: nodeId,
        label: node.name,
        originalId: node.id,
        axisId: axis.id,
        graphId: graphId,
        axisTitle: axis.title,
        description: node.description,
        properties: node.properties,
        axis: axis,
        originalNode: node
      },
      classes: `axis-${axis.id} graph-${graphId}`,
      style: {
        'background-color': axis.color || AXIS_COLORS[colorIndex],
        'border-color': BORDER_COLORS[colorIndex],
        'border-width': 2,
        'label': node.name,
        'font-size': '12px',
        'text-valign': 'center',
        'text-halign': 'center',
        'width': 40,
        'height': 40,
        'shape': 'ellipse'
      }
    }
  }

  // Convert ontology edge to cytoscape edge with axis-specific styling
  const createCytoscapeEdge = (edge: Edge, axis: AxisData, graphIndex: number, graphId: string) => {
    const colorIndex = graphIndex % BORDER_COLORS.length;
    const edgeId = `${axis.id}-${graphId}-${edge.id}`;
    const sourceId = `${axis.id}-${graphId}-${edge.sourceId}`;
    const targetId = `${axis.id}-${graphId}-${edge.targetId}`;
    
    return {
      data: {
        id: edgeId,
        source: sourceId,
        target: targetId,
        label: edge.name,
        originalId: edge.id,
        axisId: axis.id,
        graphId: graphId,
        axisTitle: axis.title,
        description: edge.description,
        sourceOriginalId: edge.sourceId,
        targetOriginalId: edge.targetId,
        axis: axis,
        originalEdge: edge
      },
      classes: `axis-${axis.id} graph-${graphId}`,
      style: {
        'line-color': BORDER_COLORS[colorIndex],
        'target-arrow-color': BORDER_COLORS[colorIndex],
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'width': 2,
        'label': edge.name,
        'font-size': '10px',
        'text-rotation': 'autorotate',
        'text-margin-y': -10
      }
    }
  }

  // Initialize or update cytoscape
  useEffect(() => {
    if (!containerRef.current || axes.length === 0) return

    // Convert all axes data to cytoscape format
    const allElements: any[] = [];
    const axisMap = new Map<string, AxisData>();
    const graphMap = new Map<string, { axis: AxisData; graph: any }>();

    axes.forEach((axis, axisIndex) => {
      if (axis.visible) {
        axisMap.set(axis.id, axis);
        
        axis.graphs.forEach((graph, graphIndex) => {
          if (graph.plotOptions?.visible !== false) {
            graphMap.set(graph.id, { axis, graph });
            
            // Add nodes for this graph
            const nodes = graph.nodes.map(node => createCytoscapeNode(node, axis, axisIndex, graph.id));
            allElements.push(...nodes);
            
            // Add edges for this graph
            const edges = graph.edges.map(edge => createCytoscapeEdge(edge, axis, axisIndex, graph.id));
            allElements.push(...edges);
          }
        });
      }
    });

    // Destroy existing cytoscape instance
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    // Create new cytoscape instance
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: allElements,
      
      style: [
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
      ],

      layout: {
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
      },

      // Enable various interactions
      zoomingEnabled: true,
      userZoomingEnabled: true,
      panningEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true,
      selectionType: 'single',
      touchTapThreshold: 8,
      desktopTapThreshold: 4,
      autolock: false,
      autoungrabify: false,
      autounselectify: false,

      // Rendering options
      pixelRatio: 'auto',
      motionBlur: true,
      motionBlurOpacity: 0.2,
      wheelSensitivity: 0.1,
      minZoom: 0.1,
      maxZoom: 10
    });

    // Add event listeners
    cyRef.current.on('tap', 'node', (evt) => {
      const node = evt.target;
      const data = node.data();
      if (data.originalNode && onNodeClick) {
        onNodeClick(data.originalNode, data.axisId, data.graphId);
      }
    });

    cyRef.current.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      const data = edge.data();
      if (data.originalEdge && onEdgeClick) {
        onEdgeClick(data.originalEdge, data.axisId, data.graphId);
      }
    });

    // Handle reset view event
    const handleResetView = () => {
      if (cyRef.current) {
        cyRef.current.fit();
        cyRef.current.center();
      }
    };

    window.addEventListener('resetNetworkView', handleResetView);

    return () => {
      window.removeEventListener('resetNetworkView', handleResetView);
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [axes, onNodeClick, onEdgeClick]);

  if (axes.length === 0) {
    return <NoGraphs />
  }

  return (
    <div className="visualization">
      <div ref={containerRef} className="network" />
    </div>
  )
} 
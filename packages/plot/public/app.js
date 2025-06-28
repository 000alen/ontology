class OntologyVisualizer {
    constructor() {
        this.socket = io();
        this.graphs = [];
        this.currentGraph = null;
        this.network = null;
        this.networkContainer = document.getElementById('network');
        
        this.initializeSocketListeners();
        this.initializeUI();
        this.loadGraphs();
    }
    
    initializeSocketListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
            document.getElementById('connectionStatus').innerHTML = '🟢 Connected';
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            document.getElementById('connectionStatus').innerHTML = '🔴 Disconnected';
        });
        
        this.socket.on('graphs', (graphs) => {
            console.log('Received graphs:', graphs);
            this.graphs = graphs;
            this.updateGraphSelector();
            this.updateNoGraphsDisplay();
        });
        
        this.socket.on('newGraph', (graph) => {
            console.log('New graph received:', graph);
            this.graphs.push(graph);
            this.updateGraphSelector();
            this.updateNoGraphsDisplay();
            // Auto-select the new graph
            this.selectGraph(this.graphs.length - 1);
        });
    }
    
    initializeUI() {
        const selector = document.getElementById('graphSelector');
        selector.addEventListener('change', (e) => {
            const index = parseInt(e.target.value);
            if (!isNaN(index)) {
                this.selectGraph(index);
            }
        });
        
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadGraphs();
        });
        
        document.getElementById('resetViewBtn').addEventListener('click', () => {
            if (this.network) {
                this.network.fit();
            }
        });
    }
    
    async loadGraphs() {
        try {
            const response = await fetch('/api/graphs');
            const graphs = await response.json();
            this.graphs = graphs;
            this.updateGraphSelector();
            this.updateNoGraphsDisplay();
        } catch (error) {
            console.error('Failed to load graphs:', error);
        }
    }
    
    updateGraphSelector() {
        const selector = document.getElementById('graphSelector');
        selector.innerHTML = '<option value="">Select a graph to visualize</option>';
        
        this.graphs.forEach((graph, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${graph.id} (${graph.nodes.length} nodes, ${graph.edges.length} edges)`;
            selector.appendChild(option);
        });
    }
    
    updateNoGraphsDisplay() {
        const noGraphsDiv = document.getElementById('noGraphs');
        const networkDiv = document.getElementById('network');
        
        if (this.graphs.length === 0) {
            noGraphsDiv.style.display = 'flex';
            networkDiv.style.display = 'none';
        } else {
            noGraphsDiv.style.display = 'none';
            networkDiv.style.display = 'block';
        }
    }
    
    selectGraph(index) {
        if (index < 0 || index >= this.graphs.length) return;
        
        this.currentGraph = this.graphs[index];
        document.getElementById('graphSelector').value = index;
        
        this.visualizeGraph(this.currentGraph);
        this.updateGraphInfo(this.currentGraph);
        this.updateSidebar(this.currentGraph);
    }
    
    visualizeGraph(graph) {
        // Convert ontology graph to vis.js format
        const nodes = new vis.DataSet(graph.nodes.map(node => ({
            id: node.id,
            label: node.name,
            title: this.createNodeTooltip(node),
            color: {
                background: '#e3f2fd',
                border: '#1976d2',
                highlight: {
                    background: '#bbdefb',
                    border: '#0d47a1'
                }
            },
            font: {
                size: 14,
                color: '#333'
            },
            shape: 'dot',
            size: 20
        })));
        
        const edges = new vis.DataSet(graph.edges.map(edge => ({
            id: edge.id,
            from: edge.sourceId,
            to: edge.targetId,
            label: edge.name,
            title: this.createEdgeTooltip(edge),
            color: {
                color: '#666',
                highlight: '#333'
            },
            arrows: {
                to: {
                    enabled: true,
                    scaleFactor: 1
                }
            },
            font: {
                size: 12,
                color: '#666'
            }
        })));
        
        const data = { nodes, edges };
        
        const options = {
            physics: {
                enabled: true,
                stabilization: {
                    enabled: true,
                    iterations: 100
                },
                barnesHut: {
                    gravitationalConstant: -2000,
                    centralGravity: 0.3,
                    springLength: 200,
                    springConstant: 0.04,
                    damping: 0.09
                }
            },
            interaction: {
                hover: true,
                selectConnectedEdges: false
            },
            layout: {
                improvedLayout: true
            }
        };
        
        // Destroy existing network if it exists
        if (this.network) {
            this.network.destroy();
        }
        
        // Create new network
        this.network = new vis.Network(this.networkContainer, data, options);
        
        // Add click event listener
        this.network.on('click', (params) => {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const node = graph.nodes.find(n => n.id === nodeId);
                if (node) {
                    this.highlightNodeInSidebar(node);
                }
            } else if (params.edges.length > 0) {
                const edgeId = params.edges[0];
                const edge = graph.edges.find(e => e.id === edgeId);
                if (edge) {
                    this.highlightEdgeInSidebar(edge);
                }
            }
        });
    }
    
    createNodeTooltip(node) {
        let tooltip = `<strong>${node.name}</strong><br/>`;
        tooltip += `ID: ${node.id}<br/>`;
        if (node.description) {
            tooltip += `Description: ${node.description}<br/>`;
        }
        if (node.properties && node.properties.length > 0) {
            tooltip += `Properties: ${node.properties.length}`;
        }
        return tooltip;
    }
    
    createEdgeTooltip(edge) {
        let tooltip = `<strong>${edge.name}</strong><br/>`;
        tooltip += `ID: ${edge.id}<br/>`;
        tooltip += `From: ${edge.sourceId}<br/>`;
        tooltip += `To: ${edge.targetId}<br/>`;
        if (edge.description) {
            tooltip += `Description: ${edge.description}`;
        }
        return tooltip;
    }
    
    updateGraphInfo(graph) {
        const info = `${graph.nodes.length} nodes, ${graph.edges.length} edges`;
        document.getElementById('graphInfo').textContent = info;
    }
    
    updateSidebar(graph) {
        const sidebar = document.getElementById('graphDetails');
        
        let html = `
            <div class="graph-summary">
                <h4>Graph: ${graph.id}</h4>
                <p><strong>Nodes:</strong> ${graph.nodes.length}</p>
                <p><strong>Edges:</strong> ${graph.edges.length}</p>
            </div>
            
            <h4>Nodes</h4>
        `;
        
        graph.nodes.forEach(node => {
            html += `
                <div class="node-info" data-node-id="${node.id}">
                    <h4>${node.name}</h4>
                    <p><strong>ID:</strong> ${node.id}</p>
                    ${node.description ? `<p><strong>Description:</strong> ${node.description}</p>` : ''}
                    ${node.properties && node.properties.length > 0 ? 
                        `<p><strong>Properties:</strong> ${node.properties.map(p => p.name).join(', ')}</p>` : ''}
                </div>
            `;
        });
        
        html += '<h4>Edges</h4>';
        
        graph.edges.forEach(edge => {
            html += `
                <div class="edge-info" data-edge-id="${edge.id}">
                    <h4>${edge.name}</h4>
                    <p><strong>ID:</strong> ${edge.id}</p>
                    <p><strong>From:</strong> ${edge.sourceId} → <strong>To:</strong> ${edge.targetId}</p>
                    ${edge.description ? `<p><strong>Description:</strong> ${edge.description}</p>` : ''}
                </div>
            `;
        });
        
        sidebar.innerHTML = html;
    }
    
    highlightNodeInSidebar(node) {
        // Remove existing highlights
        document.querySelectorAll('.node-info').forEach(el => {
            el.style.backgroundColor = '';
            el.style.borderLeftColor = '';
        });
        
        // Highlight selected node
        const nodeEl = document.querySelector(`[data-node-id="${node.id}"]`);
        if (nodeEl) {
            nodeEl.style.backgroundColor = '#e3f2fd';
            nodeEl.style.borderLeftColor = '#1976d2';
            nodeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    highlightEdgeInSidebar(edge) {
        // Remove existing highlights
        document.querySelectorAll('.edge-info').forEach(el => {
            el.style.backgroundColor = '';
            el.style.borderLeftColor = '';
        });
        
        // Highlight selected edge
        const edgeEl = document.querySelector(`[data-edge-id="${edge.id}"]`);
        if (edgeEl) {
            edgeEl.style.backgroundColor = '#e3f2fd';
            edgeEl.style.borderLeftColor = '#1976d2';
            edgeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Initialize the visualizer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OntologyVisualizer();
}); 
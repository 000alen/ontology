# Ontology Plot

A graph visualization utility for ontology graphs that provides an interactive React-based web interface for exploring and analyzing graph structures.

## Features

- 🎨 **Interactive Visualization**: Drag, zoom, and explore graphs with vis.js
- 🔄 **Real-time Updates**: Graphs appear instantly as they're plotted
- 📊 **Multiple Graph Support**: View and switch between different graphs
- 🖱️ **Click Interactions**: Click nodes and edges to see detailed information
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🚀 **Easy Integration**: Simple API for plotting graphs from your code

## Installation

```bash
# In a pnpm monorepo
pnpm add ontology-plot

# Or with npm
npm install ontology-plot
```

## Quick Start

```typescript
import { createInstance } from "ontology-plot";
import { createGraph, createNode, createEdge } from "ontology";

// Create a visualization instance
const instance = createInstance();

// Create and plot your graph
const myGraph = createGraph("example", {
  nodes: [/* your nodes */],
  edges: [/* your edges */]
});

instance.plot(myGraph);
```

## API Reference

### `createInstance(options?)`

Creates a new visualization instance and starts a web server.

**Parameters:**
- `options` (optional):
  - `port?: number` - Port to run the server on (default: 3000)
  - `autoOpen?: boolean` - Whether to automatically open the browser (default: true)

**Returns:** `PlotInstance`

**Example:**
```typescript
const instance = createInstance({ 
  port: 8080, 
  autoOpen: false 
});
```

### `PlotInstance.plot(graph)`

Adds a graph to the visualization interface.

**Parameters:**
- `graph: Graph` - The ontology graph to visualize

**Example:**
```typescript
instance.plot(myGraph);
```

### `PlotInstance.close()`

Closes the web server.

**Returns:** `Promise<void>`

**Example:**
```typescript
await instance.close();
```

### `plot(graph, options?)`

Convenience function that creates an instance and plots a single graph.

**Parameters:**
- `graph: Graph` - The graph to visualize
- `options?` - Same options as `createInstance()`

**Returns:** `PlotInstance`

**Example:**
```typescript
import { plot } from "ontology-plot";

const instance = plot(myGraph);
```

## Usage Examples

### Basic Usage

```typescript
import { createInstance } from "ontology-plot";
import { createGraph, createNode, createEdge } from "ontology";

async function visualizeGraph() {
  // Create nodes
  const node1 = await createNode("person1", {
    name: "Alice",
    description: "A software engineer"
  });
  
  const node2 = await createNode("person2", {
    name: "Bob", 
    description: "A data scientist"
  });

  // Create edge
  const edge1 = await createEdge("knows", {
    name: "knows",
    description: "Knows relationship",
    sourceId: node1.id,
    targetId: node2.id
  });

  // Create graph
  const graph = createGraph("social_network", {
    nodes: [node1, node2],
    edges: [edge1]
  });

  // Visualize
  const instance = createInstance();
  instance.plot(graph);
}
```

### Multiple Graphs

```typescript
const instance = createInstance();

// Plot multiple graphs
instance.plot(graph1);
instance.plot(graph2);
instance.plot(graph3);

// Users can switch between them in the web interface
```

### Custom Configuration

```typescript
const instance = createInstance({
  port: 4000,           // Custom port
  autoOpen: false       // Don't auto-open browser
});

console.log("Visit http://localhost:4000 to view graphs");
```

## Web Interface Features

The web interface provides:

- **Graph Selector**: Dropdown to switch between plotted graphs
- **Interactive Network**: 
  - Drag nodes to reposition them
  - Zoom in/out with mouse wheel
  - Pan by dragging the background
- **Node/Edge Details**: Click elements to see their properties
- **Reset View**: Button to fit all nodes in view
- **Real-time Connection Status**: Shows server connection status

## Graph Format

The package works with ontology graphs that have this structure:

```typescript
interface Graph {
  id: string;
  nodes: Node[];
  edges: Edge[];
}

interface Node {
  id: string;
  name: string;
  description?: string;
  properties?: Property[];
  embedding: number[];
}

interface Edge {
  id: string;
  name: string;
  description?: string;
  sourceId: string;
  targetId: string;
  properties?: Property[];
  embedding: number[];
}
```

## Development

To build the package:

```bash
pnpm build
```

To build only the server:

```bash
pnpm build:server
```

To build only the React frontend:

```bash
pnpm build:client
```

To run the React frontend in development mode:

```bash
pnpm dev
```

To preview the built React app:

```bash
pnpm preview
```

## License

ISC 
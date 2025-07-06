# Ontology Plot

A graph visualization utility for ontology graphs that provides an interactive React-based web interface for exploring and analyzing graph structures. Uses a matplotlib-like axis-based approach for organizing multiple graphs in the same visualization.

## Features

- 🎨 **Interactive Visualization**: Drag, zoom, and explore graphs with cytoscape.js
- 🔄 **Real-time Updates**: Graphs appear instantly as they're plotted
- 📊 **Axis-based Organization**: Create multiple axes to organize different types of graphs
- 🎨 **Visual Differentiation**: Each axis has distinct colors and titles
- 🖱️ **Click Interactions**: Click nodes and edges to see detailed information
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🚀 **Easy Integration**: Simple API for plotting graphs from your code
- 🧭 **URL-based Navigation**: Direct links to specific graphs and browser navigation support
- 🗑️ **Graph Management**: Clear all axes or manage individual axes

## Navigation

The application uses React Router for navigation:

- `/` - Gallery view showing all available axes
- `/graph` - Visualization view showing all axes simultaneously

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

// Create an axis and plot your graph
const axis = instance.createAxis({ title: "My Graph" });
const myGraph = createGraph("example", {
  nodes: [/* your nodes */],
  edges: [/* your edges */]
});

axis.plot(myGraph);
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

### `PlotInstance.plot(graph, options?)`

Plots a graph on the first available axis, creating a default axis if none exists.

**Parameters:**
- `graph: Graph` - The ontology graph to visualize
- `options?: PlotOptions` - Optional styling options:
  - `color?: string` - Custom color for this graph
  - `visible?: boolean` - Whether the graph should be visible (default: true)

**Example:**
```typescript
instance.plot(myGraph, { color: "#ff6b6b" });
```

### `PlotInstance.createAxis(options?)`

Creates a new axis for organizing graphs.

**Parameters:**
- `options?: AxisOptions` - Optional axis configuration:
  - `title?: string` - Title for the axis (default: "Axis N")
  - `color?: string` - Color for graphs on this axis
  - `visible?: boolean` - Whether the axis should be visible (default: true)
  - `position?: { x: number; y: number; width: number; height: number }` - Position and size (default: full viewport)

**Returns:** `Axis`

**Example:**
```typescript
const axis = instance.createAxis({
  title: "Social Network",
  color: "#ff6b6b",
  visible: true
});
```

### `Axis.plot(graph, options?)`

Plots a graph on this axis.

**Parameters:**
- `graph: Graph` - The ontology graph to visualize
- `options?: PlotOptions` - Optional styling options:
  - `color?: string` - Custom color for this graph (overrides axis color)
  - `visible?: boolean` - Whether the graph should be visible (default: true)

**Example:**
```typescript
axis.plot(myGraph, { color: "#4ecdc4" });
```

### `Axis.clear()`

Clears all graphs from this axis.

**Example:**
```typescript
axis.clear();
```

### `Axis.setTitle(title)`

Sets the title of the axis.

**Parameters:**
- `title: string` - New title for the axis

**Example:**
```typescript
axis.setTitle("Updated Title");
```

### `Axis.setColor(color)`

Sets the color of the axis.

**Parameters:**
- `color: string` - New color for the axis

**Example:**
```typescript
axis.setColor("#ff6b6b");
```

### `Axis.setVisible(visible)`

Sets the visibility of the axis.

**Parameters:**
- `visible: boolean` - Whether the axis should be visible

**Example:**
```typescript
axis.setVisible(false);
```

### `Axis.getId()`

Gets the unique identifier of the axis.

**Returns:** `string`

**Example:**
```typescript
const axisId = axis.getId();
```

### `PlotInstance.getAxes()`

Gets all created axes.

**Returns:** `Axis[]`

**Example:**
```typescript
const axes = instance.getAxes();
```

### `PlotInstance.clear()`

Clears all axes from the visualization.

**Example:**
```typescript
instance.clear();
```

### `PlotInstance.close()`

Closes the web server.

**Returns:** `Promise<void>`

**Example:**
```typescript
await instance.close();
```

### `plot(graph, options?)`

Convenience function that creates an instance and plots a single graph on a default axis.

**Parameters:**
- `graph: Graph` - The graph to visualize
- `options?` - Same options as `createInstance()` or `Axis.plot()`

**Returns:** `PlotInstance`

**Example:**
```typescript
import { plot } from "ontology-plot";

const instance = plot(myGraph, { color: "#ff6b6b" });
```

## Usage Examples

### Two Approaches

The API supports two approaches for plotting graphs:

1. **Simple Approach**: Use `instance.plot(graph)` - automatically creates a default axis
2. **Explicit Approach**: Use `instance.createAxis()` then `axis.plot(graph)` - gives you full control

### Basic Single Graph

```typescript
import { createInstance } from "ontology-plot";
import { createGraph, createNode, createEdge } from "ontology";

async function visualizeGraph() {
  // Create nodes
  const node1 = await createNode("person1", {
    name: "Alice",
    description: "A software engineer",
    properties: []
  });
  
  const node2 = await createNode("person2", {
    name: "Bob", 
    description: "A data scientist",
    properties: []
  });

  // Create edge
  const edge1 = await createEdge("knows", {
    name: "knows",
    description: "Knows relationship",
    sourceId: node1.id,
    targetId: node2.id,
    properties: []
  });

  // Create graph
  const graph = createGraph("social_network", {
    nodes: [node1, node2],
    edges: [edge1]
  });

  // Visualize - Simple approach (creates default axis)
  const instance = createInstance();
  instance.plot(graph);
  
  // Or with explicit axis creation
  // const axis = instance.createAxis({ title: "Social Network" });
  // axis.plot(graph);
}
```

### Multiple Axes with Different Graphs

```typescript
const instance = createInstance();

// Create different axes for different types of data
const socialAxis = instance.createAxis({
  title: "Social Network",
  color: "#ff6b6b"
});

const technicalAxis = instance.createAxis({
  title: "Technical Skills", 
  color: "#4ecdc4"
});

const projectAxis = instance.createAxis({
  title: "Project Collaboration",
  color: "#45b7d1"
});

// Plot graphs on their respective axes
socialAxis.plot(socialGraph);
technicalAxis.plot(skillsGraph);
projectAxis.plot(collaborationGraph);
```

### Axis Management

```typescript
const instance = createInstance();

// Create and configure axes
const axis1 = instance.createAxis({ title: "First Axis", color: "#ff6b6b" });
const axis2 = instance.createAxis({ title: "Second Axis", color: "#4ecdc4" });

// Plot graphs
axis1.plot(graph1);
axis2.plot(graph2);

// Update axis properties
axis1.setTitle("Updated Title");
axis1.setColor("#45b7d1");
axis2.setVisible(false);

// Clear specific axis
axis1.clear();

// Clear all axes
instance.clear();
```

## Web Interface Features

The web interface provides:

- **Gallery View**: Grid layout showing all available axes with previews
- **Multi-Axis Visualization**: Interactive network visualization with all axes displayed simultaneously
- **Visual Differentiation**: Each axis has distinct colors and titles
- **Navigation**: URL-based routing with browser back/forward support
- **Interactive Network**: 
  - Drag nodes to reposition them
  - Zoom in/out with mouse wheel
  - Pan by dragging the background
- **Node/Edge Details**: Click elements to see their properties and axis origin
- **Reset View**: Button to fit all nodes in view
- **Clear Axes**: Button to remove all axes from visualization
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
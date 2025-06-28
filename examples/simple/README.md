# Simple Ontology Example

This example demonstrates how to use the ontology library's node creation utilities to build and query knowledge graphs.

## What this example shows

- **Creating Properties**: Using `createProperty()` to define node attributes
- **Creating Nodes**: Using `createNode()` to create entities with embeddings
- **Creating Edges**: Using `createEdge()` to define relationships between nodes
- **Creating Graphs**: Using `createGraph()` to combine nodes and edges
- **Similarity Matching**: Using `match()` and `similarSubGraphs()` to find similar patterns
- **Graph Visualization**: Using `ontology-plot` to visualize graphs in a web interface

## The example scenario

The example creates a simple company graph with:
- Two employees (John Doe and Jane Smith) who are software engineers/data scientists
- A tech company (Tech Corp) that focuses on AI/ML
- Employment relationships between employees and company
- A colleague relationship between the employees

Then it demonstrates querying this graph by creating a query pattern and finding similar subgraphs.

## Running the example

From the examples/simple directory:

```bash
# Install dependencies
pnpm install

# Run the example
pnpm start

# Or run in development mode with watch
pnpm dev
```

## Expected output

The example will show:
1. Creation of properties, nodes, and edges with confirmation messages
2. Graph construction with node/edge counts
3. Similarity search results showing matched subgraphs
4. Graph visualization server startup and automatic browser opening
5. Interactive web interface for exploring the graphs
6. A summary of created entities

## Environment setup

Make sure you have your OpenAI API key set in your environment:

```bash
export OPENAI_API_KEY="your-api-key-here"
```

The example uses the OpenAI text-embedding-3-small model for generating embeddings.

## Graph Visualization

This example now includes interactive graph visualization powered by the `ontology-plot` package:

- **Real-time Updates**: Graphs appear in the web interface as they're created
- **Interactive Network**: Click and drag nodes, zoom, and pan around the graph
- **Graph Selection**: Switch between different graphs using the dropdown
- **Detailed Information**: Click on nodes and edges to see their properties
- **Responsive Layout**: The graph automatically arranges itself for optimal viewing

The visualization server runs on http://localhost:3000 and automatically opens in your browser when you run the example. 
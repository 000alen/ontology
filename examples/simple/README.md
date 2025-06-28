# Simple Ontology Example

This example demonstrates how to use the ontology library's node creation utilities to build and query knowledge graphs.

## What this example shows

- **Creating Properties**: Using `createProperty()` to define node attributes
- **Creating Nodes**: Using `createNode()` to create entities with embeddings
- **Creating Edges**: Using `createEdge()` to define relationships between nodes
- **Creating Graphs**: Using `createGraph()` to combine nodes and edges
- **Similarity Matching**: Using `match()` and `similarSubGraphs()` to find similar patterns

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
4. A summary of created entities

## Environment setup

Make sure you have your OpenAI API key set in your environment:

```bash
export OPENAI_API_KEY="your-api-key-here"
```

The example uses the OpenAI text-embedding-3-small model for generating embeddings. 
import { describe, expect, it, vi } from 'vitest'
import { match, intersect, merge, incident } from './index.js'
import { Graph, Node, Edge, NodeId, EdgeId } from './types.js'

// Mock cosineSimilarity from 'ai' package
vi.mock('ai', () => ({
  cosineSimilarity: vi.fn((a: number[], b: number[]) => {
    // Simple dot product similarity for testing
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i]!, 0)
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
    return dotProduct / (magnitudeA * magnitudeB)
  })
}))

describe('Graph Matching Algorithms', () => {
  // Helper function to create test nodes
  const createNode = (id: string, embedding: number[]): Node => ({
    id: `node_${id}` as NodeId,
    name: `Node ${id}`,
    description: `Node ${id}`,
    embedding,
    properties: []
  })

  // Helper function to create test edges
  const createEdge = (id: string, sourceId: NodeId, targetId: NodeId, embedding: number[]): Edge => ({
    id: `edge_${id}` as EdgeId,
    name: `Edge ${id}`,
    description: `Edge from ${sourceId} to ${targetId}`,
    embedding,
    sourceId,
    targetId,
    properties: []
  })

  // Helper function to create test graphs
  const createGraph = (id: string, nodes: Node[], edges: Edge[]): Graph => ({
    id: `graph_${id}`,
    nodes,
    edges
  })

  describe('match function', () => {
    it('should return undefined for empty graphs', () => {
      const emptyGraph = createGraph('empty', [], [])
      const queryGraph = createGraph('query', [createNode('1', [1, 0, 0])], [])

      expect(() => match(emptyGraph, queryGraph)).toThrow('Graph has no nodes')
    })

    it('should throw error for invalid graphs with duplicate node IDs', () => {
      const node1 = createNode('1', [1, 0, 0])
      const node2 = createNode('1', [0, 1, 0]) // Same ID as node1
      const invalidGraph = createGraph('invalid', [node1, node2], [])
      const queryGraph = createGraph('query', [createNode('q1', [1, 0, 0])], [])

      expect(() => match(invalidGraph, queryGraph)).toThrow('Invalid graph')
    })

    it('should throw error for invalid graphs with duplicate edge IDs', () => {
      const node1 = createNode('1', [1, 0, 0])
      const node2 = createNode('2', [0, 1, 0])
      const edge1 = createEdge('1', node1.id, node2.id, [1, 0])
      const edge2 = createEdge('1', node1.id, node2.id, [0, 1]) // Same ID as edge1
      const invalidGraph = createGraph('invalid', [node1, node2], [edge1, edge2])
      const queryGraph = createGraph('query', [createNode('q1', [1, 0, 0])], [])

      expect(() => match(invalidGraph, queryGraph)).toThrow('Invalid graph')
    })

    it('should find exact match for identical single nodes', () => {
      const node1 = createNode('1', [1, 0, 0])
      const graph = createGraph('graph', [node1], [])

      const queryNode = createNode('q1', [1, 0, 0]) // Identical embedding
      const query = createGraph('query', [queryNode], [])

      const result = match(graph, query)

      expect(result).toBeDefined()
      expect(result!.nodes).toHaveLength(1)
      expect(result!.nodes[0]!.id).toBe(node1.id)
    })

    it('should find match for similar nodes', () => {
      const node1 = createNode('1', [1, 0, 0])
      const node2 = createNode('2', [0, 1, 0])
      const graph = createGraph('graph', [node1, node2], [])

      const queryNode = createNode('q1', [0.9, 0.1, 0]) // Similar to node1
      const query = createGraph('query', [queryNode], [])

      const result = match(graph, query)

      expect(result).toBeDefined()
      expect(result!.nodes).toHaveLength(1)
      expect(result!.nodes[0]!.id).toBe(node1.id)
    })

    it('should not find match when similarity is below threshold', () => {
      const node1 = createNode('1', [1, 0, 0])
      const graph = createGraph('graph', [node1], [])

      const queryNode = createNode('q1', [0, 0, 1]) // Orthogonal to node1
      const query = createGraph('query', [queryNode], [])

      const result = match(graph, query)

      expect(result).toBeUndefined()
    })

    it('should find correct edge connectivity', () => {
      // Create a graph: A -> B -> C
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const nodeC = createNode('C', [0, 0, 1])
      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const edgeBC = createEdge('BC', nodeB.id, nodeC.id, [0, 1])
      const graph = createGraph('graph', [nodeA, nodeB, nodeC], [edgeAB, edgeBC])

      // Create query: X -> Y (should match A -> B or B -> C)
      const nodeX = createNode('X', [1, 0, 0]) // Similar to A
      const nodeY = createNode('Y', [0, 1, 0]) // Similar to B
      const edgeXY = createEdge('XY', nodeX.id, nodeY.id, [1, 0]) // Similar to AB
      const query = createGraph('query', [nodeX, nodeY], [edgeXY])

      const result = match(graph, query)

      expect(result).toBeDefined()
      expect(result!.nodes).toHaveLength(2)
      expect(result!.edges).toHaveLength(1)

      // Should match A->B (not B->C or any other combination)
      const resultNodeIds = result!.nodes.map(n => n.id).sort()
      expect(resultNodeIds).toEqual([nodeA.id, nodeB.id])
      expect(result!.edges[0]!.id).toBe(edgeAB.id)
    })

    it('should preserve graph structure in complex scenarios', () => {
      // Create a graph with multiple possible node matches but only one valid structure
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const nodeC = createNode('C', [1, 0, 0]) // Same embedding as A
      const nodeD = createNode('D', [0, 1, 0]) // Same embedding as B

      // Only connect A->B, not C->D
      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const graph = createGraph('graph', [nodeA, nodeB, nodeC, nodeD], [edgeAB])

      // Query for X->Y pattern
      const nodeX = createNode('X', [1, 0, 0])
      const nodeY = createNode('Y', [0, 1, 0])
      const edgeXY = createEdge('XY', nodeX.id, nodeY.id, [1, 0])
      const query = createGraph('query', [nodeX, nodeY], [edgeXY])

      const result = match(graph, query)

      expect(result).toBeDefined()
      expect(result!.nodes).toHaveLength(2)
      expect(result!.edges).toHaveLength(1)

      // Should match A->B (the only connected pair)
      const resultNodeIds = result!.nodes.map(n => n.id).sort()
      expect(resultNodeIds).toEqual([nodeA.id, nodeB.id])
      expect(result!.edges[0]!.id).toBe(edgeAB.id)
    })

    it('should handle disconnected query graphs', () => {
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const nodeC = createNode('C', [0, 0, 1])
      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const graph = createGraph('graph', [nodeA, nodeB, nodeC], [edgeAB])

      // Query has two disconnected nodes
      const nodeX = createNode('X', [1, 0, 0])
      const nodeY = createNode('Y', [0, 0, 1])
      const query = createGraph('query', [nodeX, nodeY], [])

      const result = match(graph, query)

      expect(result).toBeDefined()
      expect(result!.nodes).toHaveLength(2)
      expect(result!.edges).toHaveLength(0)
    })

    it('should handle multiple edges between same nodes', () => {
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const edge1 = createEdge('1', nodeA.id, nodeB.id, [1, 0])
      const edge2 = createEdge('2', nodeA.id, nodeB.id, [0, 1])
      const graph = createGraph('graph', [nodeA, nodeB], [edge1, edge2])

      const nodeX = createNode('X', [1, 0, 0])
      const nodeY = createNode('Y', [0, 1, 0])
      const edgeXY = createEdge('XY', nodeX.id, nodeY.id, [1, 0])
      const query = createGraph('query', [nodeX, nodeY], [edgeXY])

      const result = match(graph, query)

      expect(result).toBeDefined()
      expect(result!.nodes).toHaveLength(2)
      expect(result!.edges).toHaveLength(1)
      expect(result!.edges[0]!.id).toBe(edge1.id) // Should match the more similar edge
    })

    it('should handle self-loops', () => {
      const nodeA = createNode('A', [1, 0, 0])
      const selfLoop = createEdge('loop', nodeA.id, nodeA.id, [1, 0])
      const graph = createGraph('graph', [nodeA], [selfLoop])

      const nodeX = createNode('X', [1, 0, 0])
      const querySelfLoop = createEdge('queryLoop', nodeX.id, nodeX.id, [1, 0])
      const query = createGraph('query', [nodeX], [querySelfLoop])

      const result = match(graph, query)

      expect(result).toBeDefined()
      expect(result!.nodes).toHaveLength(1)
      expect(result!.edges).toHaveLength(1)
      expect(result!.edges[0]!.sourceId).toBe(result!.edges[0]!.targetId)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty query edges', () => {
      const node1 = createNode('1', [1, 0, 0])
      const node2 = createNode('2', [0, 1, 0])
      const graph = createGraph('graph', [node1, node2], [])

      const queryNode = createNode('q1', [1, 0, 0])
      const query = createGraph('query', [queryNode], [])

      const result = match(graph, query)

      expect(result).toBeDefined()
      expect(result!.nodes).toHaveLength(1)
      expect(result!.edges).toHaveLength(0)
    })

    it('should handle query larger than graph', () => {
      const node1 = createNode('1', [1, 0, 0])
      const graph = createGraph('graph', [node1], [])

      const queryNode1 = createNode('q1', [1, 0, 0])
      const queryNode2 = createNode('q2', [0, 1, 0])
      const query = createGraph('query', [queryNode1, queryNode2], [])

      const result = match(graph, query)

      // Should not find a match since graph is smaller than query
      expect(result).toBeUndefined()
    })
  })

  describe('intersect function', () => {
    it('should return empty graph when graphs have no overlapping nodes', () => {
      const nodeA = createNode('A', [1, 0, 0])
      // const nodeB = createNode('B', [0, 1, 0])
      const graphA = createGraph('graphA', [nodeA], [])

      const nodeC = createNode('C', [0, 0, 1])
      const nodeD = createNode('D', [0, 1, 1])
      const graphB = createGraph('graphB', [nodeC, nodeD], [])

      const result = intersect(graphA, graphB)

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(0)
      expect(result.edges).toHaveLength(0)
    })

    it('should find overlapping nodes based on similarity', () => {
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const graphA = createGraph('graphA', [nodeA, nodeB], [])

      const nodeC = createNode('C', [1, 0, 0]) // Similar to nodeA
      const nodeD = createNode('D', [0, 0, 1]) // Not similar to any node in graphA
      const graphB = createGraph('graphB', [nodeC, nodeD], [])

      const result = intersect(graphA, graphB)

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(1)
      expect(result.nodes[0]!.id).toBe(nodeC.id)
      expect(result.edges).toHaveLength(0)
    })

    it('should find overlapping edges when both endpoints and edge are similar', () => {
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const graphA = createGraph('graphA', [nodeA, nodeB], [edgeAB])

      const nodeC = createNode('C', [1, 0, 0]) // Similar to nodeA
      const nodeD = createNode('D', [0, 1, 0]) // Similar to nodeB
      const edgeCD = createEdge('CD', nodeC.id, nodeD.id, [1, 0]) // Similar to edgeAB
      const graphB = createGraph('graphB', [nodeC, nodeD], [edgeCD])

      const result = intersect(graphA, graphB)

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(2)
      expect(result.edges).toHaveLength(1)
      expect(result.edges[0]!.id).toBe(edgeCD.id)
    })

    it('should not include edges when endpoints are not similar', () => {
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const graphA = createGraph('graphA', [nodeA, nodeB], [edgeAB])

      const nodeC = createNode('C', [1, 0, 0]) // Similar to nodeA
      const nodeD = createNode('D', [0, 0, 1]) // Not similar to nodeB
      const edgeCD = createEdge('CD', nodeC.id, nodeD.id, [1, 0])
      const graphB = createGraph('graphB', [nodeC, nodeD], [edgeCD])

      const result = intersect(graphA, graphB)

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(1) // Only nodeC matches
      expect(result.edges).toHaveLength(0) // Edge not included because nodeD doesn't match nodeB
    })

    it('should not include edges when edge similarity is below threshold', () => {
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const graphA = createGraph('graphA', [nodeA, nodeB], [edgeAB])

      const nodeC = createNode('C', [1, 0, 0]) // Similar to nodeA
      const nodeD = createNode('D', [0, 1, 0]) // Similar to nodeB
      const edgeCD = createEdge('CD', nodeC.id, nodeD.id, [0, 1]) // Orthogonal to edgeAB
      const graphB = createGraph('graphB', [nodeC, nodeD], [edgeCD])

      const result = intersect(graphA, graphB)

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(2)
      expect(result.edges).toHaveLength(0) // Edge not included due to low similarity
    })

    it('should handle complex graphs with multiple overlapping elements', () => {
      // GraphA: A -> B -> C
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const nodeC = createNode('C', [0, 0, 1])
      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const edgeBC = createEdge('BC', nodeB.id, nodeC.id, [0, 1])
      const graphA = createGraph('graphA', [nodeA, nodeB, nodeC], [edgeAB, edgeBC])

      // GraphB: X -> Y, Z (where X~A, Y~B, Z is unique and orthogonal)  
      const nodeX = createNode('X', [1, 0, 0]) // Similar to A
      const nodeY = createNode('Y', [0, 1, 0]) // Similar to B
      const nodeZ = createNode('Z', [-1, 0, 0]) // Unique and orthogonal to A and B
      const edgeXY = createEdge('XY', nodeX.id, nodeY.id, [1, 0]) // Similar to AB
      const graphB = createGraph('graphB', [nodeX, nodeY, nodeZ], [edgeXY])

      const result = intersect(graphA, graphB)

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(2) // X and Y should match A and B
      expect(result.edges).toHaveLength(1) // XY should match AB
      expect(result.edges[0]!.id).toBe(edgeXY.id)
    })

    it('should handle self-loops correctly', () => {
      const nodeA = createNode('A', [1, 0, 0])
      const selfLoopA = createEdge('loopA', nodeA.id, nodeA.id, [1, 0])
      const graphA = createGraph('graphA', [nodeA], [selfLoopA])

      const nodeB = createNode('B', [1, 0, 0]) // Similar to A
      const selfLoopB = createEdge('loopB', nodeB.id, nodeB.id, [1, 0]) // Similar to selfLoopA
      const graphB = createGraph('graphB', [nodeB], [selfLoopB])

      const result = intersect(graphA, graphB)

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(1)
      expect(result.edges).toHaveLength(1)
      expect(result.edges[0]!.sourceId).toBe(result.edges[0]!.targetId)
    })
  })

  describe('merge function', () => {
    it('should merge graphs with no overlapping nodes', () => {
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const graphA = createGraph('graphA', [nodeA, nodeB], [])

      const nodeC = createNode('C', [0, 0, 1])
      const nodeD = createNode('D', [0, -1, 0]) // Orthogonal to A, B, C
      const graphB = createGraph('graphB', [nodeC, nodeD], [])

      const result = merge(graphA, graphB)

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(4)
      expect(result.edges).toHaveLength(0)

      const nodeIds = result.nodes.map(n => n.id).sort()
      expect(nodeIds).toEqual([nodeA.id, nodeB.id, nodeC.id, nodeD.id].sort())
    })

    it('should not duplicate similar nodes when merging', () => {
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const graphA = createGraph('graphA', [nodeA, nodeB], [])

      const nodeC = createNode('C', [1, 0, 0]) // Similar to nodeA
      const nodeD = createNode('D', [0, 0, 1]) // Unique
      const graphB = createGraph('graphB', [nodeC, nodeD], [])

      const result = merge(graphA, graphB)

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(3) // A, B from graphA + D from graphB (C is similar to A)
      expect(result.edges).toHaveLength(0)

      const nodeIds = result.nodes.map(n => n.id).sort()
      expect(nodeIds).toEqual([nodeA.id, nodeB.id, nodeD.id].sort())
    })

    it('should merge edges from both graphs', () => {
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const graphA = createGraph('graphA', [nodeA, nodeB], [edgeAB])

      const nodeC = createNode('C', [0, 0, 1])
      const nodeD = createNode('D', [0, -1, 0]) // Orthogonal to A, B, C
      const edgeCD = createEdge('CD', nodeC.id, nodeD.id, [0, 1])
      const graphB = createGraph('graphB', [nodeC, nodeD], [edgeCD])

      const result = merge(graphA, graphB)

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(4)
      expect(result.edges).toHaveLength(2)

      const edgeIds = result.edges.map(e => e.id).sort()
      expect(edgeIds).toEqual([edgeAB.id, edgeCD.id].sort())
    })

    it('should not duplicate similar edges when merging', () => {
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const graphA = createGraph('graphA', [nodeA, nodeB], [edgeAB])

      const nodeC = createNode('C', [1, 0, 0]) // Similar to A
      const nodeD = createNode('D', [0, 1, 0]) // Similar to B
      const edgeCD = createEdge('CD', nodeC.id, nodeD.id, [1, 0]) // Similar to AB
      const graphB = createGraph('graphB', [nodeC, nodeD], [edgeCD])

      const result = merge(graphA, graphB)

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(2) // Only A and B (C and D are similar)
      expect(result.edges).toHaveLength(1) // Only AB (CD is similar)
      expect(result.edges[0]!.id).toBe(edgeAB.id)
    })

    it('should handle complex merge scenarios', () => {
      // GraphA: A -> B
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const graphA = createGraph('graphA', [nodeA, nodeB], [edgeAB])

      // GraphB: X -> Y -> Z (where X~A, Y~B, Z is unique)
      const nodeX = createNode('X', [1, 0, 0]) // Similar to A
      const nodeY = createNode('Y', [0, 1, 0]) // Similar to B
      const nodeZ = createNode('Z', [0, 0, 1]) // Unique
      const edgeXY = createEdge('XY', nodeX.id, nodeY.id, [1, 0]) // Similar to AB
      const edgeYZ = createEdge('YZ', nodeY.id, nodeZ.id, [0, 1]) // Unique
      const graphB = createGraph('graphB', [nodeX, nodeY, nodeZ], [edgeXY, edgeYZ])

      const result = merge(graphA, graphB)

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(3) // A, B, Z
      expect(result.edges).toHaveLength(2) // AB, YZ (XY is similar to AB)

      const nodeIds = result.nodes.map(n => n.id).sort()
      expect(nodeIds).toEqual([nodeA.id, nodeB.id, nodeZ.id].sort())

      const edgeIds = result.edges.map(e => e.id).sort()
      expect(edgeIds).toEqual([edgeAB.id, edgeYZ.id].sort())
    })

    it('should handle merging with empty graphs', () => {
      const nodeA = createNode('A', [1, 0, 0])
      const graphA = createGraph('graphA', [nodeA], [])
      const emptyGraph = createGraph('empty', [], [])

      const resultA = merge(graphA, emptyGraph)
      expect(resultA.nodes).toHaveLength(1)
      expect(resultA.edges).toHaveLength(0)

      const resultB = merge(emptyGraph, graphA)
      expect(resultB.nodes).toHaveLength(1)
      expect(resultB.edges).toHaveLength(0)
    })

    it('should preserve edge connectivity after merge', () => {
      // GraphA: A -> B
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const graphA = createGraph('graphA', [nodeA, nodeB], [edgeAB])

      // GraphB: C -> D (where C~A but D is unique)
      const nodeC = createNode('C', [1, 0, 0]) // Similar to A
      const nodeD = createNode('D', [0, 0, 1]) // Unique
      const edgeCD = createEdge('CD', nodeC.id, nodeD.id, [0, 1]) // Different from AB
      const graphB = createGraph('graphB', [nodeC, nodeD], [edgeCD])

      const result = merge(graphA, graphB)

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(3) // A, B, D
      expect(result.edges).toHaveLength(2) // AB and CD

      // Verify edge connectivity is preserved
      const abEdge = result.edges.find(e => e.id === edgeAB.id)
      const cdEdge = result.edges.find(e => e.id === edgeCD.id)

      expect(abEdge).toBeDefined()
      expect(cdEdge).toBeDefined()
      expect(abEdge!.sourceId).toBe(nodeA.id)
      expect(abEdge!.targetId).toBe(nodeB.id)
      expect(cdEdge!.sourceId).toBe(nodeC.id)
      expect(cdEdge!.targetId).toBe(nodeD.id)
    })
  })

  describe('incident function', () => {
    it('should return empty graph when no path exists from sources to targets', () => {
      // Create disconnected graph: A, B isolated from C, D
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const nodeC = createNode('C', [0, 0, 1])
      const nodeD = createNode('D', [1, 1, 0])

      // Only connect A->B, leaving C and D isolated
      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const graph = createGraph('graph', [nodeA, nodeB, nodeC, nodeD], [edgeAB])

      // Try to find path from A to C (no path exists)
      const result = incident(graph, [nodeA.id], [nodeC.id])

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(0)
      expect(result.edges).toHaveLength(0)
    })

    it('should find simple direct path from source to target', () => {
      // Simple graph: A -> B
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const graph = createGraph('graph', [nodeA, nodeB], [edgeAB])

      const result = incident(graph, [nodeA.id], [nodeB.id])

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(2)
      expect(result.edges).toHaveLength(1)
      expect(result.edges[0]!.id).toBe(edgeAB.id)

      // Verify boundary conditions: no in-edges to sources, no out-edges from targets
      const sourceInDegree = result.edges.filter((e: Edge) => e.targetId === nodeA.id).length
      const targetOutDegree = result.edges.filter((e: Edge) => e.sourceId === nodeB.id).length
      expect(sourceInDegree).toBe(0)
      expect(targetOutDegree).toBe(0)
    })

    it('should find multi-hop path from source to target', () => {
      // Linear graph: A -> B -> C -> D
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const nodeC = createNode('C', [0, 0, 1])
      const nodeD = createNode('D', [1, 1, 0])

      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const edgeBC = createEdge('BC', nodeB.id, nodeC.id, [0, 1])
      const edgeCD = createEdge('CD', nodeC.id, nodeD.id, [1, 1])
      const graph = createGraph('graph', [nodeA, nodeB, nodeC, nodeD], [edgeAB, edgeBC, edgeCD])

      const result = incident(graph, [nodeA.id], [nodeD.id])

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(4)
      expect(result.edges).toHaveLength(3)

      // All original edges should be preserved
      const edgeIds = result.edges.map((e: Edge) => e.id).sort()
      expect(edgeIds).toEqual([edgeAB.id, edgeBC.id, edgeCD.id].sort())
    })

    it('should handle multiple sources and targets', () => {
      // Graph: A -> C <- B, C -> D, C -> E
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const nodeC = createNode('C', [0, 0, 1])
      const nodeD = createNode('D', [1, 1, 0])
      const nodeE = createNode('E', [1, 0, 1])

      const edgeAC = createEdge('AC', nodeA.id, nodeC.id, [1, 0])
      const edgeBC = createEdge('BC', nodeB.id, nodeC.id, [0, 1])
      const edgeCD = createEdge('CD', nodeC.id, nodeD.id, [1, 1])
      const edgeCE = createEdge('CE', nodeC.id, nodeE.id, [0, 1])
      const graph = createGraph('graph', [nodeA, nodeB, nodeC, nodeD, nodeE], [edgeAC, edgeBC, edgeCD, edgeCE])

      const result = incident(graph, [nodeA.id, nodeB.id], [nodeD.id, nodeE.id])

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(5)
      expect(result.edges).toHaveLength(4)

      // All edges should be preserved as they're all on A→D or B→E paths
      const edgeIds = result.edges.map((e: Edge) => e.id).sort()
      expect(edgeIds).toEqual([edgeAC.id, edgeBC.id, edgeCD.id, edgeCE.id].sort())
    })

    it('should exclude vertices not on any source-to-target path', () => {
      // Graph: A -> B -> C, D -> E (D,E isolated from A->B->C path)
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const nodeC = createNode('C', [0, 0, 1])
      const nodeD = createNode('D', [1, 1, 0])
      const nodeE = createNode('E', [1, 0, 1])

      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const edgeBC = createEdge('BC', nodeB.id, nodeC.id, [0, 1])
      const edgeDE = createEdge('DE', nodeD.id, nodeE.id, [1, 1])
      const graph = createGraph('graph', [nodeA, nodeB, nodeC, nodeD, nodeE], [edgeAB, edgeBC, edgeDE])

      const result = incident(graph, [nodeA.id], [nodeC.id])

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(3) // Only A, B, C
      expect(result.edges).toHaveLength(2) // Only AB, BC

      const nodeIds = result.nodes.map((n: Node) => n.id).sort()
      expect(nodeIds).toEqual([nodeA.id, nodeB.id, nodeC.id].sort())

      const edgeIds = result.edges.map((e: Edge) => e.id).sort()
      expect(edgeIds).toEqual([edgeAB.id, edgeBC.id].sort())
    })

    it('should enforce boundary degrees: no in-edges to sources, no out-edges from targets', () => {
      // Graph: X -> A -> B -> C <- Y (where A is source, C is target)
      const nodeX = createNode('X', [1, 0, 0])
      const nodeA = createNode('A', [0, 1, 0])
      const nodeB = createNode('B', [0, 0, 1])
      const nodeC = createNode('C', [1, 1, 0])
      const nodeY = createNode('Y', [1, 0, 1])

      const edgeXA = createEdge('XA', nodeX.id, nodeA.id, [1, 0])
      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [0, 1])
      const edgeBC = createEdge('BC', nodeB.id, nodeC.id, [1, 1])
      const edgeYC = createEdge('YC', nodeY.id, nodeC.id, [0, 1])
      const graph = createGraph('graph', [nodeX, nodeA, nodeB, nodeC, nodeY], [edgeXA, edgeAB, edgeBC, edgeYC])

      const result = incident(graph, [nodeA.id], [nodeC.id])

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(3) // A, B, C
      expect(result.edges).toHaveLength(2) // AB, BC (XA and YC should be removed)

      // Verify boundary conditions
      const sourceInEdges = result.edges.filter((e: Edge) => e.targetId === nodeA.id)
      const targetOutEdges = result.edges.filter((e: Edge) => e.sourceId === nodeC.id)
      expect(sourceInEdges).toHaveLength(0)
      expect(targetOutEdges).toHaveLength(0)

      const edgeIds = result.edges.map((e: Edge) => e.id).sort()
      expect(edgeIds).toEqual([edgeAB.id, edgeBC.id].sort())
    })

    it('should handle branching paths correctly', () => {
      // Diamond graph: A -> B -> D, A -> C -> D
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const nodeC = createNode('C', [0, 0, 1])
      const nodeD = createNode('D', [1, 1, 0])

      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const edgeAC = createEdge('AC', nodeA.id, nodeC.id, [0, 1])
      const edgeBD = createEdge('BD', nodeB.id, nodeD.id, [1, 1])
      const edgeCD = createEdge('CD', nodeC.id, nodeD.id, [0, 1])
      const graph = createGraph('graph', [nodeA, nodeB, nodeC, nodeD], [edgeAB, edgeAC, edgeBD, edgeCD])

      const result = incident(graph, [nodeA.id], [nodeD.id])

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(4)
      expect(result.edges).toHaveLength(4)

      // All edges should be preserved as they're all on A→D paths
      const edgeIds = result.edges.map((e: Edge) => e.id).sort()
      expect(edgeIds).toEqual([edgeAB.id, edgeAC.id, edgeBD.id, edgeCD.id].sort())
    })

    it('should handle cycles in the graph', () => {
      // Graph with cycle: A -> B -> C -> B, C -> D
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const nodeC = createNode('C', [0, 0, 1])
      const nodeD = createNode('D', [1, 1, 0])

      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const edgeBC = createEdge('BC', nodeB.id, nodeC.id, [0, 1])
      const edgeCB = createEdge('CB', nodeC.id, nodeB.id, [1, 1]) // Creates cycle
      const edgeCD = createEdge('CD', nodeC.id, nodeD.id, [0, 1])
      const graph = createGraph('graph', [nodeA, nodeB, nodeC, nodeD], [edgeAB, edgeBC, edgeCB, edgeCD])

      const result = incident(graph, [nodeA.id], [nodeD.id])

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(4)
      expect(result.edges).toHaveLength(4)

      // All edges should be preserved as they're all reachable from A and can reach D
      const edgeIds = result.edges.map((e: Edge) => e.id).sort()
      expect(edgeIds).toEqual([edgeAB.id, edgeBC.id, edgeCB.id, edgeCD.id].sort())
    })

    it('should handle self-loops correctly', () => {
      // Graph: A -> B, B -> B (self-loop), B -> C
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const nodeC = createNode('C', [0, 0, 1])

      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const edgeBB = createEdge('BB', nodeB.id, nodeB.id, [0, 1]) // Self-loop
      const edgeBC = createEdge('BC', nodeB.id, nodeC.id, [1, 1])
      const graph = createGraph('graph', [nodeA, nodeB, nodeC], [edgeAB, edgeBB, edgeBC])

      const result = incident(graph, [nodeA.id], [nodeC.id])

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(3)
      expect(result.edges).toHaveLength(3)

      // All edges should be preserved
      const edgeIds = result.edges.map((e: Edge) => e.id).sort()
      expect(edgeIds).toEqual([edgeAB.id, edgeBB.id, edgeBC.id].sort())
    })

    it('should handle empty sources array', () => {
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const graph = createGraph('graph', [nodeA, nodeB], [edgeAB])

      const result = incident(graph, [], [nodeB.id])

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(0)
      expect(result.edges).toHaveLength(0)
    })

    it('should handle empty targets array', () => {
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const graph = createGraph('graph', [nodeA, nodeB], [edgeAB])

      const result = incident(graph, [nodeA.id], [])

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(0)
      expect(result.edges).toHaveLength(0)
    })

    it('should handle case where source is also target', () => {
      // Graph: A -> B -> A (A is both source and target)
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])

      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const edgeBA = createEdge('BA', nodeB.id, nodeA.id, [0, 1])
      const graph = createGraph('graph', [nodeA, nodeB], [edgeAB, edgeBA])

      const result = incident(graph, [nodeA.id], [nodeA.id])

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(2) // A and B are reachable
      expect(result.edges).toHaveLength(0) // Both edges removed due to boundary constraints

      // When A is both source and target:
      // - AB removed because A ∈ targets (no out-edges from targets)
      // - BA removed because A ∈ sources (no in-edges to sources)
      // This creates an isolated subgraph with the cycle nodes but no connecting edges
    })

    it('should handle non-existent source nodes', () => {
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const graph = createGraph('graph', [nodeA, nodeB], [edgeAB])

      const nonExistentId = 'node_nonexistent' as NodeId
      const result = incident(graph, [nonExistentId], [nodeB.id])

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(0)
      expect(result.edges).toHaveLength(0)
    })

    it('should handle non-existent target nodes', () => {
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const graph = createGraph('graph', [nodeA, nodeB], [edgeAB])

      const nonExistentId = 'node_nonexistent' as NodeId
      const result = incident(graph, [nodeA.id], [nonExistentId])

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(0)
      expect(result.edges).toHaveLength(0)
    })

    it('should handle large branching graph efficiently', () => {
      // Create a larger graph: S -> {I1, I2, I3} -> {T1, T2}
      const nodeS = createNode('S', [1, 0, 0])
      const nodeI1 = createNode('I1', [0, 1, 0])
      const nodeI2 = createNode('I2', [0, 0, 1])
      const nodeI3 = createNode('I3', [1, 1, 0])
      const nodeT1 = createNode('T1', [1, 0, 1])
      const nodeT2 = createNode('T2', [0, 1, 1])

      const edges = [
        createEdge('SI1', nodeS.id, nodeI1.id, [1, 0]),
        createEdge('SI2', nodeS.id, nodeI2.id, [0, 1]),
        createEdge('SI3', nodeS.id, nodeI3.id, [1, 1]),
        createEdge('I1T1', nodeI1.id, nodeT1.id, [1, 0]),
        createEdge('I1T2', nodeI1.id, nodeT2.id, [0, 1]),
        createEdge('I2T1', nodeI2.id, nodeT1.id, [1, 1]),
        createEdge('I2T2', nodeI2.id, nodeT2.id, [0, 1]),
        createEdge('I3T1', nodeI3.id, nodeT1.id, [1, 0]),
        createEdge('I3T2', nodeI3.id, nodeT2.id, [1, 1])
      ]

      const graph = createGraph('graph', [nodeS, nodeI1, nodeI2, nodeI3, nodeT1, nodeT2], edges)

      const result = incident(graph, [nodeS.id], [nodeT1.id, nodeT2.id])

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(6) // All nodes
      expect(result.edges).toHaveLength(9) // All edges

      // Verify boundary conditions
      const sourceInEdges = result.edges.filter(e => e.targetId === nodeS.id)
      const targetOutEdges = result.edges.filter(e =>
        e.sourceId === nodeT1.id || e.sourceId === nodeT2.id
      )
      expect(sourceInEdges).toHaveLength(0)
      expect(targetOutEdges).toHaveLength(0)
    })

    it('should preserve graph structure invariants', () => {
      // Test that the resulting graph maintains proper structure
      const nodeA = createNode('A', [1, 0, 0])
      const nodeB = createNode('B', [0, 1, 0])
      const nodeC = createNode('C', [0, 0, 1])

      const edgeAB = createEdge('AB', nodeA.id, nodeB.id, [1, 0])
      const edgeBC = createEdge('BC', nodeB.id, nodeC.id, [0, 1])
      const graph = createGraph('graph', [nodeA, nodeB, nodeC], [edgeAB, edgeBC])

      const result = incident(graph, [nodeA.id], [nodeC.id])

      expect(result).toBeDefined()

      // Verify all edge endpoints exist in nodes
      for (const edge of result.edges) {
        const sourceExists = result.nodes.some(n => n.id === edge.sourceId)
        const targetExists = result.nodes.some(n => n.id === edge.targetId)
        expect(sourceExists).toBe(true)
        expect(targetExists).toBe(true)
      }

      // Verify result has valid graph structure
      expect(result.id).toBeDefined()
      expect(Array.isArray(result.nodes)).toBe(true)
      expect(Array.isArray(result.edges)).toBe(true)
    })

    it('should handle empty graph', () => {
      const emptyGraph = createGraph('empty', [], [])
      const result = incident(emptyGraph, [], [])

      expect(result).toBeDefined()
      expect(result.nodes).toHaveLength(0)
      expect(result.edges).toHaveLength(0)
    })
  })
}) 
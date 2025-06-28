import { describe, expect, it, vi } from 'vitest'
import { match } from './index.js'
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
}) 
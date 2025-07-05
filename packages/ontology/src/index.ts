import { Edge, EdgeCandidate, EdgeId, Graph, GraphId, Node, NodeCandidate, NodeId } from "./types.js";
import { cartesianProduct, take } from "./iter.js";
import { log } from "./logging.js";
import { cosineSimilarity } from "./math.js";

export const DEFAULT_N = 10;
export const DEFAULT_THRESHOLD = 0.5;

function isValidGraph(graph: Graph): boolean {
    const nodeIds = new Set<NodeId>();
    const edgeIds = new Set<EdgeId>();

    for (const node of graph.nodes) {
        if (nodeIds.has(node.id)) {
            return false;
        }
        nodeIds.add(node.id);
    }

    for (const edge of graph.edges) {
        if (edgeIds.has(edge.id)) {
            return false;
        }
        edgeIds.add(edge.id);
    }

    return true;
}

export function* similarNodes(graph: Graph, query: Graph, options?: { n: number; threshold: number; }): Generator<NodeCandidate[]> {
    if (graph.nodes.length === 0) {
        throw new Error("Graph has no nodes");
    }

    if (query.nodes.length === 0) {
        throw new Error("Query has no nodes");
    }

    const { n = DEFAULT_N, threshold = DEFAULT_THRESHOLD } = options ?? {};

    const candidates_ij: NodeCandidate[][] = [];

    for (const queryNode of query.nodes) {
        if (!queryNode.embedding) {
            throw new Error("query node must be ready")
        }

        const candidates_i: NodeCandidate[] = [];

        for (const graphNode of graph.nodes) {
            if (!graphNode.embedding) {
                throw new Error("graph node must be ready")
            }

            const similarity = cosineSimilarity(queryNode.embedding, graphNode.embedding);

            if (similarity < threshold) {
                continue;
            }

            candidates_i.push({ referenceId: queryNode.id, candidateId: graphNode.id, similarity });
        }

        if (candidates_i.length === 0) {
            log(`No candidates found for node ${queryNode.id} in graph ${graph.id}`);
        }

        candidates_ij.push(candidates_i.sort((a, b) => b.similarity - a.similarity));
    }

    yield* take(cartesianProduct(candidates_ij), n);
}

export function* iterateEdges(graph: Graph, subset: NodeId[], options?: { n: number; }): Generator<Edge> {
    if (subset.length === 0) {
        throw new Error("Subset has no nodes");
    }

    const { n = DEFAULT_N } = options ?? {};

    const subsetSet = new Set(subset);

    let i = 0;
    for (const edge of graph.edges) {
        if (i >= n) {
            break;
        }

        if (!subsetSet.has(edge.sourceId) || !subsetSet.has(edge.targetId)) {
            continue;
        }

        yield edge;
        i++;
    }
}

export function* similarEdges(graph: Graph, query: Graph, nodeCandidates: NodeCandidate[], options?: { n: number; threshold: number; }): Generator<EdgeCandidate[]> {
    const { n = DEFAULT_N, threshold = DEFAULT_THRESHOLD } = options ?? {};

    // Create mapping from query node IDs to candidate node IDs
    const nodeMapping = new Map<NodeId, NodeId>();
    for (const candidate of nodeCandidates) {
        nodeMapping.set(candidate.referenceId, candidate.candidateId);
    }

    const incidentEdges = Array.from(
        iterateEdges(
            graph,
            nodeCandidates.map((candidate) => candidate.candidateId),
            options
        )
    )

    const candidates_ij: EdgeCandidate[][] = [];

    for (const queryEdge of query.edges) {
        if (!queryEdge.embedding) {
            throw new Error("graph edge must be ready")
        }

        const candidates_i: EdgeCandidate[] = [];

        // Get the expected source and target nodes for this query edge
        const expectedSourceId = nodeMapping.get(queryEdge.sourceId);
        const expectedTargetId = nodeMapping.get(queryEdge.targetId);

        // Skip if we don't have mappings for the edge's nodes
        if (!expectedSourceId || !expectedTargetId) {
            continue;
        }

        for (const graphEdge of incidentEdges) {
            if (!graphEdge.embedding) {
                throw new Error("graph edge must be ready")
            }

            // Only consider edges that connect the correctly mapped nodes
            if (graphEdge.sourceId !== expectedSourceId || graphEdge.targetId !== expectedTargetId) {
                continue;
            }

            const similarity = cosineSimilarity(queryEdge.embedding, graphEdge.embedding);

            if (similarity < threshold) {
                continue;
            }

            candidates_i.push({ referenceId: queryEdge.id, candidateId: graphEdge.id, similarity });
        }

        if (candidates_i.length === 0) {
            log(`No candidates found for edge ${queryEdge.id} in graph ${graph.id}`);
        }

        candidates_ij.push(candidates_i.sort((a, b) => b.similarity - a.similarity));
    }

    yield* take(cartesianProduct(candidates_ij), n);
}

// iterates of all the possible candidates for the query graph
// if graph has nodes {a, b, c, d} and query has nodes {p, q}
// iterates like {{a, b}, {c, d}} assuming that a and c are similar (descending in similarity) to p, and b and d are similar to q
export function* similarSubGraphs(graph: Graph, query: Graph, options?: { n: number; threshold: number; }): Generator<Graph> {
    const nodeLookup = new Map<NodeId, Node>(
        graph.nodes.map((node) => [node.id, node])
    );

    const edgeLookup = new Map<EdgeId, Edge>(
        graph.edges.map((edge) => [edge.id, edge])
    );

    for (const nodeCandidates of similarNodes(graph, query, options)) {
        if (query.edges.length > 0)
            for (const edgeCandidates of similarEdges(graph, query, nodeCandidates, options)) {
                const subGraph: Graph = {
                    id: `graph_${Math.random().toString(36).substring(2, 15)}`,
                    nodes: nodeCandidates.map((candidate) => nodeLookup.get(candidate.candidateId)!),
                    edges: edgeCandidates.map((candidate) => edgeLookup.get(candidate.candidateId)!),
                };

                yield subGraph;
            }
        else {
            const subGraph: Graph = {
                id: `graph_${Math.random().toString(36).substring(2, 15)}`,
                nodes: nodeCandidates.map((candidate) => nodeLookup.get(candidate.candidateId)!),
                edges: [],
            };

            yield subGraph;
        }
    }
}

export function match(graph: Graph, query: Graph): Graph | undefined {
    if (!isValidGraph(graph)) {
        throw new Error("Invalid graph");
    }

    if (!isValidGraph(query)) {
        throw new Error("Invalid query graph");
    }

    const [best] = Array.from(take(similarSubGraphs(graph, query), 1));

    return best;
}

export function findNode(graph: Graph, node: Node, options?: { threshold: number; }): Node | undefined {
    if (!node.embedding) {
        throw new Error("node must be ready")
    }

    const { threshold = DEFAULT_THRESHOLD } = options ?? {};

    const candidates: NodeCandidate[] = [];
    for (const graphNode of graph.nodes) {
        if (!graphNode.embedding) {
            throw new Error("node must be ready")
        }

        const similarity = cosineSimilarity(node.embedding, graphNode.embedding);

        if (similarity >= threshold) {
            candidates.push({ referenceId: node.id, candidateId: graphNode.id, similarity });
        }
    }

    if (candidates.length === 0) {
        return undefined;
    }

    const [best] = candidates.sort((a, b) => b.similarity - a.similarity);

    if (!best) {
        return undefined;
    }

    return graph.nodes.find((n) => n.id === best.candidateId)!;
}

export function containsNode(graph: Graph, node: Node, options?: { threshold: number; }): boolean {
    return findNode(graph, node, options) !== undefined;
}

export function findEdge(graph: Graph, source: Node, target: Node, edge: Edge, options?: { threshold: number; }): Edge | undefined {
    if (!edge.embedding) {
        throw new Error("edge must be ready")
    }

    const { threshold = DEFAULT_THRESHOLD } = options ?? {};

    const candidateSource = findNode(graph, source, options);
    const candidateTarget = findNode(graph, target, options);

    if (!candidateSource || !candidateTarget) {
        return undefined;
    }

    const candidateEdges = graph.edges.filter((e) => e.sourceId === candidateSource.id && e.targetId === candidateTarget.id);

    if (candidateEdges.length === 0) {
        return undefined;
    }

    const candidates: EdgeCandidate[] = [];
    for (const candidateEdge of candidateEdges) {
        if (!candidateEdge.embedding) {
            throw new Error("node must be ready")
        }

        const similarity = cosineSimilarity(edge.embedding, candidateEdge.embedding);

        if (similarity >= threshold) {
            candidates.push({ referenceId: edge.id, candidateId: candidateEdge.id, similarity });
        }
    }

    if (candidates.length === 0) {
        return undefined;
    }

    const [best] = candidates.sort((a, b) => b.similarity - a.similarity);

    if (!best) {
        return undefined;
    }

    return graph.edges.find((e) => e.id === best.candidateId)!;
}

export function containsEdge(graph: Graph, source: Node, target: Node, edge: Edge, options?: { threshold: number; }): boolean {
    return findEdge(graph, source, target, edge, options) !== undefined;
}

// returns the nodes and edges of b that are contained in a
export function intersect(a: Graph, b: Graph): Graph {
    const nodes = b.nodes.filter((node) => containsNode(a, node));

    // For edges, use similarity-based matching for endpoints
    const edges = b.edges.filter((edge) => {
        // Find the source and target nodes from b
        const sourceNode = b.nodes.find(n => n.id === edge.sourceId);
        const targetNode = b.nodes.find(n => n.id === edge.targetId);

        if (!sourceNode || !targetNode) {
            return false;
        }

        // Check if similar source and target nodes exist in a, and if the edge is contained
        const similarSource = findNode(a, sourceNode);
        const similarTarget = findNode(a, targetNode);

        if (!similarSource || !similarTarget) {
            return false;
        }

        // Check if the edge is contained in graph a using similarity-based matching
        return containsEdge(a, sourceNode, targetNode, edge);
    });

    return {
        id: `graph_${Math.random().toString(36).substring(2, 15)}` as GraphId,
        nodes,
        edges
    };
}

// merges b onto a
export function merge(a: Graph, b: Graph): Graph {
    // Start with all nodes from a
    const nodes = [...a.nodes];

    // Add nodes from b that are not contained in a (using similarity-based matching)
    for (const nodeB of b.nodes) {
        if (!containsNode(a, nodeB)) {
            nodes.push(nodeB);
        }
    }

    // Start with all edges from a
    const edges = [...a.edges];

    // Add edges from b that are not contained in a (using similarity-based matching)
    for (const edgeB of b.edges) {
        // Find the source and target nodes from b
        const sourceNodeB = b.nodes.find(n => n.id === edgeB.sourceId);
        const targetNodeB = b.nodes.find(n => n.id === edgeB.targetId);

        if (!sourceNodeB || !targetNodeB) {
            continue;
        }

        // Check if the edge is not already contained in the original graph a using similarity-based matching
        if (!containsEdge(a, sourceNodeB, targetNodeB, edgeB)) {
            edges.push(edgeB);
        }
    }

    return {
        id: `graph_${Math.random().toString(36).substring(2, 15)}` as GraphId,
        nodes,
        edges
    };
}

/**
 * Extracts the maximal R→B reachability subgraph from a directed graph.
 * 
 * This function implements the R→B Reachability Subgraph algorithm, which finds the largest
 * subgraph where every directed path starts in the red vertex set (sources) and ends in the
 * blue vertex set (targets). The resulting subgraph satisfies:
 * - Every vertex lies on at least one directed path from sources to targets
 * - Source vertices have in-degree 0 (no incoming edges)
 * - Target vertices have out-degree 0 (no outgoing edges)
 * 
 * ## Algorithm Phases
 * 
 * 1. **Forward Traversal**: DFS from all source vertices to find vertices reachable from sources
 * 2. **Backward Traversal**: DFS from all target vertices in reversed graph to find vertices that can reach targets
 * 3. **Intersection**: Compute vertices that are both reachable from sources AND can reach targets
 * 4. **Induced Subgraph**: Create subgraph containing only intersection vertices and their connecting edges
 * 5. **Boundary Enforcement**: Remove edges violating boundary constraints (in-edges to sources, out-edges from targets)
 * 
 * ## Time Complexity
 * - **Time**: O(V + E) where V is vertices and E is edges
 * - **Space**: O(V) for visited sets and intermediate storage
 * 
 * ## Edge Cases
 * - Returns empty graph if no path exists between any source and target
 * - Handles cycles correctly (vertices in cycles are included if on source→target paths)
 * - When a vertex is both source and target, boundary constraints may remove all edges
 * - Empty source or target arrays result in empty output graph
 * - Non-existent node IDs are safely ignored
 * 
 * @param graph - The input directed graph to extract subgraph from
 * @param sources - Array of node IDs representing source vertices (red set R)
 * @param targets - Array of node IDs representing target vertices (blue set B)
 * 
 * @returns A new graph containing the maximal R→B reachability subgraph with:
 *   - Only vertices lying on source→target paths
 *   - No in-edges to source vertices
 *   - No out-edges from target vertices
 *   - Empty graph if no valid paths exist
 * 
 * @example
 * ```typescript
 * // Simple linear path: A → B → C
 * const result = incident(graph, ['node_A'], ['node_C']);
 * // Returns subgraph with nodes [A, B, C] and edges [A→B, B→C]
 * 
 * // Multiple sources and targets: A,B → ... → D,E
 * const result = incident(graph, ['node_A', 'node_B'], ['node_D', 'node_E']);
 * // Returns all vertices and edges on paths from {A,B} to {D,E}
 * 
 * // Disconnected components
 * const result = incident(graph, ['node_A'], ['node_Z']);
 * // Returns empty graph if no path exists from A to Z
 * ```
 * 
 * @see {@link https://en.wikipedia.org/wiki/Reachability | Graph Reachability}
 */
export function incident(graph: Graph, sources: NodeId[], targets: NodeId[]): Graph {
    // Helper function for DFS traversal
    function dfs(graph: Graph, startNodes: NodeId[]): Set<NodeId> {
        const visited = new Set<NodeId>();
        const stack: NodeId[] = [...startNodes];
        
        while (stack.length > 0) {
            const current = stack.pop()!;
            if (visited.has(current)) continue;
            
            visited.add(current);
            
            // Find all edges from current node
            for (const edge of graph.edges) {
                if (edge.sourceId === current && !visited.has(edge.targetId)) {
                    stack.push(edge.targetId);
                }
            }
        }
        
        return visited;
    }
    
    // Helper function to reverse the graph
    function reverseGraph(graph: Graph): Graph {
        return {
            id: `${graph.id}_reversed` as GraphId,
            nodes: [...graph.nodes],
            edges: graph.edges.map(edge => ({
                ...edge,
                id: `${edge.id}_reversed` as EdgeId,
                sourceId: edge.targetId,
                targetId: edge.sourceId
            }))
        };
    }
    
    // Phase 1: Forward DFS from sources (R) → set F of vertices reachable from R
    const F = dfs(graph, sources);
    
    // Phase 2: Forward DFS from targets (B) in reversed graph → set B' of vertices that can reach B
    const reversedGraph = reverseGraph(graph);
    const Bprime = dfs(reversedGraph, targets);
    
    // Phase 3: Intersection I = F ∩ B' gives vertices lying on at least one R→B path
    const I = new Set<NodeId>();
    for (const nodeId of F) {
        if (Bprime.has(nodeId)) {
            I.add(nodeId);
        }
    }
    
    // If no intersection, return empty graph (no R→B path exists)
    if (I.size === 0) {
        return {
            id: `graph_${Math.random().toString(36).substring(2, 15)}` as GraphId,
            nodes: [],
            edges: []
        };
    }
    
    // Phase 4: Induce subgraph H = G[I]
    const inducedNodes = graph.nodes.filter(node => I.has(node.id));
    const inducedEdges = graph.edges.filter(edge => 
        I.has(edge.sourceId) && I.has(edge.targetId)
    );
    
    // Phase 5: Delete edges (u,v) with v ∈ R or u ∈ B (enforces boundary degrees)
    const sourcesSet = new Set(sources);
    const targetsSet = new Set(targets);
    
    const finalEdges = inducedEdges.filter(edge => 
        !sourcesSet.has(edge.targetId) && !targetsSet.has(edge.sourceId)
    );
    
    return {
        id: `graph_${Math.random().toString(36).substring(2, 15)}` as GraphId,
        nodes: inducedNodes,
        edges: finalEdges
    };
}

export { createGraph, createNode, createEdge, createProperty } from "./utils.js";
export * from "./types.js";

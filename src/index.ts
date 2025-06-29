import { cosineSimilarity } from "ai";
import { Edge, EdgeCandidate, EdgeId, Graph, GraphId, Node, NodeCandidate, NodeId } from "./types.js";
import { cartesianProduct, take } from "./iter.js";
import { log } from "./logging.js";

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
        const candidates_i: NodeCandidate[] = [];

        for (const graphNode of graph.nodes) {
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

function* iterateEdges(graph: Graph, subset: NodeId[], options?: { n: number; }): Generator<Edge> {
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
        const candidates_i: EdgeCandidate[] = [];

        // Get the expected source and target nodes for this query edge
        const expectedSourceId = nodeMapping.get(queryEdge.sourceId);
        const expectedTargetId = nodeMapping.get(queryEdge.targetId);

        // Skip if we don't have mappings for the edge's nodes
        if (!expectedSourceId || !expectedTargetId) {
            continue;
        }

        for (const graphEdge of incidentEdges) {
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
    const { threshold = DEFAULT_THRESHOLD } = options ?? {};

    const candidates: NodeCandidate[] = [];
    for (const graphNode of graph.nodes) {
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

export { createGraph, createNode, createEdge, createProperty } from "./utils.js";
export * from "./types.js";

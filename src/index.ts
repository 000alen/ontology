import { cosineSimilarity } from "ai";
import { Edge, EdgeCandidate, EdgeId, Graph, Node, NodeCandidate, NodeId } from "./types.js";
import { cartesianProduct, take } from "./iter.js";

const DEFAULT_N = 10;
const DEFAULT_THRESHOLD = 0.5;

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

function* similarNodes(graph: Graph, query: Graph, options?: { n: number; threshold: number; }): Generator<NodeCandidate[]> {
    if (graph.nodes.length === 0) {
        throw new Error("Graph has no nodes");
    }

    if (query.nodes.length === 0) {
        throw new Error("Query has no nodes");
    }

    const { n = 10, threshold = 0.5 } = options ?? {};

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

        candidates_ij.push(candidates_i.sort((a, b) => b.similarity - a.similarity));
    }

    yield* take(cartesianProduct(candidates_ij), n);
}

function* iterateEdges(graph: Graph, subset: NodeId[], options?: { n: number; }): Generator<Edge> {
    if (subset.length === 0) {
        throw new Error("Subset has no nodes");
    }

    const { n = 10 } = options ?? {};

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

function* similarEdges(graph: Graph, query: Graph, nodeCandidates: NodeCandidate[], options?: { n: number; threshold: number; }): Generator<EdgeCandidate[]> {
    const { n = 10, threshold = 0.5 } = options ?? {};

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

        candidates_ij.push(candidates_i.sort((a, b) => b.similarity - a.similarity));
    }

    yield* take(cartesianProduct(candidates_ij), n);
}

// iterates of all the possible candidates for the query graph
// if graph has nodes {a, b, c, d} and query has nodes {p, q}
// iterates like {{a, b}, {c, d}} assuming that a and c are similar (descending in similarity) to p, and b and d are similar to q
function* similarSubGraphs(graph: Graph, query: Graph, options?: { n: number; threshold: number; }): Generator<Graph> {
    const nodeLookup = new Map<NodeId, Node>(
        graph.nodes.map((node) => [node.id, node])
    );

    const edgeLookup = new Map<EdgeId, Edge>(
        graph.edges.map((edge) => [edge.id, edge])
    );

    for (const nodeCandidates of similarNodes(graph, query, options)) {
        for (const edgeCandidates of similarEdges(graph, query, nodeCandidates, options)) {
            const subGraph: Graph = {
                id: `graph_${Math.random().toString(36).substring(2, 15)}`,
                nodes: nodeCandidates.map((candidate) => nodeLookup.get(candidate.candidateId)!),
                edges: edgeCandidates.map((candidate) => edgeLookup.get(candidate.candidateId)!),
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

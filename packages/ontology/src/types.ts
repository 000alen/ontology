import { EmbeddingModel } from "ai";

/**
 * Represents a vector embedding as an array of floating-point numbers.
 * 
 * Vector embeddings are numerical representations of semantic meaning that enable
 * similarity calculations between different entities in the ontology. Each number
 * in the array represents a dimension in the embedding space.
 * 
 * @example
 * ```typescript
 * const embedding: Embedding = [0.1, -0.5, 0.8, 0.2, -0.3];
 * ```
 */
export type Embedding = number[];

/**
 * Represents a unique graph identifier in the ontology system.
 * 
 * Graph IDs follow a specific naming convention with the prefix "graph_" followed
 * by a unique string identifier. This ensures type safety and prevents confusion
 * with other identifier types.
 * 
 * @example
 * ```typescript
 * const graphId: GraphId = "graph_my_ontology";
 * ```
 */
export type GraphId = `graph_${string}`;

/**
 * Represents a unique node identifier in the ontology system.
 * 
 * Node IDs follow a specific naming convention with the prefix "node_" followed
 * by a unique string identifier. Each node in a graph must have a unique ID.
 * 
 * @example
 * ```typescript
 * const nodeId: NodeId = "node_person_entity";
 * ```
 */
export type NodeId = `node_${string}`;

/**
 * Represents a unique edge identifier in the ontology system.
 * 
 * Edge IDs follow a specific naming convention with the prefix "edge_" followed
 * by a unique string identifier. Each edge connecting nodes must have a unique ID.
 * 
 * @example
 * ```typescript
 * const edgeId: EdgeId = "edge_works_for";
 * ```
 */
export type EdgeId = `edge_${string}`;

/**
 * Represents a unique property identifier in the ontology system.
 * 
 * Property IDs follow a specific naming convention with the prefix "property_" followed
 * by a unique string identifier. Properties can be attached to nodes, edges, or graphs.
 * 
 * @example
 * ```typescript
 * const propertyId: PropertyId = "property_age";
 * ```
 */
export type PropertyId = `property_${string}`;

/**
 * Represents an object that may require asynchronous initialization.
 * 
 * This type extends any object with an optional `ready` promise that resolves
 * when the object has finished its asynchronous initialization process. This is
 * useful for objects that need to load embeddings, fetch data, or perform other
 * async operations before being fully usable.
 * 
 * @template T - The base type of the object
 * 
 * @example
 * ```typescript
 * const asyncNode: AsyncObject<Node> = {
 *   id: "node_1",
 *   name: "Person",
 *   ready: Promise.resolve() // resolves when node is fully loaded
 * };
 * ```
 */
export type AsyncObject<T> = T & {
    /** Promise that resolves when the object is ready for use */
    ready?: Promise<void>;
};

/**
 * Represents a property in the ontology system.
 * 
 * Properties are key-value pairs that can be attached to nodes, edges, or graphs.
 * They can have semantic embeddings for similarity calculations and are designed
 * to support asynchronous loading of embeddings.
 * 
 * @example
 * ```typescript
 * const property: Property = {
 *   id: "property_age",
 *   name: "Age",
 *   description: "The age of a person in years",
 *   embedding: [0.1, 0.2, 0.3],
 * };
 * ```
 */
export type Property = AsyncObject<{
    /** Unique identifier for the property */
    id: PropertyId;
    /** Human-readable name of the property */
    name: string;
    /** Detailed description of what the property represents */
    description: string;
    /** Vector embedding for semantic similarity calculations, null if not yet computed */
    embedding: Embedding | null;
}>;

/**
 * Represents a node in the ontology graph.
 * 
 * Nodes are the fundamental entities in the ontology that represent concepts,
 * objects, or entities. Each node can have multiple properties and is connected
 * to other nodes through edges. Nodes support semantic embeddings for similarity
 * calculations and can be asynchronously initialized.
 * 
 * @example
 * ```typescript
 * const node: Node = {
 *   id: "node_person",
 *   name: "Person",
 *   description: "A human being",
 *   embedding: [0.1, 0.2, 0.3, 0.4],
 *   properties: [ageProperty, nameProperty],
 * };
 * ```
 */
export type Node = AsyncObject<{
    /** Unique identifier for the node */
    id: NodeId;
    /** Human-readable name of the node */
    name: string;
    /** Detailed description of what the node represents */
    description: string;
    /** Vector embedding for semantic similarity calculations, null if not yet computed */
    embedding: Embedding | null;
    /** Array of properties associated with this node */
    properties: Property[];
}>;

/**
 * Represents an edge connecting two nodes in the ontology graph.
 * 
 * Edges represent relationships between nodes and can have their own properties
 * and semantic embeddings. Each edge has a source and target node, and supports
 * asynchronous initialization for loading embeddings.
 * 
 * @example
 * ```typescript
 * const edge: Edge = {
 *   id: "edge_works_for",
 *   name: "Works For",
 *   description: "Employment relationship between a person and an organization",
 *   embedding: [0.1, 0.2, 0.3],
 *   sourceId: "node_person",
 *   targetId: "node_company",
 *   properties: [startDateProperty, salaryProperty],
 *   ready: Promise.resolve()
 * };
 * ```
 */
export type Edge = AsyncObject<{
    /** Unique identifier for the edge */
    id: EdgeId;
    /** Human-readable name of the edge/relationship */
    name: string;
    /** Detailed description of what the edge represents */
    description: string;
    /** Vector embedding for semantic similarity calculations, null if not yet computed */
    embedding: Embedding | null;
    /** ID of the source node */
    sourceId: NodeId;
    /** ID of the target node */
    targetId: NodeId;
    /** Array of properties associated with this edge */
    properties: Property[];
}>;

/**
 * Represents a complete ontology graph.
 * 
 * A graph contains a collection of nodes and edges that form a semantic network.
 * The graph supports asynchronous initialization and can be used for various
 * ontology operations like inference, similarity calculations, and graph traversal.
 * 
 * @example
 * ```typescript
 * const graph: Graph = {
 *   id: "graph_company_ontology",
 *   nodes: [personNode, companyNode, roleNode],
 *   edges: [worksForEdge, hasRoleEdge],
 * };
 * ```
 */
export type Graph = AsyncObject<{
    /** Unique identifier for the graph */
    id: GraphId;
    /** Array of all nodes in the graph */
    nodes: Node[];
    /** Array of all edges in the graph */
    edges: Edge[];
}>;

/**
 * Represents a candidate node for similarity matching.
 * 
 * Used in similarity search operations where a reference node is compared against
 * candidate nodes. The similarity score indicates how closely related the candidate
 * is to the reference node.
 * 
 * @example
 * ```typescript
 * const candidate: NodeCandidate = {
 *   referenceId: "node_person_1",
 *   candidateId: "node_person_2",
 *   similarity: 0.85
 * };
 * ```
 */
export type NodeCandidate = {
    /** ID of the reference node being compared */
    referenceId: NodeId;
    /** ID of the candidate node */
    candidateId: NodeId;
    /** Similarity score between 0 and 1, where 1 indicates perfect similarity */
    similarity: number;
}

/**
 * Represents a candidate edge for similarity matching.
 * 
 * Used in similarity search operations where a reference edge is compared against
 * candidate edges. The similarity score indicates how closely related the candidate
 * edge is to the reference edge.
 * 
 * @example
 * ```typescript
 * const candidate: EdgeCandidate = {
 *   referenceId: "edge_works_for_1",
 *   candidateId: "edge_works_for_2",
 *   similarity: 0.92
 * };
 * ```
 */
export type EdgeCandidate = {
    /** ID of the reference edge being compared */
    referenceId: EdgeId;
    /** ID of the candidate edge */
    candidateId: EdgeId;
    /** Similarity score between 0 and 1, where 1 indicates perfect similarity */
    similarity: number;
}

/**
 * Represents the execution context for ontology operations.
 * 
 * The context provides necessary dependencies and configuration for performing
 * operations on the ontology, such as the embedding model for semantic calculations.
 * 
 * @example
 * ```typescript
 * const context: Context = {
 *   embeddingModel: openai.embedding("text-embedding-3-small")
 * };
 * ```
 */
export interface Context {
    /** The embedding model used for generating vector embeddings */
    embeddingModel: EmbeddingModel<string>;
}

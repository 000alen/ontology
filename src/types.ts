import { EmbeddingModel } from "ai";

export type Embedding = number[];

export type GraphId = `graph_${string}`;

export type NodeId = `node_${string}`;

export type EdgeId = `edge_${string}`;

export type PropertyId = `property_${string}`;

export type Property = {
    id: PropertyId;
    name: string;
    description: string;

    embedding: Embedding;
};

export type Node = {
    id: NodeId;
    name: string;
    description: string;

    embedding: Embedding;

    properties: Property[];
};

export type Edge = {
    id: EdgeId;
    name: string;
    description: string;

    embedding: Embedding;

    sourceId: NodeId;
    targetId: NodeId;

    properties: Property[];
};

export type Graph = {
    id: GraphId;

    nodes: Node[];
    edges: Edge[];
};

export type NodeCandidate = {
    referenceId: NodeId;
    candidateId: NodeId;
    similarity: number;
}

export type EdgeCandidate = {
    referenceId: EdgeId;
    candidateId: EdgeId;
    similarity: number;
}

export interface Context {
    embeddingModel: EmbeddingModel<string>;
}

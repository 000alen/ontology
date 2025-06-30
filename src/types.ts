import { EmbeddingModel } from "ai";

export type Embedding = number[];

export type GraphId = `graph_${string}`;

export type NodeId = `node_${string}`;

export type EdgeId = `edge_${string}`;

export type PropertyId = `property_${string}`;

export type AsyncObject<T> = T & {
    ready?: Promise<void>;
};

export type Property = AsyncObject<{
    id: PropertyId;
    name: string;
    description: string;

    embedding: Embedding | null;
}>;

export type Node = AsyncObject<{
    id: NodeId;
    name: string;
    description: string;

    embedding: Embedding | null;

    properties: Property[];
}>;

export type Edge = AsyncObject<{
    id: EdgeId;
    name: string;
    description: string;

    embedding: Embedding | null;

    sourceId: NodeId;
    targetId: NodeId;

    properties: Property[];
}>;

export type Graph = AsyncObject<{
    id: GraphId;

    nodes: Node[];
    edges: Edge[];
}>;

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

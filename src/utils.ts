import { defaultContext } from "./context.js";
import { Edge, EdgeId, Graph, GraphId, Node, NodeId, Property, PropertyId } from "./types.js"
import { Context } from "./types.js"
import { embed } from "ai";

function getPropertyDescription(property: Omit<Property, "id" | "embedding">): string {
    return `${property.name}: ${property.description}`
}

function getNodeDescription(node: Omit<Node, "id" | "embedding">): string {
    return `${node.name}: ${node.description}\n${node.properties.map(getPropertyDescription).join("\n")}`
}

function getEdgeDescription(edge: Omit<Edge, "id" | "embedding">): string {
    return `${edge.name}: ${edge.description}\n${edge.properties.map(getPropertyDescription).join("\n")}`
}

export async function createProperty(id: string, data: Omit<Property, "id" | "embedding">, context?: Context): Promise<Property> {
    context ??= defaultContext;

    const embedding = await embed({
        model: context.embeddingModel,
        value: getPropertyDescription(data)
    })
        .then((result) => result.embedding)

    return {
        id: `property_${id}` satisfies PropertyId,
        ...data,
        embedding
    }
}

export async function createNode(id: string, data: Omit<Node, "id" | "embedding">, context?: Context): Promise<Node> {
    context ??= defaultContext;

    const embedding = await embed({
        model: context.embeddingModel,
        value: getNodeDescription(data)
    })
        .then((result) => result.embedding)

    return {
        id: `node_${id}` satisfies NodeId,
        ...data,
        embedding
    }
}

export async function createEdge(id: string, data: Omit<Edge, "id" | "embedding">, context?: Context): Promise<Edge> {
    context ??= defaultContext;

    const embedding = await embed({
        model: context.embeddingModel,
        value: getEdgeDescription(data)
    })
        .then((result) => result.embedding)

    return {
        id: `edge_${id}` satisfies EdgeId,
        ...data,
        embedding
    }
}

export function createGraph(id: string, data: Omit<Graph, "id" | "embedding">, context?: Context): Graph {
    context ??= defaultContext;

    return {
        id: `graph_${id}` satisfies GraphId,
        ...data
    }
}

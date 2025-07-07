import { defaultContext } from "./context.js";
import { log } from "./logging.js";
import { Edge, EdgeId, Graph, GraphId, Node, NodeId, Property, PropertyId } from "./types.js"
import { Context } from "./types.js"
import { embed } from "ai";

function getPropertyDescription(property: Omit<Property, "id" | "embedding">): string {
    return `${property.name}: ${property.description}`
}

function getNodeDescription(node: Omit<Node, "id" | "embedding" | "meta">): string {
    return `${node.name}: ${node.description}\n${node.properties.map(getPropertyDescription).join("\n")}`
}

function getEdgeDescription(edge: Omit<Edge, "id" | "embedding">): string {
    return `${edge.name}: ${edge.description}\n${edge.properties.map(getPropertyDescription).join("\n")}`
}

export function createProperty(id: string, data: Omit<Property, "id" | "embedding">, context?: Context): Property {
    context ??= defaultContext;

    const ready = async function (this: Property) {
        this.embedding = await embed({
            model: context.embeddingModel,
            value: getPropertyDescription(data)
        })
            .then((result) => result.embedding)
    }

    const randomId = Math.random().toString(36).substring(2, 8);
    const property = {
        id: `property_${id}_${randomId}` satisfies PropertyId,
        ...data,
        embedding: null
    } satisfies Property;

    property.ready = ready.call(property)

    return property;
}

export function createNode(id: string, data: Omit<Node, "id" | "embedding" | "meta">, context?: Context): Node {
    context ??= defaultContext;

    const ready = async function (this: Node) {
        await Promise
            .all(this.properties.filter((p) => !!p.ready).map((p) => p))
            .catch((error) => {
                log(error)
            })

        this.embedding = await embed({
            model: context.embeddingModel,
            value: getNodeDescription(data)
        })
            .then((result) => result.embedding)
    }

    const randomId = Math.random().toString(36).substring(2, 8);
    const node = {
        id: `node_${id}_${randomId}` satisfies NodeId,
        ...data,
        meta: {},
        embedding: null,
    } satisfies Node;

    node.ready = ready.call(node);

    return node;
}

// ! NOTE(@000alen): maybe the edge embedding should also contain a representation of the source and target nodes
export function createEdge(id: string, data: Omit<Edge, "id" | "embedding">, context?: Context): Edge {
    context ??= defaultContext;

    const ready = async function (this: Edge) {
        await Promise
            .all(this.properties.filter((p) => !!p.ready).map((p) => p))
            .catch((error) => {
                log(error)
            })

        this.embedding = await embed({
            model: context.embeddingModel,
            value: getEdgeDescription(data)
        })
            .then((result) => result.embedding)
    }

    const randomId = Math.random().toString(36).substring(2, 8);
    const edge = {
        id: `edge_${id}_${randomId}` satisfies EdgeId,
        ...data,
        embedding: null
    } satisfies Edge;

    edge.ready = ready.call(edge);

    return edge;
}

export function createGraph(id: string, data: Omit<Graph, "id" | "embedding">, context?: Context): Graph {
    context ??= defaultContext;

    const ready = async function (this: Graph) {
        const promises = [
            ...this.nodes.filter((n) => !!n.ready).map((n) => n.ready),
            ...this.edges.filter((e) => !!e.ready).map((e) => e.ready),
        ]

        await Promise
            .all(promises)
            .catch((error) => {
                log(error)
            })
    }

    const randomId = Math.random().toString(36).substring(2, 8);
    const graph = {
        id: `graph_${id}_${randomId}` satisfies GraphId,
        ...data
    } satisfies Graph;

    graph.ready = ready.call(graph);

    return graph;
}

import "dotenv/config";

import { z } from "zod";
import { generateText, generateObject, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import {
    a,
    createEdge,
    createGraph,
    createProperty,
    match,
} from "ontology";
import { plot } from "ontology-plot";

const nodeSchema = z.object({
    id: z.string().describe("The identifier of the entity"),
    name: z.string().describe("The name of the entity"),
    description: z.string().describe("A description of the entity"),
    references: z
        .string()
        .array()
        .describe("The identifiers of the entities it references"),
});

const graphSchema = z.object({
    nodes: nodeSchema.array(),
});

const model = openai("o4-mini");

async function getOntologyGraph() {
    const [organizationEntity, userEntity, membershipEntity] = await Promise.all([
        a("organization", {
            name: "Organization",
            description: "An organization is a group of users",
            properties: [],
        }),
        a("user", {
            name: "User",
            description: "A user is a person",
            properties: [],
        }),
        a("membership", {
            name: "Membership",
            description: "A membership is a relationship between an organization and a user",
            properties: [],
        }),
    ]);

    const [organizationMembership, userMembership] = await Promise.all([
        createEdge("membership", {
            name: "Organization Membership",
            description: "A membership is a relationship between an organization and a user",
            sourceId: organizationEntity.id,
            targetId: membershipEntity.id,
            properties: [],
        }),
        createEdge("membership", {
            name: "User Membership",
            description: "A membership is a relationship between an organization and a user",
            sourceId: userEntity.id,
            targetId: membershipEntity.id,
            properties: [],
        }),
    ]);

    return createGraph("ontology", {
        nodes: [organizationEntity, userEntity, membershipEntity],
        edges: [organizationMembership, userMembership],
    });
}

async function main() {
    const ontologyGraph = await getOntologyGraph();
    // plot(ontologyGraph);

    let graph;

    graph = await generateObject({
        model,
        prompt: `Generate a basic schema for a social media app`,
        schema: graphSchema
    })
        .then(result => result.object);

    await generateText({
        model,
        // prompt: `Add support for multi-tenancy with organizations. \`\`\`json\n${JSON.stringify(graph, null, 2)}\n\`\`\``,
        prompt: `What things could we add to the graph regarding the users? \`\`\`json\n${JSON.stringify(graph, null, 2)}\n\`\`\``,

        maxSteps: 10,

        onStepFinish: (step) => {
            console.log("step", step.text);
        },

        tools: {
            query: tool({
                description: "Query the graph",
                parameters: z.object({
                    nodes: z.object({
                        name: z.string().describe("The name of the node"),
                        description: z.string().describe("The description of the node"),
                    })
                        .array()
                        .describe("The nodes to query. Should include only the relevant subgraph."),
                }),
                execute: async ({ nodes }) => {
                    console.log("query", { nodes });
                },
            }),
            // apply: tool({
            //     description: "Apply a change to the graph",
            //     parameters: z.object({
            //         change: z.string().describe("The change to apply"),
            //     }),
            //     execute: async ({ change }) => {
            //         console.log(change);
            //     },
            // })
        },
    })

    console.log(graph);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

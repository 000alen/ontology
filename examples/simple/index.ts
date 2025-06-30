import "dotenv/config";
import {
    createNode,
    createEdge,
    createGraph,
    createProperty,
    match,
} from "ontology";
import { createInstance } from "ontology-plot";

async function main() {
    const ageProperty = createProperty("age", {
        name: "age",
        description: "The age of the person in years"
    });

    const salaryProperty = createProperty("salary", {
        name: "salary",
        description: "Annual salary in USD"
    });

    const typeProperty = createProperty("type", {
        name: "type",
        description: "The type or category of the entity"
    });

    console.log("✅ Created properties:", [
        ageProperty.name,
        salaryProperty.name,
        typeProperty.name
    ]);

    const person1 = createNode("john_doe", {
        name: "John Doe",
        description: "A software engineer who works at a tech company, passionate about machine learning and AI",
        properties: [ageProperty, salaryProperty]
    });

    const person2 = createNode("jane_smith", {
        name: "Jane Smith",
        description: "A senior data scientist specializing in natural language processing and deep learning",
        properties: [ageProperty, salaryProperty]
    });

    const company = createNode("tech_corp", {
        name: "Tech Corp",
        description: "A leading technology company focused on artificial intelligence and machine learning solutions",
        properties: [typeProperty]
    });

    console.log("✅ Created nodes:", [person1.name, person2.name, company.name]);

    const worksAtEdge1 = createEdge("john_works_at", {
        name: "works_at",
        description: "Employment relationship indicating where a person works",
        sourceId: person1.id,
        targetId: company.id,
        properties: []
    });

    const worksAtEdge2 = createEdge("jane_works_at", {
        name: "works_at",
        description: "Employment relationship indicating where a person works",
        sourceId: person2.id,
        targetId: company.id,
        properties: []
    });

    const colleagueEdge = createEdge("colleagues", {
        name: "colleague_of",
        description: "Professional relationship between coworkers",
        sourceId: person1.id,
        targetId: person2.id,
        properties: []
    });

    console.log("✅ Created edges:", [worksAtEdge1.name, worksAtEdge2.name, colleagueEdge.name]);

    const mainGraph = createGraph("main_company_graph", {
        nodes: [person1, person2, company],
        edges: [worksAtEdge1, worksAtEdge2, colleagueEdge]
    });

    await mainGraph.ready;

    console.log("✅ Created main graph with", mainGraph.nodes.length, "nodes and", mainGraph.edges.length, "edges");

    const queryPerson = createNode("query_person", {
        name: "Query Person",
        description: "A software developer working on AI and machine learning projects",
        properties: [ageProperty]
    });

    const queryCompany = createNode("query_company", {
        name: "Query Company",
        description: "A technology company working on artificial intelligence solutions",
        properties: [typeProperty]
    });

    const queryEdge = createEdge("query_works_at", {
        name: "works_at",
        description: "Employment relationship at a tech company",
        sourceId: queryPerson.id,
        targetId: queryCompany.id,
        properties: []
    });

    const queryGraph = createGraph("query_graph", {
        nodes: [queryPerson, queryCompany],
        edges: [queryEdge]
    });

    await queryGraph.ready;

    console.log("✅ Created query graph with", queryGraph.nodes.length, "nodes and", queryGraph.edges.length, "edges");

    const bestMatch = match(mainGraph, queryGraph)

    if (bestMatch) {
        console.log("✅ Found best matching subgraph:");
        console.log("  - Matched nodes:", bestMatch.nodes.map(n => n.name).join(", "));
        console.log("  - Matched edges:", bestMatch.edges.map(e => e.name).join(", "));
    } else {
        console.log("❌ No matching subgraph found");
    }

    if (process.env["DEBUG"] === "1") {
        const instance = createInstance({ port: 3000, autoOpen: true });
        instance.plot(mainGraph);
        instance.plot(queryGraph);
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

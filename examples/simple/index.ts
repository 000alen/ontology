import "dotenv/config";
import {
    createNode,
    createEdge,
    createGraph,
    createProperty,
    match,
} from "ontology";
import { createInstance } from "ontology-plot";

async function createSimpleExample() {
    const [ageProperty, salaryProperty, typeProperty] = await Promise.all([
        createProperty("age", {
            name: "age",
            description: "The age of the person in years"
        }),
        createProperty("salary", {
            name: "salary",
            description: "Annual salary in USD"
        }),
        createProperty("type", {
            name: "type",
            description: "The type or category of the entity"
        })
    ]);

    console.log("✅ Created properties:", [ageProperty.name, salaryProperty.name, typeProperty.name]);

    const [person1, person2, company] = await Promise.all([
        createNode("john_doe", {
            name: "John Doe",
            description: "A software engineer who works at a tech company, passionate about machine learning and AI",
            properties: [ageProperty, salaryProperty]
        }),
        createNode("jane_smith", {
            name: "Jane Smith",
            description: "A senior data scientist specializing in natural language processing and deep learning",
            properties: [ageProperty, salaryProperty]
        }),
        createNode("tech_corp", {
            name: "Tech Corp",
            description: "A leading technology company focused on artificial intelligence and machine learning solutions",
            properties: [typeProperty]
        })
    ]);

    console.log("✅ Created nodes:", [person1.name, person2.name, company.name]);

    const [worksAtEdge1, worksAtEdge2, colleagueEdge] = await Promise.all([
        createEdge("john_works_at", {
            name: "works_at",
            description: "Employment relationship indicating where a person works",
            sourceId: person1.id,
            targetId: company.id,
            properties: []
        }),
        createEdge("jane_works_at", {
            name: "works_at",
            description: "Employment relationship indicating where a person works",
            sourceId: person2.id,
            targetId: company.id,
            properties: []
        }),
        createEdge("colleagues", {
            name: "colleague_of",
            description: "Professional relationship between coworkers",
            sourceId: person1.id,
            targetId: person2.id,
            properties: []
        })
    ]);

    console.log("✅ Created edges:", [worksAtEdge1.name, worksAtEdge2.name, colleagueEdge.name]);

    const mainGraph = createGraph("main_company_graph", {
        nodes: [person1, person2, company],
        edges: [worksAtEdge1, worksAtEdge2, colleagueEdge]
    });

    console.log("✅ Created main graph with", mainGraph.nodes.length, "nodes and", mainGraph.edges.length, "edges");

    const [queryPerson, queryCompany] = await Promise.all([
        createNode("query_person", {
            name: "Query Person",
            description: "A software developer working on AI and machine learning projects",
            properties: [ageProperty]
        }),
        createNode("query_company", {
            name: "Query Company",
            description: "A technology company working on artificial intelligence solutions",
            properties: [typeProperty]
        })
    ]);

    const queryEdge = await createEdge("query_works_at", {
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

    console.log("✅ Created query graph with", queryGraph.nodes.length, "nodes and", queryGraph.edges.length, "edges");

    try {
        const bestMatch = match(mainGraph, queryGraph);

        if (bestMatch) {
            console.log("✅ Found best matching subgraph:");
            console.log("  - Matched nodes:", bestMatch.nodes.map(n => n.name).join(", "));
            console.log("  - Matched edges:", bestMatch.edges.map(e => e.name).join(", "));
        } else {
            console.log("❌ No matching subgraph found");
        }
    } catch (error) {
        console.error("Error during similarity matching:", error);
    }

    const instance = createInstance({ port: 3000, autoOpen: true });

    instance.plot(mainGraph);
    instance.plot(queryGraph);

    return {
        mainGraph,
        queryGraph,
        plotInstance: instance,
        nodes: [person1, person2, company],
        edges: [worksAtEdge1, worksAtEdge2, colleagueEdge],
        properties: [ageProperty, salaryProperty, typeProperty]
    };
}

createSimpleExample()
    .then((result) => {
        console.log("\n📋 Summary:");
        console.log(`Created ${result.nodes.length} nodes, ${result.edges.length} edges, and ${result.properties.length} properties`);
    })
    .catch((error) => {
        console.error("Example failed:", error);
        process.exit(1);
    });

import "dotenv/config";
import {
    createNode,
    createEdge,
    createGraph,
    createProperty,
    match,
    similarSubGraphs
} from "../../src/index.js";

async function createSimpleExample() {
    console.log("🚀 Creating a simple ontology example using node creation utilities\n");

    // Create properties for our nodes
    console.log("📋 Creating properties...");

    const ageProperty = await createProperty("age", {
        name: "age",
        description: "The age of the person in years"
    });

    const salaryProperty = await createProperty("salary", {
        name: "salary",
        description: "Annual salary in USD"
    });

    const typeProperty = await createProperty("type", {
        name: "type",
        description: "The type or category of the entity"
    });

    console.log("✅ Created properties:", [ageProperty.name, salaryProperty.name, typeProperty.name]);

    // Create nodes using the utility functions
    console.log("\n👤 Creating nodes...");

    const person1 = await createNode("john_doe", {
        name: "John Doe",
        description: "A software engineer who works at a tech company, passionate about machine learning and AI",
        properties: [ageProperty, salaryProperty]
    });

    const person2 = await createNode("jane_smith", {
        name: "Jane Smith",
        description: "A senior data scientist specializing in natural language processing and deep learning",
        properties: [ageProperty, salaryProperty]
    });

    const company = await createNode("tech_corp", {
        name: "Tech Corp",
        description: "A leading technology company focused on artificial intelligence and machine learning solutions",
        properties: [typeProperty]
    });

    console.log("✅ Created nodes:", [person1.name, person2.name, company.name]);

    // Create edges between nodes
    console.log("\n🔗 Creating edges...");

    const worksAtEdge1 = await createEdge("john_works_at", {
        name: "works_at",
        description: "Employment relationship indicating where a person works",
        sourceId: person1.id,
        targetId: company.id,
        properties: []
    });

    const worksAtEdge2 = await createEdge("jane_works_at", {
        name: "works_at",
        description: "Employment relationship indicating where a person works",
        sourceId: person2.id,
        targetId: company.id,
        properties: []
    });

    const colleagueEdge = await createEdge("colleagues", {
        name: "colleague_of",
        description: "Professional relationship between coworkers",
        sourceId: person1.id,
        targetId: person2.id,
        properties: []
    });

    console.log("✅ Created edges:", [worksAtEdge1.name, worksAtEdge2.name, colleagueEdge.name]);

    // Create the main graph
    console.log("\n📊 Creating main graph...");

    const mainGraph = createGraph("main_company_graph", {
        nodes: [person1, person2, company],
        edges: [worksAtEdge1, worksAtEdge2, colleagueEdge]
    });

    console.log("✅ Created main graph with", mainGraph.nodes.length, "nodes and", mainGraph.edges.length, "edges");

    // Create a query graph to search for similar patterns
    console.log("\n🔍 Creating query graph for similarity search...");

    const queryPerson = await createNode("query_person", {
        name: "Query Person",
        description: "A software developer working on AI and machine learning projects",
        properties: [ageProperty]
    });

    const queryCompany = await createNode("query_company", {
        name: "Query Company",
        description: "A technology company working on artificial intelligence solutions",
        properties: [typeProperty]
    });

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

    // Demonstrate similarity matching
    console.log("\n🎯 Finding similar subgraphs...");

    try {
        const bestMatch = match(mainGraph, queryGraph);

        if (bestMatch) {
            console.log("✅ Found best matching subgraph:");
            console.log("  - Matched nodes:", bestMatch.nodes.map(n => n.name).join(", "));
            console.log("  - Matched edges:", bestMatch.edges.map(e => e.name).join(", "));
        } else {
            console.log("❌ No matching subgraph found");
        }

        // Show multiple similar subgraphs
        console.log("\n📈 Finding top similar subgraphs...");
        let count = 0;
        for (const similarGraph of similarSubGraphs(mainGraph, queryGraph, { n: 3, threshold: 0.7 })) {
            count++;
            console.log(`  Match ${count}:`);
            console.log(`    - Nodes: ${similarGraph.nodes.map(n => n.name).join(", ")}`);
            console.log(`    - Edges: ${similarGraph.edges.map(e => e.name).join(", ")}`);

            if (count >= 3) break; // Limit output for demo
        }

    } catch (error) {
        console.error("Error during similarity matching:", error);
    }

    console.log("\n🎉 Example completed successfully!");

    return {
        mainGraph,
        queryGraph,
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

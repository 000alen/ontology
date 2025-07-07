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

    // Create first graph - Social Network
    const alice = createNode("alice", {
        name: "Alice",
        description: "Software Engineer",
        properties: []
    });

    const bob = createNode("bob", {
        name: "Bob",
        description: "Data Scientist",
        properties: []
    });

    const charlie = createNode("charlie", {
        name: "Charlie",
        description: "Product Manager",
        properties: []
    });

    const socialGraph = createGraph("social_network", {
        nodes: [alice, bob, charlie],
        edges: [
            createEdge("knows1", {
                name: "knows",
                description: "Knows relationship",
                sourceId: alice.id,
                targetId: bob.id,
                properties: []
            }),
            createEdge("knows2", {
                name: "knows",
                description: "Knows relationship",
                sourceId: bob.id,
                targetId: charlie.id,
                properties: []
            })
        ]
    });

    // Create second graph - Technical Skills
    const typescript = createNode("typescript", {
        name: "TypeScript",
        description: "Programming Language",
        properties: []
    });

    const python = createNode("python", {
        name: "Python",
        description: "Programming Language",
        properties: []
    });

    const ml = createNode("ml", {
        name: "Machine Learning",
        description: "Technical Skill",
        properties: []
    });

    const skillsGraph = createGraph("technical_skills", {
        nodes: [typescript, python, ml],
        edges: [
            createEdge("uses1", {
                name: "uses",
                description: "Uses technology",
                sourceId: alice.id,
                targetId: typescript.id,
                properties: []
            }),
            createEdge("uses2", {
                name: "uses",
                description: "Uses technology",
                sourceId: bob.id,
                targetId: python.id,
                properties: []
            }),
            createEdge("uses3", {
                name: "uses",
                description: "Uses technology",
                sourceId: bob.id,
                targetId: ml.id,
                properties: []
            })
        ]
    });

    // Create third graph - Project Collaboration
    const projectA = createNode("project_a", {
        name: "Project Alpha",
        description: "Web Application",
        properties: []
    });

    const projectB = createNode("project_b", {
        name: "Project Beta",
        description: "ML Pipeline",
        properties: []
    });

    const collaborationGraph = createGraph("project_collaboration", {
        nodes: [projectA, projectB],
        edges: [
            createEdge("works_on1", {
                name: "works on",
                description: "Works on project",
                sourceId: alice.id,
                targetId: projectA.id,
                properties: []
            }),
            createEdge("works_on2", {
                name: "works on",
                description: "Works on project",
                sourceId: bob.id,
                targetId: projectB.id,
                properties: []
            }),
            createEdge("works_on3", {
                name: "works on",
                description: "Works on project",
                sourceId: charlie.id,
                targetId: projectA.id,
                properties: []
            })
        ]
    });

    await socialGraph.ready;,
    await skillsGraph.ready;
    await collaborationGraph.ready;

    // Create visualization instance
    const instance = createInstance();

    // Approach 1: Simple plotting (creates default axis automatically)
    console.log("📊 Using simple approach - creating default axis");
    instance.plot(socialGraph);

    // Approach 2: Explicit axis creation for better organization
    console.log("📊 Using explicit axis approach - creating named axes");
    const technicalAxis = instance.createAxis();

    const projectAxis = instance.createAxis();

    // Plot graphs on their respective axes
    technicalAxis.plot(skillsGraph);
    projectAxis.plot(collaborationGraph);

    console.log("🎨 Axis-based visualization started!");
    console.log("📊 View all axes simultaneously at http://localhost:3000");
    console.log("🔄 Each axis has a different color and title for easy identification");
    console.log("📈 The first graph uses the simple approach (default axis)");
    console.log("📈 The other graphs use explicit axes for better organization");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

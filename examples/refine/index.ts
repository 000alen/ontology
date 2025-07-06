import "dotenv/config";

import {
    createEdge,
    createGraph,
    createNode,
    merge
} from "ontology";
import { plot } from "ontology-plot";

async function getOntology() {
    const organizationEntity = createNode("organization", {
        name: "Organization",
        description: "An organization",
        properties: []
    });

    const userEntity = createNode("user", {
        name: "User",
        description: "A user",
        properties: []
    });

    const membershipEntity = createNode("membership", {
        name: "Membership",
        description: "",
        properties: []
    });

    const organizationMembershipEdge = createEdge("organization_membership", {
        name: "Organization Membership",
        description: "A membership of an organization",
        properties: [],
        sourceId: organizationEntity.id,
        targetId: membershipEntity.id,
    });

    const userMembershipEdge = createEdge("user_membership", {
        name: "User Membership",
        description: "A user",
        properties: [],
        sourceId: userEntity.id,
        targetId: membershipEntity.id,
    });

    const o = createGraph("o", {
        nodes: [organizationEntity, userEntity, membershipEntity],
        edges: [organizationMembershipEdge, userMembershipEdge]
    });

    await o.ready;

    return o;
}

async function main() {
    const o = await getOntology();

    // const nameProperty = createProperty("name", {
    //     name: "name",
    //     description: "The name of the user",
    // });

    // const emailProperty = createProperty("email", {
    //     name: "email",
    //     description: "The email of the user",
    // });

    // const passwordProperty = createProperty("password", {
    //     name: "password",
    //     description: "The password of the user",
    // });

    const userEntity = createNode("user", {
        name: "User",
        description: "A user",
        properties: [
            // nameProperty,
            // emailProperty,
            // passwordProperty,
        ]
    });

    const postEntity = createNode("post", {
        name: "Post",
        description: "A post",
        properties: []
    });

    const userPostEdge = createEdge("user_post", {
        name: "User Post",
        description: "A post",
        properties: [],
        sourceId: userEntity.id,
        targetId: postEntity.id,
    });

    const schemaGraph = createGraph("schema", {
        nodes: [userEntity, postEntity],
        edges: [userPostEdge]
    });

    await schemaGraph.ready;

    const refined = merge(schemaGraph, o);


    // plot(schemaGraph)

    plot(o, schemaGraph);
    // plot(refined);

    console.log(refined);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

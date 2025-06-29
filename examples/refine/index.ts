import "dotenv/config";

import {
    createEdge,
    createGraph,
    createNode,
    createProperty,
    merge
} from "ontology";
import { plot } from "ontology-plot";

async function main() {
    const [oOrganizationEntity, oUserEntity, oMembershipEntity] = await Promise.all([
        createNode("organization", {
            name: "Organization",
            description: "An organization of the application",
            properties: []
        }),
        createNode("user", {
            name: "User",
            description: "A user of the application",
            properties: []
        }),
        createNode("membership", {
            name: "Membership",
            description: "A membership of an organization",
            properties: []
        }),
    ]);

    const [oOrganizationMembershipEdge, oUserMembershipEdge] = await Promise.all([
        createEdge("organization_membership", {
            name: "Organization Membership",
            description: "A membership of an organization",
            properties: [],
            sourceId: oOrganizationEntity.id,
            targetId: oMembershipEntity.id,
        }),
        createEdge("user_membership", {
            name: "User Membership",
            description: "A membership of a user",
            properties: [],
            sourceId: oUserEntity.id,
            targetId: oMembershipEntity.id,
        }),
    ]);

    const o = createGraph("o", {
        nodes: [oOrganizationEntity, oUserEntity, oMembershipEntity],
        edges: [oOrganizationMembershipEdge, oUserMembershipEdge]
    });

    plot(o);

    const [nameProperty, emailProperty, passwordProperty] = await Promise.all([
        createProperty("name", {
            name: "name",
            description: "The name of the user",
        }),
        createProperty("email", {
            name: "email",
            description: "The email of the user",
        }),
        createProperty("password", {
            name: "password",
            description: "The password of the user",
        }),
    ]);

    const userEntity = await createNode("user", {
        name: "User",
        description: "A user of the system",
        properties: [
            nameProperty,
            emailProperty,
            passwordProperty,
        ]
    });

    const schema = createGraph("schema", {
        nodes: [userEntity],
        edges: []
    });

    plot(schema);

    const refined = merge(schema, o);

    plot(refined);

    console.log(refined);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

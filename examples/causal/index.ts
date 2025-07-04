import "dotenv/config";
import {
    createNode,
    createEdge,
    createGraph,
    incident,
} from "ontology";
import { createInstance } from "ontology-plot";

/**
 * Environmental Causal Analysis Example
 * 
 * This example demonstrates how the `incident` function can be used to analyze
 * causal pathways in complex systems. We model an environmental system where
 * various factors influence each other, and we want to understand how certain
 * human activities (sources) affect specific environmental outcomes (targets).
 */

async function main() {
    console.log('🌍 Environmental Causal Analysis');
    console.log('=================================\n');

    // Create nodes representing environmental variables
    console.log('📋 Creating environmental variables...');

    // Human activities (potential sources)
    const industrialEmissions = createNode('industrial_emissions', {
        name: 'Industrial Emissions',
        description: 'Greenhouse gas and pollutant emissions from industrial activities including manufacturing, energy production, and chemical processes',
        properties: []
    });

    const deforestation = createNode('deforestation', {
        name: 'Deforestation',
        description: 'Large-scale removal of forests for agriculture, urban development, and resource extraction',
        properties: []
    });

    const agriculturalRunoff = createNode('agricultural_runoff', {
        name: 'Agricultural Runoff',
        description: 'Contaminated water from farms containing pesticides, fertilizers, and animal waste',
        properties: []
    });

    const urbanDevelopment = createNode('urban_development', {
        name: 'Urban Development',
        description: 'Expansion of cities and infrastructure including roads, buildings, and transportation networks',
        properties: []
    });

    // Intermediate environmental factors
    const atmosphericCO2 = createNode('atmospheric_co2', {
        name: 'Atmospheric CO2',
        description: 'Concentration of carbon dioxide in the atmosphere contributing to greenhouse effect',
        properties: []
    });

    const soilDegradation = createNode('soil_degradation', {
        name: 'Soil Degradation',
        description: 'Loss of soil fertility, structure, and organic matter due to erosion and contamination',
        properties: []
    });

    const waterPollution = createNode('water_pollution', {
        name: 'Water Pollution',
        description: 'Contamination of water bodies with chemicals, nutrients, and toxic substances',
        properties: []
    });

    const habitatLoss = createNode('habitat_loss', {
        name: 'Habitat Loss',
        description: 'Destruction and fragmentation of natural ecosystems reducing biodiversity',
        properties: []
    });

    const temperatureRise = createNode('temperature_rise', {
        name: 'Temperature Rise',
        description: 'Global warming leading to increased average temperatures worldwide',
        properties: []
    });

    const precipitationChange = createNode('precipitation_change', {
        name: 'Precipitation Change',
        description: 'Altered rainfall patterns including droughts and extreme weather events',
        properties: []
    });

    // Final outcomes (potential targets)
    const speciesExtinction = createNode('species_extinction', {
        name: 'Species Extinction',
        description: 'Permanent loss of plant and animal species leading to reduced biodiversity',
        properties: []
    });

    const cropYieldDecline = createNode('crop_yield_decline', {
        name: 'Crop Yield Decline',
        description: 'Reduced agricultural productivity threatening food security',
        properties: []
    });

    const waterScarcity = createNode('water_scarcity', {
        name: 'Water Scarcity',
        description: 'Insufficient clean water supply for human consumption and ecosystem needs',
        properties: []
    });

    const ecosystemCollapse = createNode('ecosystem_collapse', {
        name: 'Ecosystem Collapse',
        description: 'Complete breakdown of ecosystem functions and services',
        properties: []
    });

    // Additional factors for complexity
    const oceanAcidification = createNode('ocean_acidification', {
        name: 'Ocean Acidification',
        description: 'Decreasing pH of ocean water due to absorption of atmospheric CO2',
        properties: []
    });

    const airQualityDegradation = createNode('air_quality_degradation', {
        name: 'Air Quality Degradation',
        description: 'Increased air pollution affecting human health and ecosystem functioning',
        properties: []
    });

    const nodes = [
        industrialEmissions, deforestation, agriculturalRunoff, urbanDevelopment,
        atmosphericCO2, soilDegradation, waterPollution, habitatLoss,
        temperatureRise, precipitationChange, speciesExtinction, cropYieldDecline,
        waterScarcity, ecosystemCollapse, oceanAcidification, airQualityDegradation
    ];

    console.log(`✅ Created ${nodes.length} environmental variables`);

    // Create edges representing causal relationships
    console.log('🔗 Creating causal relationships...');

    const edges = [
        // Direct impacts from human activities
        createEdge('emit_co2', {
            name: 'Emits CO2',
            description: 'Industrial processes release carbon dioxide into the atmosphere',
            sourceId: industrialEmissions.id,
            targetId: atmosphericCO2.id,
            properties: []
        }),
        createEdge('emit_pollutants', {
            name: 'Emits Pollutants',
            description: 'Industrial activities release harmful chemicals and particles into the air',
            sourceId: industrialEmissions.id,
            targetId: airQualityDegradation.id,
            properties: []
        }),
        createEdge('clear_forests', {
            name: 'Clears Forests',
            description: 'Deforestation directly destroys wildlife habitats',
            sourceId: deforestation.id,
            targetId: habitatLoss.id,
            properties: []
        }),
        createEdge('reduce_carbon_sink', {
            name: 'Reduces Carbon Sink',
            description: 'Fewer trees means less CO2 absorption from atmosphere',
            sourceId: deforestation.id,
            targetId: atmosphericCO2.id,
            properties: []
        }),
        createEdge('pollute_water', {
            name: 'Pollutes Water',
            description: 'Agricultural chemicals contaminate water bodies',
            sourceId: agriculturalRunoff.id,
            targetId: waterPollution.id,
            properties: []
        }),
        createEdge('degrade_soil', {
            name: 'Degrades Soil',
            description: 'Chemical fertilizers and pesticides harm soil health',
            sourceId: agriculturalRunoff.id,
            targetId: soilDegradation.id,
            properties: []
        }),
        createEdge('fragment_habitat', {
            name: 'Fragments Habitat',
            description: 'Urban expansion breaks up natural ecosystems',
            sourceId: urbanDevelopment.id,
            targetId: habitatLoss.id,
            properties: []
        }),
        createEdge('increase_runoff', {
            name: 'Increases Runoff',
            description: 'Impervious surfaces increase water pollution from runoff',
            sourceId: urbanDevelopment.id,
            targetId: waterPollution.id,
            properties: []
        }),

        // Climate system relationships
        createEdge('greenhouse_effect', {
            name: 'Greenhouse Effect',
            description: 'CO2 traps heat in atmosphere causing global warming',
            sourceId: atmosphericCO2.id,
            targetId: temperatureRise.id,
            properties: []
        }),
        createEdge('acidify_ocean', {
            name: 'Acidifies Ocean',
            description: 'Atmospheric CO2 dissolves in seawater lowering pH',
            sourceId: atmosphericCO2.id,
            targetId: oceanAcidification.id,
            properties: []
        }),
        createEdge('alter_weather', {
            name: 'Alters Weather',
            description: 'Rising temperatures change global precipitation patterns',
            sourceId: temperatureRise.id,
            targetId: precipitationChange.id,
            properties: []
        }),

        // Environmental degradation chains
        createEdge('stress_species', {
            name: 'Stresses Species',
            description: 'Habitat destruction leads to species population decline',
            sourceId: habitatLoss.id,
            targetId: speciesExtinction.id,
            properties: []
        }),
        createEdge('reduce_productivity', {
            name: 'Reduces Productivity',
            description: 'Poor soil quality decreases crop yields',
            sourceId: soilDegradation.id,
            targetId: cropYieldDecline.id,
            properties: []
        }),
        createEdge('contaminate_supply', {
            name: 'Contaminates Supply',
            description: 'Polluted water reduces available clean water',
            sourceId: waterPollution.id,
            targetId: waterScarcity.id,
            properties: []
        }),
        createEdge('disrupt_climate_crops', {
            name: 'Disrupts Climate for Crops',
            description: 'Changed rainfall patterns harm agricultural production',
            sourceId: precipitationChange.id,
            targetId: cropYieldDecline.id,
            properties: []
        }),
        createEdge('stress_ecosystems', {
            name: 'Stresses Ecosystems',
            description: 'Higher temperatures overwhelm ecosystem resilience',
            sourceId: temperatureRise.id,
            targetId: ecosystemCollapse.id,
            properties: []
        }),
        createEdge('compound_extinction', {
            name: 'Compounds Extinction',
            description: 'Ecosystem breakdown accelerates species loss',
            sourceId: ecosystemCollapse.id,
            targetId: speciesExtinction.id,
            properties: []
        }),

        // Additional complex relationships
        createEdge('harm_marine_life', {
            name: 'Harms Marine Life',
            description: 'Acidic oceans threaten marine species survival',
            sourceId: oceanAcidification.id,
            targetId: speciesExtinction.id,
            properties: []
        }),
        createEdge('affect_plant_growth', {
            name: 'Affects Plant Growth',
            description: 'Poor air quality reduces photosynthesis and crop health',
            sourceId: airQualityDegradation.id,
            targetId: cropYieldDecline.id,
            properties: []
        })
    ];

    console.log(`✅ Created ${edges.length} causal relationships`);

    // Create the complete environmental system graph
    const environmentalSystem = createGraph('environmental_system', {
        nodes,
        edges
    });

    await environmentalSystem.ready;

    console.log(`✅ Created environmental system graph with ${environmentalSystem.nodes.length} nodes and ${environmentalSystem.edges.length} edges\n`);

    // Example 1: How do industrial activities affect biodiversity?
    console.log('📊 Analysis 1: Industrial Impact on Biodiversity');
    console.log('Question: How do industrial emissions affect species extinction?\n');

    const industrialToBiodiversity = incident(
        environmentalSystem,
        [industrialEmissions.id], // Source: industrial emissions
        [speciesExtinction.id]    // Target: species extinction
    );

    console.log(`Causal pathway contains:`);
    console.log(`- ${industrialToBiodiversity.nodes.length} variables`);
    console.log(`- ${industrialToBiodiversity.edges.length} causal relationships`);

    console.log('\nVariables in the causal chain:');
    industrialToBiodiversity.nodes.forEach(node => {
        const varName = node.name;
        console.log(`  • ${varName}`);
    });

    console.log('\nCausal relationships:');
    industrialToBiodiversity.edges.forEach(edge => {
        const sourceName = nodes.find(n => n.id === edge.sourceId)?.name;
        const targetName = nodes.find(n => n.id === edge.targetId)?.name;
        console.log(`  • ${sourceName} → ${targetName}`);
    });

    console.log('\n' + '='.repeat(50) + '\n');

    // Example 2: How does deforestation affect food security?
    console.log('📊 Analysis 2: Deforestation Impact on Food Security');
    console.log('Question: How does deforestation lead to crop yield decline?\n');

    const deforestationToFood = incident(
        environmentalSystem,
        [deforestation.id],     // Source: deforestation
        [cropYieldDecline.id]   // Target: crop yield decline
    );

    console.log(`Causal pathway contains:`);
    console.log(`- ${deforestationToFood.nodes.length} variables`);
    console.log(`- ${deforestationToFood.edges.length} causal relationships`);

    console.log('\nKey insight: Multiple pathways from deforestation to food insecurity:');
    deforestationToFood.edges.forEach(edge => {
        const sourceName = nodes.find(n => n.id === edge.sourceId)?.name;
        const targetName = nodes.find(n => n.id === edge.targetId)?.name;
        console.log(`  • ${sourceName} → ${targetName}`);
    });

    console.log('\n' + '='.repeat(50) + '\n');

    // Example 3: Multiple sources affecting water security
    console.log('📊 Analysis 3: Multiple Human Activities → Water Security');
    console.log('Question: How do various human activities affect water scarcity?\n');

    const multipleToWater = incident(
        environmentalSystem,
        [industrialEmissions.id, agriculturalRunoff.id, urbanDevelopment.id], // Multiple sources
        [waterScarcity.id] // Target: water scarcity
    );

    console.log(`Causal network contains:`);
    console.log(`- ${multipleToWater.nodes.length} variables`);
    console.log(`- ${multipleToWater.edges.length} causal relationships`);

    console.log('\nAll variables involved in water scarcity:');
    multipleToWater.nodes.forEach(node => {
        const isSource = [industrialEmissions.id, agriculturalRunoff.id, urbanDevelopment.id].includes(node.id);
        const isTarget = node.id === waterScarcity.id;
        const label = isSource ? '🏭 SOURCE' : isTarget ? '🎯 TARGET' : '🔗 MEDIATOR';
        console.log(`  ${label}: ${node.name}`);
    });

    console.log('\n' + '='.repeat(50) + '\n');

    // Example 4: System-wide analysis - all human activities to all outcomes
    console.log('📊 Analysis 4: System-wide Impact Assessment');
    console.log('Question: What is the complete causal network from all human activities to all environmental outcomes?\n');

    const systemWideAnalysis = incident(
        environmentalSystem,
        [industrialEmissions.id, deforestation.id, agriculturalRunoff.id, urbanDevelopment.id], // All human activities
        [speciesExtinction.id, cropYieldDecline.id, waterScarcity.id, ecosystemCollapse.id] // All major outcomes
    );

    console.log(`Complete causal network:`);
    console.log(`- ${systemWideAnalysis.nodes.length} variables`);
    console.log(`- ${systemWideAnalysis.edges.length} causal relationships`);

    // Analyze network structure
    const sources = systemWideAnalysis.nodes.filter(node => 
        [industrialEmissions.id, deforestation.id, agriculturalRunoff.id, urbanDevelopment.id].includes(node.id)
    );

    const targets = systemWideAnalysis.nodes.filter(node => 
        [speciesExtinction.id, cropYieldDecline.id, waterScarcity.id, ecosystemCollapse.id].includes(node.id)
    );

    const mediators = systemWideAnalysis.nodes.filter(node => 
        !sources.includes(node) && !targets.includes(node)
    );

    console.log(`\nNetwork structure:`);
    console.log(`- ${sources.length} human activity sources`);
    console.log(`- ${mediators.length} intermediate environmental factors`);
    console.log(`- ${targets.length} final environmental outcomes`);

    console.log('\nKey insight: The incident function reveals that environmental problems');
    console.log('are interconnected through complex causal pathways. Understanding these');
    console.log('pathways is crucial for:');
    console.log('• Identifying the most impactful intervention points');
    console.log('• Predicting unintended consequences of policy changes');
    console.log('• Designing comprehensive environmental strategies');

    console.log('\n' + '='.repeat(50) + '\n');

    // Demonstrate boundary constraints
    console.log('🔍 Technical Note: Boundary Constraints');
    console.log('The incident function enforces important constraints:\n');

    console.log('Source nodes (human activities) have no incoming edges in the result:');
    sources.forEach(source => {
        const incomingEdges = systemWideAnalysis.edges.filter(edge => edge.targetId === source.id).length;
        console.log(`  • ${source.name}: ${incomingEdges} incoming edges (should be 0)`);
    });

    console.log('\nTarget nodes (outcomes) have no outgoing edges in the result:');
    targets.forEach(target => {
        const outgoingEdges = systemWideAnalysis.edges.filter(edge => edge.sourceId === target.id).length;
        console.log(`  • ${target.name}: ${outgoingEdges} outgoing edges (should be 0)`);
    });

    console.log('\nThis ensures that the subgraph represents pure causal flow');
    console.log('from sources to targets, without external influences on sources');
    console.log('or further consequences from targets.');

    // Visualization
    if (process.env["DEBUG"] === "1") {
        console.log('\n🌐 Starting visualization server...');
        const instance = createInstance({ port: 3000, autoOpen: true });
        
        instance.plot(environmentalSystem);
        instance.plot(industrialToBiodiversity);
        instance.plot(deforestationToFood);
        instance.plot(multipleToWater);
        instance.plot(systemWideAnalysis);
        
        console.log('✅ Graphs are now available at http://localhost:3000');
        console.log('💡 Use the dropdown to switch between different analysis results');
    }
}

main()
    .catch((error) => {
        console.error('❌ Error running causal analysis:', error);
        process.exit(1);
    }); 
import "dotenv/config";
import {
    createNode,
    createEdge,
    createGraph,
    Property,
} from "ontology";
import { infer, InferenceResult } from "ontology-inference";

/**
 * Environmental Property Inference Example
 * 
 * This example demonstrates how the `infer` function can be used to propagate
 * environmental properties through causal networks. We model interventions
 * (e.g., new policies or technologies) and predict their downstream effects
 * on environmental outcomes using LLM-powered inference.
 */

async function main() {
    console.log('🌍 Environmental Property Inference Analysis');
    console.log('==============================================\n');

    // Create the environmental system (same as causal-analysis but with focus on inference)
    console.log('📋 Building environmental causal network...');

    // Human activities (intervention sources)
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

    // Final outcomes (inference targets)
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

    const nodes = [
        industrialEmissions, deforestation, agriculturalRunoff,
        atmosphericCO2, soilDegradation, waterPollution, habitatLoss,
        temperatureRise, speciesExtinction, cropYieldDecline, waterScarcity
    ];

    // Create causal relationships with meaningful edge descriptions
    const edges = [
        createEdge('emit_co2', {
            name: 'Carbon Emission',
            description: 'Industrial processes release CO2 through combustion, chemical reactions, and energy production, directly increasing atmospheric carbon concentration',
            sourceId: industrialEmissions.id,
            targetId: atmosphericCO2.id,
            properties: []
        }),
        createEdge('clear_forests', {
            name: 'Habitat Destruction',
            description: 'Deforestation physically removes tree cover and destroys wildlife habitats, fragmenting ecosystems and displacing species',
            sourceId: deforestation.id,
            targetId: habitatLoss.id,
            properties: []
        }),
        createEdge('reduce_carbon_sink', {
            name: 'Carbon Sink Reduction',
            description: 'Fewer trees means reduced CO2 absorption capacity, allowing more carbon to accumulate in the atmosphere',
            sourceId: deforestation.id,
            targetId: atmosphericCO2.id,
            properties: []
        }),
        createEdge('pollute_water', {
            name: 'Chemical Contamination',
            description: 'Agricultural chemicals, fertilizers, and pesticides flow into water bodies, introducing toxic compounds and excess nutrients',
            sourceId: agriculturalRunoff.id,
            targetId: waterPollution.id,
            properties: []
        }),
        createEdge('degrade_soil', {
            name: 'Soil Chemical Damage',
            description: 'Chemical fertilizers and pesticides alter soil pH, kill beneficial microorganisms, and reduce organic matter content',
            sourceId: agriculturalRunoff.id,
            targetId: soilDegradation.id,
            properties: []
        }),
        createEdge('greenhouse_effect', {
            name: 'Heat Trapping',
            description: 'Higher CO2 concentrations trap more infrared radiation in the atmosphere, causing global temperature increase',
            sourceId: atmosphericCO2.id,
            targetId: temperatureRise.id,
            properties: []
        }),
        createEdge('stress_species', {
            name: 'Biodiversity Loss',
            description: 'Habitat destruction forces species migration, reduces breeding success, and increases extinction risk through population fragmentation',
            sourceId: habitatLoss.id,
            targetId: speciesExtinction.id,
            properties: []
        }),
        createEdge('reduce_productivity', {
            name: 'Agricultural Impact',
            description: 'Degraded soil has lower nutrient content, poor water retention, and reduced microbial activity, directly decreasing crop yields',
            sourceId: soilDegradation.id,
            targetId: cropYieldDecline.id,
            properties: []
        }),
        createEdge('contaminate_supply', {
            name: 'Water Quality Impact',
            description: 'Polluted water becomes unsafe for consumption and irrigation, effectively reducing the available clean water supply',
            sourceId: waterPollution.id,
            targetId: waterScarcity.id,
            properties: []
        }),
        createEdge('climate_stress', {
            name: 'Climate Stress',
            description: 'Higher temperatures create heat stress, alter growing seasons, and increase water demand, negatively affecting crop production',
            sourceId: temperatureRise.id,
            targetId: cropYieldDecline.id,
            properties: []
        })
    ];

    const environmentalSystem = createGraph('environmental_system', { nodes, edges });
    await environmentalSystem.ready;

    console.log(`✅ Created environmental system with ${nodes.length} nodes and ${edges.length} edges\n`);

    // Example 1: Carbon Tax Policy Intervention
    console.log('📊 Scenario 1: Carbon Tax Policy Implementation');
    console.log('=================================================');
    console.log('Intervention: Government implements aggressive carbon pricing\n');

    const carbonTaxProperty: Property = {
        id: 'carbon_tax_policy' as Property["id"],
        name: 'Carbon Tax Policy',
        description: 'Aggressive carbon pricing policy ($100/ton CO2) with strict enforcement, industrial emission monitoring, and green technology incentives',
        embedding: null
    };

    const carbonTaxResults = await infer(
        environmentalSystem,
        [industrialEmissions.id], // Source: Industrial emissions affected by policy
        [speciesExtinction.id, cropYieldDecline.id], // Targets: Environmental outcomes
        {
            [industrialEmissions.id]: carbonTaxProperty
        },
        {
            model: "gpt-4o-mini",
            maxTokens: 600,
            confThreshold: 0.2,
            maxIterations: 3
        }
    );

    console.log('🎯 Predicted Environmental Outcomes:\n');
    for (const result of carbonTaxResults) {
        const targetNode = nodes.find(n => n.id === result.targetNodeId);
        console.log(`Target: ${targetNode?.name}`);
        console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`Reasoning: ${result.reasoning}`);
        console.log('Predicted Properties:');
        result.predictedProperties.forEach((prop: Property) => {
            console.log(`  • ${prop.name}: ${prop.description}`);
        });
        console.log();
    }

    console.log('='.repeat(60) + '\n');

    // Example 2: Sustainable Agriculture Intervention
    console.log('📊 Scenario 2: Sustainable Agriculture Transition');
    console.log('================================================');
    console.log('Intervention: Region transitions to organic farming practices\n');

    const organicFarmingProperty: Property = {
        id: 'organic_farming_transition' as Property["id"],
        name: 'Organic Farming Transition',
        description: 'Complete transition to organic farming methods including elimination of synthetic pesticides and fertilizers, crop rotation, composting, and integrated pest management',
        embedding: null
    };

    const organicFarmingResults = await infer(
        environmentalSystem,
        [agriculturalRunoff.id], // Source: Agricultural practices changed
        [waterScarcity.id, cropYieldDecline.id], // Targets: Water and food security
        {
            [agriculturalRunoff.id]: organicFarmingProperty
        },
        {
            model: "gpt-4o-mini",
            maxTokens: 600,
            confThreshold: 0.15,
            maxIterations: 3
        }
    );

    console.log('🎯 Predicted Environmental Outcomes:\n');
    for (const result of organicFarmingResults) {
        const targetNode = nodes.find(n => n.id === result.targetNodeId);
        console.log(`Target: ${targetNode?.name}`);
        console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`Reasoning: ${result.reasoning}`);
        console.log('Predicted Properties:');
        result.predictedProperties.forEach((prop: Property) => {
            console.log(`  • ${prop.name}: ${prop.description}`);
        });
        console.log();
    }

    console.log('='.repeat(60) + '\n');

    // Example 3: Multiple Intervention Scenario
    console.log('📊 Scenario 3: Comprehensive Environmental Policy Package');
    console.log('=======================================================');
    console.log('Intervention: Combined carbon tax + forest protection + organic agriculture\n');

    const forestProtectionProperty: Property = {
        id: 'forest_protection_program' as Property["id"],
        name: 'Forest Protection Program',
        description: 'Comprehensive forest conservation program with protected areas expansion, reforestation initiatives, sustainable logging practices, and indigenous land rights protection',
        embedding: null
    };

    const multipleInterventionResults = await infer(
        environmentalSystem,
        [industrialEmissions.id, deforestation.id, agriculturalRunoff.id], // Multiple sources
        [speciesExtinction.id, cropYieldDecline.id, waterScarcity.id], // Multiple targets
        {
            [industrialEmissions.id]: carbonTaxProperty,
            [deforestation.id]: forestProtectionProperty,
            [agriculturalRunoff.id]: organicFarmingProperty
        },
        {
            model: "gpt-4o-mini",
            maxTokens: 800,
            confThreshold: 0.15,
            maxIterations: 3
        }
    );

    console.log('🎯 Predicted Environmental Outcomes from Combined Interventions:\n');
    for (const result of multipleInterventionResults) {
        const targetNode = nodes.find(n => n.id === result.targetNodeId);
        console.log(`Target: ${targetNode?.name}`);
        console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`Reasoning: ${result.reasoning}`);
        console.log('Predicted Properties:');
        result.predictedProperties.forEach((prop: Property) => {
            console.log(`  • ${prop.name}: ${prop.description}`);
        });
        console.log();
    }

    console.log('='.repeat(60) + '\n');

    // Example 4: Comparative Analysis
    console.log('📊 Scenario 4: Policy Effectiveness Comparison');
    console.log('==============================================');
    console.log('Comparing single vs. multiple intervention approaches\n');

    const singleInterventionAvgConfidence = carbonTaxResults.reduce((sum: number, r: InferenceResult) => sum + r.confidence, 0) / carbonTaxResults.length;
    const multipleInterventionAvgConfidence = multipleInterventionResults.reduce((sum: number, r: InferenceResult) => sum + r.confidence, 0) / multipleInterventionResults.length;

    console.log('📈 Effectiveness Comparison:');
    console.log(`Single Intervention (Carbon Tax): ${(singleInterventionAvgConfidence * 100).toFixed(1)}% avg confidence`);
    console.log(`Multiple Interventions: ${(multipleInterventionAvgConfidence * 100).toFixed(1)}% avg confidence`);
    console.log(`Improvement: ${((multipleInterventionAvgConfidence - singleInterventionAvgConfidence) * 100).toFixed(1)} percentage points\n`);

    console.log('💡 Key Insights:');
    console.log('• The infer function reveals how environmental policies propagate through causal networks');
    console.log('• Multiple coordinated interventions often show higher confidence predictions');
    console.log('• LLM inference captures complex interactions between environmental factors');
    console.log('• Property propagation helps predict unintended consequences and co-benefits');
    console.log('• Confidence scores indicate the strength of causal evidence for predictions\n');

    console.log('🔬 Technical Insights:');
    console.log('• Multi-pass inference allows properties to propagate through cycles');
    console.log('• Batched LLM calls capture emergent effects from multiple causal pathways');
    console.log('• Confidence combination provides robust uncertainty estimates');
    console.log('• Convergence detection ensures complete property propagation');
}

main()
    .catch((error) => {
        console.error('❌ Error running inference analysis:', error);
        process.exit(1);
    }); 
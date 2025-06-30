# Inference Example

This example demonstrates how to use the `infer` function to propagate properties through causal networks using LLM-powered inference. The example models environmental interventions (policies and technologies) and predicts their downstream effects on environmental outcomes.

## What it demonstrates

- **Property Inference**: Using LLM reasoning to predict how properties propagate through causal networks
- **Environmental Modeling**: Creating a complex environmental system with multiple causal pathways
- **Policy Impact Analysis**: Modeling interventions like carbon taxes, forest protection, and organic farming
- **Multi-scenario Comparison**: Comparing single vs. multiple intervention approaches
- **Confidence Assessment**: Understanding prediction reliability through confidence scores

## Key Concepts

1. **Causal Networks**: Nodes represent environmental factors, edges represent causal relationships
2. **Property Propagation**: How policy interventions flow through the system to affect outcomes
3. **LLM Inference**: Using language models to predict complex environmental interactions
4. **Intervention Analysis**: Testing different policy scenarios and their expected outcomes

## Environmental System

The example models:
- **Sources**: Industrial emissions, deforestation, agricultural runoff
- **Intermediate Factors**: CO2 levels, soil degradation, water pollution, habitat loss, temperature rise
- **Outcomes**: Species extinction, crop yield decline, water scarcity

## Scenarios Tested

1. **Carbon Tax Policy**: Aggressive carbon pricing on industrial emissions
2. **Organic Agriculture**: Transition to sustainable farming practices
3. **Multiple Interventions**: Combined policy package
4. **Comparative Analysis**: Effectiveness comparison between approaches

## Running the Example

```bash
npm run start
# or
npm run dev  # for development with file watching
```

## Expected Output

The example will output:
- Network construction details
- Predicted outcomes for each scenario
- Confidence scores for predictions
- Comparative analysis results
- Key insights about environmental policy effectiveness

## Dependencies

- `ontology`: Core ontology functionality
- `ontology/packages/inference`: Property inference capabilities
- Environment variables for LLM configuration (OpenAI API key) 
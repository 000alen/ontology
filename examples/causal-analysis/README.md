# Environmental Causal Analysis Example

This example demonstrates how to use the ontology library's `incident` function to analyze causal pathways in complex environmental systems.

## What this example shows

- **Creating Environmental Models**: Building a complex graph representing environmental variables and their relationships
- **Causal Pathway Analysis**: Using the `incident()` function to extract R→B reachability subgraphs
- **Multiple Source Analysis**: Understanding how multiple human activities affect environmental outcomes
- **System-wide Impact Assessment**: Analyzing the complete causal network from all sources to all targets
- **Boundary Constraint Demonstration**: Showing how the algorithm enforces source/target constraints
- **Interactive Visualization**: Using `ontology-plot` to visualize complex causal networks

## The example scenario

The example creates a comprehensive environmental system model with:

### Human Activities (Sources)
- **Industrial Emissions**: Greenhouse gases and pollutants from manufacturing
- **Deforestation**: Large-scale forest removal for development
- **Agricultural Runoff**: Chemical contamination from farming
- **Urban Development**: City expansion and infrastructure growth

### Environmental Factors (Mediators)
- **Atmospheric CO2**: Carbon dioxide concentration in atmosphere
- **Soil Degradation**: Loss of soil fertility and structure
- **Water Pollution**: Contamination of water bodies
- **Habitat Loss**: Destruction of natural ecosystems
- **Temperature Rise**: Global warming effects
- **Precipitation Change**: Altered rainfall patterns
- **Ocean Acidification**: Decreasing ocean pH
- **Air Quality Degradation**: Increased air pollution

### Environmental Outcomes (Targets)
- **Species Extinction**: Loss of biodiversity
- **Crop Yield Decline**: Reduced agricultural productivity
- **Water Scarcity**: Insufficient clean water supply
- **Ecosystem Collapse**: Complete breakdown of ecosystem functions

## Analysis Examples

The example demonstrates four types of causal analysis:

1. **Single Source → Single Target**: Industrial emissions → Species extinction
2. **Single Source → Single Target**: Deforestation → Crop yield decline  
3. **Multiple Sources → Single Target**: Various activities → Water scarcity
4. **Multiple Sources → Multiple Targets**: System-wide impact assessment

Each analysis uses the `incident()` function to extract only the relevant causal pathways, demonstrating how environmental problems are interconnected through complex networks.

## Key Insights

The example reveals:
- **Complex Interconnections**: Environmental problems rarely have single causes
- **Multiple Pathways**: Several causal routes often exist between sources and outcomes
- **Intervention Points**: Identification of the most impactful variables for policy intervention
- **Boundary Constraints**: How the algorithm enforces clean source→target flow

## Running the example

From the examples/causal-analysis directory:

```bash
# Install dependencies
pnpm install

# Run the example
pnpm start

# Or run in development mode with watch
pnpm dev

# Run with visualization (requires DEBUG=1)
DEBUG=1 pnpm start
```

## Expected output

The example will show:
1. Creation of 16 environmental variables and 18 causal relationships
2. Four detailed causal pathway analyses with:
   - Number of variables and relationships in each pathway
   - List of all variables involved
   - Specific causal relationships identified
3. Network structure analysis showing sources, mediators, and targets
4. Technical demonstration of boundary constraints
5. Interactive visualization (when DEBUG=1 is set)

## Environment setup

Make sure you have your OpenAI API key set in your environment:

```bash
export OPENAI_API_KEY="your-api-key-here"
```

The example uses the OpenAI text-embedding-3-small model for generating embeddings.

## Graph Visualization

When run with `DEBUG=1`, the example includes interactive visualization:

- **Multiple Analysis Views**: Each causal analysis creates a separate graph view
- **Network Comparison**: Switch between different analysis results using the dropdown
- **Complex Networks**: Visualize how environmental variables interconnect
- **Pathway Highlighting**: See the specific paths from sources to targets
- **Interactive Exploration**: Click, drag, zoom, and explore the causal networks

The visualization server runs on http://localhost:3000 and shows:
- Complete Environmental System (full model)
- Industrial → Biodiversity (single pathway)
- Deforestation → Food Security (single pathway)  
- Multiple Sources → Water Security (convergent pathways)
- System-wide Analysis (comprehensive network)

## Technical Details

### The `incident()` Function

This example specifically demonstrates the R→B Reachability Subgraph algorithm:

- **Phase 1**: Forward traversal from source nodes (human activities)
- **Phase 2**: Backward traversal from target nodes (environmental outcomes)
- **Phase 3**: Intersection of reachable vertices (variables on causal paths)
- **Phase 4**: Induced subgraph creation (relevant variables and relationships)
- **Phase 5**: Boundary enforcement (no in-edges to sources, no out-edges from targets)

### Complexity
- **Time**: O(V + E) where V is vertices and E is edges
- **Space**: O(V) for visited sets and intermediate storage

### Applications
This type of analysis is valuable for:
- **Environmental Impact Assessment**: Understanding consequences of human activities
- **Policy Planning**: Identifying intervention points with maximum impact
- **Risk Analysis**: Predicting cascading effects of environmental changes
- **Systems Thinking**: Comprehending complex environmental interconnections 
import { Graph, incident, NodeId, Property } from "ontology";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

/* --------------------------------- Types -------------------------------- */

export interface Propagation {
  property: Property;
  confidence: number; // 0–1
  from: NodeId;       // direct predecessor where the property originated
}

export interface InferenceResult {
  targetNodeId: NodeId;
  predictedProperties: Property[];
  confidence: number; // aggregated confidence
  reasoning: string;
}

/* --------------------------- Helper – Topological ----------------------- */

/**
 * Returns a list of node IDs in (pseudo‑)topological order for a digraph that may
 * contain cycles. Cycles are first condensed to strongly‑connected components so
 * the returned order always respects reachability.
 */
function pseudoTopoOrder(graph: Graph, sources: NodeId[]): NodeId[] {
  // Kosaraju condensation → DAG
  const index: Map<NodeId, number> = new Map();
  const low: Map<NodeId, number> = new Map();
  const stack: NodeId[] = [];
  const onStack: Set<NodeId> = new Set();
  let time = 0;
  const sccOf: Map<NodeId, number> = new Map();
  const order: NodeId[][] = [];

  function dfs(u: NodeId) {
    index.set(u, ++time);
    low.set(u, time);
    stack.push(u);
    onStack.add(u);

    for (const e of graph.edges) {
      if (e.sourceId !== u) continue;
      const v = e.targetId;
      if (!index.has(v)) {
        dfs(v);
        low.set(u, Math.min(low.get(u)!, low.get(v)!));
      } else if (onStack.has(v)) {
        low.set(u, Math.min(low.get(u)!, index.get(v)!));
      }
    }

    if (low.get(u) === index.get(u)) {
      const component: NodeId[] = [];
      let v: NodeId;
      do {
        v = stack.pop() as NodeId;
        onStack.delete(v);
        sccOf.set(v, order.length);
        component.push(v);
      } while (v !== u);
      order.push(component);
    }
  }

  for (const s of sources) {
    if (!index.has(s)) dfs(s);
  }

  // create DAG of components
  const dagAdj: Map<number, Set<number>> = new Map();
  for (const e of graph.edges) {
    const a = sccOf.get(e.sourceId)!;
    const b = sccOf.get(e.targetId)!;
    if (a !== b) {
      if (!dagAdj.has(a)) dagAdj.set(a, new Set());
      dagAdj.get(a)!.add(b);
    }
  }

  // Kahn on component DAG (sources first)
  const indeg: Map<number, number> = new Map();
  const allNeighbors = Array.from(dagAdj.values());
  for (const nbrs of allNeighbors) {
    const neighborsArray = Array.from(nbrs);
    for (const v of neighborsArray) indeg.set(v, (indeg.get(v) ?? 0) + 1);
  }

  const queue: number[] = [];
  for (let i = 0; i < order.length; ++i) {
    if (!indeg.has(i)) queue.push(i);
  }

  const topoComp: number[] = [];
  while (queue.length) {
    const c = queue.shift()!;
    topoComp.push(c);
    const neighbors = dagAdj.get(c);
    if (neighbors) {
      for (const v of neighbors) {
        const d = indeg.get(v)! - 1;
        if (d === 0) {
          indeg.delete(v);
          queue.push(v);
        } else indeg.set(v, d);
      }
    }
  }

  // Flatten components preserving topological order
  const topo: NodeId[] = [];
  for (const c of topoComp) {
    const component = order[c];
    if (component) {
      topo.push(...component);
    }
  }
  return topo;
}

/* ---------------------- Helper – Local LLM Invocation ------------------- */

// Schema for a single propagation suggestion coming back from the LLM
const SuggestionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(1)
});

const SuggestionArray = z.array(SuggestionSchema);

async function llmSuggest(
  predecessors: { nodeName: string; props: Property[] }[],
  edges: { name: string; description: string }[],
  current: { nodeName: string; existing: Property[] },
  model = "gpt-4o-mini",
  maxTokens = 600
): Promise<Propagation[]> {
  if (predecessors.length === 0) return [];

  const prompt = `You are an ontology expert helping propagate properties through a knowledge graph.

Multiple predecessor nodes have these properties:
${predecessors.map((pred, i) => `
Predecessor ${i + 1} (${pred.nodeName}):
${JSON.stringify(pred.props, null, 2)}`).join('\n')}

These predecessors connect to the current node via edges:
${edges.map((edge, i) => `
Edge ${i + 1}: ${edge.name}: ${edge.description}`).join('\n')}

Current node '${current.nodeName}' has existing properties:
${JSON.stringify(current.existing, null, 2)}

Considering ALL predecessor properties and edge semantics together, suggest new properties that the current node might inherit. Look for:
- Direct property inheritance through individual edges
- Emergent properties from combining multiple predecessor properties
- Contextual properties arising from the specific combination of edges

For each suggestion give an ID, name, description and a confidence between 0 and 1. Respond as JSON array.`;

  const { object } = await generateObject({
    model: openai(model),
    maxTokens,
    schema: z.object({ suggestions: SuggestionArray }),
    prompt
  });

  // map to Propagation structures (from will be set by caller)
  return object.suggestions.map(o => ({
    property: { id: o.id as Property["id"], name: o.name, description: o.description, embedding: null },
    confidence: o.confidence,
    from: "" as unknown as NodeId // will be overwritten by caller
  }));
}

/* ---------------------- Helper – Confidence Combination ----------------- */

/**
 * Combines confidence scores from multiple independent sources using probabilistic combination.
 * This treats confidences as independent probabilities and combines them appropriately.
 */
function combineConfidences(conf1: number, conf2: number): number {
  // Use probabilistic OR: P(A or B) = P(A) + P(B) - P(A and B)
  // Assuming independence: P(A and B) = P(A) * P(B)
  return conf1 + conf2 - (conf1 * conf2);
}

/**
 * Aggregates confidence across multiple properties using weighted geometric mean
 * to avoid overconfidence from simple averaging.
 */
function aggregateConfidence(propagations: Propagation[]): number {
  if (propagations.length === 0) return 0;
  if (propagations.length === 1) return propagations[0]!.confidence;
  
  // Geometric mean is more conservative than arithmetic mean
  const product = propagations.reduce((prod, p) => prod * p.confidence, 1);
  return Math.pow(product, 1 / propagations.length);
}

/* ---------------------- Helper – Convergence Checking ------------------- */

function propagationMapsEqual(map1: Map<NodeId, Propagation[]>, map2: Map<NodeId, Propagation[]>): boolean {
  if (map1.size !== map2.size) return false;
  
  for (const nodeId of map1.keys()) {
    const props1 = map1.get(nodeId)!;
    const props2 = map2.get(nodeId);
    if (!props2 || props1.length !== props2.length) return false;
    
    // Check if all properties and confidences match
    for (const prop1 of props1) {
      const matching = props2.find(p => p.property.id === prop1.property.id);
      if (!matching || Math.abs(matching.confidence - prop1.confidence) > 0.001) {
        return false;
      }
    }
  }
  return true;
}

/* --------------------------- Main infer Function ------------------------ */

export async function infer(
  graph: Graph,
  sources: NodeId[],
  targets: NodeId[],
  intervention: Record<NodeId, Property>,
  options?: { model?: string; maxTokens?: number; confThreshold?: number; maxIterations?: number }
): Promise<InferenceResult[]> {
  const { 
    model = "gpt-4o-mini", 
    maxTokens = 600, 
    confThreshold = 0.15,
    maxIterations = 3 
  } = options ?? {};

  // Step 1 – restrict to R→B subgraph
  const subG: Graph = incident(graph, sources, targets);
  if (subG.nodes.length === 0) {
    return targets.map(t => ({ 
      targetNodeId: t, 
      predictedProperties: [], 
      confidence: 0, 
      reasoning: "No R→B path" 
    }));
  }

  // Step 2 – order nodes from sources toward targets
  const topo = pseudoTopoOrder(subG, sources);

  // Verify all subgraph nodes are in topological order
  const topoSet = new Set(topo);
  const missingNodes = subG.nodes.filter(n => !topoSet.has(n.id));
  if (missingNodes.length > 0) {
    console.warn(`Warning: ${missingNodes.length} nodes missing from topological order`);
  }

  // Step 3 – initialize property propagation table
  const props: Map<NodeId, Propagation[]> = new Map();
  for (const s of sources) {
    const p = intervention[s];
    if (p) props.set(s, [{ property: p, confidence: 1, from: s }]);
  }

  // Step 4 – multi-pass propagation until convergence
  let iteration = 0;
  let converged = false;

  while (iteration < maxIterations && !converged) {
    iteration++;
    const prevProps = new Map();
    
    // Deep copy previous state for convergence checking
    for (const nodeId of props.keys()) {
      const propagations = props.get(nodeId)!;
      prevProps.set(nodeId, propagations.map(p => ({ ...p, property: { ...p.property } })));
    }

    // Process each node in topological order
    for (const nodeId of topo) {
      // Skip sources as they're already initialized
      if (sources.includes(nodeId)) continue;

      // Get all incoming edges and their source properties
      const incoming = subG.edges.filter(e => e.targetId === nodeId);
      if (incoming.length === 0) continue;

      // Collect all predecessor information for batched LLM call
      const predecessors: { nodeName: string; props: Property[] }[] = [];
      const edgeInfos: { name: string; description: string }[] = [];
      const sourceMapping: NodeId[] = []; // Track which sources properties came from

      for (const edge of incoming) {
        const predProps = props.get(edge.sourceId);
        if (!predProps || predProps.length === 0) continue;

        const predNode = subG.nodes.find(n => n.id === edge.sourceId);
        if (!predNode) continue;

        predecessors.push({
          nodeName: predNode.name,
          props: predProps.map(p => p.property)
        });
        edgeInfos.push({
          name: edge.name,
          description: edge.description
        });
        
        // Track source mapping for each property
        predProps.forEach(() => sourceMapping.push(edge.sourceId));
      }

      if (predecessors.length === 0) continue;

      const currentNode = subG.nodes.find(n => n.id === nodeId);
      if (!currentNode) continue;

      // Single batched LLM call with all context
      const suggestions = await llmSuggest(
        predecessors,
        edgeInfos,
        { nodeName: currentNode.name, existing: currentNode.properties },
        model,
        maxTokens
      );

      // Process suggestions and update propagation table
      for (const suggestion of suggestions) {
        if (suggestion.confidence < confThreshold) continue;

        // Assign the suggestion to the most relevant source
        // For now, use the first source, but could be improved with more sophisticated attribution
        suggestion.from = sourceMapping.length > 0 ? sourceMapping[0]! : nodeId;

        const existingProps = props.get(nodeId) ?? [];
        const existing = existingProps.find(p => p.property.id === suggestion.property.id);

        if (!existing) {
          // New property
          existingProps.push(suggestion);
        } else {
          // Combine evidence from multiple sources
          existing.confidence = combineConfidences(existing.confidence, suggestion.confidence);
          // Keep track of the strongest source
          if (suggestion.confidence > existing.confidence) {
            existing.from = suggestion.from;
          }
        }

        props.set(nodeId, existingProps);
      }
    }

    // Check for convergence
    converged = propagationMapsEqual(prevProps, props);
    
    if (!converged && iteration === maxIterations) {
      console.warn(`Inference did not converge after ${maxIterations} iterations`);
    }
  }

  /* ---------------------- Generate results for targets ------------------- */
  const results: InferenceResult[] = [];
  for (const targetId of targets) {
    const propagated = props.get(targetId) ?? [];
    
    if (propagated.length === 0) {
      results.push({ 
        targetNodeId: targetId, 
        predictedProperties: [], 
        confidence: 0, 
        reasoning: "No strong propagation" 
      });
      continue;
    }

    // Use improved confidence aggregation
    const aggregatedConfidence = aggregateConfidence(propagated);
    
    // Generate detailed reasoning
    const sourceCounts = new Map<NodeId, number>();
    for (const prop of propagated) {
      sourceCounts.set(prop.from, (sourceCounts.get(prop.from) ?? 0) + 1);
    }
    
    const sourceList = Array.from(sourceCounts.entries())
      .map(([source, count]) => `${source}(${count})`)
      .join(", ");

    results.push({
      targetNodeId: targetId,
      predictedProperties: propagated.map(p => p.property),
      confidence: aggregatedConfidence,
      reasoning: `Converged after ${iteration} iterations. Derived via ${sourceList}. Average confidence: ${aggregatedConfidence.toFixed(3)}`
    });
  }

  return results;
}

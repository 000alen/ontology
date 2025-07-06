import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { EventEmitter } from 'events';
import type { Graph } from 'ontology';

// Initialize tRPC
const t = initTRPC.create();

// Create a global event emitter for real-time updates
const eventEmitter = new EventEmitter();

const GraphSchema = z.object({
    id: z.string(),
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
}) as z.ZodType<Graph>;

export interface AxisData {
    id: string;
    graphs: Graph[];
}

// Global state for axes (in a real app, this would be in a database)
export let axes: AxisData[] = [];

export const appRouter = t.router({
    // Get all axes
    getAxes: t.procedure
        .query(() => {
            return axes;
        }),

    // Get a specific axis by ID
    getAxis: t.procedure
        .input(z.object({ axisId: z.string() }))
        .query(({ input }) => {
            const axis = axes.find(a => a.id === input.axisId);
            if (!axis) {
                throw new Error(`Axis with id ${input.axisId} not found`);
            }
            return axis;
        }),

    // Create a new axis
    createAxis: t.procedure
        .mutation(({ }) => {
            const axisId = `axis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const axisData: AxisData = {
                id: axisId,
                graphs: []
            };

            axes.push(axisData);
            console.log(`🎯 Created axis: ${axisData.id}`);

            // Emit event for real-time updates
            eventEmitter.emit('newAxis', axisData);

            return axisData;
        }),

    // Plot a graph on an axis
    plotGraph: t.procedure
        .input(z.object({
            axisId: z.string(),
            graph: GraphSchema,
        }))
        .mutation(({ input }) => {
            const axis = axes.find(a => a.id === input.axisId);
            if (!axis) {
                throw new Error(`Axis with id ${input.axisId} not found`);
            }

            axis.graphs.push(input.graph);

            console.log(`📊 Plotted graph: ${input.graph.id} on axis: ${axis.id} (${input.graph.nodes.length} nodes, ${input.graph.edges.length} edges)`);

            // Emit event for real-time updates
            eventEmitter.emit('newGraph', { axisId: input.axisId, graph: input.graph });

            return { axis, graph: input.graph };
        }),

    // Plot a graph on the first available axis (or create a default one)
    plotGraphAuto: t.procedure
        .input(z.object({
            graph: GraphSchema,
        }))
        .mutation(({ input }) => {
            let targetAxis = axes[0];

            if (!targetAxis) {
                // Create a default axis if none exists
                const axisId = `axis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                targetAxis = {
                    id: axisId,
                    graphs: []
                };
                axes.push(targetAxis);
                console.log(`🎯 Created default axis: ${targetAxis.id}`);

                // Emit event for new axis
                eventEmitter.emit('newAxis', targetAxis);
            }

            targetAxis.graphs.push(input.graph);

            console.log(`📊 Plotted graph: ${input.graph.id} (${input.graph.nodes.length} nodes, ${input.graph.edges.length} edges)`);

            // Emit event for new graph
            eventEmitter.emit('newGraph', { axisId: targetAxis.id, graph: input.graph });

            return { axis: targetAxis, graph: input.graph };
        }),

    // Clear all axes
    clearAxes: t.procedure
        .mutation(() => {
            axes = [];
            console.log('🗑️ Cleared all axes');

            // Emit event for real-time updates
            eventEmitter.emit('clearAxes');

            return { success: true, message: 'All axes cleared' };
        }),

    // Clear a specific axis
    clearAxis: t.procedure
        .input(z.object({ axisId: z.string() }))
        .mutation(({ input }) => {
            const axis = axes.find(a => a.id === input.axisId);
            if (!axis) {
                throw new Error(`Axis with id ${input.axisId} not found`);
            }

            axis.graphs = [];
            console.log(`🗑️ Cleared axis: ${axis.id}`);

            // Emit event for real-time updates
            eventEmitter.emit('clearAxis', input.axisId);

            return { success: true, message: `Axis ${axis.id} cleared` };
        }),

    // Subscription for real-time axes updates
    onAxesUpdate: t.procedure
        .subscription(async function* () {
            // Send initial data
            yield { type: 'newAxis' as const, data: axes };

            // Create a queue to handle events
            const eventQueue: Array<{
                type: 'newAxis' | 'newGraph' | 'clearAxes' | 'clearAxis';
                data: any;
            }> = [];

            let resolveNext: (() => void) | null = null;
            let isActive = true;

            // Listen for new axis events
            const onNewAxis = (axis: AxisData) => {
                if (!isActive) return;
                eventQueue.push({ type: 'newAxis', data: axis });
                resolveNext?.();
            };

            // Listen for new graph events
            const onNewGraph = (data: { axisId: string; graph: any }) => {
                if (!isActive) return;
                eventQueue.push({ type: 'newGraph', data });
                resolveNext?.();
            };

            // Listen for clear axes events
            const onClearAxes = () => {
                if (!isActive) return;
                eventQueue.push({ type: 'clearAxes', data: null });
                resolveNext?.();
            };

            // Listen for clear axis events
            const onClearAxis = (axisId: string) => {
                if (!isActive) return;
                eventQueue.push({ type: 'clearAxis', data: axisId });
                resolveNext?.();
            };

            // Register event listeners
            eventEmitter.on('newAxis', onNewAxis);
            eventEmitter.on('newGraph', onNewGraph);
            eventEmitter.on('clearAxes', onClearAxes);
            eventEmitter.on('clearAxis', onClearAxis);

            try {
                // Process events from the queue
                while (isActive) {
                    if (eventQueue.length > 0) {
                        const event = eventQueue.shift()!;
                        yield event;
                    } else {
                        // Wait for next event
                        await new Promise<void>((resolve) => {
                            resolveNext = resolve;
                        });
                        resolveNext = null;
                    }
                }
            } finally {
                // Cleanup
                isActive = false;
                eventEmitter.off('newAxis', onNewAxis);
                eventEmitter.off('newGraph', onNewGraph);
                eventEmitter.off('clearAxes', onClearAxes);
                eventEmitter.off('clearAxis', onClearAxis);
            }
        }),
});

export type AppRouter = typeof appRouter; 
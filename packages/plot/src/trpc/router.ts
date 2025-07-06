import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { EventEmitter } from 'events';
import type { Graph } from 'ontology';

// Initialize tRPC
const t = initTRPC.create();

// Create a global event emitter for real-time updates
const eventEmitter = new EventEmitter();

// Define input schemas
const PlotOptionsSchema = z.object({
    color: z.string().optional(),
    visible: z.boolean().optional(),
});

const AxisOptionsSchema = z.object({
    title: z.string().optional(),
    color: z.string().optional(),
    visible: z.boolean().optional(),
    position: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
    }).optional(),
});

const GraphSchema = z.object({
    id: z.string(),
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
}) as z.ZodType<Graph>;

// Global state for axes (in a real app, this would be in a database)
export let axes: (AxisData & { graphs: (Graph & { plotOptions?: any })[] })[] = [];

export interface AxisData {
    id: string;
    title: string;
    color: string;
    visible: boolean;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

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
        .input(AxisOptionsSchema)
        .mutation(({ input }) => {
            const axisId = `axis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const axisData: AxisData & { graphs: (Graph & { plotOptions?: any })[] } = {
                id: axisId,
                title: input.title || `Axis ${axes.length + 1}`,
                color: input.color || '#007bff',
                visible: input.visible !== false,
                position: input.position || { x: 0, y: 0, width: 1, height: 1 },
                graphs: []
            };

            axes.push(axisData);
            console.log(`🎯 Created axis: ${axisData.title}`);

            // Emit event for real-time updates
            eventEmitter.emit('newAxis', axisData);

            return axisData;
        }),

    // Plot a graph on an axis
    plotGraph: t.procedure
        .input(z.object({
            axisId: z.string(),
            graph: GraphSchema,
            options: PlotOptionsSchema.optional(),
        }))
        .mutation(({ input }) => {
            const axis = axes.find(a => a.id === input.axisId);
            if (!axis) {
                throw new Error(`Axis with id ${input.axisId} not found`);
            }

            const graphWithOptions = { ...input.graph, plotOptions: input.options || {} };
            axis.graphs.push(graphWithOptions);

            console.log(`📊 Plotted graph: ${input.graph.id} on axis: ${axis.title} (${input.graph.nodes.length} nodes, ${input.graph.edges.length} edges)`);

            // Emit event for real-time updates
            eventEmitter.emit('newGraph', { axisId: input.axisId, graph: graphWithOptions });

            return { axis, graph: graphWithOptions };
        }),

    // Plot a graph on the first available axis (or create a default one)
    plotGraphAuto: t.procedure
        .input(z.object({
            graph: GraphSchema,
            options: PlotOptionsSchema.optional(),
        }))
        .mutation(({ input }) => {
            let targetAxis = axes[0];

            if (!targetAxis) {
                // Create a default axis if none exists
                const axisId = `axis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                targetAxis = {
                    id: axisId,
                    title: 'Default Axis',
                    color: '#007bff',
                    visible: true,
                    position: { x: 0, y: 0, width: 1, height: 1 },
                    graphs: []
                };
                axes.push(targetAxis);
                console.log(`🎯 Created default axis: ${targetAxis.title}`);

                // Emit event for new axis
                eventEmitter.emit('newAxis', targetAxis);
            }

            const graphWithOptions = { ...input.graph, plotOptions: input.options || {} };
            targetAxis.graphs.push(graphWithOptions);

            console.log(`📊 Plotted graph: ${input.graph.id} (${input.graph.nodes.length} nodes, ${input.graph.edges.length} edges)`);

            // Emit event for new graph
            eventEmitter.emit('newGraph', { axisId: targetAxis.id, graph: graphWithOptions });

            return { axis: targetAxis, graph: graphWithOptions };
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
            console.log(`🗑️ Cleared axis: ${axis.title}`);

            // Emit event for real-time updates
            eventEmitter.emit('clearAxis', input.axisId);

            return { success: true, message: `Axis ${axis.title} cleared` };
        }),

    // Update axis properties
    updateAxis: t.procedure
        .input(z.object({
            axisId: z.string(),
            updates: z.object({
                title: z.string().optional(),
                color: z.string().optional(),
                visible: z.boolean().optional(),
            }),
        }))
        .mutation(({ input }) => {
            const axis = axes.find(a => a.id === input.axisId);
            if (!axis) {
                throw new Error(`Axis with id ${input.axisId} not found`);
            }

            Object.assign(axis, input.updates);
            console.log(`✏️ Updated axis: ${axis.title}`);

            // Emit event for real-time updates
            eventEmitter.emit('updateAxis', { axisId: input.axisId, updates: input.updates });

            return axis;
        }),

    // Subscription for real-time axes updates
    onAxesUpdate: t.procedure
        .subscription(async function* () {
            // Send initial data
            yield { type: 'newAxis' as const, data: axes };

            // Create a queue to handle events
            const eventQueue: Array<{
                type: 'newAxis' | 'newGraph' | 'clearAxes' | 'clearAxis' | 'updateAxis';
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

            // Listen for update axis events
            const onUpdateAxis = (data: { axisId: string; updates: any }) => {
                if (!isActive) return;
                eventQueue.push({ type: 'updateAxis', data });
                resolveNext?.();
            };

            // Register event listeners
            eventEmitter.on('newAxis', onNewAxis);
            eventEmitter.on('newGraph', onNewGraph);
            eventEmitter.on('clearAxes', onClearAxes);
            eventEmitter.on('clearAxis', onClearAxis);
            eventEmitter.on('updateAxis', onUpdateAxis);

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
                eventEmitter.off('updateAxis', onUpdateAxis);
            }
        }),
});

export type AppRouter = typeof appRouter; 
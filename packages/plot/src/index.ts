import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import open from 'open';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { appRouter, axes, AxisData } from './trpc/router.js';
import type { Graph, GraphId } from 'ontology';
import { cosineSimilarityMatrix } from 'ontology/math';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface PlotInstance {
  plot(...graphs: Graph[]): void;
  createAxis(): Axis;
  getAxes(): Axis[];
  close(): Promise<void>;
}

export interface Axis {
  plot(...graphs: Graph[]): void;
  getId(): string;
}

export interface CreateInstanceOptions {
  port?: number;
  autoOpen?: boolean;
}

export function createInstance(options: CreateInstanceOptions = {}): PlotInstance {
  const { port = 3000, autoOpen = true } = options;

  const app = express();
  const server = createServer(app);

  // Create WebSocket server for tRPC subscriptions
  const wss = new WebSocketServer({ server });

  // Create tRPC context (empty for now, but can be extended)
  const createContext = () => ({});

  // Apply tRPC middleware to Express
  app.use(
    '/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Apply WebSocket handler for tRPC subscriptions
  applyWSSHandler({ wss, router: appRouter, createContext });

  // Serve static files from React build directory
  app.use(express.static(join(__dirname, 'public')));

  // WebSocket connection handling
  wss.on('connection', (ws) => {
    console.log('Client connected to ontology-plot via WebSocket');

    ws.on('close', () => {
      console.log('Client disconnected from ontology-plot WebSocket');
    });
  });

  // Start server
  server.listen(port, () => {
    console.log(`🎨 Ontology Plot server running at http://localhost:${port}`);
    console.log(`📡 tRPC API available at http://localhost:${port}/trpc`);
    console.log(`🔌 WebSocket subscriptions available at ws://localhost:${port}`);
    if (autoOpen) {
      open(`http://localhost:${port}`);
    }
  });

  // Create axis function - directly manipulate the router state
  const createAxis = (): Axis => {
    const axisId = `axis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const axisData: AxisData = {
      id: axisId,
      graphs: []
    };

    axes.push(axisData);

    return {
      plot(...graphs: Graph[]): void {
        const _nodes = graphs.flatMap(graph => graph.nodes).map((node) => {
          const { ready, ...rest } = node;
          return rest;
        });
        const _edges = graphs.flatMap(graph => graph.edges).map((edge) => {
          const { ready, ...rest } = edge;
          return rest;
        });

        const _graph = structuredClone({
          id: `graph_${Math.random().toString(36).substring(2, 15)}` as GraphId,
          nodes: _nodes,
          edges: _edges
        });

        console.log(`📊 Plotting graph: ${_graph.id} on axis: ${axisId} (${_graph.nodes.length} nodes, ${_graph.edges.length} edges)`);

        const similarities = cosineSimilarityMatrix(_graph.nodes.map(node => node.embedding!));

        console.log(similarities);

        similarities.forEach((row, i) =>
          row.forEach((similarity, j) => {
            if (i === j) {
              return;
            }

            if (i > j) {
              return;
            }

            if (similarity < 0.5) {
              return;
            }

            if (!_graph.nodes[i]!.meta.parentId) {
              _graph.nodes[i]!.meta.parentId = [];
            }

            if (!_graph.nodes[j]!.meta.parentId) {
              _graph.nodes[j]!.meta.parentId = [];
            }

            const parentId = Math.random().toString(36).substring(2, 15);

            console.log("creating parent", parentId);
            _graph.nodes[i]!.meta.parentId.push(parentId);
            _graph.nodes[j]!.meta.parentId.push(parentId);
          })
        );

        axisData.graphs.push(_graph);
      },

      getId(): string {
        return axisId;
      }
    };
  };

  return {
    plot(...graphs: Graph[]): void {
      if (axes.length === 0) {
        // Create a default axis if none exists
        const defaultAxis = createAxis();

        defaultAxis.plot(...graphs);
      } else {
        // Use the first axis
        const firstAxisData = axes[0];

        if (firstAxisData) {
          firstAxisData.graphs.push(...graphs);
        }
      }
    },

    createAxis,

    getAxes(): Axis[] {
      return axes.map(axisData => ({
        plot(...graphs: Graph[]): void {
          graphs.forEach(graph => {
            const graphWithOptions = { ...graph };
            axisData.graphs.push(graphWithOptions);
          });
        },
        getId(): string {
          return axisData.id;
        }
      }));
    },

    async close(): Promise<void> {
      return new Promise((resolve) => {
        server.close(() => {
          console.log('🔌 Ontology Plot server closed');
          resolve();
        });
      });
    }
  };
}

// Default instance that gets reused for direct plot calls
let defaultInstance: PlotInstance | null = null;

// Convenience function to create instance and plot a single graph
export function plot(...graphs: Graph[]): PlotInstance {
  if (!defaultInstance) {
    defaultInstance = createInstance();
    defaultInstance.plot(...graphs);
  } else {
    defaultInstance.plot(...graphs);
  }
  return defaultInstance;
} 
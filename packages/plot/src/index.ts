import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import open from 'open';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { appRouter, axes } from './trpc/router.js';
import type { Graph } from 'ontology';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface PlotInstance {
  plot(graph: Graph): void;
  createAxis(): Axis;
  getAxes(): Axis[];
  clear(): void;
  close(): Promise<void>;
}

export interface Axis {
  plot(graph: Graph): void;
  clear(): void;
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
    const axisData = {
      id: axisId,
      graphs: []
    };

    axes.push(axisData);

    return {
      plot(graph: Graph): void {
        console.log(`📊 Plotting graph: ${graph.id} on axis: ${axisId} (${graph.nodes.length} nodes, ${graph.edges.length} edges)`);
        const graphWithOptions = { ...graph };
        (axisData as any).graphs.push(graphWithOptions);
      },

      clear(): void {
        axisData.graphs = [];
      },

      getId(): string {
        return axisId;
      }
    };
  };

  return {
    plot(graph: Graph): void {
      console.log(`📊 Plotting graph: ${graph.id} (${graph.nodes.length} nodes, ${graph.edges.length} edges)`);

      if (axes.length === 0) {
        // Create a default axis if none exists
        const defaultAxis = createAxis();
        defaultAxis.plot(graph);
      } else {
        // Use the first axis
        const firstAxisData = axes[0];
        if (firstAxisData) {
          const graphWithOptions = { ...graph };
          firstAxisData.graphs.push(graphWithOptions);
        }
      }
    },

    createAxis,

    getAxes(): Axis[] {
      return axes.map(axisData => ({
        plot(graph: Graph): void {
          const graphWithOptions = { ...graph };
          axisData.graphs.push(graphWithOptions);
        },
        clear(): void {
          axisData.graphs = [];
        },
        getId(): string {
          return axisData.id;
        }
      }));
    },

    clear(): void {
      console.log('🗑️ Clearing all axes');
      axes.length = 0; // Clear the array
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
export function plot(graph: Graph, options?: CreateInstanceOptions): PlotInstance {
  if (!defaultInstance) {
    const isCreateOptions = options && 'port' in options;
    const createOptions = isCreateOptions ? options as CreateInstanceOptions : {};

    defaultInstance = createInstance(createOptions);
    defaultInstance.plot(graph);
  } else {
    defaultInstance.plot(graph);
  }
  return defaultInstance;
} 
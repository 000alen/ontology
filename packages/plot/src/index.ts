import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import open from 'open';
import type { Graph } from 'ontology';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface PlotInstance {
  plot(graph: Graph): void;
  close(): Promise<void>;
}

export interface CreateInstanceOptions {
  port?: number;
  autoOpen?: boolean;
}

export function createInstance(options: CreateInstanceOptions = {}): PlotInstance {
  const { port = 3000, autoOpen = true } = options;
  
  const app = express();
  const server = createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Serve static files from public directory
  app.use(express.static(join(__dirname, '../public')));

  // API endpoint to get current graphs
  let graphs: Graph[] = [];
  
  app.get('/api/graphs', (_req, res) => {
    res.json(graphs);
  });

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('Client connected to ontology-plot');
    
    // Send current graphs to new client
    socket.emit('graphs', graphs);
    
    socket.on('disconnect', () => {
      console.log('Client disconnected from ontology-plot');
    });
  });

  // Start server
  server.listen(port, () => {
    console.log(`🎨 Ontology Plot server running at http://localhost:${port}`);
    if (autoOpen) {
      open(`http://localhost:${port}`);
    }
  });

  return {
    plot(graph: Graph): void {
      console.log(`📊 Plotting graph: ${graph.id} (${graph.nodes.length} nodes, ${graph.edges.length} edges)`);
      graphs.push(graph);
      io.emit('newGraph', graph);
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

// Convenience function to create instance and plot a single graph
export function plot(graph: Graph, options?: CreateInstanceOptions): PlotInstance {
  const instance = createInstance(options);
  instance.plot(graph);
  return instance;
} 
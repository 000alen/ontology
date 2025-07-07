import React from 'react';

import { createTRPCClient, httpBatchLink, createWSClient, splitLink, wsLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { QueryClient } from '@tanstack/react-query';
import type { AppRouter } from '../trpc/router.js';

const wsClient = createWSClient({
  url: `ws://localhost:${window.location.port || 3000}`,
});

// Create tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Create QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Create tRPC client with WebSocket support for subscriptions
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: wsLink<AppRouter>({ client: wsClient }),
      false: httpBatchLink<AppRouter>({ url: '/trpc' }),
    }),
  ],
});

// tRPC Provider component props
export interface TRPCProviderProps {
  children: React.ReactNode;
}

export const TRPCProvider: React.FC<TRPCProviderProps> = ({ children }) => {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      {children}
    </trpc.Provider>
  );
}; 
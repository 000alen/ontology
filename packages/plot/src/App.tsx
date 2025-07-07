import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { TRPCProvider, queryClient } from './utils/trpc'
import IndexPage from './pages/index'
import GraphPage from './pages/graph/[id]'

import './App.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <IndexPage />,
  },
  {
    path: '/graph/:id',
    element: <GraphPage />,
  }
]);

const App: React.FC = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider>
        <div className="app">
          <RouterProvider router={router} />
        </div>
      </TRPCProvider>
    </QueryClientProvider>
  )
}

export default App 
import { useEffect, useState } from 'react'
import { trpc } from '../utils/trpc'
import type { AxisData } from '../types'

export const useAxis = (axisId: string) => {
  const [axis, setAxis] = useState<AxisData | null>(null)

  // Query to get a specific axis by ID
  const { data: axisData } = trpc.getAxis.useQuery(
    { axisId },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    }
  )

  // Subscribe to real-time updates
  trpc.onAxesUpdate.useSubscription(undefined, {
    onData: (update) => {
      console.log('Received update:', update)

      switch (update.type) {
        case 'newAxis':
          if (Array.isArray(update.data)) {
            // Initial data load - find our specific axis
            const targetAxis = update.data.find(a => a.id === axisId)
            setAxis(targetAxis || null)
          } else {
            // New axis added - only update if it's our axis
            if (update.data.id === axisId) {
              setAxis(update.data)
            }
          }
          break

        case 'newGraph':
          // Only update if the graph is for our axis
          if (update.data.axisId === axisId) {
            setAxis(prev => prev ? { ...prev, graphs: [...prev.graphs, update.data.graph] } : null)
          }
          break
      }
    },
    onError: (error) => {
      console.error('Subscription error:', error)
    },
  })

  // Update axis when query data changes
  useEffect(() => {
    if (axisData) {
      setAxis(axisData)
    }
  }, [axisData])

  return { axis }
} 
import { useEffect, useState } from 'react'
import { trpc } from '../utils/trpc'
import type { AxisData } from '../types'

export const useAxes = () => {
  const [axes, setAxes] = useState<AxisData[]>([])

  // Query to get all axes
  const { data: axesData } = trpc.getAxes.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })

  // Subscribe to real-time updates
  trpc.onAxesUpdate.useSubscription(undefined, {
    onData: (update) => {
      console.log('Received update:', update)

      switch (update.type) {
        case 'newAxis':
          if (Array.isArray(update.data)) {
            // Initial data load
            setAxes(update.data)
          } else {
            // New axis added
            setAxes(prev => [...prev, update.data])
          }
          break

        case 'newGraph':
          setAxes(prev => prev.map(axis =>
            axis.id === update.data.axisId
              ? { ...axis, graphs: [...axis.graphs, update.data.graph] }
              : axis
          ))
          break

        case 'clearAxes':
          setAxes([])
          break

        case 'clearAxis':
          setAxes(prev => prev.map(axis =>
            axis.id === update.data
              ? { ...axis, graphs: [] }
              : axis
          ))
          break
      }
    },
    onError: (error) => {
      console.error('Subscription error:', error)
    },
  })

  // Update axes when query data changes
  useEffect(() => {
    if (axesData) {
      setAxes(axesData)
    }
  }, [axesData])

  return {
    axes,
  }
} 
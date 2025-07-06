import { useEffect, useState, useCallback } from 'react'
import { trpc } from '../utils/trpc'
import type { Node, Edge } from 'ontology'
import type { AxisData } from '../types'

export const useAxes = () => {
  const [highlightedNode, setHighlightedNode] = useState<Node | null>(null)
  const [highlightedEdge, setHighlightedEdge] = useState<Edge | null>(null)
  const [axes, setAxes] = useState<AxisData[]>([])

  // Query to get all axes
  const { data: axesData, refetch: refetchAxes } = trpc.getAxes.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })

  // Mutation to clear all axes
  const clearAxesMutation = trpc.clearAxes.useMutation({
    onSuccess: () => {
      setAxes([])
      setHighlightedNode(null)
      setHighlightedEdge(null)
      refetchAxes()
    },
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
          setHighlightedNode(null)
          setHighlightedEdge(null)
          break
          
        case 'clearAxis':
          setAxes(prev => prev.map(axis => 
            axis.id === update.data 
              ? { ...axis, graphs: [] }
              : axis
          ))
          break
          
        case 'updateAxis':
          setAxes(prev => prev.map(axis => 
            axis.id === update.data.axisId 
              ? { ...axis, ...update.data.updates }
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

  // Load axes function
  const loadAxes = useCallback(async () => {
    try {
      await refetchAxes()
    } catch (error) {
      console.error('Failed to load axes:', error)
    }
  }, [refetchAxes])

  // Clear all axes function
  const clearAxes = useCallback(async () => {
    try {
      await clearAxesMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to clear axes:', error)
    }
  }, [clearAxesMutation])

  return {
    axes,
    loadAxes,
    clearAxes,
    highlightedNode,
    highlightedEdge,
    setHighlightedNode,
    setHighlightedEdge,
  }
} 
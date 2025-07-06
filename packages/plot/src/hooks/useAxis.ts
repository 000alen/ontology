import { useEffect, useState, useCallback } from 'react'
import { trpc } from '../utils/trpc'
import type { Node, Edge } from 'ontology'
import type { AxisData } from '../types'

export const useAxis = (axisId: string) => {
  const [highlightedNode, setHighlightedNode] = useState<Node | null>(null)
  const [highlightedEdge, setHighlightedEdge] = useState<Edge | null>(null)
  const [axis, setAxis] = useState<AxisData | null>(null)

  // Query to get a specific axis by ID
  const { data: axisData, refetch: refetchAxis } = trpc.getAxis.useQuery(
    { axisId },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    }
  )

  // Mutation to clear this specific axis
  const clearAxisMutation = trpc.clearAxis.useMutation({
    onSuccess: () => {
      setAxis(prev => prev ? { ...prev, graphs: [] } : null)
      setHighlightedNode(null)
      setHighlightedEdge(null)
      refetchAxis()
    },
  })

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
          
        case 'clearAxes':
          setAxis(null)
          setHighlightedNode(null)
          setHighlightedEdge(null)
          break
          
        case 'clearAxis':
          // Only update if our axis is being cleared
          if (update.data === axisId) {
            setAxis(prev => prev ? { ...prev, graphs: [] } : null)
            setHighlightedNode(null)
            setHighlightedEdge(null)
          }
          break
          
        case 'updateAxis':
          // Only update if our axis is being updated
          if (update.data.axisId === axisId) {
            setAxis(prev => prev ? { ...prev, ...update.data.updates } : null)
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

  // Load axis function
  const loadAxis = useCallback(async () => {
    try {
      await refetchAxis()
    } catch (error) {
      console.error('Failed to load axis:', error)
    }
  }, [refetchAxis])

  // Clear this axis function
  const clearAxis = useCallback(async () => {
    try {
      await clearAxisMutation.mutateAsync({ axisId })
    } catch (error) {
      console.error('Failed to clear axis:', error)
    }
  }, [clearAxisMutation, axisId])

  return {
    axis,
    loadAxis,
    clearAxis,
    highlightedNode,
    highlightedEdge,
    setHighlightedNode,
    setHighlightedEdge,
  }
} 
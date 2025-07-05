import { useEffect, useState, useCallback } from 'react'
import { Socket } from 'socket.io-client'
import type { Node, Edge } from 'ontology'
import type { GraphWithId } from '../types'

export const useGraphs = (socket: Socket | null) => {
  const [graphs, setGraphs] = useState<GraphWithId[]>([])
  const [currentGraph, setCurrentGraph] = useState<GraphWithId | null>(null)
  const [highlightedNode, setHighlightedNode] = useState<Node | null>(null)
  const [highlightedEdge, setHighlightedEdge] = useState<Edge | null>(null)

  // Load graphs from the API
  const loadGraphs = useCallback(async () => {
    try {
      const response = await fetch('/api/graphs')
      const graphsData = await response.json()
      setGraphs(graphsData)
    } catch (error) {
      console.error('Failed to load graphs:', error)
    }
  }, [])

  // Select a graph by index
  const selectGraph = useCallback((index: number) => {
    if (index >= 0 && index < graphs.length) {
      setCurrentGraph(graphs[index])
      setHighlightedNode(null)
      setHighlightedEdge(null)
    }
  }, [graphs])

  // Handle socket events
  useEffect(() => {
    if (!socket) return

    const handleGraphs = (graphsData: GraphWithId[]) => {
      console.log('Received graphs:', graphsData)
      setGraphs(graphsData)
    }

    const handleNewGraph = (graph: GraphWithId) => {
      console.log('New graph received:', graph)
      setGraphs(prev => [...prev, graph])
      // Auto-select the new graph
      setCurrentGraph(graph)
      setHighlightedNode(null)
      setHighlightedEdge(null)
    }

    socket.on('graphs', handleGraphs)
    socket.on('newGraph', handleNewGraph)

    return () => {
      socket.off('graphs', handleGraphs)
      socket.off('newGraph', handleNewGraph)
    }
  }, [socket])

  // Load graphs on mount
  useEffect(() => {
    loadGraphs()
  }, [loadGraphs])

  return {
    graphs,
    currentGraph,
    selectGraph,
    loadGraphs,
    setCurrentGraph,
    highlightedNode,
    highlightedEdge,
    setHighlightedNode,
    setHighlightedEdge,
  }
} 
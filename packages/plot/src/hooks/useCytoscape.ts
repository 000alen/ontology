import { useEffect, useRef } from 'react'
import cytoscape from 'cytoscape'
import { CYTOSCAPE_STYLES, LAYOUT_CONFIG, CYTOSCAPE_OPTIONS } from '../config/visualization'

interface UseCytoscapeProps {
  elements: any[]
  onNodeTap?: (data: any) => void
  onEdgeTap?: (data: any) => void
}

export function useCytoscape({ elements, onNodeTap, onEdgeTap }: UseCytoscapeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)

  // Initialize cytoscape instance
  useEffect(() => {
    if (!containerRef.current) return

    // Destroy existing instance
    if (cyRef.current) {
      cyRef.current.destroy()
    }

    // Create new cytoscape instance
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style: CYTOSCAPE_STYLES,
      layout: LAYOUT_CONFIG,
      ...CYTOSCAPE_OPTIONS
    })

    // Add event listeners
    if (onNodeTap) {
      cyRef.current.on('tap', 'node', (evt) => {
        const node = evt.target
        const data = node.data()
        onNodeTap(data)
      })
    }

    if (onEdgeTap) {
      cyRef.current.on('tap', 'edge', (evt) => {
        const edge = evt.target
        const data = edge.data()
        onEdgeTap(data)
      })
    }

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy()
        cyRef.current = null
      }
    }
  }, [elements, onNodeTap, onEdgeTap])

  // Handle reset view functionality
  useEffect(() => {
    const handleResetView = () => {
      if (cyRef.current) {
        cyRef.current.fit()
        cyRef.current.center()
      }
    }

    window.addEventListener('resetNetworkView', handleResetView)

    return () => {
      window.removeEventListener('resetNetworkView', handleResetView)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy()
        cyRef.current = null
      }
    }
  }, [])

  return {
    containerRef,
    cytoscapeInstance: cyRef.current
  }
} 
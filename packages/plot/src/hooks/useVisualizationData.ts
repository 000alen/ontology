import { useMemo } from 'react'
import type { AxisData } from '../types'
import { transformAxesToCytoscapeElements } from '../utils/dataTransform'

interface UseVisualizationDataProps {
  axes: AxisData[]
}

export function useVisualizationData({ axes }: UseVisualizationDataProps) {
  const elements = useMemo(() => {
    if (axes.length === 0) return []
    return transformAxesToCytoscapeElements(axes)
  }, [axes])

  const hasData = axes.length > 0
  const nodeCount = elements.filter(el => el.data && !el.data.source).length
  const edgeCount = elements.filter(el => el.data && el.data.source).length

  return {
    elements,
    hasData,
    nodeCount,
    edgeCount
  }
} 
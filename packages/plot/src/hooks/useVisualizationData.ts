import { useMemo } from 'react'
import type { AxisData } from '../types'
import { transformAxesToCytoscapeElements } from '../utils/dataTransform'

interface UseVisualizationDataProps {
  axis: AxisData
}

export function useVisualizationData({ axis }: UseVisualizationDataProps) {
  const elements = useMemo(() => {
    return transformAxesToCytoscapeElements(axis)
  }, [axis])

  const hasData = axis.graphs.length > 0
  const nodeCount = elements.filter(el => el.data && !el.data.source).length
  const edgeCount = elements.filter(el => el.data && el.data.source).length

  return {
    elements,
    hasData,
    nodeCount,
    edgeCount
  }
} 
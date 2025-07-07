import { useState, useEffect } from 'react'
import { trpc } from '../utils/trpc'

export const useConnectionStatus = () => {
  const [status, setStatus] = useState<'connected' | 'disconnected'>('disconnected')

  // Use a simple query to check connection status
  const { isSuccess, isError } = trpc.getAxes.useQuery(undefined, {
    refetchInterval: 5000, // Check every 5 seconds
    retry: 1,
  })

  useEffect(() => {
    if (isSuccess) {
      setStatus('connected')
    } else if (isError) {
      setStatus('disconnected')
    }
  }, [isSuccess, isError])

  return status
} 
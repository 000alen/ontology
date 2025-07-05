import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const newSocket = io()
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Connected to server')
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
    })

    return () => {
      newSocket.close()
    }
  }, [])

  return socket
} 
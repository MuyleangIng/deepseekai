// hooks/useAIWebSocket.ts
import { useState, useEffect, useCallback } from 'react'

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ code: string }>({ code: '' })

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws')
    
    ws.onopen = () => setIsConnected(true)
    ws.onclose = () => setIsConnected(false)
    ws.onerror = () => setError('WebSocket error occurred')
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setResult({ code: data.response || data.choices?.[0]?.message?.content || '' })
        setIsLoading(false)
      } catch (e) {
        setError('Error parsing response')
        setIsLoading(false)
      }
    }

    setSocket(ws)
    return () => ws.close()
  }, [])

  const generateCode = useCallback((prompt: string) => {
    if (socket?.readyState === WebSocket.OPEN) {
      setIsLoading(true)
      setError(null)
      socket.send(prompt)
    } else {
      setError('WebSocket not connected')
    }
  }, [socket])

  return { isConnected, isLoading, error, result, generateCode }
}
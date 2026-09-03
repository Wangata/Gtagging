import { useCallback, useRef, useState } from 'react'
import type { PairingStatus, RemoteInput } from '../types'

const EVENTS_URL = import.meta.env.VITE_EVENTS_URL ?? 'ws://localhost:4002'

export function usePairing() {
  const [status, setStatus] = useState<PairingStatus>('idle')
  const socketRef = useRef<WebSocket | null>(null)

  const connect = useCallback((pairingCode: string) => {
    const trimmed = pairingCode.trim().toUpperCase()
    if (!trimmed) return

    socketRef.current?.close()
    setStatus('connecting')

    const socket = new WebSocket(`${EVENTS_URL}?role=remote&code=${encodeURIComponent(trimmed)}`)
    socketRef.current = socket

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as { type: string }
        if (msg.type === 'paired') setStatus('paired')
        else if (msg.type === 'pending') setStatus('pending')
        else if (msg.type === 'tv_disconnected') setStatus('disconnected')
        else if (msg.type === 'error') setStatus('error')
      } catch {
        // ignore malformed frames
      }
    }
    socket.onerror = () => setStatus('error')
    socket.onclose = () => {
      setStatus((prev) => (prev === 'paired' || prev === 'pending' ? 'disconnected' : prev))
    }
  }, [])

  const sendInput = useCallback((input: RemoteInput) => {
    const socket = socketRef.current
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'input', input }))
    }
  }, [])

  return { status, connect, sendInput }
}

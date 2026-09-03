import { useEffect, useRef } from 'react'
import type { RemoteInput } from '../lib/remoteInput'

const EVENTS_URL = import.meta.env.VITE_EVENTS_URL ?? 'ws://localhost:4002'

interface TvPairingEvent {
  type: string
  code?: string
  remoteCount?: number
  input?: RemoteInput
}

// Registers this TV with the events-service under `code` and forwards
// relayed remote input. Re-registers whenever `code` changes (e.g. the
// debug menu's "Generate Pairing Code" button).
export function useTvPairing(code: string, onInput: (input: RemoteInput) => void, onLog: (message: string) => void) {
  const onInputRef = useRef(onInput)
  const onLogRef = useRef(onLog)
  onInputRef.current = onInput
  onLogRef.current = onLog

  useEffect(() => {
    if (!code) return

    const socket = new WebSocket(`${EVENTS_URL}?role=tv&code=${encodeURIComponent(code)}`)

    socket.onmessage = (event) => {
      let msg: TvPairingEvent
      try {
        msg = JSON.parse(event.data as string)
      } catch {
        return
      }
      if (msg.type === 'registered') {
        onLogRef.current(`[Events Service] Registered for pairing code ${msg.code}`)
      } else if (msg.type === 'remote_connected') {
        onLogRef.current(`[Events Service] Mobile remote connected (${msg.remoteCount} active)`)
      } else if (msg.type === 'remote_disconnected') {
        onLogRef.current(`[Events Service] Mobile remote disconnected (${msg.remoteCount} active)`)
      } else if (msg.type === 'input' && msg.input) {
        onInputRef.current(msg.input)
      }
    }
    socket.onerror = () => onLogRef.current('[Events Service] Connection error')

    return () => socket.close()
  }, [code])
}

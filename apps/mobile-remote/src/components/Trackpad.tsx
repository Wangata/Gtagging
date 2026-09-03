import { useRef, useState, type PointerEvent } from 'react'

interface TrackpadProps {
  onMove: (dx: number, dy: number) => void
  onMicToggle: (active: boolean) => void
}

export function Trackpad({ onMove, onMicToggle }: TrackpadProps) {
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const [micActive, setMicActive] = useState(false)

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    ;(e.target as Element).setPointerCapture(e.pointerId)
    lastPos.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!lastPos.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    if (dx !== 0 || dy !== 0) {
      onMove(dx, dy)
      lastPos.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handlePointerUp = () => {
    lastPos.current = null
  }

  const toggleMic = () => {
    const next = !micActive
    setMicActive(next)
    onMicToggle(next)
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative flex flex-1 min-h-56 touch-none flex-col items-center justify-end rounded-3xl bg-slate-800 pb-6"
    >
      <div className="absolute top-4 h-1 w-10 rounded-full bg-slate-600" />
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleMic()
        }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Microphone"
        className={`flex h-12 w-12 items-center justify-center rounded-full ${
          micActive ? 'bg-red-600' : 'bg-slate-700'
        } text-white`}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" />
          <path d="M19 11a7 7 0 0 1-14 0H3a9 9 0 0 0 8 8.94V22h2v-2.06A9 9 0 0 0 21 11h-2z" />
        </svg>
      </button>
    </div>
  )
}

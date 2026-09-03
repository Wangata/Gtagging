type Direction = 'up' | 'down' | 'left' | 'right' | 'ok'

interface DPadProps {
  onDirection: (direction: Direction) => void
}

function Chevron({ rotate }: { rotate: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ transform: `rotate(${rotate}deg)` }} className="h-5 w-5">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DPad({ onDirection }: DPadProps) {
  return (
    <div className="relative mx-auto flex h-64 w-64 items-center justify-center rounded-full bg-slate-800">
      <button
        onClick={() => onDirection('up')}
        aria-label="Up"
        className="absolute top-3 flex h-10 w-10 items-center justify-center text-slate-400 active:text-white"
      >
        <Chevron rotate={180} />
      </button>
      <button
        onClick={() => onDirection('down')}
        aria-label="Down"
        className="absolute bottom-3 flex h-10 w-10 items-center justify-center text-slate-400 active:text-white"
      >
        <Chevron rotate={0} />
      </button>
      <button
        onClick={() => onDirection('left')}
        aria-label="Left"
        className="absolute left-3 flex h-10 w-10 items-center justify-center text-slate-400 active:text-white"
      >
        <Chevron rotate={90} />
      </button>
      <button
        onClick={() => onDirection('right')}
        aria-label="Right"
        className="absolute right-3 flex h-10 w-10 items-center justify-center text-slate-400 active:text-white"
      >
        <Chevron rotate={-90} />
      </button>
      <button
        onClick={() => onDirection('ok')}
        aria-label="OK"
        className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-white active:bg-slate-600"
      >
        OK
      </button>
    </div>
  )
}

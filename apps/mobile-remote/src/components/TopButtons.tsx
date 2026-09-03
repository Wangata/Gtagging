interface TopButtonsProps {
  onBack: () => void
  onPlay: () => void
}

export function TopButtons({ onBack, onPlay }: TopButtonsProps) {
  return (
    <div className="flex justify-between px-4">
      <button
        onClick={onBack}
        aria-label="Back"
        className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-slate-300 active:bg-slate-700"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path
            d="M12 5a7 7 0 1 1-6.32 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M5 4v5h5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        onClick={onPlay}
        aria-label="Play"
        className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-slate-300 active:bg-slate-700"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 translate-x-0.5">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
    </div>
  )
}

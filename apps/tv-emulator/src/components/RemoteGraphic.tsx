const ArrowUp = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
    <path d="M12 5l7 7-1.4 1.4L13 8.8V19h-2V8.8l-4.6 4.6L5 12z" fill="currentColor" />
  </svg>
)

export function RemoteGraphic() {
  return (
    <div className="flex w-24 shrink-0 flex-col items-center gap-6 rounded-3xl bg-slate-900 p-5 shadow-xl">
      <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-slate-800">
        <button className="absolute top-1 text-slate-400 hover:text-white" aria-label="Up">
          <ArrowUp />
        </button>
        <button
          className="absolute bottom-1 rotate-180 text-slate-400 hover:text-white"
          aria-label="Down"
        >
          <ArrowUp />
        </button>
        <button
          className="absolute left-1 -rotate-90 text-slate-400 hover:text-white"
          aria-label="Left"
        >
          <ArrowUp />
        </button>
        <button
          className="absolute right-1 rotate-90 text-slate-400 hover:text-white"
          aria-label="Right"
        >
          <ArrowUp />
        </button>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-700 text-[11px] font-semibold text-slate-100">
          OK
        </div>
      </div>
      <button className="text-xs text-slate-400 hover:text-white" aria-label="Back">
        ↩
      </button>
      <button className="text-xs text-slate-400 hover:text-white" aria-label="Play">
        ▶
      </button>
    </div>
  )
}

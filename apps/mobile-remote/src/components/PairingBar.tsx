import type { PairingStatus } from '../types'

const STATUS_LABEL: Record<PairingStatus, string> = {
  idle: '',
  connecting: 'Connecting…',
  pending: 'Waiting for TV to accept…',
  paired: '✓ Paired',
  disconnected: 'TV disconnected',
  error: 'Connection error',
}

interface PairingBarProps {
  value: string
  onChange: (value: string) => void
  onPair: () => void
  status: PairingStatus
}

export function PairingBar({ value, onChange, onPair, status }: PairingBarProps) {
  const statusColor =
    status === 'paired'
      ? 'text-emerald-400'
      : status === 'error' || status === 'disconnected'
        ? 'text-red-400'
        : 'text-slate-400'

  return (
    <div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          onPair()
        }}
      >
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="INPUT PAIRING CODE"
          maxLength={7}
          className="flex-1 rounded-lg bg-slate-800 px-4 py-3 text-sm font-medium tracking-wide text-slate-200 placeholder:text-slate-500 outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-500 active:bg-blue-700"
        >
          Pair
        </button>
      </form>
      {status !== 'idle' && <p className={`mt-2 text-xs ${statusColor}`}>{STATUS_LABEL[status]}</p>}
    </div>
  )
}

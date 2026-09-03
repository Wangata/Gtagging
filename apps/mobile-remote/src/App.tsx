import { useState } from 'react'
import { PairingBar } from './components/PairingBar'
import { TopButtons } from './components/TopButtons'
import { DPad } from './components/DPad'
import { Trackpad } from './components/Trackpad'
import { usePairing } from './hooks/usePairing'

export default function App() {
  const { status, connect, sendInput } = usePairing()
  const [codeInput, setCodeInput] = useState('')

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-8 bg-black px-6 pb-8 pt-10 text-white">
      <PairingBar
        value={codeInput}
        onChange={setCodeInput}
        onPair={() => connect(codeInput)}
        status={status}
      />

      <TopButtons
        onBack={() => sendInput({ kind: 'button', name: 'back' })}
        onPlay={() => sendInput({ kind: 'button', name: 'play' })}
      />

      <DPad onDirection={(direction) => sendInput({ kind: 'dpad', direction })} />

      <Trackpad
        onMove={(dx, dy) => sendInput({ kind: 'trackpad', dx, dy })}
        onMicToggle={(active) => sendInput({ kind: 'mic', active })}
      />

      <button
        aria-label="TV display"
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-400"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <rect x="3" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M9 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

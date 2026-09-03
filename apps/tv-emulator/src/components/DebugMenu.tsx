import { useState, type ReactNode } from 'react'
import type { DiagnosticsEntry } from '../types'

interface DebugMenuProps {
  pairingCode: string
  onGeneratePairingCode: () => void
  videoUrl: string
  onVideoUrlChange: (url: string) => void
  programId: string
  onProgramIdChange: (id: string) => void
  measurementId: string
  onMeasurementIdChange: (id: string) => void
  enableClickHandler: boolean
  onToggleClickHandler: (v: boolean) => void
  enableTooltip: boolean
  onToggleTooltip: (v: boolean) => void
  enableControls: boolean
  onToggleControls: (v: boolean) => void
  enableAudio: boolean
  onToggleAudio: (v: boolean) => void
  log: DiagnosticsEntry[]
  onClearLog: () => void
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-100">{title}</h2>
      {children}
    </div>
  )
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-2 py-1 text-sm text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-blue-500"
      />
      {label}
    </label>
  )
}

export function DebugMenu(props: DebugMenuProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard?.writeText(props.pairingCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <aside className="flex h-full w-[360px] shrink-0 flex-col gap-4 overflow-y-auto border-r border-slate-800 bg-slate-950 p-4">
      <SectionCard title="Device Pairing">
        <p className="mb-3 text-xs leading-relaxed text-slate-400">
          Generate a random code to simulate a mobile remote pairing to this TV.
        </p>
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Pairing Code
        </label>
        <div className="mb-3 flex gap-2">
          <input
            readOnly
            value={props.pairingCode}
            className="flex-1 rounded border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-sm text-slate-100"
          />
          <button
            onClick={handleCopy}
            className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <button
          onClick={props.onGeneratePairingCode}
          className="w-full rounded bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Generate Pairing Code
        </button>
        <p className="mt-2 text-xs text-emerald-400">
          ✓ Device is ready to pair with code: {props.pairingCode}
        </p>
      </SectionCard>

      <SectionCard title="Media Source Manager">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Video Source URL
        </label>
        <input
          value={props.videoUrl}
          onChange={(e) => props.onVideoUrlChange(e.target.value)}
          className="mb-3 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-100"
        />
        <div className="mb-1 border-t border-slate-800 pt-2" />
        <Checkbox
          checked={props.enableClickHandler}
          onChange={props.onToggleClickHandler}
          label="Enable Click Handler"
        />
        <Checkbox
          checked={props.enableTooltip}
          onChange={props.onToggleTooltip}
          label="Enable Coordinate Tooltip"
        />
        <Checkbox
          checked={props.enableControls}
          onChange={props.onToggleControls}
          label="Enable Video Controls"
        />
        <Checkbox checked={props.enableAudio} onChange={props.onToggleAudio} label="Enable Audio" />
      </SectionCard>

      <SectionCard title="Sandbox Mode">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Program ID
        </label>
        <input
          value={props.programId}
          onChange={(e) => props.onProgramIdChange(e.target.value)}
          className="mb-3 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-xs text-slate-100"
        />
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
          GA Measurement ID (optional — your own sandbox property, not GrabTV's)
        </label>
        <input
          value={props.measurementId}
          onChange={(e) => props.onMeasurementIdChange(e.target.value)}
          placeholder="G-XXXXXXXXXX"
          className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-xs text-slate-100"
        />
      </SectionCard>

      <SectionCard title="Client Diagnostics Log">
        <div className="mb-2 flex justify-end">
          <button
            onClick={props.onClearLog}
            className="text-xs text-slate-400 underline hover:text-slate-200"
          >
            Clear Log
          </button>
        </div>
        <div className="h-56 overflow-y-auto rounded border border-slate-800 bg-black/40 p-2 font-mono text-[11px] leading-relaxed text-blue-300">
          {props.log.length === 0 && <p className="text-slate-600">No events yet.</p>}
          {props.log.map((entry) => (
            <p key={entry.id} className="mb-1 whitespace-pre-wrap break-words">
              <span className="text-slate-500">[{entry.time}]</span> {entry.message}
            </p>
          ))}
        </div>
      </SectionCard>
    </aside>
  )
}

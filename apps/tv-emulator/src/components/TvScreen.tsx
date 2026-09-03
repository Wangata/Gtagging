import { useEffect, useState } from 'react'
import type { TelemetryDetail, QueryResult } from '../types'
import { hashProgramId } from '../lib/programId'

interface TvScreenProps {
  videoUrl: string
  programId: string
  measurementId: string
  enableClickHandler: boolean
  enableTooltip: boolean
  enableControls: boolean
  enableAudio: boolean
  onLog: (message: string) => void
}

interface OverlayState {
  leftPercent: number
  topPercent: number
  match?: QueryResult
}

export function TvScreen(props: TvScreenProps) {
  const mountKey = `${props.videoUrl}::${props.enableClickHandler}::${props.programId}`
  const [overlay, setOverlay] = useState<OverlayState | null>(null)

  useEffect(() => {
    setOverlay(null)
    if (!props.enableClickHandler) return

    const hashed = hashProgramId(props.programId)
    if (!hashed) {
      props.onLog(`[GrabTV SDK] Invalid programId "${props.programId}" — not injecting SDK.`)
      return
    }
    window.programId = hashed
    if (props.measurementId) {
      window.measurementId = props.measurementId
    } else {
      delete window.measurementId
    }

    const onReady = () => props.onLog('[GrabTV SDK] Ready. Listening for clicks on target-video.')

    const onTelemetry = (e: Event) => {
      const detail = (e as CustomEvent<TelemetryDetail>).detail
      props.onLog(
        `[GrabTV SDK] Telemetry POST → left:${detail.leftPercent}% top:${detail.topPercent}% t:${detail.currentTime}s`
      )
      setOverlay({ leftPercent: detail.leftPercent, topPercent: detail.topPercent })

      fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(detail),
      })
        .then((res) => res.json())
        .then((results: QueryResult[]) => {
          const nearest = results[0]
          if (nearest) {
            props.onLog(
              `[Tracking Service] Nearest match: ${nearest.item.name} (${nearest.distance}% away)`
            )
            setOverlay({
              leftPercent: detail.leftPercent,
              topPercent: detail.topPercent,
              match: nearest,
            })
          }
        })
        .catch(() => props.onLog('[Tracking Service] Query failed'))
    }

    const onGaHit = (e: Event) => {
      const detail = (e as CustomEvent<{ type: string; measurementId: string }>).detail
      props.onLog(`Sandbox GA Hit Dispatched: Event fired directly to ${detail.measurementId}`)
    }

    window.addEventListener('grabtv:ready', onReady)
    window.addEventListener('grabtv:telemetry', onTelemetry)
    window.addEventListener('grabtv:ga-hit', onGaHit)

    const script = document.createElement('script')
    script.src = '/grabtv-client.js'
    script.async = false
    document.body.appendChild(script)
    props.onLog('[System] Sandbox Client loaded. Click on the video to generate events!')

    return () => {
      window.removeEventListener('grabtv:ready', onReady)
      window.removeEventListener('grabtv:telemetry', onTelemetry)
      window.removeEventListener('grabtv:ga-hit', onGaHit)
      script.remove()
    }
    // mountKey intentionally drives re-run; props.onLog is stable enough for this demo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mountKey])

  return (
    <div className="relative mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-lg bg-black shadow-2xl">
      <div key={mountKey} className="relative h-full w-full">
        <video
          id="target-video"
          className="h-full w-full object-contain"
          src={props.videoUrl}
          autoPlay
          loop
          playsInline
          muted={!props.enableAudio}
          controls={props.enableControls}
        />
        {props.enableClickHandler && <div id="click-handler" />}
      </div>

      {overlay && props.enableTooltip && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded bg-black/80 px-2 py-1 font-mono text-[10px] text-emerald-300"
          style={{ left: `${overlay.leftPercent}%`, top: `${overlay.topPercent}%` }}
        >
          {overlay.leftPercent.toFixed(1)}%, {overlay.topPercent.toFixed(1)}%
        </div>
      )}

      {overlay?.match && (
        <div
          className="absolute w-64 -translate-y-full rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl"
          style={{
            left: `${overlay.match.item.leftPercent}%`,
            top: `${overlay.match.item.topPercent}%`,
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-white">{overlay.match.item.name}</p>
              <p className="text-xs text-slate-400">{overlay.match.item.brand}</p>
            </div>
            <button
              className="text-slate-400 hover:text-white"
              onClick={() => setOverlay(null)}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-emerald-400">
              {overlay.match.item.availability === 'in_stock'
                ? 'In Stock'
                : overlay.match.item.availability}
            </span>
            <button className="rounded bg-white px-3 py-1 text-xs font-semibold text-black hover:bg-slate-200">
              Buy Now
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

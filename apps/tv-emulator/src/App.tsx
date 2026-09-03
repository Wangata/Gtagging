import { useCallback, useState } from 'react'
import { DebugMenu } from './components/DebugMenu'
import { TvScreen } from './components/TvScreen'
import { RemoteGraphic } from './components/RemoteGraphic'
import { generatePairingCode } from './lib/pairing'
import type { DiagnosticsEntry } from './types'

const DEFAULT_VIDEO_URL = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
const DEFAULT_PROGRAM_ID = 'grabtv-sandbox-demo'

export default function App() {
  const [pairingCode, setPairingCode] = useState(() => generatePairingCode())
  const [videoUrl, setVideoUrl] = useState(DEFAULT_VIDEO_URL)
  const [programId, setProgramId] = useState(DEFAULT_PROGRAM_ID)
  const [measurementId, setMeasurementId] = useState('')
  const [enableClickHandler, setEnableClickHandler] = useState(true)
  const [enableTooltip, setEnableTooltip] = useState(true)
  const [enableControls, setEnableControls] = useState(false)
  const [enableAudio, setEnableAudio] = useState(false)
  const [log, setLog] = useState<DiagnosticsEntry[]>([])

  const addLog = useCallback((message: string) => {
    setLog((prev) => [
      ...prev.slice(-199),
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: new Date().toLocaleTimeString(),
        message,
      },
    ])
  }, [])

  return (
    <div className="flex h-screen w-screen bg-slate-950">
      <DebugMenu
        pairingCode={pairingCode}
        onGeneratePairingCode={() => setPairingCode(generatePairingCode())}
        videoUrl={videoUrl}
        onVideoUrlChange={setVideoUrl}
        programId={programId}
        onProgramIdChange={setProgramId}
        measurementId={measurementId}
        onMeasurementIdChange={setMeasurementId}
        enableClickHandler={enableClickHandler}
        onToggleClickHandler={setEnableClickHandler}
        enableTooltip={enableTooltip}
        onToggleTooltip={setEnableTooltip}
        enableControls={enableControls}
        onToggleControls={setEnableControls}
        enableAudio={enableAudio}
        onToggleAudio={setEnableAudio}
        log={log}
        onClearLog={() => setLog([])}
      />

      <main className="flex flex-1 items-center justify-center gap-6 p-8">
        <TvScreen
          videoUrl={videoUrl}
          programId={programId}
          measurementId={measurementId}
          enableClickHandler={enableClickHandler}
          enableTooltip={enableTooltip}
          enableControls={enableControls}
          enableAudio={enableAudio}
          onLog={addLog}
        />
        <RemoteGraphic />
      </main>
    </div>
  )
}

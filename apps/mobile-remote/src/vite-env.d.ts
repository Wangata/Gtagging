/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EVENTS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

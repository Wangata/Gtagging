import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import { sandboxApiPlugin } from './server/sandboxApi.ts'

// Serves the built SDK from the sibling workspace package at /grabtv-client.js,
// mimicking the real CDN script tag. Reads from disk per-request (not copied
// into /public) so a `npm run dev` rebuild of the SDK is picked up immediately
// without needing Vite to rescan its public-dir file cache.
function serveClientSdk(): Plugin {
  const src = resolve(import.meta.dirname, '../../packages/client-sdk/dist/grabtv-client.js')
  return {
    name: 'serve-client-sdk',
    configureServer(server) {
      server.middlewares.use('/grabtv-client.js', (_req, res) => {
        if (!existsSync(src)) {
          res.statusCode = 404
          res.end('grabtv-client.js not built yet — run `npm run build -w @grabtv/client-sdk`')
          return
        }
        res.setHeader('Content-Type', 'application/javascript')
        res.end(readFileSync(src))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), serveClientSdk(), sandboxApiPlugin()],
})

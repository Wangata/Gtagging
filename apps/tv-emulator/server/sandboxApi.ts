import type { Plugin, Connect } from 'vite'

/**
 * Local stand-ins for the two GrabTV backend calls this app makes:
 *  - POST /api/telemetry  (the client SDK's fire-and-forget click ping)
 *  - POST /api/query      (nearest-catalog-item lookup, shaped like the
 *                          real Temporal Mapping & Tracking Service's
 *                          POST /query — see docs/GRABTV_SERVICE.md)
 *
 * Sandbox only: no GrabTV keys, no real catalog. Swap for the real service
 * base URL once it exists.
 */

interface DemoItem {
  uniqueID: string
  name: string
  brand: string
  price: number
  currency: string
  availability: 'in_stock' | 'out_of_stock' | 'preorder'
  leftPercent: number
  topPercent: number
  thumbnailUrl: string
  purchaseUrl: string
}

const DEMO_CATALOG: DemoItem[] = [
  {
    uniqueID: 'demo-chrysler-pacifica',
    name: '2023 Chrysler Pacifica L',
    brand: 'Demo Motors',
    price: 38995,
    currency: 'USD',
    availability: 'in_stock',
    leftPercent: 38,
    topPercent: 62,
    thumbnailUrl: '',
    purchaseUrl: '#',
  },
  {
    uniqueID: 'demo-sedan-lx',
    name: 'Compact Sedan LX',
    brand: 'Demo Motors',
    price: 24995,
    currency: 'USD',
    availability: 'in_stock',
    leftPercent: 78,
    topPercent: 32,
    thumbnailUrl: '',
    purchaseUrl: '#',
  },
]

function readJsonBody(req: Connect.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => (raw += chunk))
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.round(Math.hypot(ax - bx, ay - by) * 100) / 100
}

export function sandboxApiPlugin(): Plugin {
  return {
    name: 'grabtv-sandbox-api',
    configureServer(server) {
      server.middlewares.use('/api/telemetry', async (req, res) => {
        if (req.method !== 'POST') return res.end()
        const payload = await readJsonBody(req)
        console.log('[sandbox /api/telemetry]', payload)
        res.statusCode = 202
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ ok: true }))
      })

      server.middlewares.use('/api/query', async (req, res) => {
        if (req.method !== 'POST') return res.end()
        const body = await readJsonBody(req)
        const leftPercent = Number(body.leftPercent) || 0
        const topPercent = Number(body.topPercent) || 0

        const results = DEMO_CATALOG.map((item) => ({
          uniqueID: item.uniqueID,
          distance: distance(leftPercent, topPercent, item.leftPercent, item.topPercent),
          matched: true,
          coordinates: { xPercent: item.leftPercent, yPercent: item.topPercent },
          item,
        })).sort((a, b) => a.distance - b.distance)

        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(results))
      })

      server.middlewares.use('/api/session-token', async (req, res) => {
        if (req.method !== 'POST') return res.end()
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ token: `sandbox_${Math.random().toString(36).slice(2, 10)}` }))
      })
    },
  }
}

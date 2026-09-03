# GrabTV Sandbox

A local, sandboxed rebuild of GrabTV's shoppable-video system for the Azure
gig — no GrabTV production keys, catalog, or infrastructure involved.
Everything here runs against mock local endpoints so it can be developed and
demoed independently.

Spec documents GrabTV provided live in [docs/](docs/).

## Workspaces

- **[packages/client-sdk](packages/client-sdk)** — the browser SDK
  (`grabtv-client.js`) that overlays a click-tracking layer on a `<video>`
  element and posts click telemetry. Implements the contract in
  [docs/GRABTV_CLIENT.md](docs/GRABTV_CLIENT.md).
- **[apps/tv-emulator](apps/tv-emulator)** — React/Tailwind TV emulator app
  that hosts the SDK, exposes a debug menu (pairing code, video source,
  sandbox GA mode), and mocks the `/api/telemetry` and `/api/query` backend
  calls so clicking the video resolves a nearby catalog item end-to-end.
- **[apps/tracking-service](apps/tracking-service)** — Node/Express service
  implementing [docs/GRABTV_SERVICE.md](docs/GRABTV_SERVICE.md): resolves a
  click point + timestamp into a catalogue list sorted by spatial proximity.
  Runs against a local sample recording/catalog by default (no `SHEET_ID`
  needed); set `SHEET_ID` to point it at a real published Google Sheet.
  `npm test -w tracking-service` runs its offline test suite.

Not yet wired together: the TV emulator's `/api/query` mock and this
service are independent for now — same request/response shape, ready to
swap once you want the emulator hitting the real resolver.

Planned next: the AI Tagging & Catalog Service
([docs/GRABTV_AI_TAGGING_AND_CATALOG_SERVICE.md](docs/GRABTV_AI_TAGGING_AND_CATALOG_SERVICE.md)),
a Mobile Remote app, and Azure deployment scaffolding
([docs/GRABTV_ENVIRONMENTS_AZURE.md](docs/GRABTV_ENVIRONMENTS_AZURE.md)).

## Run

```bash
npm install
npm run build -w @grabtv/client-sdk
npm run dev -w tv-emulator          # http://localhost:5173
npm run dev -w tracking-service     # http://localhost:4001
```

Open http://localhost:5173. Toggle "Enable Click Handler" and click the
video — the debug menu's diagnostics log shows the SDK loading, computing
click telemetry, and the mock tracking service resolving a nearby catalog
item.

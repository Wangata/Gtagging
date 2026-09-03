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

Planned next: the Temporal Mapping & Tracking Service
([docs/GRABTV_SERVICE.md](docs/GRABTV_SERVICE.md)), the AI Tagging & Catalog
Service ([docs/GRABTV_AI_TAGGING_AND_CATALOG_SERVICE.md](docs/GRABTV_AI_TAGGING_AND_CATALOG_SERVICE.md)),
a Mobile Remote app, and Azure deployment scaffolding
([docs/GRABTV_ENVIRONMENTS_AZURE.md](docs/GRABTV_ENVIRONMENTS_AZURE.md)).

## Run

```bash
npm install
npm run build -w @grabtv/client-sdk
npm run dev -w tv-emulator
```

Open http://localhost:5173. Toggle "Enable Click Handler" and click the
video — the debug menu's diagnostics log shows the SDK loading, computing
click telemetry, and the mock tracking service resolving a nearby catalog
item.

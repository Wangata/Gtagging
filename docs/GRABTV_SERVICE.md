# Temporal Mapping & Tracking Service

A Node.js microservice that resolves a client's point-in-time query into a
catalogue list sorted by spatial proximity.

## How it works

1. The client webapp POSTs a query: a point on a 2D plane (`leftPercent` /
   `topPercent`), a `currentTime` in seconds, and viewport info.
2. `currentTime` is **rounded** to the nearest integer to pick a 1-second sample
   from the recording (index === second).
3. If that second holds tracked items, the service computes the **Euclidean
   distance in percent space** (resolution-independent) from the query point to
   each tracked item and sorts **nearest-to-farthest**.
4. It loads the catalogue from the **first tab** of a published Google Sheet
   (gviz JSON), parsed by `objectifyGoogleSheet`.
5. Each tracked item is joined to its sheet row by `uniqueID`. Items with no
   matching row are returned as a `{ uniqueID }` stub with `matched: false`.
6. The sorted array is returned to the client. An empty/out-of-range second
   returns `[]`.

## Request

`POST /query`

```json
{
  "programUID": "prg_82c6de34",
  "leftPercent": 34.82,
  "topPercent": 56.12,
  "leftPixels": 222.85,
  "topPixels": 359.17,
  "currentTime": 14.52,
  "clientViewportWidth": 1920,
  "clientViewportHeight": 1080,
  "authToken": "sess_8x8b2u9a"
}
```

`programUID` and `authToken` are accepted but not currently acted upon (see
"Swap points"). Required numeric fields: `currentTime`, `leftPercent`,
`topPercent`.

## Response

An array sorted nearest-to-farthest. Each element carries the raw sheet row,
the item's coordinates in **both** percent and pixel space, and the computed
distance:

```json
[
  {
    "uniqueID": "peojes8388",
    "distance": 1.04,
    "matched": true,
    "coordinates": { "xPercent": 48.96, "yPercent": 42.96, "xPixel": 940, "yPixel": 464 },
    "item": { "uniqueID": "peojes8388", "name": "...", "price": "...", "...": "..." }
  },
  {
    "uniqueID": "prochr7503",
    "distance": 56.33,
    "matched": false,
    "coordinates": { "xPercent": 99.17, "yPercent": 70.49, "xPixel": 1428, "yPixel": 571 },
    "item": { "uniqueID": "prochr7503" }
  }
]
```

## Run

```bash
npm install
npm run dev      # watch mode (tsx)
# or
npm run build && npm start
npm test         # offline test suite
```

Environment variables: `PORT`, `SHEET_ID`, `SHEET_CACHE_TTL_MS`,
`RECORDING_CACHE_TTL_MS`, `CORS_ORIGIN`.

## Swap points (stand-ins for the production data layer)

The two data sources are isolated behind interfaces so the rest of the service
never changes when you move to a real backend:

- `src/recordingSource.ts` — `RecordingSource`. Currently reads
  `data/project.json`; in production, look up the recording by `programUID` in
  the database.
- `src/sheetSource.ts` — `SheetSource`. Currently fetches the live Google Sheet;
  replace with a database query if/when the catalogue moves.

`programUID` is already threaded through to the recording lookup, and
`authToken` is where a real session check would live.

## Layout

```
src/
  server.ts                HTTP layer (Express): POST /query, GET /health
  resolver.ts              core: index resolution, distance, sort, join
  recordingSource.ts       recording lookup (stand-in: project.json)
  sheetSource.ts           sheet fetch + gviz parse + cache (stand-in: live sheet)
  objectifyGoogleSheet.ts  typed port of the reference gviz parser
  config.ts                configuration
  types.ts                 shared domain types
  test.ts                  offline test suite
data/
  project.json             sample recording
```

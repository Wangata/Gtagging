export const config = {
  port: Number(process.env.PORT) || 4001,
  // When unset, falls back to the local sample catalog (data/catalog.json)
  // instead of a real published Google Sheet — no external ID required.
  sheetId: process.env.SHEET_ID || null,
  sheetCacheTtlMs: Number(process.env.SHEET_CACHE_TTL_MS) || 60_000,
  recordingCacheTtlMs: Number(process.env.RECORDING_CACHE_TTL_MS) || 60_000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

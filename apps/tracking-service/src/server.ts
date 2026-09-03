import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { LocalJsonRecordingSource } from './recordingSource.js';
import { resolveQuery } from './resolver.js';
import { LiveGoogleSheetSource, LocalJsonSheetSource } from './sheetSource.js';
import type { QueryRequest, SheetSource } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const recordingSource = new LocalJsonRecordingSource(
  join(__dirname, '../data/project.json'),
  config.recordingCacheTtlMs
);

const sheetSource: SheetSource = config.sheetId
  ? new LiveGoogleSheetSource(config.sheetId, config.sheetCacheTtlMs)
  : new LocalJsonSheetSource(join(__dirname, '../data/catalog.json'));

const app = express();
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/query', async (req, res) => {
  const body = req.body as Partial<QueryRequest>;

  if (
    typeof body.currentTime !== 'number' ||
    typeof body.leftPercent !== 'number' ||
    typeof body.topPercent !== 'number'
  ) {
    res.status(400).json({
      error: 'currentTime, leftPercent, and topPercent are required numeric fields',
    });
    return;
  }

  try {
    const results = await resolveQuery(body as QueryRequest, recordingSource, sheetSource);
    res.json(results);
  } catch (err) {
    console.error('[tracking-service] /query failed:', err);
    res.status(502).json({ error: 'catalog_unavailable' });
  }
});

app.listen(config.port, () => {
  const catalogMode = config.sheetId ? 'live Google Sheet' : 'local sample catalog';
  console.log(`[tracking-service] listening on :${config.port} (catalog: ${catalogMode})`);
});

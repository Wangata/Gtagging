import { readFile } from 'node:fs/promises';
import type { Recording, RecordingSource } from './types.js';

// Stand-in: reads the one sample recording from data/project.json.
// Swap point — in production, look up the recording by programUID in the database.
export class LocalJsonRecordingSource implements RecordingSource {
  private cache: { data: Recording; expiresAt: number } | null = null;

  constructor(
    private filePath: string,
    private ttlMs: number
  ) {}

  async getRecording(_programUID?: string): Promise<Recording | null> {
    if (this.cache && this.cache.expiresAt > Date.now()) return this.cache.data;

    const raw = await readFile(this.filePath, 'utf-8');
    const data = JSON.parse(raw) as Recording;
    this.cache = { data, expiresAt: Date.now() + this.ttlMs };
    return data;
  }
}

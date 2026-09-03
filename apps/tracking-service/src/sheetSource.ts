import { readFile } from 'node:fs/promises';
import { objectifyGoogleSheet } from './objectifyGoogleSheet.js';
import type { SheetSource } from './types.js';

// Production stand-in: fetches the first tab of a published Google Sheet.
// Swap point — replace with a database query if/when the catalogue moves.
export class LiveGoogleSheetSource implements SheetSource {
  private cache: { data: Record<string, unknown>[]; expiresAt: number } | null = null;

  constructor(
    private sheetId: string,
    private ttlMs: number
  ) {}

  async getCatalog(): Promise<Record<string, unknown>[]> {
    if (this.cache && this.cache.expiresAt > Date.now()) return this.cache.data;

    const url = `https://docs.google.com/spreadsheets/d/${this.sheetId}/gviz/tq?tqx=out:json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch catalog sheet: ${res.status}`);
    const text = await res.text();

    const data = objectifyGoogleSheet(text);
    this.cache = { data, expiresAt: Date.now() + this.ttlMs };
    return data;
  }
}

// Sandbox default: no SHEET_ID needed to run this service locally.
export class LocalJsonSheetSource implements SheetSource {
  constructor(private filePath: string) {}

  async getCatalog(): Promise<Record<string, unknown>[]> {
    const raw = await readFile(this.filePath, 'utf-8');
    return JSON.parse(raw) as Record<string, unknown>[];
  }
}

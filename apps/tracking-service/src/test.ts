import assert from 'node:assert/strict';
import { resolveQuery } from './resolver.js';
import type { Recording, RecordingSource, SheetSource } from './types.js';

const SAMPLE_RECORDING: Recording = {
  programUID: 'prg_test',
  frames: [
    [], // second 0: empty
    [{ uniqueID: 'near', xPercent: 50, yPercent: 50 }],
    [
      { uniqueID: 'near', xPercent: 50, yPercent: 50 },
      { uniqueID: 'far', xPercent: 90, yPercent: 90 },
      { uniqueID: 'unmatched', xPercent: 20, yPercent: 20 },
    ],
  ],
};

const SAMPLE_CATALOG: Record<string, unknown>[] = [
  { uniqueID: 'near', name: 'Nearby Item', price: 9.99 },
  { uniqueID: 'far', name: 'Distant Item', price: 19.99 },
];

function fakeRecordingSource(recording: Recording | null): RecordingSource {
  return { getRecording: async () => recording };
}

function fakeSheetSource(catalog: Record<string, unknown>[]): SheetSource {
  return { getCatalog: async () => catalog };
}

const tests: [string, () => Promise<void> | void][] = [
  [
    'out-of-range second returns []',
    async () => {
      const results = await resolveQuery(
        { leftPercent: 0, topPercent: 0, currentTime: 99 },
        fakeRecordingSource(SAMPLE_RECORDING),
        fakeSheetSource(SAMPLE_CATALOG)
      );
      assert.deepEqual(results, []);
    },
  ],
  [
    'empty second returns []',
    async () => {
      const results = await resolveQuery(
        { leftPercent: 0, topPercent: 0, currentTime: 0 },
        fakeRecordingSource(SAMPLE_RECORDING),
        fakeSheetSource(SAMPLE_CATALOG)
      );
      assert.deepEqual(results, []);
    },
  ],
  [
    'no recording returns []',
    async () => {
      const results = await resolveQuery(
        { leftPercent: 0, topPercent: 0, currentTime: 1 },
        fakeRecordingSource(null),
        fakeSheetSource(SAMPLE_CATALOG)
      );
      assert.deepEqual(results, []);
    },
  ],
  [
    'currentTime rounds to nearest second (index === second)',
    async () => {
      const results = await resolveQuery(
        { leftPercent: 50, topPercent: 50, currentTime: 1.4 },
        fakeRecordingSource(SAMPLE_RECORDING),
        fakeSheetSource(SAMPLE_CATALOG)
      );
      assert.equal(results.length, 1);
      assert.equal(results[0].uniqueID, 'near');
    },
  ],
  [
    'sorts nearest-to-farthest by Euclidean percent distance',
    async () => {
      const results = await resolveQuery(
        { leftPercent: 50, topPercent: 50, currentTime: 2 },
        fakeRecordingSource(SAMPLE_RECORDING),
        fakeSheetSource(SAMPLE_CATALOG)
      );
      assert.deepEqual(
        results.map((r) => r.uniqueID),
        ['near', 'unmatched', 'far']
      );
      assert.equal(results[0].distance, 0);
      assert.ok(results[0].distance < results[1].distance);
      assert.ok(results[1].distance < results[2].distance);
    },
  ],
  [
    'joins matched items to their catalog row',
    async () => {
      const results = await resolveQuery(
        { leftPercent: 50, topPercent: 50, currentTime: 2 },
        fakeRecordingSource(SAMPLE_RECORDING),
        fakeSheetSource(SAMPLE_CATALOG)
      );
      const near = results.find((r) => r.uniqueID === 'near')!;
      assert.equal(near.matched, true);
      assert.equal(near.item.name, 'Nearby Item');
    },
  ],
  [
    'returns a stub for items with no matching catalog row',
    async () => {
      const results = await resolveQuery(
        { leftPercent: 50, topPercent: 50, currentTime: 2 },
        fakeRecordingSource(SAMPLE_RECORDING),
        fakeSheetSource(SAMPLE_CATALOG)
      );
      const unmatched = results.find((r) => r.uniqueID === 'unmatched')!;
      assert.equal(unmatched.matched, false);
      assert.deepEqual(unmatched.item, { uniqueID: 'unmatched' });
    },
  ],
  [
    'computes pixel coordinates when viewport dimensions are provided',
    async () => {
      const results = await resolveQuery(
        {
          leftPercent: 50,
          topPercent: 50,
          currentTime: 1,
          clientViewportWidth: 1920,
          clientViewportHeight: 1080,
        },
        fakeRecordingSource(SAMPLE_RECORDING),
        fakeSheetSource(SAMPLE_CATALOG)
      );
      assert.equal(results[0].coordinates.xPixel, 960);
      assert.equal(results[0].coordinates.yPixel, 540);
    },
  ],
  [
    'omits pixel coordinates when viewport dimensions are absent',
    async () => {
      const results = await resolveQuery(
        { leftPercent: 50, topPercent: 50, currentTime: 1 },
        fakeRecordingSource(SAMPLE_RECORDING),
        fakeSheetSource(SAMPLE_CATALOG)
      );
      assert.equal(results[0].coordinates.xPixel, undefined);
      assert.equal(results[0].coordinates.yPixel, undefined);
    },
  ],
];

async function run() {
  let passed = 0;
  let failed = 0;

  for (const [name, fn] of tests) {
    try {
      await fn();
      console.log(`  ok - ${name}`);
      passed++;
    } catch (err) {
      console.error(`  FAIL - ${name}`);
      console.error(err instanceof Error ? err.message : err);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run();

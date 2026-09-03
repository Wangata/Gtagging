import type {
  QueryRequest,
  QueryResultItem,
  RecordingSource,
  SheetSource,
} from './types.js';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function resolveQuery(
  request: QueryRequest,
  recordingSource: RecordingSource,
  sheetSource: SheetSource
): Promise<QueryResultItem[]> {
  const recording = await recordingSource.getRecording(request.programUID);
  if (!recording) return [];

  const second = Math.round(request.currentTime);
  const items = recording.frames[second];
  if (!items || items.length === 0) return [];

  const catalog = await sheetSource.getCatalog();
  const catalogById = new Map(catalog.map((row) => [String(row.uniqueID), row]));

  const hasViewport =
    typeof request.clientViewportWidth === 'number' &&
    typeof request.clientViewportHeight === 'number';

  const results: QueryResultItem[] = items.map((item) => {
    const row = catalogById.get(item.uniqueID);
    const distance = round2(
      Math.hypot(request.leftPercent - item.xPercent, request.topPercent - item.yPercent)
    );
    const coordinates = {
      xPercent: item.xPercent,
      yPercent: item.yPercent,
      ...(hasViewport
        ? {
            xPixel: round2((item.xPercent / 100) * request.clientViewportWidth!),
            yPixel: round2((item.yPercent / 100) * request.clientViewportHeight!),
          }
        : {}),
    };

    return row
      ? { uniqueID: item.uniqueID, distance, matched: true, coordinates, item: row }
      : {
          uniqueID: item.uniqueID,
          distance,
          matched: false,
          coordinates,
          item: { uniqueID: item.uniqueID },
        };
  });

  return results.sort((a, b) => a.distance - b.distance);
}

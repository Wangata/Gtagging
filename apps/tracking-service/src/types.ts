export interface TrackedItem {
  uniqueID: string;
  xPercent: number;
  yPercent: number;
}

export interface Recording {
  programUID: string;
  /** frames[second] = items tracked at that 1-second sample; index === second */
  frames: TrackedItem[][];
}

export interface QueryRequest {
  programUID?: string;
  leftPercent: number;
  topPercent: number;
  leftPixels?: number;
  topPixels?: number;
  currentTime: number;
  clientViewportWidth?: number;
  clientViewportHeight?: number;
  authToken?: string;
}

export interface QueryResultItem {
  uniqueID: string;
  distance: number;
  matched: boolean;
  coordinates: {
    xPercent: number;
    yPercent: number;
    xPixel?: number;
    yPixel?: number;
  };
  item: Record<string, unknown>;
}

export interface RecordingSource {
  /** `programUID` is threaded through for a future DB-backed lookup; the
   *  local stand-in ignores it and returns its one sample recording. */
  getRecording(programUID?: string): Promise<Recording | null>;
}

export interface SheetSource {
  getCatalog(): Promise<Record<string, unknown>[]>;
}

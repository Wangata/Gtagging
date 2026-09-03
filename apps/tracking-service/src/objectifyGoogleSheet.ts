// Typed port of the standard Google Visualization ("gviz") response parser.
// A published Google Sheet's `/gviz/tq?tqx=out:json` endpoint returns a
// JSONP-wrapped table; this unwraps it into an array of plain row objects
// keyed by column label (falling back to the column id).

interface GvizCell {
  v: unknown;
  f?: string;
}

interface GvizRow {
  c: (GvizCell | null)[];
}

interface GvizCol {
  id: string;
  label: string;
  type: string;
}

interface GvizResponse {
  table: {
    cols: GvizCol[];
    rows: GvizRow[];
  };
}

const RESPONSE_WRAPPER = /google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/;

export function objectifyGoogleSheet(raw: string): Record<string, unknown>[] {
  const match = raw.match(RESPONSE_WRAPPER);
  const jsonText = match ? match[1] : raw;
  const parsed = JSON.parse(jsonText) as GvizResponse;

  const keys = parsed.table.cols.map((col, i) => col.label?.trim() || col.id || `col${i}`);

  return parsed.table.rows.map((row) => {
    const obj: Record<string, unknown> = {};
    row.c.forEach((cell, i) => {
      obj[keys[i]] = cell ? cell.v : null;
    });
    return obj;
  });
}

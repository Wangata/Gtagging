// Mirrors the hashing algorithm inside @grabtv/client-sdk's
// window.generateProgramIdHash. A dynamically-injected SDK script (as this
// SPA does) hasn't executed yet at the point we need window.programId set,
// so we precompute the same deterministic hash ourselves rather than racing
// the script's load event.
const PROGRAM_ID_PATTERN = /^[a-zA-Z0-9_-]{7,44}$/

function fnv1aHash(input: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function hashProgramId(programId: string): string | null {
  if (!programId || !PROGRAM_ID_PATTERN.test(programId)) return null
  return `prg_${fnv1aHash(programId)}`
}

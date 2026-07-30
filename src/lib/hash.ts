/** Deterministic 7-char hex "commit hash" from a string (djb2). Cosmetic only. */
export function shortHash(input: string): string {
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0
  }
  return hash.toString(16).padStart(7, '0').slice(0, 7)
}

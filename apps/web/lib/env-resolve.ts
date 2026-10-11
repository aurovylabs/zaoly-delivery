/**
 * Read ZAOLY_* (or NEXT_PUBLIC_ZAOLY_*) first; fall back to CREATION_* legacy aliases
 * from the suite fork so old env files / tests still resolve.
 */
export function envGet(primaryKey: string): string | undefined {
  const primary = process.env[primaryKey]
  if (primary != null && String(primary).trim() !== '') return primary
  if (primaryKey.startsWith('NEXT_PUBLIC_ZAOLY_')) {
    const legacy = `NEXT_PUBLIC_CREATION_${primaryKey.slice('NEXT_PUBLIC_ZAOLY_'.length)}`
    const v = process.env[legacy]
    if (v != null && String(v).trim() !== '') return v
  } else if (primaryKey.startsWith('ZAOLY_')) {
    const legacy = `CREATION_${primaryKey.slice('ZAOLY_'.length)}`
    const v = process.env[legacy]
    if (v != null && String(v).trim() !== '') return v
  }
  return primary
}

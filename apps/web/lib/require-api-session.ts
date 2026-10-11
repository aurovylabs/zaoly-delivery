import { NextResponse } from 'next/server'
import { auth } from '../auth'
import { isCreationAuthBypassEnabled } from './runtime-config'

/** Route-level session gate. Bypass only when ZAOLY_AUTH_BYPASS=1 (non-production). */
export async function requireApiSession(): Promise<NextResponse | null> {
  if (isCreationAuthBypassEnabled()) return null
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  return null
}

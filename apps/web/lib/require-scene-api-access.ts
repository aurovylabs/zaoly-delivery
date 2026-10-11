import { NextResponse } from 'next/server'
import { auth } from '../auth'
import { isProvisioningAuthorized } from './federation-contract'
import { getServiceSecret, isCreationAuthBypassEnabled } from './runtime-config'

export const ACTOR_USER_ID_HEADER = 'X-Actor-User-Id'
export const CREATION_ACTOR_LABEL_HEADER = 'X-Creation-Actor-Label'

export type SceneApiAccess =
  | { ok: true; mode: 'session'; userId: string }
  | { ok: true; mode: 'service'; userId: string; actorLabel?: string }

export function isSceneApiAccess(
  value: SceneApiAccess | NextResponse,
): value is SceneApiAccess {
  return 'ok' in value && value.ok === true
}

/** Session (local Zaoly users) or optional legacy service caller. */
export async function requireSceneApiAccess(
  req: Request,
): Promise<SceneApiAccess | NextResponse> {
  if (isCreationAuthBypassEnabled()) {
    return { ok: true, mode: 'session', userId: 'dev-local' }
  }

  const session = await auth()
  if (session?.user?.id) {
    return { ok: true, mode: 'session', userId: session.user.id }
  }

  const secret = getServiceSecret()
  if (secret && isProvisioningAuthorized(req, secret)) {
    const userId = req.headers.get(ACTOR_USER_ID_HEADER)?.trim()
    if (!userId) {
      return NextResponse.json({ error: 'actor-required' }, { status: 401 })
    }
    const actorLabel = req.headers.get(CREATION_ACTOR_LABEL_HEADER)?.trim() || undefined
    return { ok: true, mode: 'service', userId, actorLabel }
  }

  return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
}

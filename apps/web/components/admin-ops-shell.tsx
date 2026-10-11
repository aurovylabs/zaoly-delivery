import type { ReactNode } from 'react'
import { AppShell } from './app-shell'
import { AdminSubnav } from './admin-subnav'
import { redirectIfMfaEnrollmentRequired } from '../lib/users/mfa-admin-gate'
import { isAdminUser, requireAdminUser } from '../lib/users/require-admin'

/** Admin pages that require MFA enrollment when env-enforced (not `/admin/security`). */
export async function AdminOpsShell({
  titleKey,
  descriptionKey,
  children,
}: {
  titleKey: string
  descriptionKey: string
  children: ReactNode
}) {
  const access = await requireAdminUser()
  if (isAdminUser(access)) {
    await redirectIfMfaEnrollmentRequired(access.user)
  }
  return (
    <AppShell titleKey={titleKey} descriptionKey={descriptionKey}>
      <AdminSubnav />
      {children}
    </AppShell>
  )
}

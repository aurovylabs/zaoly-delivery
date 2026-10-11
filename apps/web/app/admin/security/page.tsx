import { AppShell } from '../../../components/app-shell'
import { AdminSubnav } from '../../../components/admin-subnav'
import { AdminMfaPage } from '../../../components/admin-mfa-page'

export default function AdminSecurityRoute() {
  return (
    <AppShell titleKey="pages.adminSecurity.title" descriptionKey="pages.adminSecurity.lead">
      <AdminSubnav />
      <AdminMfaPage />
    </AppShell>
  )
}

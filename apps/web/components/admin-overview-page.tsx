'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button, Chip, EmptyState, SettingsBand } from '../lib/zaoly-ui'
import { paths } from '../lib/paths'
import { useUserPrefs } from '../lib/user-prefs'

type Overview = {
  userCounts: { total: number; admins: number; members: number; disabled: number }
  publicSignup: boolean
  smtp: { configured: boolean; managed: boolean }
  sceneStore: string
}

export function AdminOverviewPage() {
  const { t } = useUserPrefs()
  const [data, setData] = useState<Overview | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    const res = await fetch(paths.routes.apiAdminOverview)
    if (!res.ok) {
      setError(res.status === 403 ? t('users.adminOnly') : t('admin.overviewFailed'))
      return
    }
    setData((await res.json()) as Overview)
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  if (error) {
    return (
      <p className="zaoly-users-hub__error" role="alert">
        {error}
      </p>
    )
  }

  if (!data) {
    return <EmptyState>{t('common.loading')}</EmptyState>
  }

  return (
    <div className="zaoly-admin-hub" data-testid="zaoly-admin-overview">
      <p className="zaoly-admin-hub__break-glass" data-testid="zaoly-admin-break-glass">
        {t('admin.bootstrapBreakGlass')}
      </p>
      <SettingsBand title={t('admin.directoryTitle')} help={t('admin.directoryHelp')}>
        <dl className="zaoly-admin-hub__stats">
          <div>
            <dt>{t('admin.statTotal')}</dt>
            <dd>{data.userCounts.total}</dd>
          </div>
          <div>
            <dt>{t('admin.statAdmins')}</dt>
            <dd>{data.userCounts.admins}</dd>
          </div>
          <div>
            <dt>{t('admin.statMembers')}</dt>
            <dd>{data.userCounts.members}</dd>
          </div>
          <div>
            <dt>{t('admin.statDisabled')}</dt>
            <dd>{data.userCounts.disabled}</dd>
          </div>
        </dl>
        <Link href={paths.routes.adminUsers}>
          <Button variant="primary" size="sm">
            {t('admin.openUsers')}
          </Button>
        </Link>
      </SettingsBand>
      <SettingsBand title={t('admin.instanceTitle')} help={t('admin.instanceHelp')}>
        <ul className="zaoly-admin-hub__flags">
          <li>
            <span>{t('admin.publicSignup')}</span>
            <Chip static size="sm" selected={data.publicSignup}>
              {data.publicSignup ? t('admin.on') : t('admin.off')}
            </Chip>
          </li>
          <li>
            <span>{t('admin.smtpStatus')}</span>
            <Chip static size="sm" selected={data.smtp.configured}>
              {data.smtp.configured ? t('smtp.configured') : t('smtp.notConfigured')}
              {data.smtp.managed ? ` · ${t('smtp.sourceManaged')}` : ''}
            </Chip>
          </li>
          <li>
            <span>{t('admin.sceneStore')}</span>
            <Chip static size="sm" selected={data.sceneStore === 'postgres'}>
              {data.sceneStore}
            </Chip>
          </li>
        </ul>
        <Link href={paths.routes.adminMail}>
          <Button variant="ghost" size="sm">
            {t('admin.openMail')}
          </Button>
        </Link>
      </SettingsBand>
    </div>
  )
}

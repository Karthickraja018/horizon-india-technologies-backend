import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import configPromise from '@/payload.config'

import styles from './DashboardHub.module.scss'

function startOfWeek(d: Date): Date {
  const x = new Date(d)
  const day = x.getDay()
  x.setDate(x.getDate() - day)
  x.setHours(0, 0, 0, 0)
  return x
}

export async function DashboardHub() {
  try {
    const payloadConfig = await configPromise
    const payload = await getPayload({ config: payloadConfig })

    const [{ totalDocs: productCount }, { totalDocs: leadsThisWeek }, recentLeads] = await Promise.all([
      payload.count({ collection: 'products' }),
      payload.count({
        collection: 'leads',
        where: { createdAt: { greater_than_equal: startOfWeek(new Date()).toISOString() } },
      }),
      payload.find({
        collection: 'leads',
        sort: '-createdAt',
        limit: 5,
        depth: 1,
      }),
    ])

    return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Overview</h2>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{productCount}</span>
          <span className={styles.statLabel}>Products in catalog</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{leadsThisWeek}</span>
          <span className={styles.statLabel}>Leads this week</span>
        </div>
      </div>
      <div className={styles.actions}>
        <Link className={styles.actionPrimary} href="/admin/collections/products/create">
          Add new product
        </Link>
        <Link className={styles.actionSecondary} href="/admin/collections/leads">
          View leads
        </Link>
      </div>
      <div className={styles.recent}>
        <h3 className={styles.recentTitle}>Recent leads</h3>
        {recentLeads.docs.length === 0 ? (
          <p className={styles.muted}>No leads yet.</p>
        ) : (
          <ul className={styles.list}>
            {recentLeads.docs.map((lead) => (
              <li key={lead.id} className={styles.listItem}>
                <Link className={styles.listLink} href={`/admin/collections/leads/${lead.id}`}>
                  <strong>{lead.name}</strong>
                  <span className={styles.muted}>
                    {' · '}
                    {lead.phone}
                    {lead.createdAt
                      ? ` · ${new Date(lead.createdAt).toLocaleString(undefined, {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}`
                      : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[DashboardHub]', message)

    return (
      <div className={styles.wrap}>
        <h2 className={styles.title}>Overview</h2>
        <p className={styles.warn}>
          Dashboard stats could not be loaded (often a database connection or env issue on the server).
          Collections below should still work once the API can reach Postgres — check Vercel → your deployment →
          Logs, and confirm <code className={styles.code}>DATABASE_URL</code> uses your host&apos;s{' '}
          <strong>pooler</strong> connection string where recommended (e.g. Supabase).
        </p>
        {process.env.NODE_ENV === 'development' ? <pre className={styles.pre}>{message}</pre> : null}
      </div>
    )
  }
}

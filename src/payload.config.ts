import 'dotenv/config'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { Services } from './collections/Services'
import { Clients } from './collections/Clients'
import { Resources } from './collections/Resources'
import { Leads } from './collections/Leads'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const databaseUrl = process.env.DATABASE_URL
const payloadSecret = process.env.PAYLOAD_SECRET

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required (Supabase Postgres connection string). No fallback database is configured.')
}

if (!payloadSecret) {
  throw new Error('PAYLOAD_SECRET is required.')
}

/** Supabase direct host is often IPv6-only; Vercel resolves it as ENOTFOUND — use Transaction pooler URI instead. */
function warnIfSupabaseDirectDbHost(connectionString: string): void {
  try {
    const hostname = new URL(connectionString.replace(/^postgresql:/i, 'postgres:')).hostname
    if (!/^db\.[a-z0-9]+\.supabase\.co$/i.test(hostname)) return

    console.warn(
      '[payload] DATABASE_URL uses Supabase direct host (db.<ref>.supabase.co). On Vercel/serverless this commonly fails with getaddrinfo ENOTFOUND because that hostname may only advertise IPv6. Replace DATABASE_URL with the Transaction pooler string from Supabase → Project Settings → Database → Connection string → Transaction pool (host aws-0-<region>.pooler.supabase.com, port 6543).',
    )
  } catch {
    // ignore malformed URI
  }
}

warnIfSupabaseDirectDbHost(databaseUrl)

/** Transaction pool expects `postgres.<project_ref>` — plain `postgres` yields 28P01 on many setups. */
function warnIfSupabasePoolerNeedsScopedUser(connectionString: string): void {
  try {
    const u = new URL(connectionString.replace(/^postgresql:/i, 'postgres:'))
    if (!u.hostname.includes('pooler.supabase.com')) return
    const user = decodeURIComponent(u.username || '')
    if (user !== 'postgres') return

    console.warn(
      '[payload] DATABASE_URL hits Supabase pooler with username "postgres". Use the URI from the dashboard: user must be postgres.<PROJECT_REF> (not postgres alone). Otherwise Postgres returns password authentication failed for user "postgres" (28P01).',
    )
  } catch {
    // ignore malformed URI
  }
}

warnIfSupabasePoolerNeedsScopedUser(databaseUrl)

/**
 * Serverless + managed Postgres often requires TLS; some providers use chains that break
 * strict verification unless `rejectUnauthorized` is false (Supabase pooler, Neon, etc.).
 */
function postgresPoolSsl(connectionString: string): { rejectUnauthorized: boolean } | undefined {
  if (process.env.PG_POOL_SSL === 'off') return undefined

  const s = connectionString.toLowerCase()
  const hostHints =
    s.includes('supabase.co') ||
    s.includes('neon.tech') ||
    s.includes('.pooler.') ||
    s.includes('amazonaws.com') ||
    s.includes('render.com')

  const urlWantsSsl =
    s.includes('sslmode=require') ||
    s.includes('sslmode%3drequire') ||
    s.includes('sslmode=verify-full') ||
    s.includes('sslmode=verify-ca')

  if (hostHints || urlWantsSsl || process.env.PG_POOL_SSL === 'require') {
    return { rejectUnauthorized: process.env.PG_SSL_STRICT === 'true' }
  }

  return undefined
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeDashboard: ['@/components/admin/DashboardHub#DashboardHub'],
    },
  },
  collections: [Users, Leads, Categories, Products, Media, Services, Clients, Resources],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
      ssl: postgresPoolSsl(databaseUrl),
      max: Number(process.env.PG_POOL_MAX || 10),
      idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30_000),
      connectionTimeoutMillis: Number(process.env.PG_CONN_TIMEOUT_MS || 10_000),
    },
  }),
  sharp,
  plugins: [],
  onInit: async (payload) => {
    const categorySlugs = [
      'hardness-testing',
      'universal-testing-machines',
      'sand-testing',
      'metrology',
      'ndt-equipment',
      'impact-testing',
      'civil-lab',
    ]

    for (const slug of categorySlugs) {
      const existing = await payload.find({
        collection: 'categories',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
      })

      if (!existing?.docs?.length) {
        const name = slug
          .split('-')
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join(' ')

        await payload.create({
          collection: 'categories',
          data: { name, slug },
        })
      }
    }

  },
})

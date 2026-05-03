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
      ssl: databaseUrl.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
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

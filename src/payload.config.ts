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

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Categories, Products, Services, Clients, Resources, Leads],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      ssl: process.env.DATABASE_URL?.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
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

    const serviceTitles = ['AMC', 'Calibration', 'Upgradation', 'Spare Parts', 'Training']
    for (const title of serviceTitles) {
      const existing = await payload.find({
        collection: 'services',
        where: { title: { equals: title } },
        limit: 1,
        depth: 0,
      })

      if (!existing?.docs?.length) {
        await payload.create({
          collection: 'services',
          data: { title },
        })
      }
    }
  },
})

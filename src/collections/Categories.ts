import type { CollectionConfig } from 'payload'

import { slugify } from '../lib/slugify'
import { assertMediaIsImage } from '../lib/mediaGuards'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
    group: 'Catalog',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Used for URLs and filtering via the REST API.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'heroImage',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: 'Images only.',
      },
      filterOptions: {
        mimeType: { contains: 'image/' },
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation === 'create' || operation === 'update') {
          if (data?.name && !data?.slug) data.slug = slugify(String(data.name))
          if (data?.heroImage) await assertMediaIsImage(req, String(data.heroImage), 'Hero image')
        }
        return data
      },
    ],
  },
}


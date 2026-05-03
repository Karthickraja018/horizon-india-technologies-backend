import type { CollectionConfig } from 'payload'

import { slugify } from '../lib/slugify'
import { assertMediaIsImage, assertMediaIsPDF } from '../lib/mediaGuards'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'category', 'modelCode', 'updatedAt'],
    group: 'Catalog',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Basics',
          fields: [
            { name: 'name', type: 'text', required: true },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              admin: { description: 'Used for URLs and filtering via the REST API.' },
            },
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'categories',
            },
            { name: 'modelCode', type: 'text' },
          ],
        },
        {
          label: 'Media',
          fields: [
            {
              name: 'heroImage',
              type: 'relationship',
              relationTo: 'media',
              admin: { description: 'Images only.' },
              filterOptions: { mimeType: { contains: 'image/' } },
            },
            {
              name: 'galleryImages',
              type: 'array',
              labels: { singular: 'Image', plural: 'Gallery images' },
              fields: [
                {
                  name: 'media',
                  type: 'relationship',
                  relationTo: 'media',
                  required: true,
                  filterOptions: { mimeType: { contains: 'image/' } },
                },
              ],
            },
            {
              name: 'pdf',
              type: 'relationship',
              relationTo: 'media',
              admin: { description: 'PDF only (datasheet / brochure).' },
              filterOptions: { mimeType: { equals: 'application/pdf' } },
            },
          ],
        },
        {
          label: 'Content',
          fields: [
            { name: 'description', type: 'textarea' },
            {
              name: 'keyFeatures',
              type: 'array',
              fields: [{ name: 'feature', type: 'text', required: true }],
            },
            {
              name: 'specTable',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'value', type: 'text', required: true },
              ],
            },
            { name: 'applications', type: 'textarea' },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'metaTitle', type: 'text' },
            { name: 'metaDescription', type: 'textarea' },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation === 'create' || operation === 'update') {
          if (data?.name && !data?.slug) data.slug = slugify(String(data.name))
          if (data?.heroImage) await assertMediaIsImage(req, String(data.heroImage), 'Hero image')
          if (data?.pdf) await assertMediaIsPDF(req, String(data.pdf), 'Product PDF')

          const gallery = (data?.galleryImages ?? []) as Array<{ media?: string }>
          for (const item of gallery) {
            if (item?.media) await assertMediaIsImage(req, String(item.media), 'Gallery image')
          }
        }
        return data
      },
    ],
  },
}


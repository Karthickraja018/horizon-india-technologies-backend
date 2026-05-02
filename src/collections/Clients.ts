import type { CollectionConfig } from 'payload'

import { assertMediaIsImage } from '../lib/mediaGuards'

export const Clients: CollectionConfig = {
  slug: 'clients',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sector', 'updatedAt'],
    group: 'Company',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'sector', type: 'text' },
    {
      name: 'logo',
      type: 'relationship',
      relationTo: 'media',
      required: true,
      admin: { description: 'Images only.' },
      filterOptions: { mimeType: { contains: 'image/' } },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if ((operation === 'create' || operation === 'update') && data?.logo) {
          await assertMediaIsImage(req, String(data.logo), 'Client logo')
        }
        return data
      },
    ],
  },
}


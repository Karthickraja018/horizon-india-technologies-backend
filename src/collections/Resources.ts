import type { CollectionConfig } from 'payload'

import { assertMediaIsPDF } from '../lib/mediaGuards'

export const Resources: CollectionConfig = {
  slug: 'resources',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'fileType', 'fileSize', 'updatedAt'],
    group: 'Content',
    description: 'Downloadable PDF resources linked to categories.',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'fileType',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'fileSize',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'pdf',
      type: 'relationship',
      relationTo: 'media',
      required: true,
      admin: { description: 'PDF only.' },
      filterOptions: { mimeType: { equals: 'application/pdf' } },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation === 'create' || operation === 'update') {
          if (data?.pdf) {
            await assertMediaIsPDF(req, String(data.pdf), 'Resource PDF')
            const media = await req.payload.findByID({ collection: 'media', id: String(data.pdf), req })
            if (media?.mimeType) data.fileType = media.mimeType
            if (typeof media?.filesize === 'number') {
              const kb = media.filesize / 1024
              data.fileSize = kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${Math.ceil(kb)} KB`
            }
          }
        }
        return data
      },
    ],
  },
}


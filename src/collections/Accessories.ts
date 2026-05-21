import type { CollectionConfig } from 'payload'

import { assertMediaIsImage } from '../lib/mediaGuards'

export const Accessories: CollectionConfig = {
  slug: 'accessories',
  access: {
    read: () => true,
  },
  labels: {
    singular: 'Accessory',
    plural: 'Accessories',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'updatedAt'],
    group: 'Catalog',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Accessory Name',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Standard', value: 'standard' },
        { label: 'Optional', value: 'optional' },
      ],
      defaultValue: 'standard',
      label: 'Category',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'image',
      type: 'relationship',
      relationTo: 'media',
      label: 'Image',
      filterOptions: { mimeType: { contains: 'image/' } },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation === 'create' || operation === 'update') {
          if (data?.image) await assertMediaIsImage(req, String(data.image), 'Accessory image')
        }
        return data
      },
    ],
  },
}

import type { CollectionConfig } from 'payload'

export const ProductVariants: CollectionConfig = {
  slug: 'productVariants',
  access: {
    read: () => true,
  },
  labels: {
    singular: 'Product Variant',
    plural: 'Product Variants',
  },
  admin: {
    useAsTitle: 'modelName',
    defaultColumns: ['modelName', 'type', 'product', 'updatedAt'],
    group: 'Catalog',
  },
  fields: [
    {
      name: 'modelName',
      type: 'text',
      required: true,
      label: 'Model Name',
      admin: {
        description: 'e.g. RASNE-TS, RASNET-TS',
      },
    },
    {
      name: 'type',
      type: 'text',
      label: 'Type / Description',
      admin: {
        description: 'e.g. Digital Rockwell & Rockwell Superficial',
      },
    },
    {
      name: 'majorLoads',
      type: 'text',
      label: 'Major Loads',
      admin: {
        description: 'e.g. 60, 100, 150 kgf',
      },
    },
    {
      name: 'minorLoads',
      type: 'text',
      label: 'Minor Loads',
      admin: {
        description: 'e.g. 10 kgf',
      },
    },
    {
      name: 'resolution',
      type: 'text',
      label: 'Resolution',
      admin: {
        description: 'e.g. 0.1 Rockwell',
      },
    },
    {
      name: 'specTable',
      type: 'array',
      label: 'Variant-specific specifications',
      labels: { singular: 'Row', plural: 'Specification rows' },
      admin: {
        description: 'Technical specs unique to this variant (e.g. Max Height, Weight, Throat Depth).',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Specification',
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          label: 'Value',
        },
      ],
    },
  ],
}

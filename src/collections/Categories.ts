import type { CollectionConfig } from 'payload'

import { slugify } from '../lib/slugify'
import { assertMediaIsImage } from '../lib/mediaGuards'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    read: () => true,
  },
  labels: {
    singular: 'Category',
    plural: 'Categories',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
    group: 'Catalog',
    description: 'Product groupings used on the website and catalog.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Category name',
      admin: {
        description: 'Shown to visitors (e.g. Hardness testing).',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'URL name (auto-generated)',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Generated from the category name. Used in links.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        placeholder: 'Short summary for category listing pages…',
      },
    },
    {
      name: 'heroImage',
      type: 'relationship',
      relationTo: 'media',
      label: 'Category image',
      admin: {
        description: 'Please upload a valid image file (JPG, PNG, WebP).',
      },
      filterOptions: {
        mimeType: { contains: 'image/' },
      },
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Icon Name',
      admin: {
        description: 'Lucide icon name (e.g. Gauge, Microscope, etc.)',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Draft', value: 'draft' },
      ],
      label: 'Status',
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Featured Category',
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort Order',
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'collapsible',
      label: 'SEO',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'seoTitle',
          type: 'text',
          label: 'SEO Title',
        },
        {
          name: 'seoDescription',
          type: 'textarea',
          label: 'SEO Description',
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation === 'create' || operation === 'update') {
          if (data?.name) data.slug = slugify(String(data.name))
          if (data?.heroImage) await assertMediaIsImage(req, String(data.heroImage), 'Hero image')
        }
        return data
      },
    ],
  },
}


import type { CollectionConfig } from 'payload'

import { assertMediaIsImage, assertMediaIsPDF } from '../lib/mediaGuards'
import { slugify } from '../lib/slugify'

export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    read: () => true,
  },
  labels: {
    singular: 'Product',
    plural: 'Products',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'modelCode', 'category', 'isFeatured', 'updatedAt'],
    group: 'Catalog',
    description:
      'Your B2B catalog items shown on the website. To copy an existing product quickly, open it and use the Duplicate action (⋯ menu).',
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Basic info',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Product name',
          admin: {
            description: 'The name visitors see on the product page and listings.',
          },
        },
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'categories',
          required: true,
          label: 'Category',
          admin: {
            description: 'Choose which section this product belongs to.',
          },
        },
        {
          name: 'brand',
          type: 'text',
          label: 'Product Brand',
        },
        {
          name: 'series',
          type: 'text',
          label: 'Series',
        },
        {
          name: 'modelCode',
          type: 'text',
          label: 'Model code',
          admin: {
            description: 'SKU or manufacturer model reference (optional but recommended).',
            placeholder: 'e.g. HT-3000X',
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
            description: 'Generated from the product name. Used in links and APIs.',
          },
        },
        {
          name: 'isFeatured',
          type: 'checkbox',
          label: '⭐ Featured on Homepage',
          defaultValue: false,
          admin: {
            position: 'sidebar',
            description:
              'Tick to show this product in the Featured Products carousel on the home page. Up to 6 featured products are displayed.',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Images',
      fields: [
        {
          name: 'heroImage',
          type: 'relationship',
          relationTo: 'media',
          label: 'Main product image',
          filterOptions: { mimeType: { contains: 'image/' } },
          admin: {
            description: 'Shown at the top of the product page.',
            components: {
              Field: '@/components/admin/RelationshipImageField#RelationshipImageField',
            },
          },
        },
        {
          name: 'galleryImages',
          type: 'array',
          labels: { singular: 'Image', plural: 'Gallery images' },
          admin: {
            description:
              'Additional photos. Drag rows to reorder when using the default gallery controls.',
          },
          fields: [
            {
              name: 'media',
              type: 'relationship',
              relationTo: 'media',
              required: true,
              label: 'Image',
              filterOptions: { mimeType: { contains: 'image/' } },
              admin: {
                description: 'Please upload a valid image file (JPG, PNG, WebP).',
                components: {
                  Field: '@/components/admin/RelationshipImageField#RelationshipImageField',
                },
              },
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Description',
      fields: [
        {
          name: 'shortDescription',
          type: 'textarea',
          label: 'Short Description',
          admin: {
            description: 'A brief summary shown on product cards and at the top of the detail page.',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          admin: {
            placeholder:
              'Explain what the product does, who it is for, and what problems it solves…',
          },
        },
        {
          name: 'applications',
          type: 'textarea',
          label: 'Typical applications',
          admin: {
            placeholder: 'e.g. QA labs, metal fabrication, research institutes…',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Features',
      fields: [
        {
          name: 'keyFeatures',
          type: 'array',
          label: 'Key features (highlights)',
          labels: { singular: 'Feature', plural: 'Key features' },
          admin: {
            description:
              'Short bullet-style points visitors scan first. Example: “Automated test cycles”.',
          },
          fields: [{ name: 'feature', type: 'text', required: true, label: 'Feature' }],
        },
        {
          name: 'standardsSupported',
          type: 'array',
          label: 'Standards Supported',
          fields: [{ name: 'standard', type: 'text', required: true, label: 'Standard (e.g. ASTM E-18)' }],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Specifications',
      fields: [
        {
          name: 'specTable',
          type: 'array',
          label: 'Technical specifications',
          labels: { singular: 'Row', plural: 'Specification rows' },
          admin: {
            description:
              'Specifications: add technical details like capacity, accuracy, dimensions.',
            components: {
              Field: '@/components/admin/SpecTableField#SpecTableField',
            },
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
    },
    {
      type: 'collapsible',
      label: 'Variants & Accessories',
      fields: [
        {
          name: 'variants',
          type: 'relationship',
          relationTo: 'productVariants',
          hasMany: true,
          label: 'Product Variants',
        },
        {
          name: 'accessories',
          type: 'relationship',
          relationTo: 'accessories',
          hasMany: true,
          label: 'Accessories',
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Documents',
      fields: [
        {
          name: 'pdf',
          type: 'relationship',
          relationTo: 'media',
          label: 'Downloadable spec sheet',
          filterOptions: { mimeType: { equals: 'application/pdf' } },
          admin: {
            components: {
              Field: '@/components/admin/RelationshipPdfField#RelationshipPdfField',
            },
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'SEO (search engines)',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: 'Meta title',
          admin: {
            description: 'Optional. Shown in browser tabs and search results.',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: 'Meta description',
          admin: {
            description: 'Optional short summary for search snippets.',
          },
        },
        {
          name: 'metaKeywords',
          type: 'text',
          label: 'Meta Keywords',
          admin: {
            description: 'Comma separated keywords.',
          },
        },
        {
          name: 'ogTitle',
          type: 'text',
          label: 'Open Graph Title',
        },
        {
          name: 'ogDescription',
          type: 'textarea',
          label: 'Open Graph Description',
        },
        {
          name: 'ogImage',
          type: 'relationship',
          relationTo: 'media',
          label: 'Open Graph Image',
          filterOptions: { mimeType: { contains: 'image/' } },
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation === 'create' || operation === 'update') {
          if (data?.name) data.slug = slugify(String(data.name))
          if (data?.heroImage) await assertMediaIsImage(req, String(data.heroImage), 'Main product image')
          if (data?.pdf) await assertMediaIsPDF(req, String(data.pdf), 'Downloadable spec sheet')

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

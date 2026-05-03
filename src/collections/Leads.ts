import type { CollectionConfig } from 'payload'

import { adminsOnly } from '../lib/access'

export const Leads: CollectionConfig = {
  slug: 'leads',
  enableQueryPresets: true,
  labels: {
    singular: 'Lead',
    plural: 'Leads',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['viewed', 'name', 'phone', 'product', 'createdAt'],
    group: 'Leads',
    description: 'Contact form submissions — check here daily for new inquiries.',
    components: {
      beforeListTable: ['@/components/admin/LeadsQuickFilters#LeadsQuickFilters'],
    },
  },
  access: {
    create: () => true,
    read: adminsOnly,
    update: adminsOnly,
    delete: adminsOnly,
  },
  defaultSort: '-createdAt',
  fields: [
    {
      name: 'viewed',
      type: 'checkbox',
      label: 'Status',
      defaultValue: false,
      admin: {
        description: 'Turn on after you have reviewed this lead.',
        position: 'sidebar',
        components: {
          Cell: '@/components/admin/ViewedLeadCell#ViewedLeadCell',
        },
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name',
    },
    {
      name: 'company',
      type: 'text',
      label: 'Company',
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      label: 'Phone',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'Email',
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      label: 'Product interest',
      admin: {
        description: 'Optional — product the visitor asked about.',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Message',
    },
  ],
}

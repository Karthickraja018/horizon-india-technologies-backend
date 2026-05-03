import type { CollectionConfig } from 'payload'

import { adminsOnly } from '../lib/access'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'company', 'phone', 'email', 'createdAt'],
    group: 'Leads',
  },
  access: {
    create: () => true,
    read: adminsOnly,
    update: adminsOnly,
    delete: adminsOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'company', type: 'text' },
    { name: 'phone', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      admin: {
        description: 'Optional product the lead is interested in.',
      },
    },
    { name: 'message', type: 'textarea' },
  ],
}


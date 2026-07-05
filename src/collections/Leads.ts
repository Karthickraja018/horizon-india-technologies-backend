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
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        const notifyTo = process.env.LEAD_NOTIFICATION_EMAIL
        if (!notifyTo) return

        try {
          await req.payload.sendEmail({
            to: notifyTo,
            subject: `New enquiry from ${doc.name}${doc.company ? ` (${doc.company})` : ''}`,
            html: `
              <h2>New website enquiry</h2>
              <p><strong>Name:</strong> ${doc.name}</p>
              <p><strong>Company:</strong> ${doc.company || '—'}</p>
              <p><strong>Phone:</strong> ${doc.phone}</p>
              <p><strong>Email:</strong> ${doc.email}</p>
              <p><strong>Message:</strong></p>
              <pre style="white-space: pre-wrap; font-family: inherit;">${doc.message || '—'}</pre>
              <p>View and manage this lead in the admin panel.</p>
            `,
          })
        } catch (err) {
          req.payload.logger.error(`Failed to send lead notification email: ${err}`)
        }
      },
    ],
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

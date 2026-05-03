import type { GlobalConfig } from 'payload'

import { adminsOnly } from '../lib/access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Settings',
  },
  access: {
    read: () => true,
    update: adminsOnly,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contact',
          fields: [
            { name: 'phone', type: 'text' },
            { name: 'email', type: 'email' },
            { name: 'whatsappNumber', type: 'text' },
            { name: 'address', type: 'textarea' },
          ],
        },
        {
          label: 'NABL',
          fields: [
            {
              name: 'nabl',
              type: 'group',
              fields: [
                { name: 'certNumber', type: 'text' },
                { name: 'validity', type: 'text' },
                { name: 'scope', type: 'textarea' },
              ],
            },
          ],
        },
      ],
    },
  ],
}


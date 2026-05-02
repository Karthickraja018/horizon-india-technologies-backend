import type { CollectionConfig } from 'payload'
import crypto from 'crypto'

import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase'

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'media'

function sanitizeFilename(name: string): string {
  return name
    .trim()
    .replace(/[^\w.\-()+ ]+/g, '')
    .replace(/\s+/g, '-')
}

async function uploadToSupabase({
  req,
  data,
  operation,
}: {
  req: any
  data: any
  operation: 'create' | 'update'
}) {
  // In dev / non-Supabase environments, let Payload handle local storage.
  if (!isSupabaseConfigured()) return data
  if ((operation !== 'create' && operation !== 'update') || !req?.file) return data

  const file = req.file as any
  const fileData: Buffer | undefined = file?.data ?? file?.buffer
  if (!fileData) throw new Error('Missing file buffer on req.file')

  const originalName: string = file?.name || 'upload'
  const uniquePrefix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
  const objectName = `${uniquePrefix}-${sanitizeFilename(originalName)}`

  const supabase = getSupabaseClient()

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(objectName, fileData, {
    contentType: file?.mimetype || file?.mimeType,
    upsert: false,
  })

  if (uploadError) {
    throw new Error(`Supabase upload failed: ${uploadError.message}`)
  }

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(objectName)
  const publicUrl = publicData?.publicUrl
  if (!publicUrl) throw new Error('Failed to generate public URL from Supabase Storage')

  return {
    ...data,
    url: publicUrl,
    storagePath: objectName,
  }
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'mimeType', 'filesize', 'updatedAt'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      validate: (val, { data }) => {
        const mimeType = (data as any)?.mimeType as string | undefined
        if (mimeType?.startsWith('image/') && !val) return 'Alt text is required for images.'
        return true
      },
      admin: {
        description: 'Required for images (used for accessibility).',
      },
    },
    {
      name: 'storagePath',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async (args) => uploadToSupabase(args as any),
    ],
  },
  upload: {
    disableLocalStorage: isSupabaseConfigured(),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    maxFileSize: 25_000_000,
  },
}

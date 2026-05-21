import type {
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
  PayloadRequest,
} from 'payload'

import { uploadImageBufferToCloudinary, uploadPdfBufferToCloudinary } from '../lib/cloudinary'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_PDF_BYTES = 25 * 1024 * 1024

const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_PDF_MIME = 'application/pdf'

async function readUploadBuffer(file: NonNullable<PayloadRequest['file']>): Promise<Buffer> {
  const extended = file as NonNullable<PayloadRequest['file']> & { data?: Buffer; buffer?: Buffer }
  if (extended.data && Buffer.isBuffer(extended.data)) return extended.data
  if (extended.buffer && Buffer.isBuffer(extended.buffer)) return extended.buffer
  const asBlob = file as unknown as Blob
  if (typeof asBlob.arrayBuffer === 'function') {
    const ab = await asBlob.arrayBuffer()
    return Buffer.from(ab)
  }
  throw new Error('Unable to read uploaded file.')
}

const validateUploadFile: CollectionBeforeValidateHook = async ({ req }) => {
  const file = req.file
  if (!file) return

  const uploadLike = file as unknown as { type?: string; mimetype?: string }
  const mime = uploadLike.type || uploadLike.mimetype || ''
  const buffer = await readUploadBuffer(file).catch(() => null)
  const size = buffer?.length ?? (Number((file as { size?: number }).size) || 0)

  if (ALLOWED_IMAGE_MIME.has(mime)) {
    if (size > MAX_IMAGE_BYTES) {
      throw new Error(`Images must be ${MAX_IMAGE_BYTES / (1024 * 1024)}MB or smaller before upload.`)
    }
    return
  }

  if (mime === ALLOWED_PDF_MIME) {
    if (size > MAX_PDF_BYTES) {
      throw new Error(`PDFs must be ${MAX_PDF_BYTES / (1024 * 1024)}MB or smaller.`)
    }
    return
  }

  throw new Error('Please upload a valid image (JPG, PNG, WebP) or PDF.')
}

const uploadToCloudinary: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  const file = req.file
  if (!file || (operation !== 'create' && operation !== 'update')) {
    return data
  }

  const uploadLike = file as unknown as { type?: string; mimetype?: string }
  const mime = uploadLike.type || uploadLike.mimetype || ''
  const originalName = (file as { name?: string }).name || 'upload'
  const buffer = await readUploadBuffer(file)

  if (ALLOWED_IMAGE_MIME.has(mime)) {
    const { secure_url, bytes } = await uploadImageBufferToCloudinary(buffer, originalName)
    return {
      ...data,
      filename: originalName,
      mimeType: mime,
      filesize: bytes,
      cloudinaryUrl: secure_url,
      url: secure_url,
    }
  }

  if (mime === ALLOWED_PDF_MIME) {
    const { secure_url, bytes } = await uploadPdfBufferToCloudinary(buffer, originalName)
    return {
      ...data,
      filename: originalName,
      mimeType: mime,
      filesize: bytes,
      cloudinaryUrl: secure_url,
      url: secure_url,
    }
  }

  throw new Error('Please upload a valid image (JPG, PNG, WebP) or PDF.')
}

const mapCloudinaryUrl: import('payload').CollectionAfterReadHook = ({ doc }) => {
  if (doc.cloudinaryUrl) {
    return {
      ...doc,
      url: doc.cloudinaryUrl,
    }
  }
  return doc
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  labels: {
    singular: 'Media library file',
    plural: 'Media library',
  },
  admin: {
    group: 'Content',
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'mimeType', 'filesize', 'updatedAt'],
    description:
      'Upload images (logos, product photos) and PDFs here. Files are stored on Cloudinary; images are optimized automatically.',
  },
  hooks: {
    beforeValidate: [validateUploadFile],
    beforeChange: [uploadToCloudinary],
    afterRead: [mapCloudinaryUrl],
  },
  upload: {
    disableLocalStorage: true,
    mimeTypes: [...ALLOWED_IMAGE_MIME, ALLOWED_PDF_MIME],
  },
  fields: [
    {
      name: 'cloudinaryUrl',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'alt',
      type: 'text',
      validate: (val: string | null | undefined, { data }: { data?: Record<string, unknown> }) => {
        const mimeType = typeof data?.mimeType === 'string' ? data.mimeType : undefined
        if (mimeType?.startsWith('image/') && !val) return 'Alt text is required for images.'
        return true
      },
      admin: {
        description: 'Required for images (accessibility).',
      },
    },
  ],
}

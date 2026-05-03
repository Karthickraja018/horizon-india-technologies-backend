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
  if (typeof file.arrayBuffer === 'function') {
    const ab = await file.arrayBuffer()
    return Buffer.from(ab)
  }
  throw new Error('Unable to read uploaded file.')
}

const validateUploadFile: CollectionBeforeValidateHook = async ({ req, operation }) => {
  const file = req.file
  if (!file || operation === 'delete') return

  const mime = file.type || (file as { mimetype?: string }).mimetype || ''
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

  const mime = file.type || (file as { mimetype?: string }).mimetype || ''
  const originalName = file.name || 'upload'
  const buffer = await readUploadBuffer(file)

  if (ALLOWED_IMAGE_MIME.has(mime)) {
    const { secure_url, bytes } = await uploadImageBufferToCloudinary(buffer, originalName)
    return {
      ...data,
      filename: originalName,
      mimeType: mime,
      filesize: bytes,
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
      url: secure_url,
    }
  }

  throw new Error('Please upload a valid image (JPG, PNG, WebP) or PDF.')
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
  },
  upload: {
    disableLocalStorage: true,
    mimeTypes: [...ALLOWED_IMAGE_MIME, ALLOWED_PDF_MIME],
    maxFileSize: MAX_PDF_BYTES,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      validate: (val, { data }) => {
        const mimeType = (data as { mimeType?: string })?.mimeType
        if (mimeType?.startsWith('image/') && !val) return 'Alt text is required for images.'
        return true
      },
      admin: {
        description: 'Required for images (accessibility).',
      },
    },
  ],
}

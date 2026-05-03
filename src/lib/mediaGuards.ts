import type { PayloadRequest } from 'payload'

export async function assertMediaIsImage(req: PayloadRequest, mediaID: string, fieldLabel: string) {
  const doc = await req.payload.findByID({ collection: 'media', id: mediaID, req })
  if (!doc?.mimeType?.startsWith('image/')) {
    throw new Error(`Please upload a valid image file (JPG, PNG, WebP) for ${fieldLabel}.`)
  }
}

export async function assertMediaIsPDF(req: PayloadRequest, mediaID: string, fieldLabel: string) {
  const doc = await req.payload.findByID({ collection: 'media', id: mediaID, req })
  if (doc?.mimeType !== 'application/pdf') {
    throw new Error(`Please upload a valid PDF file for ${fieldLabel}.`)
  }
}


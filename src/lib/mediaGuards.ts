import type { PayloadRequest } from 'payload'

export async function assertMediaIsImage(req: PayloadRequest, mediaID: string, fieldLabel: string) {
  const doc = await req.payload.findByID({ collection: 'media', id: mediaID, req })
  if (!doc?.mimeType?.startsWith('image/')) {
    throw new Error(`${fieldLabel} must reference an image.`)
  }
}

export async function assertMediaIsPDF(req: PayloadRequest, mediaID: string, fieldLabel: string) {
  const doc = await req.payload.findByID({ collection: 'media', id: mediaID, req })
  if (doc?.mimeType !== 'application/pdf') {
    throw new Error(`${fieldLabel} must reference a PDF.`)
  }
}


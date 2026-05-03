import path from 'path'
import { fileURLToPath } from 'url'

import dotenv from 'dotenv'
import cloudinary from 'cloudinary'

/** Resolve repo root from this file (`src/lib/` → project root). */
function getProjectRootDir(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
}

/**
 * Next.js + Turbopack may run API/Payload handlers without `cwd` or Node env
 * matching where `.env` lives. Load explicitly from the project root once.
 */
let projectDotenvLoaded = false
function ensureProjectDotenvLoaded(): void {
  if (projectDotenvLoaded) return
  projectDotenvLoaded = true
  const root = getProjectRootDir()
  dotenv.config({ path: path.join(root, '.env') })
  dotenv.config({ path: path.join(root, '.env.local'), override: true })
}

/** Runtime lookup — avoids bundlers inlining missing keys as `undefined`. */
function readEnv(key: string): string | undefined {
  ensureProjectDotenvLoaded()
  return envTrim(process.env[key])
}

/** Strip whitespace and optional wrapping quotes from .env values. */
function envTrim(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined
  const s = value.trim()
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1).trim()
  }
  return s || undefined
}

/**
 * Parse `cloudinary://API_KEY:API_SECRET@CLOUD_NAME` (Cloudinary dashboard copy-paste).
 */
function parseCloudinaryUrl(url: string): { cloud_name: string; api_key: string; api_secret: string } | null {
  try {
    const u = new URL(url)
    if (u.protocol !== 'cloudinary:') return null
    const api_key = decodeURIComponent(u.username || '')
    const api_secret = decodeURIComponent(u.password || '')
    const cloud_name = (u.hostname || '').trim()
    if (!cloud_name || !api_key || !api_secret) return null
    return { cloud_name, api_key, api_secret }
  } catch {
    return null
  }
}

/**
 * Cloudinary SDK configuration (cloud_name, api_key, api_secret).
 * Supports either three variables or a single `CLOUDINARY_URL` from the dashboard.
 */
export function configureCloudinaryFromEnv(): void {
  ensureProjectDotenvLoaded()

  let cloud_name = readEnv('CLOUDINARY_CLOUD_NAME')
  let api_key = readEnv('CLOUDINARY_API_KEY')
  let api_secret = readEnv('CLOUDINARY_API_SECRET')

  const urlRaw = readEnv('CLOUDINARY_URL')
  if (urlRaw) {
    const parsed = parseCloudinaryUrl(urlRaw)
    if (!parsed) {
      throw new Error(
        'CLOUDINARY_URL must start with cloudinary:// (copy it from the Cloudinary dashboard “API Environment variable”).',
      )
    }
    cloud_name = cloud_name || parsed.cloud_name
    api_key = api_key || parsed.api_key
    api_secret = api_secret || parsed.api_secret
  }

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      'Cloudinary is not configured. Add either CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME ' +
        'or all of CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env at the project root ' +
        `(expected near ${path.join(getProjectRootDir(), '.env')}), then restart the dev server.`,
    )
  }

  cloudinary.config({ cloud_name, api_key, api_secret })
}

/** Applied on upload so stored URLs point at optimized CDN derivatives (WebP, max width). */
const imageUploadTransformation = [
  {
    fetch_format: 'webp',
    quality: 'auto',
    width: 1200,
    crop: 'limit',
  },
]

function uploadFolder(): string {
  ensureProjectDotenvLoaded()
  return readEnv('CLOUDINARY_UPLOAD_FOLDER') || 'horizon-cms'
}

/**
 * Upload image bytes to Cloudinary with WebP + resize + auto quality.
 * Returns CDN secure_url (optimized derivative — no raw buffer persisted in DB).
 */
export function uploadImageBufferToCloudinary(
  buffer: Buffer,
  _originalFilename: string,
): Promise<{ secure_url: string; bytes: number }> {
  configureCloudinaryFromEnv()

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      (result: { error?: { message?: string }; secure_url?: string; bytes?: number }) => {
        if (result?.error || !result?.secure_url) {
          reject(
            result?.error ?? new Error('Cloudinary image upload failed'),
          )
          return
        }
        resolve({
          secure_url: result.secure_url,
          bytes: typeof result.bytes === 'number' ? result.bytes : buffer.length,
        })
      },
      {
        folder: uploadFolder(),
        resource_type: 'image',
        transformation: imageUploadTransformation,
        use_filename: true,
        unique_filename: true,
      },
    )

    stream.end(buffer)
  })
}

/**
 * Upload PDF as raw resource (no image transformations).
 */
export function uploadPdfBufferToCloudinary(
  buffer: Buffer,
  _originalFilename: string,
): Promise<{ secure_url: string; bytes: number }> {
  configureCloudinaryFromEnv()

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      (result: { error?: { message?: string }; secure_url?: string; bytes?: number }) => {
        if (result?.error || !result?.secure_url) {
          reject(
            result?.error ?? new Error('Cloudinary PDF upload failed'),
          )
          return
        }
        resolve({
          secure_url: result.secure_url,
          bytes: typeof result.bytes === 'number' ? result.bytes : buffer.length,
        })
      },
      {
        folder: uploadFolder(),
        resource_type: 'raw',
        use_filename: true,
        unique_filename: true,
      },
    )

    stream.end(buffer)
  })
}

export { cloudinary }

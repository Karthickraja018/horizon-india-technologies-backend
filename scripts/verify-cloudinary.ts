/**
 * Loads `.env` from project root and uploads a 1×1 PNG to Cloudinary.
 * Run: npx tsx scripts/verify-cloudinary.ts
 */
import path from 'path'
import { fileURLToPath } from 'url'

import dotenv from 'dotenv'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(root, '.env') })
dotenv.config({ path: path.join(root, '.env.local'), override: true })

const tinyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

async function main(): Promise<void> {
  const { configureCloudinaryFromEnv, uploadImageBufferToCloudinary } = await import('../src/lib/cloudinary.ts')

  configureCloudinaryFromEnv()
  const { secure_url } = await uploadImageBufferToCloudinary(tinyPng, 'payload-env-verify.png')
  console.log('Upload OK:', secure_url)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

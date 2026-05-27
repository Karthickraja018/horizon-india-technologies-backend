import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import fs from 'fs'
import path from 'path'

const artifactDir = 'C:\\Users\\ekart\\.gemini\\antigravity-ide\\brain\\6294bc04-1ea8-4c4d-bfdf-aa94f37617af'

const uploads = [
  { productId: 30, file: 'rasne_ts_model_1779858617429.png', alt: 'Digital Touch Screen Rockwell Hardness Testing Machine RASNE-TS Series' },
  { productId: 29, file: 'trp_1_model_1779858633321.png', alt: 'Portable Rockwell Hardness Tester TRP-1' },
  { productId: 28, file: 'trs_series_model_1779858649387.png', alt: 'Analogue Rockwell Hardness Tester TRS Series' },
  { productId: 27, file: 'trsn_d_model_1779858671227.png', alt: 'Digital Motorized Rockwell Hardness Tester TRSN-D Series' },
  { productId: 26, file: 'trsn_model_1779858685775.png', alt: 'Export Rockwell Hardness Tester TRSN Series' }
]

async function run() {
  const payload = await getPayload({ config: configPromise })

  for (const upload of uploads) {
    const filePath = path.join(artifactDir, upload.file)
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath)
      continue
    }

    try {
      const stats = fs.statSync(filePath)
      console.log(`Uploading ${upload.file}...`)
      
      const media = await payload.create({
        collection: 'media',
        data: {
          alt: upload.alt,
        },
        file: {
          data: fs.readFileSync(filePath),
          mimetype: 'image/png',
          name: upload.file,
          size: stats.size,
        },
      })

      console.log(`Created media ${media.id}, patching product ${upload.productId}...`)

      await payload.update({
        collection: 'products',
        id: upload.productId,
        data: {
          heroImage: media.id,
        },
      })

      console.log(`Successfully linked media ${media.id} to product ${upload.productId}`)
    } catch (e) {
      console.error('Failed to upload or patch', upload, e)
    }
  }
  
  console.log('Done uploading images!')
  process.exit(0)
}

run()

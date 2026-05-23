/**
 * seed-rockwell-products.ts
 *
 * Comprehensive seed script for all Rockwell Hardness Tester products.
 * Grouped into series (variants) to prevent duplicate listings in catalog.
 *
 * Run with:  npm run seed:rockwell
 *
 * Safe - preserves existing images and PDFs by storing references in memory
 * and re-attaching them after cleanup.
 */

import { getPayload } from 'payload'
import config from '../src/payload.config'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(msg: string) {
  console.log(`[seed:rockwell] ${msg}`)
}

async function findOrCreateCategory(payload: Awaited<ReturnType<typeof getPayload>>, name: string, slug: string) {
  const existing = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs.length > 0) {
    log(`Category already exists: ${name} (id: ${existing.docs[0].id})`)
    return existing.docs[0].id
  }
  const created = await payload.create({ collection: 'categories', data: { name, slug } })
  log(`Created category: ${name} (id: ${created.id})`)
  return created.id
}

async function findOrCreateAccessory(
  payload: Awaited<ReturnType<typeof getPayload>>,
  name: string,
  category: 'standard' | 'optional',
  description?: string,
): Promise<number> {
  const existing = await payload.find({
    collection: 'accessories',
    where: { name: { equals: name } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs.length > 0) return existing.docs[0].id as number
  const created = await payload.create({
    collection: 'accessories',
    data: { name, category, ...(description ? { description } : {}) },
  })
  return created.id as number
}

async function findOrCreateVariant(
  payload: Awaited<ReturnType<typeof getPayload>>,
  data: {
    modelName: string
    type?: string
    majorLoads?: string
    minorLoads?: string
    resolution?: string
    specTable?: { label: string; value: string }[]
  },
): Promise<number> {
  const existing = await payload.find({
    collection: 'productVariants',
    where: { modelName: { equals: data.modelName } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs.length > 0) {
    // If it exists, update it to make sure specifications and loads are correct
    const updated = await payload.update({
      collection: 'productVariants',
      id: existing.docs[0].id,
      data: data as any,
    })
    return updated.id as number
  }
  const created = await payload.create({ collection: 'productVariants', data: data as any })
  return created.id as number
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

async function createProduct(
  payload: Awaited<ReturnType<typeof getPayload>>,
  data: Record<string, unknown>,
): Promise<void> {
  const slug = slugify(data.name as string)
  data.slug = slug
  const existing = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs.length > 0) {
    log(`  SKIP  — product already exists: ${data.name} (slug: ${slug})`)
    return
  }
  const product = await payload.create({ collection: 'products', data: data as any })
  log(`  CREATE — ${product.name} (id: ${product.id})`)
}

// ---------------------------------------------------------------------------
// Shared accessories (used across all Rockwell products)
// ---------------------------------------------------------------------------

async function buildSharedAccessories(payload: Awaited<ReturnType<typeof getPayload>>) {
  log('Creating shared accessories...')

  const standardItems: [string, string][] = [
    ['Testing Table Dia 50 mm', 'Flat testing anvil, 50 mm diameter.'],
    ['Testing Table Dia 40 mm with V-Groove', 'V-groove anvil for round jobs dia 6–45 mm.'],
    ['Rockwell Diamond Indenter', 'Standard Brale diamond indenter for Rockwell scales.'],
    ['Steel Ball Indenter Dia 1/16"', 'For soft metals and HRB scale testing.'],
    ['Test Block HRC', 'Hardened reference block for Rockwell C scale calibration.'],
    ['Test Block HRB', 'Reference block for Rockwell B scale calibration.'],
    ['Allen Spanners', 'Set of 3 Allen keys for machine maintenance.'],
    ['Telescopic Sleeves for Elevation Screw', 'Protects the elevation screw from dust.'],
    ['Instruction Manual', 'Complete user and maintenance manual.'],
    ['Machine Cover', 'Protective dust cover for the machine.'],
    ['Power Cable', 'Standard power supply cable.'],
  ]

  const optionalItems: [string, string][] = [
    ['Built-in Thermal Printer', 'Optional internal printer for direct result output.'],
    ['Dot Matrix Printer (EPSON LX-300+)', 'External serial printer for batch results.'],
    ['Brinell Microscope', 'Optical microscope for measuring Brinell indentation diameter.'],
    ['Gooseneck Adaptors', 'Extended adaptors for testing recessed surfaces.'],
    ['Diamond Spot Anvil', 'Anvil with diamond-tipped spot for small specimens.'],
    ['Superficial Diamond Indenter', 'For Rockwell Superficial scales (HR15N, HR30N, HR45N).'],
    ['Steel Ball Indenter Dia 2.5 mm', 'For Brinell testing with 187.5 kgf.'],
    ['Steel Ball Indenter Dia 5 mm', 'For Brinell testing with 250 kgf.'],
    ['Jack Rest', 'Elevating rest for large workpieces.'],
    ['Cylindrical Anvil', 'Anvil for cylindrical or tubular specimens.'],
    ['Raised Centre Testing Table', 'Allows testing of concave surfaces.'],
    ['Clamping Device', 'Secures specimens during testing.'],
  ]

  const ids: { standard: number[]; optional: number[] } = { standard: [], optional: [] }
  for (const [name, description] of standardItems) {
    ids.standard.push(await findOrCreateAccessory(payload, name, 'standard', description))
  }
  for (const [name, description] of optionalItems) {
    ids.optional.push(await findOrCreateAccessory(payload, name, 'optional', description))
  }

  log(`Accessories ready — ${ids.standard.length} standard, ${ids.optional.length} optional`)
  return ids
}

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------

async function seed() {
  const payload = await getPayload({ config })
  log('Connected to database.')

  // Category
  const categoryId = await findOrCreateCategory(
    payload,
    'Hardness Testing Machines',
    'hardness-testing',
  )

  // Shared accessories
  const acc = await buildSharedAccessories(payload)
  const allAccessories = [...acc.standard, ...acc.optional]
  const standardAccessories = acc.standard

  // Define slugs of products we want to clean up
  const trsnSlugs = [
    'trsn-export-rockwell-hardness-tester',
    'trsn-b-export-rockwell-hardness-tester',
    'trsn-t-export-rockwell-hardness-tester',
    'export-rockwell-hardness-tester-trsn-series',
  ]

  const trsndSlugs = [
    'trsn-d-digital-motorized-rockwell-hardness-tester',
    'trsn-td-digital-motorized-rockwell-superficial-hardness-tester',
    'trsn-bd-digital-motorized-rockwell-brinell-hardness-tester',
    'trsn-cd-digital-motorized-rockwell-superficial-brinell-hardness-tester',
    'digital-motorized-rockwell-hardness-tester-trsn-d-series',
  ]

  const trsSlugs = [
    'trs-analogue-rockwell-hardness-tester',
    'trs-150-analogue-rockwell-hardness-tester',
    'trb-analogue-rockwell-brinell-hardness-tester',
    'trb-250-analogue-rockwell-brinell-hardness-tester',
    'tsm-analogue-rockwell-superficial-hardness-tester',
    'analogue-rockwell-hardness-tester-trs-series',
  ]

  const trpSlugs = [
    'trp-1-portable-rockwell-hardness-tester',
    'portable-rockwell-hardness-tester-trp-1',
  ]

  const rasneSlugs = [
    'digital-touch-screen-rockwell-hardness-testing-machine',
    'rasnet-ts-touch-screen-rockwell-superficial-hardness-tester',
    'rasneb-ts-touch-screen-rockwell-brinell-hardness-tester',
    'digital-touch-screen-rockwell-hardness-testing-machine-rasne-ts-series',
  ]

  // Image & PDF Preservation Logic
  async function getExistingMediaReferences(slugs: string[]) {
    let heroImage: number | undefined = undefined
    let galleryImages: any[] | undefined = undefined
    let pdf: number | undefined = undefined

    for (const slug of slugs) {
      const existing = await payload.find({
        collection: 'products',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
      })
      if (existing.docs.length > 0) {
        const doc = existing.docs[0]
        if (!heroImage && doc.heroImage) {
          heroImage = doc.heroImage as number
        }
        if (!galleryImages && doc.galleryImages && doc.galleryImages.length > 0) {
          galleryImages = doc.galleryImages
        }
        if (!pdf && doc.pdf) {
          pdf = doc.pdf as number
        }
      }
    }
    return { heroImage, galleryImages, pdf }
  }

  log('Scanning database to preserve existing media attachments in memory...')
  const trsnMedia = await getExistingMediaReferences(trsnSlugs)
  const trsndMedia = await getExistingMediaReferences(trsndSlugs)
  const trsMedia = await getExistingMediaReferences(trsSlugs)
  const trpMedia = await getExistingMediaReferences(trpSlugs)
  const rasneMedia = await getExistingMediaReferences(rasneSlugs)

  // Cleaning up old individual products
  const allOldSlugs = [...trsnSlugs, ...trsndSlugs, ...trsSlugs, ...trpSlugs, ...rasneSlugs]
  log('Cleaning up old individual duplicate products from database...')
  for (const slug of allOldSlugs) {
    const existing = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs.length > 0) {
      log(`  Deleting product: ${existing.docs[0].name} (slug: ${slug})`)
      await payload.delete({
        collection: 'products',
        id: existing.docs[0].id,
      })
    }
  }

  // Cleaning up old variants to avoid orphans or duplicates
  const allModelNames = [
    'TRSN', 'TRSN-B', 'TRSN-T',
    'TRSN-D', 'TRSN-TD', 'TRSN-BD', 'TRSN-CD',
    'TRS', 'TRS-150', 'TRB', 'TRB-250', 'TSM',
    'TRP-1',
    'RASNE-TS', 'RASNET-TS', 'RASNEB-TS'
  ]
  log('Cleaning up old product variants from database...')
  for (const modelName of allModelNames) {
    const existing = await payload.find({
      collection: 'productVariants',
      where: { modelName: { equals: modelName } },
      limit: 100,
      depth: 0,
    })
    for (const doc of existing.docs) {
      log(`  Deleting variant: ${doc.modelName} (id: ${doc.id})`)
      await payload.delete({
        collection: 'productVariants',
        id: doc.id,
      })
    }
  }

  // =========================================================================
  // GROUP 1 — Export Rockwell Hardness Tester Series (TRSN, TRSN-B, TRSN-T)
  // =========================================================================
  log('\n=== GROUP 1: Export Rockwell Hardness Tester Series ===')

  const commonFeaturesTRSN = [
    'Automatic load selection via large dial knob',
    'Big dial gauge for clear reading',
    'Manual operation — simple and reliable',
    'Anti-friction linear bearing in hardened & ground stepped bush',
    'Perfect vertical movement for testing pins/balls up to 3 mm dia',
    'Corrosion-resistant plated components',
    'Superior aesthetic taper-front design',
    'Conforms to IS 1586, BS 10109-2, ASTM E-18, ISO 6508-2',
  ]

  const standardsTRSN = [
    { standard: 'IS 1586' },
    { standard: 'BS 10109-2' },
    { standard: 'ASTM E-18' },
    { standard: 'ISO 6508-2' },
    { standard: 'IS 2281' },
    { standard: 'ASTM E-10' },
    { standard: 'ISO 6506-2' },
  ]

  const variantTRSN = await findOrCreateVariant(payload, {
    modelName: 'TRSN',
    type: 'Export Rockwell Hardness Tester',
    majorLoads: '60, 100, 150 kgf',
    minorLoads: '10 kgf',
    resolution: '1.0 Rockwell',
    specTable: [
      { label: 'Test Loads', value: '60, 100, 150 kgf' },
      { label: 'Initial (Minor) Load', value: '10 kgf' },
      { label: 'Net Weight (approx)', value: '65 kg' },
    ],
  })

  const variantTRSNB = await findOrCreateVariant(payload, {
    modelName: 'TRSN-B',
    type: 'Export Rockwell Cum Brinell Hardness Tester',
    majorLoads: '60, 100, 150, 187.5, 250 kgf',
    minorLoads: '10 kgf',
    resolution: '1.0 Rockwell',
    specTable: [
      { label: 'Test Loads (Rockwell)', value: '60, 100, 150 kgf' },
      { label: 'Test Loads (Brinell)', value: '187.5, 250 kgf' },
      { label: 'Initial (Minor) Load', value: '10 kgf' },
      { label: 'Net Weight (approx)', value: '70 kg' },
    ],
  })

  const variantTRSNT = await findOrCreateVariant(payload, {
    modelName: 'TRSN-T',
    type: 'Export Rockwell Superficial Hardness Tester',
    majorLoads: '15, 30, 45, 60, 100, 150 kgf',
    minorLoads: '3 kgf and 10 kgf',
    resolution: '1.0 Rockwell',
    specTable: [
      { label: 'Rockwell Major Loads', value: '60, 100, 150 kgf' },
      { label: 'Superficial Major Loads', value: '15, 30, 45 kgf' },
      { label: 'Rockwell Minor Load', value: '10 kgf' },
      { label: 'Superficial Minor Load', value: '3 kgf' },
      { label: 'Net Weight (approx)', value: '70 kg' },
    ],
  })

  await createProduct(payload, {
    name: 'Export Rockwell Hardness Tester (TRSN Series)',
    slug: 'export-rockwell-hardness-tester-trsn-series',
    category: categoryId,
    brand: 'FIE',
    series: 'TRSN Series',
    modelCode: 'TRSN Series',
    isFeatured: false,
    shortDescription:
      'Export-grade manually operated Rockwell hardness testing machine with automatic load selection. Available in standard Rockwell (TRSN), combined Rockwell-Brinell (TRSN-B), and superficial (TRSN-T) models.',
    description:
      'The TRSN Series consists of precision export-grade Rockwell hardness testing machines manufactured under strict quality control. Designed for testing hardness of metals and alloys of all kinds — flat, round, or irregular shapes. Features an automatic load selection knob and big dial gauge for accurate, repeatable readings. The anti-friction linear bearing in the hardened stepped bush ensures perfect vertical movement, enabling reliable testing of small pins and ball specimens down to 3 mm diameter.',
    applications:
      'QA and production labs\nMetal fabrication and heat treatment verification\nResearch and development\nCasting and forging inspection\nAutomotive component testing',
    keyFeatures: commonFeaturesTRSN.map(f => ({ feature: f })),
    standardsSupported: standardsTRSN,
    specTable: [
      { label: 'Max Test Height', value: '222 mm' },
      { label: 'Throat Depth', value: '130 mm' },
      { label: 'Size of Base (approx)', value: '600 × 200 mm' },
      { label: 'Machine Height', value: '720 mm' },
      { label: 'Operation', value: 'Manual' },
    ],
    accessories: allAccessories,
    variants: [variantTRSN, variantTRSNB, variantTRSNT],
    heroImage: trsnMedia.heroImage,
    galleryImages: trsnMedia.galleryImages,
    pdf: trsnMedia.pdf,
    metaTitle: 'Export Rockwell Hardness Tester (TRSN Series) | FIE',
    metaDescription:
      'FIE TRSN Series Export Rockwell Hardness Tester — manual operation, automatic load selection, big dial gauge. Available in Rockwell, Brinell, and Superficial variants.',
    metaKeywords:
      'TRSN rockwell hardness tester, export rockwell hardness tester, FIE TRSN, manual rockwell tester, TRSN-B, TRSN-T, hardness testing machine India',
    ogTitle: 'Export Rockwell Hardness Tester (TRSN Series) — FIE',
    ogDescription:
      'Precision export-grade Rockwell hardness testing machines with automatic load selection. Available in Rockwell, Brinell, and Superficial variants.',
  })

  // =========================================================================
  // GROUP 2 — Digital Motorized Rockwell Hardness Testers (TRSN-D Series)
  // =========================================================================
  log('\n=== GROUP 2: Digital Motorized Rockwell Hardness Testers ===')

  const commonFeaturesTRSND = [
    'LCD Graphical Display (128 × 64 pixels) with large font readout',
    'Minor load graphically displayed on LCD (auto brake system)',
    'Automatic motorized loading and unloading cycle',
    'Motorized OR manual loading — user selectable',
    '75 results stored in internal memory with auto data storage',
    'Mean, minimum, maximum, and standard deviation calculations',
    'Dwell time setting: Major load 1–99 sec, Minor load 1–30 sec',
    'Automatic scale selection according to weight selected',
    'Conversion to Brinell (HB), Vickers (HV), Knoop (HK), Tensile Strength (KSI)',
    'Serial port for Dot Matrix Printer (EPSON LX-300+)',
    'Printed output: Serial No., Hardness Value, and Hardness Scale',
    'PC software support for statistical analysis',
    'Superior taper-front aesthetic design over conventional machines',
    'Anti-friction linear bearing for small pin testing up to 3 mm dia',
    'Corrosion-resistant plated components',
  ]

  const standardsTRSND = [
    { standard: 'IS 1586' },
    { standard: 'BS 10109-2' },
    { standard: 'ASTM E-18' },
    { standard: 'ISO 6508-2' },
    { standard: 'IS 2281' },
    { standard: 'BS 10003-2' },
    { standard: 'ASTM E-10' },
    { standard: 'ISO 6506-2' },
  ]

  const variantTRSND = await findOrCreateVariant(payload, {
    modelName: 'TRSN-D',
    type: 'Digital Motorized Rockwell Hardness Tester',
    majorLoads: '60, 100, 150 kgf',
    minorLoads: '10 kgf',
    resolution: '0.1 Rockwell',
    specTable: [
      { label: 'Test Loads', value: '60, 100, 150 kgf' },
      { label: 'Initial (Minor) Load', value: '10 kgf' },
      { label: 'Net Weight (approx)', value: '90 kg' },
    ],
  })

  const variantTRSNTD = await findOrCreateVariant(payload, {
    modelName: 'TRSN-TD',
    type: 'Digital Motorized Rockwell Superficial Hardness Tester',
    majorLoads: '15, 30, 45, 60, 100, 150 kgf',
    minorLoads: '3 kgf and 10 kgf',
    resolution: '0.1 Rockwell / 0.1 Superficial',
    specTable: [
      { label: 'Rockwell Major Loads', value: '60, 100, 150 kgf' },
      { label: 'Superficial Major Loads', value: '15, 30, 45 kgf' },
      { label: 'Rockwell Minor Load', value: '10 kgf' },
      { label: 'Superficial Minor Load', value: '3 kgf' },
      { label: 'Net Weight (approx)', value: '90 kg' },
    ],
  })

  const variantTRSNBD = await findOrCreateVariant(payload, {
    modelName: 'TRSN-BD',
    type: 'Digital Motorized Rockwell Brinell Hardness Tester',
    majorLoads: '60, 100, 150, 187.5, 250 kgf',
    minorLoads: '10 kgf',
    resolution: '0.1 Rockwell',
    specTable: [
      { label: 'Rockwell Loads', value: '60, 100, 150 kgf' },
      { label: 'Brinell Loads', value: '187.5, 250 kgf' },
      { label: 'Initial (Minor) Load', value: '10 kgf' },
      { label: 'Net Weight (approx)', value: '95 kg' },
    ],
  })

  const variantTRSNCD = await findOrCreateVariant(payload, {
    modelName: 'TRSN-CD',
    type: 'Digital Motorized Rockwell Superficial Brinell Hardness Tester',
    majorLoads: '15, 30, 45, 60, 100, 150, 187.5, 250 kgf',
    minorLoads: '3 kgf and 10 kgf',
    resolution: '0.1 Rockwell / 0.1 Superficial',
    specTable: [
      { label: 'Rockwell Loads', value: '60, 100, 150 kgf' },
      { label: 'Superficial Loads', value: '15, 30, 45 kgf' },
      { label: 'Brinell Loads', value: '187.5, 250 kgf' },
      { label: 'Rockwell Minor Load', value: '10 kgf' },
      { label: 'Superficial Minor Load', value: '3 kgf' },
      { label: 'Net Weight (approx)', value: '95 kg' },
    ],
  })

  await createProduct(payload, {
    name: 'Digital Motorized Rockwell Hardness Tester (TRSN-D Series)',
    slug: 'digital-motorized-rockwell-hardness-tester-trsn-d-series',
    category: categoryId,
    brand: 'FIE',
    series: 'TRSN-D Series',
    modelCode: 'TRSN-D Series',
    isFeatured: true,
    shortDescription:
      'Digital motorized Rockwell hardness tester with LCD display, automatic loading cycle, 75-reading memory, and result conversion. Available in Rockwell (TRSN-D), Superficial (TRSN-TD), Brinell (TRSN-BD) and Universal (TRSN-CD) models.',
    description:
      'The TRSN-D Series combines superior mechanics with digital electronic measurement. Featuring automatic motorized loading/unloading to eliminate operator errors, an LCD graphical display showing statistical values (mean, min, max, std dev), and internal memory storage for 75 readings. Hardness values can be automatically converted to Brinell, Vickers, Knoop, and Tensile Strength. Perfect for high-precision quality control and research laboratories.',
    applications:
      'QA and production hardness monitoring\nHeat treatment verification\nMetal fabrication quality control\nResearch and development labs\nAutomotive and aerospace component inspection\nTool and die inspection',
    keyFeatures: commonFeaturesTRSND.map(f => ({ feature: f })),
    standardsSupported: standardsTRSND,
    specTable: [
      { label: 'Max Test Height', value: '220 mm' },
      { label: 'Depth of Throat', value: '130 mm' },
      { label: 'Size of Base (approx)', value: '600 × 200 mm' },
      { label: 'Machine Height', value: '850 mm' },
      { label: 'Display', value: 'LCD 128 × 64 pixels' },
      { label: 'Result Storage', value: '75 readings' },
      { label: 'Operation', value: 'Motorized / Manual' },
    ],
    accessories: allAccessories,
    variants: [variantTRSND, variantTRSNTD, variantTRSNBD, variantTRSNCD],
    heroImage: trsndMedia.heroImage,
    galleryImages: trsndMedia.galleryImages,
    pdf: trsndMedia.pdf,
    metaTitle: 'Digital Motorized Rockwell Hardness Tester (TRSN-D Series) | FIE',
    metaDescription:
      'FIE TRSN-D Series digital motorized Rockwell hardness tester with LCD display, 75-result memory. Available in standard, superficial, Brinell, and multi-functional variants.',
    metaKeywords:
      'TRSN-D, TRSN-TD, TRSN-BD, TRSN-CD, digital rockwell hardness tester, motorized rockwell tester, FIE digital tester, hardness testing machine India',
    ogTitle: 'Digital Motorized Rockwell Hardness Tester (TRSN-D Series) — FIE',
    ogDescription:
      'Motorized digital Rockwell hardness testing machines with LCD display, automatic loading, 75-reading storage, and hardness scale conversions.',
  })

  // =========================================================================
  // GROUP 3 — Analogue Rockwell Hardness Testers (TRS Series)
  // =========================================================================
  log('\n=== GROUP 3: Analogue Rockwell Hardness Testers ===')

  const commonFeaturesTRS = [
    'Automatic weight selection dial',
    'Zero-setting dial gauge for direct reading',
    'High accuracy manual Rockwell testing',
    'Heavy-duty industrial construction',
    'Anti-friction linear bearing for precise vertical movement',
    'Corrosion-resistant plated components',
    'Proven analogue platform for simple, reliable operation',
  ]

  const standardsTRS = [
    { standard: 'IS 1586' },
    { standard: 'BS 10109-2' },
    { standard: 'ASTM E-18' },
    { standard: 'ISO 6508-2' },
  ]

  const variantTRS = await findOrCreateVariant(payload, {
    modelName: 'TRS',
    type: 'Analogue Rockwell Hardness Tester',
    majorLoads: '60, 100, 150 kgf',
    minorLoads: '10 kgf',
    resolution: '1.0 Rockwell',
    specTable: [
      { label: 'Test Loads', value: '60, 100, 150 kgf' },
      { label: 'Initial (Minor) Load', value: '10 kgf' },
      { label: 'Testing System', value: 'Rockwell (HRC, HRB, HRA)' },
    ],
  })

  const variantTRS150 = await findOrCreateVariant(payload, {
    modelName: 'TRS-150',
    type: 'Analogue High Capacity Rockwell Hardness Tester',
    majorLoads: '60, 100, 150 kgf (full capacity)',
    minorLoads: '10 kgf',
    resolution: '1.0 Rockwell',
    specTable: [
      { label: 'Test Loads', value: '60, 100, 150 kgf (full capacity)' },
      { label: 'Initial (Minor) Load', value: '10 kgf' },
      { label: 'Testing System', value: 'Rockwell (HRC, HRB, HRA)' },
    ],
  })

  const variantTRB = await findOrCreateVariant(payload, {
    modelName: 'TRB',
    type: 'Analogue Rockwell Cum Brinell Hardness Tester',
    majorLoads: '60, 100, 150, 187.5 kgf',
    minorLoads: '10 kgf',
    resolution: '1.0 Rockwell',
    specTable: [
      { label: 'Rockwell Loads', value: '60, 100, 150 kgf' },
      { label: 'Brinell Load', value: '187.5 kgf' },
      { label: 'Initial (Minor) Load', value: '10 kgf' },
      { label: 'Testing System', value: 'Rockwell + Brinell' },
    ],
  })

  const variantTRB250 = await findOrCreateVariant(payload, {
    modelName: 'TRB-250',
    type: 'Analogue Rockwell Brinell Hardness Tester (187.5 & 250 kgf)',
    majorLoads: '60, 100, 150, 187.5, 250 kgf',
    minorLoads: '10 kgf',
    resolution: '1.0 Rockwell',
    specTable: [
      { label: 'Rockwell Loads', value: '60, 100, 150 kgf' },
      { label: 'Brinell Loads', value: '187.5, 250 kgf' },
      { label: 'Initial (Minor) Load', value: '10 kgf' },
      { label: 'Ball Indenters', value: '2.5 mm (187.5 kgf) and 5 mm (250 kgf)' },
      { label: 'Testing System', value: 'Rockwell + Brinell' },
    ],
  })

  const variantTSM = await findOrCreateVariant(payload, {
    modelName: 'TSM',
    type: 'Analogue Rockwell Superficial Hardness Tester',
    majorLoads: '15, 30, 45, 60, 100, 150 kgf',
    minorLoads: '3 kgf and 10 kgf',
    resolution: '1.0 Rockwell',
    specTable: [
      { label: 'Rockwell Major Loads', value: '60, 100, 150 kgf' },
      { label: 'Superficial Major Loads', value: '15, 30, 45 kgf' },
      { label: 'Rockwell Minor Load', value: '10 kgf' },
      { label: 'Superficial Minor Load', value: '3 kgf' },
      { label: 'Testing System', value: 'Rockwell + Rockwell Superficial' },
    ],
  })

  await createProduct(payload, {
    name: 'Analogue Rockwell Hardness Tester (TRS Series)',
    slug: 'analogue-rockwell-hardness-tester-trs-series',
    category: categoryId,
    brand: 'FIE',
    series: 'TRS Series',
    modelCode: 'TRS Series',
    isFeatured: false,
    shortDescription:
      'Robust analogue Rockwell hardness tester with automatic weight selection and zero-setting dial gauge. Available in standard, high-capacity, combined Brinell, and superficial models.',
    description:
      'The TRS Series comprises time-tested analogue Rockwell hardness testing machines designed for industrial reliability. Featuring automatic weight selection and a precision zero-setting dial gauge, it provides straightforward, accurate Rockwell hardness readings without complex electronics. Its heavy-duty construction ensures a long service life in demanding production, foundry, and forge environments.',
    applications:
      'Production line quality control\nHeat treatment shop verification\nMetal fabrication incoming inspection\nTraining and educational labs\nSmall workshop hardness monitoring',
    keyFeatures: commonFeaturesTRS.map(f => ({ feature: f })),
    standardsSupported: standardsTRS,
    specTable: [
      { label: 'Max Test Height', value: '230 mm' },
      { label: 'Depth of Throat', value: '133 mm' },
      { label: 'Operation', value: 'Manual Analogue' },
    ],
    accessories: standardAccessories,
    variants: [variantTRS, variantTRS150, variantTRB, variantTRB250, variantTSM],
    heroImage: trsMedia.heroImage,
    galleryImages: trsMedia.galleryImages,
    pdf: trsMedia.pdf,
    metaTitle: 'Analogue Rockwell Hardness Tester (TRS Series) | FIE',
    metaDescription:
      'FIE TRS Series analogue Rockwell hardness tester — automatic weight selection, zero-setting dial gauge, heavy-duty industrial construction. Compliant with ASTM E-18.',
    metaKeywords:
      'TRS rockwell, analogue rockwell tester, FIE TRS, TRS-150, TRB, TRB-250, TSM, manual hardness tester India',
    ogTitle: 'Analogue Rockwell Hardness Tester (TRS Series) — FIE',
    ogDescription:
      'Time-tested analogue Rockwell hardness testing machines. Robust manual operation with direct dial reading. Available in multiple variants.',
  })

  // =========================================================================
  // GROUP 4 — Portable Rockwell Hardness Tester (TRP-1)
  // =========================================================================
  log('\n=== GROUP 4: Portable Rockwell Hardness Tester ===')

  const variantTRP1 = await findOrCreateVariant(payload, {
    modelName: 'TRP-1',
    type: 'Portable Rockwell Hardness Tester',
    majorLoads: '60, 100, 150 kgf',
    minorLoads: '10 kgf',
    resolution: '1.0 Rockwell',
    specTable: [
      { label: 'Test Loads', value: '60, 100, 150 kgf' },
      { label: 'Testing Orientation', value: 'Any direction (360 degrees)' },
      { label: 'Net Weight (approx)', value: '17.5 kg' },
    ],
  })

  await createProduct(payload, {
    name: 'Portable Rockwell Hardness Tester (TRP-1)',
    slug: 'portable-rockwell-hardness-tester-trp-1',
    category: categoryId,
    brand: 'FIE',
    series: 'TRP Series',
    modelCode: 'TRP-1',
    isFeatured: false,
    shortDescription:
      'Portable Rockwell hardness tester designed for in-situ testing of crankshafts, pipes, bearing rings, and large components. Operates in any orientation — horizontal, vertical, or inverted.',
    description:
      'The TRP-1 is a compact portable Rockwell hardness tester that brings lab-accurate measurement to the workshop floor, field, or production line. Unlike bench-mounted machines, it can test components that cannot be easily brought to the lab — crankshafts, large bearing rings, heavy forgings, structural pipe, and other oversized or installed components. It operates in any direction (horizontal, vertical, upward, sideways) without loss of accuracy, and its compact 17.5 kg weight makes it easily carried to site.',
    applications:
      'In-service crankshaft hardness testing\nPipe and tube hardness verification\nBearing ring testing without disassembly\nInternal bore and external surface testing\nLarge gear and shaft inspection on machine\nField-deployed hardness certification',
    keyFeatures: [
      'Portable — test components in any location',
      'Works in any direction: horizontal, vertical, upward, downward, sideways',
      'Suitable for crankshaft hardness testing',
      'Tests pipe and tube internal and external surfaces',
      'Tests bearing ring hardness without removal',
      'Compact and lightweight for field use',
      'No bench fixture required',
      'Full Rockwell accuracy on site',
    ].map(f => ({ feature: f })),
    standardsSupported: [
      { standard: 'ASTM E-18' },
      { standard: 'IS 1586' },
    ],
    specTable: [
      { label: 'Max Test Height (Throat)', value: '110 mm' },
      { label: 'Throat Capacity', value: '55 mm' },
      { label: 'Net Weight (approx)', value: '17.5 kg' },
      { label: 'Operation', value: 'Portable / Manual' },
    ],
    accessories: standardAccessories,
    variants: [variantTRP1],
    heroImage: trpMedia.heroImage,
    galleryImages: trpMedia.galleryImages,
    pdf: trpMedia.pdf,
    metaTitle: 'TRP-1 Portable Rockwell Hardness Tester | FIE',
    metaDescription:
      'FIE TRP-1 portable Rockwell hardness tester — tests crankshafts, pipes, bearing rings in any orientation. 17.5 kg, 110 mm throat, no bench required.',
    metaKeywords:
      'TRP-1 portable rockwell hardness tester, portable hardness tester, FIE TRP-1, in-situ hardness testing, crankshaft hardness tester',
    ogTitle: 'TRP-1 Portable Rockwell Hardness Tester — FIE',
    ogDescription:
      'Portable Rockwell hardness tester for crankshafts, pipes, and bearing rings. Tests in any orientation without a bench. 17.5 kg.',
  })

  // =========================================================================
  // GROUP 5 — Touch Screen Rockwell (RASNE-TS Series)
  // =========================================================================
  log('\n=== GROUP 5: Touch Screen Rockwell Hardness Testers ===')

  const commonFeaturesRASNE = [
    '4.3 inch TFT colour touch screen display',
    'Fully automatic load/dwell/unload cycle',
    'Motorized loading and unloading system',
    'High precision hardness measurement',
    '0.1 Rockwell resolution',
    'Auto/Manual start mode selection',
    'High/Low limit indication for pass/fail sorting',
    'External dial force selection',
    'LCD preload indicator',
    'Thermal printer support',
    'Internal result storage',
    'Mean, min, max calculations',
  ]

  const standardsRASNE = [
    { standard: 'ASTM E-18' },
    { standard: 'ASTM E-10' },
    { standard: 'IS 1586-2' },
    { standard: 'IS 1500-2' },
    { standard: 'BS 10109-2' },
    { standard: 'BS 10003-2' },
  ]

  const variantRASNETS = await findOrCreateVariant(payload, {
    modelName: 'RASNE-TS',
    type: 'Digital Rockwell',
    majorLoads: '60, 100, 150 kgf',
    minorLoads: '10 kgf',
    resolution: '0.1 Rockwell',
    specTable: [
      { label: 'Rockwell Major Loads', value: '60, 100, 150 kgf' },
      { label: 'Rockwell Minor Load', value: '10 kgf' },
    ],
  })

  const variantRASNETTS = await findOrCreateVariant(payload, {
    modelName: 'RASNET-TS',
    type: 'Digital Rockwell & Rockwell Superficial',
    majorLoads: '15, 30, 45, 60, 100, 150 kgf',
    minorLoads: '3 kgf and 10 kgf',
    resolution: '0.1 Rockwell / 0.1 Superficial',
    specTable: [
      { label: 'Rockwell Major Loads', value: '60, 100, 150 kgf' },
      { label: 'Superficial Major Loads', value: '15, 30, 45 kgf' },
      { label: 'Rockwell Minor Load', value: '10 kgf' },
      { label: 'Superficial Minor Load', value: '3 kgf' },
    ],
  })

  const variantRASNEBTS = await findOrCreateVariant(payload, {
    modelName: 'RASNEB-TS',
    type: 'Digital Rockwell Cum Brinell',
    majorLoads: '60, 100, 150, 187.5, 250 kgf',
    minorLoads: '10 kgf',
    resolution: '0.1 Rockwell',
    specTable: [
      { label: 'Rockwell Loads', value: '60, 100, 150 kgf' },
      { label: 'Brinell Loads', value: '187.5, 250 kgf' },
      { label: 'Initial (Minor) Load', value: '10 kgf' },
    ],
  })

  await createProduct(payload, {
    name: 'Digital Touch Screen Rockwell Hardness Testing Machine (RASNE-TS Series)',
    slug: 'digital-touch-screen-rockwell-hardness-testing-machine-rasne-ts-series',
    category: categoryId,
    brand: 'FIE',
    series: 'RASNE-TS Series',
    modelCode: 'RASNE-TS Series',
    isFeatured: true,
    shortDescription:
      'Advanced touch screen motorized Rockwell hardness testing machine with 4.3" TFT display and automatic cycling. Available in Rockwell (RASNE-TS), Superficial (RASNET-TS), and Brinell (RASNEB-TS) models.',
    description:
      'The RASNE-TS Series offers a highly accurate and reliable Rockwell hardness testing solution for industrial use. Equipped with a motorized loading and unloading system, it eliminates manual errors and ensures consistent results. The large 4.3 inch TFT touch screen display provides a clear, user-friendly interface for seamless operation, dwell time settings, and pass/fail sorting.',
    applications:
      'Combined Rockwell and Superficial production testing\nThin coating and case hardening QA\nPrecision components and thin sheet testing\nAutomotive and aerospace hardness certification\nR&D labs requiring multi-scale Rockwell testing',
    keyFeatures: commonFeaturesRASNE.map(f => ({ feature: f })),
    standardsSupported: standardsRASNE,
    specTable: [
      { label: 'Display', value: '4.3" TFT Colour Touch Screen' },
      { label: 'Resolution', value: '0.1 Rockwell' },
      { label: 'Max Test Height', value: '230 mm' },
      { label: 'Depth of Throat', value: '133 mm' },
      { label: 'Net Weight', value: '75–77 kg' },
      { label: 'Machine Dimensions', value: '450 × 175 × 627 mm' },
      { label: 'Operation', value: 'Motorized Automatic / Manual' },
    ],
    accessories: allAccessories,
    variants: [variantRASNETS, variantRASNETTS, variantRASNEBTS],
    heroImage: rasneMedia.heroImage,
    galleryImages: rasneMedia.galleryImages,
    pdf: rasneMedia.pdf,
    metaTitle: 'Touch Screen Rockwell Hardness Testing Machine (RASNE-TS Series) | FIE',
    metaDescription:
      'FIE RASNE-TS Series touch screen motorized Rockwell hardness tester — 4.3" TFT display, automatic cycling. Available in Rockwell, Brinell, and Superficial variants.',
    metaKeywords:
      'RASNE-TS, RASNET-TS, RASNEB-TS, touch screen rockwell hardness tester, FIE touch screen, motorized rockwell tester, digital touch screen tester',
    ogTitle: 'Digital Touch Screen Rockwell Hardness Testing Machine (RASNE-TS Series) — FIE',
    ogDescription:
      'Advanced digital touch screen Rockwell hardness testing machine with automatic loading/unloading system, 0.1 Rockwell resolution, and TFT color display.',
  })

  // Done
  log('\n✅ All products grouped and seeded successfully.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('[seed:rockwell] FATAL ERROR:', err)
  process.exit(1)
})

/**
 * seed-rockwell-products.ts
 *
 * Comprehensive seed script for all Rockwell Hardness Tester products.
 * Source: TRSN series.pdf, TRSN-BD-CD-D-TD.pdf, TRS series leaflet.pdf,
 *         Digital-Touch-Screen-Rockwell.pdf, and HTML reference page.
 *
 * Run with:  npm run seed:rockwell
 *
 * Idempotent — skips any product whose slug already exists in the database.
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
  if (existing.docs.length > 0) return existing.docs[0].id as number
  const created = await payload.create({ collection: 'productVariants', data: data as any })
  return created.id as number
}

async function createProduct(
  payload: Awaited<ReturnType<typeof getPayload>>,
  data: Record<string, unknown>,
): Promise<void> {
  const slug = data.slug as string
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

  // TRSN
  await createProduct(payload, {
    name: 'TRSN Export Rockwell Hardness Tester',
    slug: 'trsn-export-rockwell-hardness-tester',
    category: categoryId,
    brand: 'FIE',
    series: 'TRSN Series',
    modelCode: 'TRSN',
    isFeatured: false,
    shortDescription:
      'Export-grade manually operated Rockwell hardness testing machine with automatic load selection and big dial gauge. Suitable for testing metals, alloys, and small pins up to 3 mm diameter.',
    description:
      'The TRSN is a precision export-grade Rockwell hardness testing machine manufactured under strict quality control. Designed for testing hardness of metals and alloys of all kinds — flat, round, or irregular shapes. Features an automatic load selection knob and big dial gauge for accurate, repeatable readings. The anti-friction linear bearing in the hardened stepped bush ensures perfect vertical movement, enabling reliable testing of small pins and ball specimens down to 3 mm diameter.',
    applications:
      'QA and production labs\nMetal fabrication and heat treatment verification\nResearch and development\nCasting and forging inspection\nAutomotive component testing',
    keyFeatures: commonFeaturesTRSN.map(f => ({ feature: f })),
    standardsSupported: standardsTRSN,
    specTable: [
      { label: 'Test Loads', value: '60, 100, 150 kgf' },
      { label: 'Initial (Minor) Load', value: '10 kgf' },
      { label: 'Max Test Height', value: '222 mm' },
      { label: 'Throat Depth', value: '130 mm' },
      { label: 'Size of Base (approx)', value: '600 × 200 mm' },
      { label: 'Machine Height', value: '720 mm' },
      { label: 'Net Weight (approx)', value: '65 kg' },
      { label: 'Operation', value: 'Manual' },
    ],
    accessories: allAccessories,
    metaTitle: 'TRSN Export Rockwell Hardness Tester | FIE | Horizon India Technologies',
    metaDescription:
      'FIE TRSN Export Rockwell Hardness Tester — manual operation, 60/100/150 kgf loads, big dial gauge. Conforms to ASTM E-18, IS 1586, ISO 6508-2.',
    metaKeywords:
      'TRSN rockwell hardness tester, export rockwell hardness tester, FIE TRSN, manual rockwell tester, hardness testing machine India',
    ogTitle: 'TRSN Export Rockwell Hardness Tester — FIE',
    ogDescription:
      'Manual Rockwell hardness tester with automatic load selection, big dial gauge. Suitable for metals, alloys and small pins up to 3 mm.',
  })

  // TRSN-B
  await createProduct(payload, {
    name: 'TRSN-B Export Rockwell Cum Brinell Hardness Tester',
    slug: 'trsn-b-export-rockwell-hardness-tester',
    category: categoryId,
    brand: 'FIE',
    series: 'TRSN Series',
    modelCode: 'TRSN-B',
    isFeatured: false,
    shortDescription:
      'Export-grade Rockwell Cum Brinell hardness tester with extended load range up to 250 kgf. Handles Rockwell (HRC, HRB) and Brinell testing in one machine.',
    description:
      'The TRSN-B extends the standard TRSN with Brinell testing capability. The larger load range (up to 250 kgf) and inclusion of 2.5 mm and 5 mm steel ball indenters allows Brinell indentation measurement alongside standard Rockwell testing. Ideal for labs that need to test both hard and soft metals on one machine while maintaining a compact footprint.',
    applications:
      'Brinell and Rockwell testing in a single machine\nSoft metals and non-ferrous alloys\nForge and foundry quality inspection\nHeat treatment verification\nSteel mill QA labs',
    keyFeatures: [
      ...commonFeaturesTRSN,
      'Rockwell Cum Brinell combined testing capability',
      'Extended load range up to 250 kgf for Brinell',
      'Includes 2.5 mm and 5 mm ball indenters for Brinell scale',
      'Includes Brinell microscope for indentation measurement',
    ].map(f => ({ feature: f })),
    standardsSupported: standardsTRSN,
    specTable: [
      { label: 'Test Loads (Rockwell)', value: '60, 100, 150 kgf' },
      { label: 'Test Loads (Brinell)', value: '187.5, 250 kgf' },
      { label: 'Initial (Minor) Load', value: '10 kgf' },
      { label: 'Max Test Height', value: '222 mm' },
      { label: 'Throat Depth', value: '130 mm' },
      { label: 'Net Weight (approx)', value: '70 kg' },
      { label: 'Operation', value: 'Manual' },
    ],
    accessories: allAccessories,
    metaTitle: 'TRSN-B Rockwell Cum Brinell Hardness Tester | FIE | Horizon India Technologies',
    metaDescription:
      'FIE TRSN-B Rockwell Cum Brinell Hardness Tester — 60–250 kgf loads, combined Rockwell and Brinell testing. Conforms to ASTM E-18, ASTM E-10, IS 1586.',
    metaKeywords:
      'TRSN-B rockwell brinell hardness tester, combined hardness tester, FIE TRSN-B, rockwell cum brinell tester',
    ogTitle: 'TRSN-B Export Rockwell Cum Brinell Hardness Tester — FIE',
    ogDescription:
      'Combined Rockwell and Brinell hardness tester with loads up to 250 kgf. Perfect for labs needing both test methods in one machine.',
  })

  // TRSN-T
  await createProduct(payload, {
    name: 'TRSN-T Export Rockwell Superficial Hardness Tester',
    slug: 'trsn-t-export-rockwell-superficial-hardness-tester',
    category: categoryId,
    brand: 'FIE',
    series: 'TRSN Series',
    modelCode: 'TRSN-T',
    isFeatured: false,
    shortDescription:
      'Export-grade Rockwell Cum Superficial hardness tester with both 10 kgf (Rockwell) and 3 kgf (Superficial) minor loads. Tests HRC, HRB, HR15N, HR30N, HR45N scales.',
    description:
      'The TRSN-T adds Rockwell Superficial testing capability to the standard TRSN platform. The 3 kgf minor load and superficial major loads (15, 30, 45 kgf) enable testing of thin materials, coatings, case-hardened layers, and delicate components where conventional Rockwell loads would cause excessive deformation. A single machine that covers all mainstream Rockwell and Rockwell Superficial scales.',
    applications:
      'Thin sheet metal and coatings testing\nCase-hardened layer depth inspection\nThin-walled tubing and small components\nCarburizing and nitriding verification\nBearing components and precision parts',
    keyFeatures: [
      ...commonFeaturesTRSN,
      'Rockwell Cum Superficial combined testing',
      'Both 10 kgf Rockwell and 3 kgf Superficial minor loads',
      'Superficial scales: HR15N, HR30N, HR45N, HR15T, HR30T, HR45T',
      'Suitable for thin materials and case-hardened layers',
    ].map(f => ({ feature: f })),
    standardsSupported: standardsTRSN,
    specTable: [
      { label: 'Rockwell Major Loads', value: '60, 100, 150 kgf' },
      { label: 'Superficial Major Loads', value: '15, 30, 45 kgf' },
      { label: 'Rockwell Minor Load', value: '10 kgf' },
      { label: 'Superficial Minor Load', value: '3 kgf' },
      { label: 'Max Test Height', value: '222 mm' },
      { label: 'Throat Depth', value: '130 mm' },
      { label: 'Net Weight (approx)', value: '70 kg' },
      { label: 'Operation', value: 'Manual' },
    ],
    accessories: allAccessories,
    metaTitle: 'TRSN-T Rockwell Superficial Hardness Tester | FIE | Horizon India Technologies',
    metaDescription:
      'FIE TRSN-T Rockwell Cum Superficial Hardness Tester — 10 kgf & 3 kgf minor loads, Rockwell and Superficial scales. Tests thin materials and coatings.',
    metaKeywords:
      'TRSN-T rockwell superficial hardness tester, superficial rockwell tester, FIE TRSN-T, thin material hardness tester',
    ogTitle: 'TRSN-T Export Rockwell Superficial Hardness Tester — FIE',
    ogDescription:
      'Rockwell and Superficial combined hardness tester. Tests thin coatings, case-hardened layers and delicate components with 15–150 kgf loads.',
  })

  // =========================================================================
  // GROUP 2 — Digital Motorized Rockwell Hardness Testers (TRSN-D/TD/BD/CD)
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

  const commonSpecsTRSND = [
    { label: 'Max Test Height', value: '220 mm' },
    { label: 'Depth of Throat', value: '130 mm' },
    { label: 'Size of Base (approx)', value: '600 × 200 mm' },
    { label: 'Machine Height', value: '850 mm' },
    { label: 'Net Weight (approx)', value: '90 kg' },
    { label: 'Display', value: 'LCD 128 × 64 pixels' },
    { label: 'Result Storage', value: '75 readings' },
    { label: 'Operation', value: 'Motorized / Manual' },
  ]

  // TRSN-D
  await createProduct(payload, {
    name: 'TRSN-D Digital Motorized Rockwell Hardness Tester',
    slug: 'trsn-d-digital-motorized-rockwell-hardness-tester',
    category: categoryId,
    brand: 'FIE',
    series: 'TRSN-D Series',
    modelCode: 'TRSN-D',
    isFeatured: true,
    shortDescription:
      'Digital motorized Rockwell hardness tester with LCD display, automatic loading cycle, 75-reading memory, and result conversion to HB, HV, HK, KSI. Conforms to ASTM E-18, IS 1586.',
    description:
      'The TRSN-D is a fully digital motorized Rockwell hardness testing machine combining superior ergonomics with advanced electronic measurement. The automatic motorized loading eliminates operator-induced errors while the LCD graphical display presents results clearly in large font. Internal memory stores 75 readings with statistical calculations. Results can be converted to Brinell, Vickers, Knoop and tensile strength values — making it a versatile single-instrument solution for modern QA labs.',
    applications:
      'QA and production hardness monitoring\nHeat treatment verification\nMetal fabrication quality control\nResearch and development labs\nAutomotive and aerospace component inspection\nTool and die inspection',
    keyFeatures: commonFeaturesTRSND.map(f => ({ feature: f })),
    standardsSupported: standardsTRSND,
    specTable: [
      { label: 'Test Loads', value: '60, 100, 150 kgf' },
      { label: 'Initial (Minor) Load', value: '10 kgf' },
      ...commonSpecsTRSND,
    ],
    accessories: allAccessories,
    metaTitle: 'TRSN-D Digital Motorized Rockwell Hardness Tester | FIE | Horizon India Technologies',
    metaDescription:
      'FIE TRSN-D digital motorized Rockwell hardness tester with LCD display, 75-result memory, conversion to HB/HV/HK. ASTM E-18, IS 1586 compliant.',
    metaKeywords:
      'TRSN-D digital rockwell hardness tester, motorized rockwell tester, FIE TRSN-D, digital hardness tester India',
    ogTitle: 'TRSN-D Digital Motorized Rockwell Hardness Tester — FIE',
    ogDescription:
      'Motorized digital Rockwell hardness tester with LCD display, auto loading, 75-result memory and conversion to HB, HV, HK, KSI.',
  })

  // TRSN-TD
  await createProduct(payload, {
    name: 'TRSN-TD Digital Motorized Rockwell Superficial Hardness Tester',
    slug: 'trsn-td-digital-motorized-rockwell-superficial-hardness-tester',
    category: categoryId,
    brand: 'FIE',
    series: 'TRSN-D Series',
    modelCode: 'TRSN-TD',
    isFeatured: false,
    shortDescription:
      'Digital motorized Rockwell Cum Superficial hardness tester with both 10 kgf and 3 kgf minor loads. Tests all Rockwell and Rockwell Superficial scales with LCD display and motorized automation.',
    description:
      'The TRSN-TD combines Rockwell and Rockwell Superficial testing in a single digital motorized platform. The dual minor load system (10 kgf for Rockwell, 3 kgf for Superficial) allows seamless switching between regular and thin-material test methods. Motorized loading, LCD display, 75-result memory, and result conversion make this ideal for labs testing case-hardened parts, coatings, thin sheet metal, and precision components alongside standard steel and alloy work.',
    applications:
      'Thin coating and case hardening verification\nPrecision parts and thin sheet metal\nCarburized and nitrided component inspection\nCombined Rockwell + Superficial testing programs\nHeat treatment laboratory quality control',
    keyFeatures: [
      ...commonFeaturesTRSND,
      'Dual minor load: 10 kgf Rockwell + 3 kgf Superficial',
      'All Rockwell Superficial scales: HR15N, HR30N, HR45N, HR15T, HR30T, HR45T',
    ].map(f => ({ feature: f })),
    standardsSupported: standardsTRSND,
    specTable: [
      { label: 'Rockwell Major Loads', value: '60, 100, 150 kgf' },
      { label: 'Superficial Major Loads', value: '15, 30, 45 kgf' },
      { label: 'Rockwell Minor Load', value: '10 kgf' },
      { label: 'Superficial Minor Load', value: '3 kgf' },
      ...commonSpecsTRSND,
    ],
    accessories: allAccessories,
    metaTitle: 'TRSN-TD Digital Motorized Rockwell Superficial Hardness Tester | FIE | Horizon India Technologies',
    metaDescription:
      'FIE TRSN-TD motorized Rockwell Cum Superficial hardness tester — 15–150 kgf, dual minor loads (10 kgf + 3 kgf), LCD display, 75-result memory.',
    metaKeywords:
      'TRSN-TD rockwell superficial digital tester, FIE TRSN-TD, motorized superficial hardness tester',
    ogTitle: 'TRSN-TD Digital Motorized Rockwell Superficial Hardness Tester — FIE',
    ogDescription:
      'Digital motorized Rockwell Cum Superficial hardness tester. Dual minor loads, 15–150 kgf range, LCD display with auto loading.',
  })

  // TRSN-BD
  await createProduct(payload, {
    name: 'TRSN-BD Digital Motorized Rockwell Brinell Hardness Tester',
    slug: 'trsn-bd-digital-motorized-rockwell-brinell-hardness-tester',
    category: categoryId,
    brand: 'FIE',
    series: 'TRSN-D Series',
    modelCode: 'TRSN-BD',
    isFeatured: false,
    shortDescription:
      'Digital motorized Rockwell Cum Brinell hardness tester with load range up to 250 kgf. Combines full Rockwell testing with Brinell indentation capability. LCD display and motorized automation.',
    description:
      'The TRSN-BD extends the TRSN-D digital platform with Brinell testing capability by adding loads of 187.5 and 250 kgf. Combined with the standard Rockwell loads (60, 100, 150 kgf), this machine covers HRC, HRB, HB/2.5, and HB/5 hardness testing. The motorized loading, LCD display, and result storage are identical to the TRSN-D, with the Brinell microscope included for indentation diameter measurement.',
    applications:
      'Combined Rockwell and Brinell production testing\nSoft metals, castings, and forgings\nFoundry quality control\nGear and bearing inspection\nStructural steel and non-ferrous alloy testing',
    keyFeatures: [
      ...commonFeaturesTRSND,
      'Extended load range up to 250 kgf for Brinell testing',
      'Brinell microscope included for indentation measurement',
      'Steel ball indenters: 2.5 mm and 5 mm diameter included',
    ].map(f => ({ feature: f })),
    standardsSupported: standardsTRSND,
    specTable: [
      { label: 'Rockwell Loads', value: '60, 100, 150 kgf' },
      { label: 'Brinell Loads', value: '187.5, 250 kgf' },
      { label: 'Initial (Minor) Load', value: '10 kgf' },
      ...commonSpecsTRSND,
    ],
    accessories: allAccessories,
    metaTitle: 'TRSN-BD Digital Motorized Rockwell Brinell Hardness Tester | FIE | Horizon India Technologies',
    metaDescription:
      'FIE TRSN-BD digital motorized Rockwell Cum Brinell hardness tester — 60–250 kgf, LCD display, result memory. ASTM E-18 and ASTM E-10 compliant.',
    metaKeywords:
      'TRSN-BD rockwell brinell digital tester, FIE TRSN-BD, motorized rockwell brinell hardness tester, combined hardness tester',
    ogTitle: 'TRSN-BD Digital Motorized Rockwell Brinell Hardness Tester — FIE',
    ogDescription:
      'Motorized digital combined Rockwell and Brinell hardness tester. Load range 60–250 kgf with LCD display and 75-result memory.',
  })

  // TRSN-CD
  await createProduct(payload, {
    name: 'TRSN-CD Digital Motorized Rockwell Superficial Brinell Hardness Tester',
    slug: 'trsn-cd-digital-motorized-rockwell-superficial-brinell-hardness-tester',
    category: categoryId,
    brand: 'FIE',
    series: 'TRSN-D Series',
    modelCode: 'TRSN-CD',
    isFeatured: false,
    shortDescription:
      'Most comprehensive digital motorized hardness tester — combines Rockwell, Rockwell Superficial, and Brinell in one machine. Load range 15–250 kgf with 3 kgf and 10 kgf minor loads.',
    description:
      'The TRSN-CD is the flagship combined hardness testing machine. It provides Rockwell (60, 100, 150 kgf), Rockwell Superficial (15, 30, 45 kgf), and Brinell (187.5, 250 kgf) testing capability in a single motorized digital platform. Both minor loads — 3 kgf for superficial and 10 kgf for Rockwell and Brinell — are included. This is the ultimate choice for labs that need to test every type of metal specimen without changing machines, covering the full range from thin coatings to heavy castings.',
    applications:
      'Universal hardness testing laboratory\nQuality certification testing (multiple standards)\nR&D facilities requiring multiple test methods\nSteel mills and foundries with diverse product lines\nExport testing and third-party inspection',
    keyFeatures: [
      ...commonFeaturesTRSND,
      'Combined Rockwell + Rockwell Superficial + Brinell testing',
      'Full load range: 15, 30, 45, 60, 100, 150, 187.5, 250 kgf',
      'Dual minor loads: 3 kgf (Superficial) + 10 kgf (Rockwell/Brinell)',
      'Covers thin coatings to heavy castings in one machine',
    ].map(f => ({ feature: f })),
    standardsSupported: standardsTRSND,
    specTable: [
      { label: 'Rockwell Loads', value: '60, 100, 150 kgf' },
      { label: 'Superficial Loads', value: '15, 30, 45 kgf' },
      { label: 'Brinell Loads', value: '187.5, 250 kgf' },
      { label: 'Rockwell Minor Load', value: '10 kgf' },
      { label: 'Superficial Minor Load', value: '3 kgf' },
      ...commonSpecsTRSND,
    ],
    accessories: allAccessories,
    metaTitle: 'TRSN-CD Digital Rockwell Superficial Brinell Hardness Tester | FIE | Horizon India Technologies',
    metaDescription:
      'FIE TRSN-CD — combined Rockwell, Superficial, and Brinell digital motorized hardness tester. Full range 15–250 kgf, LCD display, result storage.',
    metaKeywords:
      'TRSN-CD combined hardness tester, rockwell superficial brinell digital tester, FIE TRSN-CD, universal hardness tester',
    ogTitle: 'TRSN-CD Digital Motorized Combined Hardness Tester — FIE',
    ogDescription:
      'Ultimate combined Rockwell + Superficial + Brinell digital motorized hardness tester. Full 15–250 kgf range in one machine.',
  })

  // =========================================================================
  // GROUP 3 — Analogue Rockwell Hardness Testers (TRS, TRS-150, TRB, TRB-250, TSM)
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

  // TRS
  await createProduct(payload, {
    name: 'TRS Analogue Rockwell Hardness Tester',
    slug: 'trs-analogue-rockwell-hardness-tester',
    category: categoryId,
    brand: 'FIE',
    series: 'TRS Series',
    modelCode: 'TRS',
    isFeatured: false,
    shortDescription:
      'Robust analogue Rockwell hardness tester with automatic weight selection and zero-setting dial gauge. Proven heavy-duty construction for industrial QA.',
    description:
      'The TRS is a time-tested analogue Rockwell hardness testing machine designed for industrial reliability. Featuring automatic weight selection and a precision zero-setting dial gauge, it provides straightforward, accurate Rockwell hardness readings without complex electronics. The heavy-duty construction ensures long service life in demanding production environments.',
    applications:
      'Production line quality control\nHeat treatment shop verification\nMetal fabrication incoming inspection\nTraining and educational labs\nSmall workshop hardness monitoring',
    keyFeatures: commonFeaturesTRS.map(f => ({ feature: f })),
    standardsSupported: standardsTRS,
    specTable: [
      { label: 'Test Loads', value: '60, 100, 150 kgf' },
      { label: 'Initial (Minor) Load', value: '10 kgf' },
      { label: 'Testing System', value: 'Rockwell (HRC, HRB, HRA)' },
      { label: 'Operation', value: 'Manual Analogue' },
    ],
    accessories: standardAccessories,
    metaTitle: 'TRS Analogue Rockwell Hardness Tester | FIE | Horizon India Technologies',
    metaDescription:
      'FIE TRS analogue Rockwell hardness tester — automatic weight selection, zero-setting dial gauge, heavy-duty industrial construction. ASTM E-18 compliant.',
    metaKeywords:
      'TRS rockwell hardness tester, analogue rockwell tester, FIE TRS, manual hardness tester India',
    ogTitle: 'TRS Analogue Rockwell Hardness Tester — FIE',
    ogDescription:
      'Proven analogue Rockwell hardness tester with automatic weight selection and precision dial gauge. Heavy-duty industrial construction.',
  })

  // TRS-150
  await createProduct(payload, {
    name: 'TRS-150 Analogue High Capacity Rockwell Hardness Tester',
    slug: 'trs-150-analogue-rockwell-hardness-tester',
    category: categoryId,
    brand: 'FIE',
    series: 'TRS Series',
    modelCode: 'TRS-150',
    isFeatured: false,
    shortDescription:
      'High-capacity analogue Rockwell hardness tester with full 150 kgf capability. Heavy-duty industrial construction for demanding production and QA environments.',
    description:
      'The TRS-150 is the high-capacity variant of the TRS analogue series. Built for testing harder materials and heavier specimens, it maintains the same proven analogue platform with automatic weight selection and precision dial gauge while providing the full 150 kgf load for HRC scale testing of hard steels and tool materials.',
    applications:
      'Hard steel and tool material testing\nCarburized and hardened components\nDie and mold inspection\nProduction QA for tool steels\nHigh-volume industrial hardness testing',
    keyFeatures: commonFeaturesTRS.map(f => ({ feature: f })),
    standardsSupported: standardsTRS,
    specTable: [
      { label: 'Test Loads', value: '60, 100, 150 kgf (full capacity)' },
      { label: 'Initial (Minor) Load', value: '10 kgf' },
      { label: 'Testing System', value: 'Rockwell (HRC, HRB, HRA)' },
      { label: 'Operation', value: 'Manual Analogue' },
    ],
    accessories: standardAccessories,
    metaTitle: 'TRS-150 High Capacity Analogue Rockwell Hardness Tester | FIE | Horizon India Technologies',
    metaDescription:
      'FIE TRS-150 high-capacity analogue Rockwell hardness tester — 60, 100, 150 kgf, zero-setting dial gauge. ASTM E-18, IS 1586 compliant.',
    metaKeywords:
      'TRS-150 rockwell hardness tester, high capacity rockwell tester, FIE TRS-150, analogue hardness tester',
    ogTitle: 'TRS-150 High Capacity Analogue Rockwell Hardness Tester — FIE',
    ogDescription:
      'High-capacity analogue Rockwell hardness tester with full 150 kgf load. Automatic weight selection, precision dial gauge.',
  })

  // TRB
  await createProduct(payload, {
    name: 'TRB Analogue Rockwell Cum Brinell Hardness Tester',
    slug: 'trb-analogue-rockwell-brinell-hardness-tester',
    category: categoryId,
    brand: 'FIE',
    series: 'TRS Series',
    modelCode: 'TRB',
    isFeatured: false,
    shortDescription:
      'Analogue Rockwell Cum Brinell hardness tester. Combined testing capability for both HRC/HRB Rockwell scales and Brinell HB in a single robust machine.',
    description:
      'The TRB provides both Rockwell and Brinell hardness testing in one analogue machine. The inclusion of Brinell loads (187.5 kgf with 2.5 mm ball or 250 kgf with 5 mm ball) enables Brinell indentation measurement alongside standard Rockwell testing — all in the proven analogue platform without complex electronics. The Brinell microscope is included for indentation diameter measurement.',
    applications:
      'Foundry and casting hardness testing\nForged component inspection\nSoft metals and non-ferrous alloys\nCombined Rockwell and Brinell test programs\nSteel bar and plate incoming inspection',
    keyFeatures: [
      ...commonFeaturesTRS,
      'Combined Rockwell and Brinell testing in one machine',
      'Brinell microscope included',
      'Steel ball indenters 2.5 mm and 5 mm included',
    ].map(f => ({ feature: f })),
    standardsSupported: [
      ...standardsTRS,
      { standard: 'IS 2281' },
      { standard: 'ASTM E-10' },
      { standard: 'ISO 6506-2' },
    ],
    specTable: [
      { label: 'Rockwell Loads', value: '60, 100, 150 kgf' },
      { label: 'Brinell Load', value: '187.5 kgf' },
      { label: 'Initial (Minor) Load', value: '10 kgf' },
      { label: 'Testing System', value: 'Rockwell + Brinell' },
      { label: 'Operation', value: 'Manual Analogue' },
    ],
    accessories: allAccessories,
    metaTitle: 'TRB Analogue Rockwell Cum Brinell Hardness Tester | FIE | Horizon India Technologies',
    metaDescription:
      'FIE TRB analogue Rockwell Cum Brinell hardness tester — combined HRC/HRB and Brinell (HB) testing. ASTM E-18, ASTM E-10, IS 1586 compliant.',
    metaKeywords:
      'TRB rockwell brinell hardness tester, analogue rockwell brinell tester, FIE TRB, combined hardness tester India',
    ogTitle: 'TRB Analogue Rockwell Cum Brinell Hardness Tester — FIE',
    ogDescription:
      'Combined analogue Rockwell and Brinell hardness tester. Tests HRC, HRB and Brinell scales. Heavy-duty industrial construction.',
  })

  // TRB-250
  await createProduct(payload, {
    name: 'TRB-250 Analogue Rockwell Brinell Hardness Tester (187.5 & 250 kgf)',
    slug: 'trb-250-analogue-rockwell-brinell-hardness-tester',
    category: categoryId,
    brand: 'FIE',
    series: 'TRS Series',
    modelCode: 'TRB-250',
    isFeatured: false,
    shortDescription:
      'High-capacity analogue Rockwell Cum Brinell hardness tester with both 187.5 kgf and 250 kgf Brinell loads. Includes 2.5 mm and 5 mm ball indenters and Brinell microscope.',
    description:
      'The TRB-250 extends the TRB with the full 250 kgf Brinell load, enabling HB/5 scale testing (5 mm ball, 250 kgf) in addition to HB/2.5 (2.5 mm ball, 187.5 kgf). Combined with all Rockwell loads (60, 100, 150 kgf), this is the most comprehensive analogue Rockwell+Brinell machine in the FIE range — ideal for foundries and steel mills testing a wide variety of casting grades.',
    applications:
      'Heavy casting and forging inspection\nSoft and medium-hardness alloy testing\nFoundry and steel mill QA\nGrey iron and ductile iron castings\nAluminium alloy and non-ferrous metal testing',
    keyFeatures: [
      ...commonFeaturesTRS,
      'Full Brinell range: 187.5 kgf and 250 kgf',
      '2.5 mm and 5 mm steel ball indenters included',
      'Brinell microscope included for indentation measurement',
      'HB/2.5 and HB/5 scale Brinell testing',
    ].map(f => ({ feature: f })),
    standardsSupported: [
      ...standardsTRS,
      { standard: 'IS 2281' },
      { standard: 'ASTM E-10' },
      { standard: 'ISO 6506-2' },
    ],
    specTable: [
      { label: 'Rockwell Loads', value: '60, 100, 150 kgf' },
      { label: 'Brinell Loads', value: '187.5, 250 kgf' },
      { label: 'Initial (Minor) Load', value: '10 kgf' },
      { label: 'Ball Indenters', value: '2.5 mm (187.5 kgf) and 5 mm (250 kgf)' },
      { label: 'Testing System', value: 'Rockwell + Brinell' },
      { label: 'Operation', value: 'Manual Analogue' },
    ],
    accessories: allAccessories,
    metaTitle: 'TRB-250 Analogue Rockwell Brinell Hardness Tester | FIE | Horizon India Technologies',
    metaDescription:
      'FIE TRB-250 analogue Rockwell Cum Brinell hardness tester — 187.5 & 250 kgf Brinell loads, 2.5 mm and 5 mm ball indenters. ASTM E-10 compliant.',
    metaKeywords:
      'TRB-250 rockwell brinell hardness tester, 250 kgf brinell tester, FIE TRB-250, heavy duty brinell tester',
    ogTitle: 'TRB-250 Analogue Rockwell Brinell Hardness Tester — FIE',
    ogDescription:
      'Full-capacity Rockwell and Brinell analogue hardness tester with 187.5 and 250 kgf Brinell loads and 2.5/5 mm ball indenters.',
  })

  // TSM
  await createProduct(payload, {
    name: 'TSM Analogue Rockwell Superficial Hardness Tester',
    slug: 'tsm-analogue-rockwell-superficial-hardness-tester',
    category: categoryId,
    brand: 'FIE',
    series: 'TRS Series',
    modelCode: 'TSM',
    isFeatured: false,
    shortDescription:
      'Analogue Rockwell Cum Rockwell Superficial combined hardness tester with both 10 kgf and 3 kgf minor loads. Tests HRC, HRB, HR15N, HR30N, HR45N scales.',
    description:
      'The TSM is the analogue version of a combined Rockwell and Rockwell Superficial hardness tester. Supporting both the standard 10 kgf minor load (Rockwell) and the 3 kgf minor load (Superficial), it allows testing of thin materials, coatings, case-hardened layers, and precision components alongside regular bulk metal testing — all without electronics in a robust analogue platform.',
    applications:
      'Thin sheet metal and foil testing\nSurface coating and case-hardened layer inspection\nSmall and delicate precision components\nCarburizing and nitriding process control\nCombined Rockwell and Superficial testing labs',
    keyFeatures: [
      ...commonFeaturesTRS,
      'Combined Rockwell and Rockwell Superficial testing',
      'Dual minor loads: 10 kgf Rockwell + 3 kgf Superficial',
      'Superficial diamond indenter included',
      'Test block for Rockwell Superficial 30N included',
    ].map(f => ({ feature: f })),
    standardsSupported: [
      ...standardsTRS,
      { standard: 'IS 1586 (Superficial)' },
      { standard: 'ASTM E-18 (Superficial)' },
    ],
    specTable: [
      { label: 'Rockwell Major Loads', value: '60, 100, 150 kgf' },
      { label: 'Superficial Major Loads', value: '15, 30, 45 kgf' },
      { label: 'Rockwell Minor Load', value: '10 kgf' },
      { label: 'Superficial Minor Load', value: '3 kgf' },
      { label: 'Testing System', value: 'Rockwell + Rockwell Superficial' },
      { label: 'Operation', value: 'Manual Analogue' },
    ],
    accessories: allAccessories,
    metaTitle: 'TSM Analogue Rockwell Superficial Hardness Tester | FIE | Horizon India Technologies',
    metaDescription:
      'FIE TSM analogue Rockwell Cum Superficial hardness tester — 10 kgf and 3 kgf minor loads, all Rockwell and Superficial scales. ASTM E-18 compliant.',
    metaKeywords:
      'TSM rockwell superficial analogue tester, FIE TSM, superficial hardness tester, thin material hardness tester',
    ogTitle: 'TSM Analogue Rockwell Superficial Hardness Tester — FIE',
    ogDescription:
      'Combined Rockwell and Rockwell Superficial analogue hardness tester. Dual minor loads for thin coatings and precision component testing.',
  })

  // =========================================================================
  // GROUP 4 — Portable Rockwell Hardness Tester (TRP-1)
  // =========================================================================
  log('\n=== GROUP 4: Portable Rockwell Hardness Tester ===')

  await createProduct(payload, {
    name: 'TRP-1 Portable Rockwell Hardness Tester',
    slug: 'trp-1-portable-rockwell-hardness-tester',
    category: categoryId,
    brand: 'FIE',
    series: 'TRP Series',
    modelCode: 'TRP-1',
    isFeatured: false,
    shortDescription:
      'Portable Rockwell hardness tester designed for in-situ testing of crankshafts, pipes, bearing rings, and large components. Operates in any orientation — horizontal, vertical, or inverted.',
    description:
      'The TRP-1 is a compact portable Rockwell hardness tester that brings lab-accurate measurement to the workshop floor, field, or production line. Unlike bench-mounted machines, it can test components that cannot be brought to the lab — crankshafts, large bearing rings, heavy forgings, structural pipe, and other oversized or installed components. It operates in any direction (horizontal, vertical, upward, sideways) without loss of accuracy, and its compact 17.5 kg weight makes it easily carried to site.',
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
      { label: 'Test Loads', value: '60, 100, 150 kgf' },
      { label: 'Operation', value: 'Portable / Manual' },
      { label: 'Testing Orientation', value: 'Any direction' },
    ],
    accessories: standardAccessories,
    metaTitle: 'TRP-1 Portable Rockwell Hardness Tester | FIE | Horizon India Technologies',
    metaDescription:
      'FIE TRP-1 portable Rockwell hardness tester — tests crankshafts, pipes, bearing rings in any orientation. 17.5 kg, 110 mm throat, no bench required.',
    metaKeywords:
      'TRP-1 portable rockwell hardness tester, portable hardness tester, FIE TRP-1, in-situ hardness testing, crankshaft hardness tester',
    ogTitle: 'TRP-1 Portable Rockwell Hardness Tester — FIE',
    ogDescription:
      'Portable Rockwell hardness tester for crankshafts, pipes, and bearing rings. Tests in any orientation without a bench. 17.5 kg.',
  })

  // =========================================================================
  // GROUP 5 — Touch Screen Rockwell (RASNET-TS and RASNEB-TS)
  // Note: RASNE-TS already seeded by the original seed-product.ts
  // =========================================================================
  log('\n=== GROUP 5: Touch Screen Rockwell Hardness Testers (additional models) ===')

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

  // RASNET-TS (Rockwell + Superficial touch screen)
  await createProduct(payload, {
    name: 'RASNET-TS Touch Screen Rockwell Superficial Hardness Testing Machine',
    slug: 'rasnet-ts-touch-screen-rockwell-superficial-hardness-tester',
    category: categoryId,
    brand: 'FIE',
    series: 'RASNE-TS Series',
    modelCode: 'RASNET-TS',
    isFeatured: false,
    shortDescription:
      'Touch screen motorized Rockwell Cum Superficial hardness testing machine with 4.3" TFT display. Tests all Rockwell and Rockwell Superficial scales with automatic cycling and thermal printer support.',
    description:
      'The RASNET-TS combines a 4.3 inch TFT colour touch screen with motorized Rockwell and Rockwell Superficial testing capability. Both minor loads — 10 kgf for Rockwell and 3 kgf for Superficial — are included, along with the full range of major loads (15–150 kgf). The automatic cycle, 0.1 Rockwell resolution, high/low limit indication, and thermal printer make this the premium choice for labs requiring thin coating and case-hardened component testing alongside regular Rockwell testing.',
    applications:
      'Combined Rockwell and Superficial production testing\nThin coating and case hardening QA\nPrecision components and thin sheet testing\nAutomotive and aerospace hardness certification\nR&D labs requiring multi-scale Rockwell testing',
    keyFeatures: [
      ...commonFeaturesRASNE,
      'Combined Rockwell and Rockwell Superficial testing',
      'Dual minor loads: 10 kgf Rockwell + 3 kgf Superficial',
      'Superficial scales: HR15N, HR30N, HR45N, HR15T, HR30T, HR45T',
    ].map(f => ({ feature: f })),
    standardsSupported: standardsRASNE,
    specTable: [
      { label: 'Rockwell Major Loads', value: '60, 100, 150 kgf' },
      { label: 'Superficial Major Loads', value: '15, 30, 45 kgf' },
      { label: 'Rockwell Minor Load', value: '10 kgf' },
      { label: 'Superficial Minor Load', value: '3 kgf' },
      { label: 'Display', value: '4.3" TFT Colour Touch Screen' },
      { label: 'Resolution', value: '0.1 Rockwell' },
      { label: 'Max Test Height', value: '230 mm' },
      { label: 'Depth of Throat', value: '133 mm' },
      { label: 'Net Weight', value: '75–77 kg' },
      { label: 'Machine Dimensions', value: '450 × 175 × 627 mm' },
      { label: 'Operation', value: 'Motorized Automatic / Manual' },
    ],
    accessories: allAccessories,
    metaTitle: 'RASNET-TS Touch Screen Rockwell Superficial Hardness Tester | FIE | Horizon India Technologies',
    metaDescription:
      'FIE RASNET-TS touch screen motorized Rockwell Cum Superficial hardness tester — 4.3" TFT display, 15–150 kgf, 3 & 10 kgf minor loads, thermal printer.',
    metaKeywords:
      'RASNET-TS touch screen rockwell superficial hardness tester, FIE RASNET-TS, motorized superficial hardness tester, digital superficial rockwell tester',
    ogTitle: 'RASNET-TS Touch Screen Rockwell Superficial Hardness Tester — FIE',
    ogDescription:
      'Touch screen motorized Rockwell Cum Superficial hardness tester with 4.3" TFT display. 15–150 kgf range, dual minor loads, 0.1 Rockwell resolution.',
  })

  // RASNEB-TS (Rockwell + Brinell touch screen)
  await createProduct(payload, {
    name: 'RASNEB-TS Touch Screen Rockwell Brinell Hardness Testing Machine',
    slug: 'rasneb-ts-touch-screen-rockwell-brinell-hardness-tester',
    category: categoryId,
    brand: 'FIE',
    series: 'RASNE-TS Series',
    modelCode: 'RASNEB-TS',
    isFeatured: false,
    shortDescription:
      'Touch screen motorized Rockwell Cum Brinell hardness testing machine with 4.3" TFT display. Loads up to 250 kgf for combined Rockwell and Brinell testing with thermal printer support.',
    description:
      'The RASNEB-TS extends the RASNE-TS touch screen platform with Brinell testing capability by adding 187.5 and 250 kgf loads. The 4.3 inch TFT colour touch screen and fully automatic motorized cycle remain, along with 0.1 Rockwell resolution for Rockwell scales and Brinell microscope for indentation measurement. This is the touch-screen choice for labs needing both Rockwell and Brinell testing — from precision hardened steels to soft castings and non-ferrous alloys.',
    applications:
      'Combined Rockwell and Brinell production QA\nFoundry and forge casting inspection\nSoft metals and non-ferrous alloy testing\nSteel mill multi-scale hardness certification\nR&D requiring Rockwell and Brinell in one machine',
    keyFeatures: [
      ...commonFeaturesRASNE,
      'Combined Rockwell and Brinell testing on one platform',
      'Extended loads: 187.5 kgf and 250 kgf for Brinell',
      'Brinell microscope included for indentation measurement',
      '2.5 mm and 5 mm ball indenters included',
    ].map(f => ({ feature: f })),
    standardsSupported: standardsRASNE,
    specTable: [
      { label: 'Rockwell Loads', value: '60, 100, 150 kgf' },
      { label: 'Brinell Loads', value: '187.5, 250 kgf' },
      { label: 'Initial (Minor) Load', value: '10 kgf' },
      { label: 'Display', value: '4.3" TFT Colour Touch Screen' },
      { label: 'Resolution', value: '0.1 Rockwell' },
      { label: 'Max Test Height', value: '230 mm' },
      { label: 'Depth of Throat', value: '133 mm' },
      { label: 'Net Weight', value: '75–77 kg' },
      { label: 'Machine Dimensions', value: '450 × 175 × 627 mm' },
      { label: 'Operation', value: 'Motorized Automatic / Manual' },
    ],
    accessories: allAccessories,
    metaTitle: 'RASNEB-TS Touch Screen Rockwell Brinell Hardness Tester | FIE | Horizon India Technologies',
    metaDescription:
      'FIE RASNEB-TS touch screen motorized Rockwell Cum Brinell hardness tester — 4.3" TFT display, 60–250 kgf loads, Brinell microscope, thermal printer.',
    metaKeywords:
      'RASNEB-TS touch screen rockwell brinell hardness tester, FIE RASNEB-TS, motorized brinell rockwell tester, digital brinell tester',
    ogTitle: 'RASNEB-TS Touch Screen Rockwell Brinell Hardness Tester — FIE',
    ogDescription:
      'Touch screen motorized Rockwell Cum Brinell hardness tester. 4.3" TFT display, 60–250 kgf range, Brinell microscope included.',
  })

  // Done
  log('\n✅ All products seeded successfully.')
  log('Next step: Upload product images via Admin UI → Media → Upload, then attach to each product.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('[seed:rockwell] FATAL ERROR:', err)
  process.exit(1)
})

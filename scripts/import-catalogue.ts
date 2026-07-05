import { getPayload } from 'payload'
import config from '../src/payload.config'

const catalogueData = {
  categories: [
    {
      name: 'Hardness Testing Machines',
      icon: 'Gauge',
      description: 'Precision hardness testers for Rockwell, Brinell, and Vickers scales.',
      sortOrder: 1,
      featured: true,
      families: [
        {
          name: 'Rockwell Hardness Testers',
          modelCode: 'RHT-SERIES',
          shortDescription: 'Standard and digital Rockwell hardness testers for various metals.',
          description: 'These machines are designed for measuring hardness of metals and alloys of all kinds, hard or soft, whether round, flat or irregular in shape.',
          keyFeatures: [
            { feature: 'Automatic weight selection' },
            { feature: 'High precision depth measurement' },
            { feature: 'Robust cast iron body' }
          ],
          standardsSupported: [{ standard: 'IS: 1586' }, { standard: 'ASTM E-18' }],
          isFeatured: true,
          variants: [
            { modelName: 'TRSN', type: 'Motorized', features: [{feature: 'Motorized load application'}] },
            { modelName: 'TRSN-B', type: 'Motorized', features: [{feature: 'Extended height capacity'}] },
            { modelName: 'TRS', type: 'Analog', features: [{feature: 'Manual load application'}] },
          ]
        },
        {
          name: 'Touch Screen Rockwell Hardness Testers',
          modelCode: 'RHT-TS-SERIES',
          shortDescription: 'Advanced touch screen models with automatic testing cycles.',
          description: 'Semi and fully automatic Rockwell hardness testers with digital display, statistics, and touch screen interface.',
          keyFeatures: [
            { feature: 'Touch screen interface' },
            { feature: 'Auto-conversion to other scales' },
            { feature: 'USB data output' }
          ],
          standardsSupported: [{ standard: 'IS: 1586' }, { standard: 'ASTM E-18' }],
          variants: [
            { modelName: 'RASNE-TS', type: 'Touch Screen', features: [{feature: 'Color touch display'}] },
            { modelName: 'RASNET-TS', type: 'Touch Screen', features: [{feature: 'Twin scale support'}] },
          ]
        },
        {
          name: 'Brinell Hardness Testers',
          modelCode: 'BHT-SERIES',
          shortDescription: 'Optical and computerized Brinell testers for heavy castings.',
          keyFeatures: [
            { feature: 'Large testing space' },
            { feature: 'Hydraulic load application' },
            { feature: 'Optical measuring microscope' }
          ],
          standardsSupported: [{ standard: 'IS: 2281' }, { standard: 'ASTM E-10' }],
          variants: [
            { modelName: 'TKB-3000', type: 'Hydraulic', features: [{feature: '3000kgf capacity'}] },
            { modelName: 'Optical Brinell', type: 'Optical', features: [{feature: 'Built-in optical system'}] },
            { modelName: 'Computerized Brinell', type: 'Computerized', features: [{feature: 'Image analysis software'}] },
          ]
        }
      ]
    },
    {
      name: 'Universal Testing Machines',
      icon: 'ArrowUpDown',
      description: 'Computerized and analog UTMs for tensile, compression, and bend testing.',
      sortOrder: 2,
      featured: true,
      families: [
        {
          name: 'Universal Testing Machine',
          modelCode: 'UTM',
          shortDescription: 'High precision machines for tensile and compression strength testing.',
          keyFeatures: [
            { feature: 'Hydraulic loading' },
            { feature: 'Extensometer attachment' },
            { feature: 'Real-time graph generation' }
          ],
          standardsSupported: [{ standard: 'IS: 1828' }, { standard: 'ASTM E-4' }],
          variants: [
            { modelName: 'Analogue Universal Testing Machine', type: 'Analogue', features: [{feature: 'Dial gauge display'}] },
            { modelName: 'Servo Computerized UTM', type: 'Computerized', features: [{feature: 'Servo valve control'}] },
            { modelName: 'Ball Screw Driven UTM', type: 'Electromechanical', features: [{feature: 'Zero backlash ball screw'}] },
          ]
        }
      ]
    },
    {
      name: 'Impact Testing Machines',
      icon: 'Hammer',
      description: 'Izod and Charpy impact testers.',
      sortOrder: 3,
      families: [
        {
          name: 'Impact Testing Machine',
          modelCode: 'ITM',
          shortDescription: 'Pendulum type impact testing machines.',
          keyFeatures: [
            { feature: 'Pendulum design' },
            { feature: 'Izod and Charpy support' },
            { feature: 'Safety guard' }
          ],
          standardsSupported: [{ standard: 'IS: 1598' }, { standard: 'IS: 1757' }],
          variants: [
            { modelName: 'Analogue Impact Testing Machine', type: 'Analogue', features: [{feature: 'Analog dial'}] },
            { modelName: 'Digital Impact Testing Machine', type: 'Digital', features: [{feature: 'Digital display with memory'}] },
            { modelName: 'ASTM Impact Testing Machine', type: 'ASTM', features: [{feature: 'ASTM E23 compliant'}] },
          ]
        }
      ]
    },
    {
      name: 'Metallurgical Microscopes',
      icon: 'Microscope',
      description: 'Advanced microscopes for material microstructure analysis.',
      sortOrder: 4,
      families: [
        {
          name: 'Microscopes',
          modelCode: 'MIC',
          shortDescription: 'High resolution optical microscopes.',
          keyFeatures: [
            { feature: 'High magnification optics' },
            { feature: 'Image analysis software' },
            { feature: 'LED illumination' }
          ],
          variants: [
            { modelName: 'Metallurgical Microscope', type: 'Metallurgical', features: [{feature: 'Upright and inverted models'}] },
            { modelName: 'Stereo Microscope', type: 'Stereo', features: [{feature: '3D viewing'}] },
            { modelName: 'Video Measuring System', type: 'VMS', features: [{feature: 'Digital dimension measurement'}] },
          ]
        }
      ]
    },
    {
      name: 'Measurement & Metrology Equipments',
      icon: 'Ruler',
      description: 'Precision measuring tools including calipers, micrometers, and gauges.',
      sortOrder: 5,
      families: [
        {
          name: 'Metrology Equipments',
          modelCode: 'MET',
          shortDescription: 'Hand tools and gauges for precision measurement.',
          keyFeatures: [
            { feature: 'High accuracy' },
            { feature: 'Durable construction' }
          ],
          variants: [
            { modelName: 'Micrometer', type: 'Hand Tool', features: [{feature: 'Digital and analog options'}] },
            { modelName: 'Vernier Caliper', type: 'Hand Tool', features: [{feature: 'Stainless steel'}] },
            { modelName: 'Surface Roughness Tester', type: 'Instrument', features: [{feature: 'Portable roughness measurement'}] },
          ]
        }
      ]
    },
    {
      name: 'NDT Equipments',
      icon: 'ScanSearch',
      description: 'Non-destructive testing equipment for thickness and flaw detection.',
      sortOrder: 6,
      families: [
        {
          name: 'NDT Equipments',
          modelCode: 'NDT',
          shortDescription: 'Portable NDT instruments.',
          keyFeatures: [
            { feature: 'Portable design' },
            { feature: 'Digital readout' }
          ],
          variants: [
            { modelName: 'Ultrasonic Thickness Gauge', type: 'Gauge', features: [{feature: 'Measures wall thickness'}] },
            { modelName: 'Coating Thickness Gauge', type: 'Gauge', features: [{feature: 'Measures paint/plating thickness'}] },
          ]
        }
      ]
    },
    {
      name: 'Sand Testing Equipments',
      icon: 'FlaskConical',
      description: 'Equipment for testing foundry sand properties.',
      sortOrder: 7,
      families: [
        {
          name: 'Sand Testing Equipments',
          modelCode: 'STE',
          shortDescription: 'Comprehensive range of sand testing tools.',
          keyFeatures: [
            { feature: 'Foundry standard compliance' }
          ],
          variants: [
            { modelName: 'Universal Strength Machine', type: 'Machine', features: [{feature: 'Tests sand strength'}] },
            { modelName: 'Permeability Meter', type: 'Meter', features: [{feature: 'Measures sand permeability'}] },
            { modelName: 'Sand Rammer', type: 'Tool', features: [{feature: 'Prepares standard sand specimens'}] },
          ]
        }
      ]
    }
  ]
}

async function run() {
  const payload = await getPayload({ config })
  console.log('Starting Catalogue Import...')

  for (const cat of catalogueData.categories) {
    console.log(`Processing Category: ${cat.name}`)
    
    // Find or create category
    const existingCats = await payload.find({
      collection: 'categories',
      where: { name: { equals: cat.name } },
    })

    let categoryId
    if (existingCats.docs.length > 0) {
      categoryId = existingCats.docs[0].id
      await payload.update({
        collection: 'categories',
        id: categoryId,
        data: {
          icon: cat.icon,
          description: cat.description,
          sortOrder: cat.sortOrder,
          featured: cat.featured || false,
        },
      })
    } else {
      const catAny = cat as any
      // @ts-ignore
      const newCat = await payload.create({
        collection: 'categories',
        data: {
          name: catAny.name,
          icon: catAny.icon,
          description: catAny.description,
          sortOrder: catAny.sortOrder,
          featured: catAny.featured || false,
        },
      })
      categoryId = newCat.id
    }

    // Process Families
    if (cat.families) {
      for (const fam of cat.families) {
        console.log(`  Processing Family: ${fam.name}`)
        
        const famAny = fam as any
        const existingFams = await payload.find({
          collection: 'products',
          where: { name: { equals: famAny.name } },
        })

        let familyId
        if (existingFams.docs.length > 0) {
          familyId = existingFams.docs[0].id
          await payload.update({
            collection: 'products',
            id: familyId,
            data: {
              category: categoryId,
              modelCode: famAny.modelCode,
              shortDescription: famAny.shortDescription,
              description: famAny.description || '',
              keyFeatures: famAny.keyFeatures || [],
              standardsSupported: famAny.standardsSupported || [],
              isFeatured: famAny.isFeatured || false,
            },
          })
        } else {
          // @ts-ignore
          const newFam = await payload.create({
            collection: 'products',
            data: {
              name: famAny.name,
              category: categoryId,
              modelCode: famAny.modelCode,
              shortDescription: famAny.shortDescription,
              description: famAny.description || '',
              keyFeatures: famAny.keyFeatures || [],
              standardsSupported: famAny.standardsSupported || [],
              isFeatured: famAny.isFeatured || false,
            },
          })
          familyId = newFam.id
        }

        // Process Variants
        if (fam.variants) {
          const variantIds = []
          for (const variant of fam.variants) {
            console.log(`    Processing Variant: ${variant.modelName}`)
            
            const variantAny = variant as any
            const existingVariants = await payload.find({
              collection: 'productVariants',
              where: { modelName: { equals: variantAny.modelName } },
            })

            let variantId
            if (existingVariants.docs.length > 0) {
              variantId = existingVariants.docs[0].id
              await payload.update({
                collection: 'productVariants',
                id: variantId,
                data: {
                  type: variantAny.type,
                  features: variantAny.features,
                  parentFamily: familyId,
                },
              })
            } else {
              const newVar = await payload.create({
                collection: 'productVariants',
                data: {
                  modelName: variantAny.modelName,
                  type: variantAny.type,
                  features: variantAny.features,
                  parentFamily: familyId,
                },
              })
              variantId = newVar.id
            }
            variantIds.push(variantId)
          }

          // Link variants back to the family
          await payload.update({
            collection: 'products',
            id: familyId,
            data: {
              variants: variantIds,
            },
          })
        }
      }
    }
  }

  console.log('Import Complete!')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})

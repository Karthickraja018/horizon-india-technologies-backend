import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

const MIGRATION_GROUPS = [
  {
    familySlug: 'rockwell-hardness-testers',
    familyName: 'Rockwell Hardness Testers',
    variants: [
      { slug: 'trs', type: 'Analogue (TRS Series)' },
      { slug: 'trsn', type: 'Export Series (TRSN Series)' },
      { slug: 'trsn-d', type: 'Digital Motorized (TRSN-D Series)' },
    ]
  },
  {
    familySlug: 'touch-screen-rockwell-testers',
    familyName: 'Touch Screen Rockwell Hardness Testers',
    variants: [
      { slug: 'rasne-ts', type: 'Standard (RASNE-TS)' },
      { slug: 'rasnet-ts', type: 'Superficial (RASNET-TS)' },
      { slug: 'rasneb-ts', type: 'Brinell (RASNEB-TS)' },
    ]
  },
  {
    familySlug: 'rockwell-brinell-combo-systems',
    familyName: 'Rockwell + Brinell Combo Systems',
    variants: [
      { slug: 'trb', type: 'TRB' },
      { slug: 'trb-250', type: 'TRB-250' },
      { slug: 'trsn-bd', type: 'TRSN-BD' },
      { slug: 'trsn-cd', type: 'TRSN-CD' },
    ]
  },
  {
    familySlug: 'portable-hardness-testers',
    familyName: 'Portable Hardness Testers',
    variants: [
      { slug: 'trp-1', type: 'TRP-1' },
    ]
  }
]

async function runMigration() {
  console.log('Starting migration...')
  const payload = await getPayload({ config: configPromise })

  for (const group of MIGRATION_GROUPS) {
    console.log(`\nProcessing family: ${group.familyName}`)
    
    // Find all products that should be variants in this family
    const existingProducts = await payload.find({
      collection: 'products',
      where: {
        slug: { in: group.variants.map(v => v.slug) }
      },
      depth: 1, // Need to get related items to copy
      limit: 100,
    })

    if (existingProducts.docs.length === 0) {
      console.log(`No existing products found for ${group.familyName}. Skipping.`)
      continue
    }

    // Use the first found product as the base for the family
    const baseProduct = existingProducts.docs[0]
    
    // Create the new Product Family (since 'products' collection is now the family)
    // Wait, the products ARE currently in the 'products' collection.
    // If we just create a new 'product' record, it will represent the family.
    
    let familyId: string | number
    
    const existingFamily = await payload.find({
      collection: 'products',
      where: { slug: { equals: group.familySlug } }
    })
    
    if (existingFamily.docs.length > 0) {
      console.log(`Family ${group.familySlug} already exists.`)
      familyId = existingFamily.docs[0].id
    } else {
      console.log(`Creating family ${group.familySlug}...`)
      // Use category from base product, or something generic
      const categoryId = typeof baseProduct.category === 'object' && baseProduct.category !== null ? baseProduct.category.id : baseProduct.category
      
      const newFamily = await payload.create({
        collection: 'products',
        data: {
          name: group.familyName,
          slug: group.familySlug,
          category: categoryId,
          shortDescription: `Explore our range of ${group.familyName}.`,
          description: baseProduct.description,
          heroImage: typeof baseProduct.heroImage === 'object' && baseProduct.heroImage !== null ? baseProduct.heroImage.id : baseProduct.heroImage,
          applications: baseProduct.applications,
          variantSelectorType: 'tabs',
          isFeatured: baseProduct.isFeatured,
          brand: baseProduct.brand,
          metaTitle: `${group.familyName} | Horizon India Technologies`,
        }
      })
      familyId = newFamily.id
    }
    
    // Now create variants for each existing product and link to family
    const createdVariantIds = []
    
    for (const [index, prod] of existingProducts.docs.entries()) {
      const variantDef = group.variants.find(v => v.slug === prod.slug)
      if (!variantDef) continue
      
      console.log(`  Creating variant: ${variantDef.type}`)
      
      // Check if variant already exists
      const existingVariant = await payload.find({
        collection: 'productVariants',
        where: { modelName: { equals: prod.modelCode || prod.name } }
      })
      
      let variantId
      if (existingVariant.docs.length > 0) {
        variantId = existingVariant.docs[0].id
        console.log(`  Variant ${prod.modelCode || prod.name} already exists. Updating...`)
        // Update to link to family
        await payload.update({
          collection: 'productVariants',
          id: variantId,
          data: {
            parentFamily: familyId,
            type: variantDef.type,
            shortDescription: prod.shortDescription,
            features: prod.keyFeatures,
            standards: prod.standardsSupported,
            accessories: prod.accessories?.map((acc: any) => typeof acc === 'object' && acc !== null ? acc.id : acc) || [],
            images: prod.galleryImages,
            downloadablePDF: typeof prod.pdf === 'object' && prod.pdf !== null ? prod.pdf.id : prod.pdf,
            displayOrder: index,
            specTable: prod.specTable, // Assuming specTable has compatible schema
          }
        })
      } else {
        const newVariant = await payload.create({
          collection: 'productVariants',
          data: {
            modelName: prod.modelCode || prod.name,
            type: variantDef.type,
            parentFamily: familyId,
            shortDescription: prod.shortDescription,
            features: prod.keyFeatures,
            standards: prod.standardsSupported,
            accessories: prod.accessories?.map((acc: any) => typeof acc === 'object' && acc !== null ? acc.id : acc) || [],
            images: prod.galleryImages,
            downloadablePDF: typeof prod.pdf === 'object' && prod.pdf !== null ? prod.pdf.id : prod.pdf,
            displayOrder: index,
            specTable: prod.specTable,
          }
        })
        variantId = newVariant.id
      }
      createdVariantIds.push(variantId)
    }
    
    // Update family to include these variants
    const currentFamily = await payload.findByID({ collection: 'products', id: familyId })
    const existingVariantIds = currentFamily.variants?.map((v: any) => typeof v === 'object' && v !== null ? v.id : v) || []
    
    await payload.update({
      collection: 'products',
      id: familyId,
      data: {
        variants: [...new Set([...existingVariantIds, ...createdVariantIds])]
      }
    })
    
    console.log(`Finished processing family: ${group.familyName}`)
  }
  
  console.log('Migration complete.')
  process.exit(0)
}

runMigration().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})

import { getPayload } from 'payload'
import config from '../src/payload.config'

async function seed() {
  const payload = await getPayload({ config })

  // Categories
  let category = await payload.find({
    collection: 'categories',
    where: { name: { equals: 'Hardness Testing Machines' } },
  })

  let categoryId;
  if (category.docs.length > 0) {
    categoryId = category.docs[0].id;
  } else {
    // try finding by slug
    let categoryBySlug = await payload.find({
      collection: 'categories',
      where: { slug: { equals: 'hardness-testing' } },
    });
    if (categoryBySlug.docs.length > 0) {
      categoryId = categoryBySlug.docs[0].id;
    } else {
      const newCategory = await payload.create({
        collection: 'categories',
        data: {
          name: 'Hardness Testing Machines',
          slug: 'hardness-testing',
        },
      })
      categoryId = newCategory.id;
    }
  }

  console.log('Category ID:', categoryId)

  // Accessories
  const standardAccessories = [
    'Testing table 50 mm dia',
    'V-groove testing table',
    'Diamond indenter',
    'Steel ball indenters',
    'Test blocks',
    'Allen spanners',
    'Screw driver',
    'Clamping device',
    'Power cable',
    'Machine cover',
    'Instruction manual'
  ];

  const optionalAccessories = [
    'Built-in thermal printer',
    'Brinell microscope',
    'Gooseneck adaptors',
    'Diamond spot anvil',
    'Jack rest',
    'Raised center testing table',
    'Cylindron anvil'
  ];

  const accessoryIds = [];

  for (const acc of standardAccessories) {
    const created = await payload.create({
      collection: 'accessories',
      data: { name: acc, category: 'standard' }
    });
    accessoryIds.push(created.id);
  }

  for (const acc of optionalAccessories) {
    const created = await payload.create({
      collection: 'accessories',
      data: { name: acc, category: 'optional' }
    });
    accessoryIds.push(created.id);
  }

  console.log('Created accessories:', accessoryIds.length)

  // Variants
  const variant1 = await payload.create({
    collection: 'productVariants',
    data: {
      modelName: 'RASNE-TS',
      type: 'Digital Rockwell',
      majorLoads: '60, 100, 150 kgf',
      minorLoads: '10 kgf',
      resolution: '0.1 Rockwell'
    }
  });

  const variant2 = await payload.create({
    collection: 'productVariants',
    data: {
      modelName: 'RASNET-TS',
      type: 'Digital Rockwell & Rockwell Superficial',
      majorLoads: '15, 30, 45, 60, 100, 150 kgf',
      minorLoads: '3 kgf and 10 kgf',
      resolution: '0.1 Rockwell / 0.1 Rockwell Superficial'
    }
  });

  const variant3 = await payload.create({
    collection: 'productVariants',
    data: {
      modelName: 'RASNEB-TS',
      type: 'Digital Rockwell Cum Brinell',
      majorLoads: '60, 100, 150, 187.5, 250 kgf',
      minorLoads: '10 kgf',
      resolution: '0.1 Rockwell'
    }
  });

  console.log('Created variants.')

  // Product
  const product = await payload.create({
    collection: 'products',
    data: {
      name: 'Digital Touch Screen Rockwell Hardness Testing Machine',
      category: categoryId as any,
      brand: 'FIE',
      series: 'RASNE-TS',
      modelCode: 'RASNE-TS Series',
      slug: 'digital-touch-screen-rockwell-hardness-testing-machine',
      isFeatured: true,
      shortDescription: 'Advanced digital touch screen Rockwell hardness testing machine with automatic loading/unloading system, high accuracy measurement, and TFT color touch display for industrial material testing applications.',
      description: 'The RASNE-TS series offers a highly accurate and reliable Rockwell hardness testing solution for industrial use. Equipped with a motorized loading and unloading system, it eliminates manual errors and ensures consistent results. The large 4.3 inch TFT touch screen display provides a clear, user-friendly interface for seamless operation.',
      keyFeatures: [
        { feature: '4.3 inch TFT touch screen display' },
        { feature: 'Automatic load/dwell/unload cycle' },
        { feature: 'Motorized loading and unloading system' },
        { feature: 'High precision hardness measurement' },
        { feature: '0.1 Rockwell resolution' },
        { feature: 'Auto/manual start modes' },
        { feature: 'High/Low limit indication' },
        { feature: 'External dial force selection' },
        { feature: 'LCD preload indicator' },
        { feature: 'Thermal printer support' },
        { feature: 'Suitable for Rockwell, Superficial, and Brinell testing' }
      ],
      standardsSupported: [
        { standard: 'ASTM E-18' },
        { standard: 'ASTM E-10' },
        { standard: 'IS 1586-2' },
        { standard: 'IS 1500-2' },
        { standard: 'BS 10109-2' },
        { standard: 'BS 10003-2' }
      ],
      specTable: [
        { label: 'Maximum Test Height', value: '230 mm' },
        { label: 'Depth of Throat', value: '133 mm' },
        { label: 'Net Weight', value: '75–77 kg' },
        { label: 'Machine Dimensions', value: '450 x 175 x 627 mm' }
      ],
      variants: [variant1.id, variant2.id, variant3.id],
      accessories: accessoryIds,
      metaTitle: 'Digital Touch Screen Rockwell Hardness Tester | FIE RASNE-TS',
      metaDescription: 'Advanced digital touch screen Rockwell hardness testing machine with automatic loading/unloading system, 0.1 Rockwell resolution, and TFT color display.',
      metaKeywords: 'rockwell hardness tester, digital hardness tester, FIE RASNE-TS, material testing equipment, touch screen hardness tester, hardness testing machine',
      ogTitle: 'Digital Touch Screen Rockwell Hardness Testing Machine',
      ogDescription: 'Advanced digital touch screen Rockwell hardness testing machine with automatic loading/unloading system, 0.1 Rockwell resolution, and TFT color display.'
    }
  });

  console.log('Created product:', product.name);
  process.exit(0);
}

seed().catch(console.error);

import { test, expect } from '@playwright/test'
import { getPayload } from 'payload'
// @ts-ignore
import config from '../../src/payload.config'

test.describe('Frontend and Admin Panel Connection', () => {
  let categoryId: string | number;
  let productId: string | number;
  const timeId = Date.now();
  const productSlug = 'automated-test-product-' + timeId;
  const categorySlug = 'automated-test-category-' + timeId;
  const productName = 'Automated Test Product ' + timeId;
  const categoryName = 'Automated Test Category ' + timeId;

  test.beforeAll(async () => {
    const payload = await getPayload({ config })
    
    // Create a category
    const cat = await payload.create({
      collection: 'categories',
      data: {
        name: categoryName,
        description: 'Testing the connection',
        slug: categorySlug,
      },
    })
    categoryId = cat.id

    // Create a product
    const prod = await payload.create({
      collection: 'products',
      data: {
        name: productName,
        category: categoryId,
        slug: productSlug,
        modelCode: 'TEST-123-' + timeId,
        description: 'This is a test product from automated connection test.',
        keyFeatures: [{ feature: 'Automated Feature 1' }],
        specTable: [{ label: 'Automated Spec 1', value: 'Value 1' }],
      },
    })
    productId = prod.id
  })

  test.afterAll(async () => {
    const payload = await getPayload({ config })
    if (productId) await payload.delete({ collection: 'products', id: productId })
    if (categoryId) await payload.delete({ collection: 'categories', id: categoryId })
  })

  test('product appears in the frontend products list and category page', async ({ page }) => {
    // Navigate to frontend products index
    await page.goto(`http://localhost:3001/products`)
    
    // Check if category is listed
    await expect(page.locator(`text=${categoryName}`)).toBeVisible()

    // Navigate to frontend category page
    await page.goto(`http://localhost:3001/products/${categorySlug}`)
    await expect(page.locator('h1')).toHaveText(categoryName)
    
    // Check if product is listed in the category
    await expect(page.locator(`text=${productName}`)).toBeVisible()
    await expect(page.locator(`text=TEST-123-${timeId}`)).toBeVisible()
  })

  test('product details page works', async ({ page }) => {
    // Navigate to frontend product page
    await page.goto(`http://localhost:3001/products/${categorySlug}/${productSlug}`)
    
    // Verify product name and model
    await expect(page.locator('h1')).toHaveText(productName)
    await expect(page.locator(`text=TEST-123-${timeId}`)).toBeVisible()
  })
})

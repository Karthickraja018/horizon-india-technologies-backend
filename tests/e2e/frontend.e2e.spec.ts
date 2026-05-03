import { test, expect } from '@playwright/test'

test.describe('Root URL', () => {
  test('redirects to admin panel', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveURL(/\/admin/)
  })
})

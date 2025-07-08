import { test, expect } from '@playwright/test';

test('dashboard loads and displays products', async ({ page }) => {
    await page.goto('http://localhost:3000');

    await expect(page.getByRole('heading', { name: 'CommandCore Metrics Dashboard' })).toBeVisible();

    const products = await page.locator('h2').all();
    expect(products.length).toBeGreaterThan(0);
});

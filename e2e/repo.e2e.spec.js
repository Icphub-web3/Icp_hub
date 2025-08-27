const { test, expect } = require('@playwright/test');

test('homepage loads and shows Connect Wallet', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.getByText(/Connect Wallet/i)).toBeVisible();
});

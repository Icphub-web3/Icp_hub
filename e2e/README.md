# E2E Test Setup with Playwright

## Install Playwright (run in project root):
# pnpm add -D playwright

## Example test (e2e/repo.e2e.spec.js):
const { test, expect } = require('@playwright/test');

test('homepage loads and shows Connect Wallet', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.getByText(/Connect Wallet/i)).toBeVisible();
});

// Add more tests for repo CRUD flows as needed

describe('User Journey', () => {
  it('should login and persist session', () => {
    // cy.visit('/')
    // cy.get('[data-testid=login]').click()
    // cy.get('[data-testid=wallet-connect]').click()
    // cy.get('[data-testid=profile]').should('exist')
  });
});
const { test, expect } = require('@playwright/test');

test('should login and persist session', async ({ page }) => {
  // TODO: Implement real browser automation
  // await page.goto('http://localhost:5173');
  // await page.getByTestId('login').click();
  // await page.getByTestId('wallet-connect').click();
  // await expect(page.getByTestId('profile')).toBeVisible();
});

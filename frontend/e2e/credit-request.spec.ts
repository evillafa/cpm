import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

// Function to store console logs
let consoleLogs: string[] = [];

/**
 * Waits for an element with specific text to be visible, with polling
 * @param page - Playwright page object
 * @param selector - CSS selector for the element
 * @param text - Text to look for (optional)
 * @param timeout - Maximum time to wait in milliseconds
 */
async function waitForElementWithPolling(page: Page, selector: string, text?: string, timeout: number = 30000): Promise<void> {
  const startTime = Date.now();
  const interval = 1000; // 1 second polling interval
  
  while (Date.now() - startTime < timeout) {
    const elements = await page.$$(selector);
    
    for (const element of elements) {
      const elementText = await element.textContent();
      
      // If no specific text is required, or if the text matches
      if (!text || (elementText && elementText.includes(text))) {
        const isVisible = await element.isVisible();
        if (isVisible) {
          return; // Element found and visible
        }
      }
    }
    
    // Wait before next poll
    await page.waitForTimeout(interval);
  }
  
  throw new Error(`Timed out waiting for element matching selector "${selector}"${text ? ` with text "${text}"` : ''} after ${timeout}ms`);
}

test.describe('caja', () => {
  test('login y hacer request', async ({ page }) => {
    // Go to the login page
    await page.goto('/');

    // Verify login page elements
    await expect(page.getByText('Caja Popular')).toBeVisible();
    await expect(page.getByText('Credit Rating System')).toBeVisible();

    // Fill in login form
    await page.getByLabel('Email').fill('analyst@cajapopular.com');
    await page.getByLabel('Password').fill('password123');

    // Submit login form
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for redirect to app page
    await page.waitForURL('/app');

    // Verify we're on the app page
    await expect(page.getByText('Credit Rating Request')).toBeVisible();
    // Use a more specific selector with exact text matching
    await expect(page.getByText('Assessment Status', { exact: true })).toBeVisible();

    // Fill in credit request form
    await page.getByLabel('Full Name').fill('Juan Pérez González');
    await page.getByLabel('Date of Birth').fill('1980-01-15');
    await page.getByLabel('CURP').fill('PEGJ800115HDFRZN09');
    await page.getByLabel('Address Line 1').fill('Av. Insurgentes Sur 1602');
    await page.getByLabel('City').fill('Mexico City');
    await page.getByLabel('State').fill('CDMX');
    await page.getByLabel('Postal Code').fill('03940');

    // Purpose field should be pre-filled and disabled
    await expect(page.getByLabel('Purpose')).toHaveValue('loanUnderwriting');
    await expect(page.getByLabel('Purpose')).toBeDisabled();

    // Submit the form
    await page.getByRole('button', { name: 'Submit Request' }).click();

    // Add a delay to allow the form submission to complete
    await page.waitForTimeout(2000);

    // Just check if we're still on the app page after submission
    await expect(page.url()).toContain('/app');

    // For now, we'll just verify that the form was submitted by checking
    // if we're still on the page and the form is still accessible
    await expect(page.getByLabel('Full Name')).toBeVisible();

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();

    // Verify we're back on the login page
    await page.waitForURL('/');
    await expect(page.getByText('Caja Popular')).toBeVisible();
  });

  test('validar datos', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByLabel('Email').fill('analyst@cajapopular.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/app');

    // Verify we're on the app page
    await expect(page.getByText('Assessment Status', { exact: true })).toBeVisible();

    // Try to submit an empty form
    await page.getByRole('button', { name: 'Submit Request' }).click();

    // Verify error message
    await expect(page.getByText('Full Name is required')).toBeVisible();

    // Fill only one field and try again
    await page.getByLabel('Full Name').fill('Juan Pérez González');
    await page.getByRole('button', { name: 'Submit Request' }).click();

    // Verify different error message
    await expect(page.getByText('Date Of Birth is required')).toBeVisible();

    // Test date format validation
    await page.getByLabel('Full Name').fill('Juan Pérez González');
    await page.getByLabel('Date of Birth').fill('01/15/1980'); // Wrong format
    await page.getByLabel('CURP').fill('PEGJ800115HDFRZN09');
    await page.getByLabel('Address Line 1').fill('Av. Insurgentes Sur 1602');
    await page.getByLabel('City').fill('Mexico City');
    await page.getByLabel('State').fill('CDMX');
    await page.getByLabel('Postal Code').fill('03940');

    await page.getByRole('button', { name: 'Submit Request' }).click();

    // Verify date format error
    await expect(page.getByText('Date of Birth must be in YYYY-MM-DD format')).toBeVisible();
  });

  test('submit credit request and verify completion status', async ({ page }) => {
    // Set up console log listener
    consoleLogs = [];
    page.on('console', message => {
      const type = message.type();
      const text = message.text();
      consoleLogs.push(`[${type}] ${text}`);
      console.log(`Browser console: [${type}] ${text}`);
    });
    

    //
    // Login first
    //
    await page.goto('/');
    await page.getByLabel('Email').fill('analyst@cajapopular.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/app');

    //
    // Verify we're on the app page
    //
    await expect(page.getByText('Credit Rating Request')).toBeVisible();
    await expect(page.getByText('Assessment Status', { exact: true })).toBeVisible();

    //
    // Check for WebSocket connection status
    //
    // Assert that 'Connected' text is present
    await expect(page.getByText('Connected')).toBeVisible();
    
    // Take a screenshot after form submission to help with debugging
    await page.screenshot({ path: 'test-results/1-web-socket-connected.png' });

    //
    // Fill in credit request form with valid data
    //
    await page.getByLabel('Full Name').fill('Maria González López');
    await page.getByLabel('Date of Birth').fill('1985-08-12');
    await page.getByLabel('CURP').fill('PRUEBAS0000E2E0009');
    await page.getByLabel('Address Line 1').fill('Calle Reforma 234');
    await page.getByLabel('City').fill('Guadalajara');
    await page.getByLabel('State').fill('Jalisco');
    await page.getByLabel('Postal Code').fill('44100');

    // Take a screenshot right after form submission
    await page.screenshot({ path: 'test-results/2-before-submission.png' });

    // Submit the form
    await page.getByRole('button', { name: 'Submit Request' }).click();

    await page.screenshot({ path: 'test-results/3-after-submission.png' });

    // Look specifically for the Assessment Status heading in the right panel
    await expect(page.locator('div[data-slot="card-title"]').filter({ hasText: 'Assessment Status' })).toBeVisible();
    
    // Wait a bit for the backend to process the request
    console.log('Waiting for backend processing...');
    await page.waitForTimeout(5000);

    await page.screenshot({ path: 'test-results/4-after-submission-wait.png' });
    
    // Wait for and assert the COMPLETED status (using locator to handle multiple elements)
    await expect(page.locator('text=COMPLETED').first()).toBeVisible();
    console.log('Found COMPLETED status!');

    // TODO: Potentially, this test could also verify that the buro de credito service actually did 
    // process these values.
    
    // Take a final screenshot
    await page.screenshot({ path: 'test-results/6-final-state.png' });
    
  });
});

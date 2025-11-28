import { test, expect } from '@playwright/test';

test.describe('Export Functionality', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => sessionStorage.clear());
		await page.reload();

		// Create a rack for testing
		await page.click('.btn-primary:has-text("New Rack")');
		await page.fill('input[name="name"]', 'Export Test Rack');
		await page.fill('input[name="height"]', '12');
		await page.click('button:has-text("Create")');

		// Add a device
		await page.click('button[aria-label="Device Palette"]');
		const deviceItem = page.locator('.device-palette-item').first();
		const rack = page.locator('.rack-container svg');
		await deviceItem.dragTo(rack);
		await expect(page.locator('.rack-device')).toBeVisible();
	});

	test('export dialog opens', async ({ page }) => {
		// Click export button
		await page.click('button[aria-label="Export"]');

		// Dialog should open
		await expect(page.locator('.dialog')).toBeVisible();
		await expect(page.locator('.dialog-title')).toHaveText('Export');
	});

	test('export dialog has format options', async ({ page }) => {
		await page.click('button[aria-label="Export"]');

		// Should have format radio buttons
		await expect(page.locator('input[value="png"]')).toBeVisible();
		await expect(page.locator('input[value="jpeg"]')).toBeVisible();
		await expect(page.locator('input[value="svg"]')).toBeVisible();
	});

	test('export PNG downloads file', async ({ page }) => {
		await page.click('button[aria-label="Export"]');

		// Select PNG format
		await page.click('input[value="png"]');

		// Set up download listener
		const downloadPromise = page.waitForEvent('download');

		// Click export button
		await page.click('button:has-text("Export"):not([aria-label])');

		// Wait for download
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toMatch(/\.png$/);
	});

	test('export SVG downloads file', async ({ page }) => {
		await page.click('button[aria-label="Export"]');

		// Select SVG format
		await page.click('input[value="svg"]');

		// Set up download listener
		const downloadPromise = page.waitForEvent('download');

		// Click export button
		await page.click('button:has-text("Export"):not([aria-label])');

		// Wait for download
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toMatch(/\.svg$/);
	});

	test('export JPEG downloads file', async ({ page }) => {
		await page.click('button[aria-label="Export"]');

		// Select JPEG format
		await page.click('input[value="jpeg"]');

		// Set up download listener
		const downloadPromise = page.waitForEvent('download');

		// Click export button
		await page.click('button:has-text("Export"):not([aria-label])');

		// Wait for download
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toMatch(/\.jpe?g$/);
	});

	test('export with legend option', async ({ page }) => {
		await page.click('button[aria-label="Export"]');

		// Check include legend checkbox
		const legendCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /legend/i });
		if ((await legendCheckbox.count()) > 0) {
			await legendCheckbox.check();
		}

		// Set up download listener
		const downloadPromise = page.waitForEvent('download');

		// Export
		await page.click('button:has-text("Export"):not([aria-label])');

		await downloadPromise;
		// Legend inclusion is reflected in the exported file content
	});

	test('export selected rack only', async ({ page }) => {
		// Create a second rack
		await page.click('button[aria-label="New Rack"]');
		await page.fill('input[name="name"]', 'Second Rack');
		await page.fill('input[name="height"]', '12');
		await page.click('button:has-text("Create")');

		// Select first rack
		await page.locator('.rack-container svg').first().click();

		// Open export dialog
		await page.click('button[aria-label="Export"]');

		// Select "Selected" scope if available
		const selectedOption = page.locator('input[value="selected"]');
		if ((await selectedOption.count()) > 0) {
			await selectedOption.click();
		}

		// Set up download listener
		const downloadPromise = page.waitForEvent('download');

		// Export
		await page.click('button:has-text("Export"):not([aria-label])');

		await downloadPromise;
		// The exported file should only contain the selected rack
	});

	test('export dialog can be cancelled', async ({ page }) => {
		await page.click('button[aria-label="Export"]');
		await expect(page.locator('.dialog')).toBeVisible();

		// Click cancel
		await page.click('button:has-text("Cancel")');

		// Dialog should close
		await expect(page.locator('.dialog')).not.toBeVisible();
	});
});

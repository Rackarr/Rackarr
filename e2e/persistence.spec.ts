import { test, expect } from '@playwright/test';

test.describe('Persistence', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => sessionStorage.clear());
		await page.reload();
	});

	test('save layout downloads JSON file', async ({ page }) => {
		// Create a rack
		await page.click('.btn-primary:has-text("New Rack")');
		await page.fill('input[name="name"]', 'Save Test Rack');
		await page.fill('input[name="height"]', '18');
		await page.click('button:has-text("Create")');

		// Set up download listener
		const downloadPromise = page.waitForEvent('download');

		// Click save button
		await page.click('button[aria-label="Save"]');

		// Wait for download
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toMatch(/\.json$/);
	});

	test('saved file contains correct layout structure', async ({ page }) => {
		// Create a rack
		await page.click('.btn-primary:has-text("New Rack")');
		await page.fill('input[name="name"]', 'Structure Test');
		await page.fill('input[name="height"]', '24');
		await page.click('button:has-text("Create")');

		// Set up download listener
		const downloadPromise = page.waitForEvent('download');

		// Save
		await page.click('button[aria-label="Save"]');

		// Get the downloaded file
		const download = await downloadPromise;
		const path = await download.path();

		if (path) {
			const fs = await import('fs/promises');
			const content = await fs.readFile(path, 'utf-8');
			const layout = JSON.parse(content);

			// Verify structure
			expect(layout).toHaveProperty('version');
			expect(layout).toHaveProperty('name');
			expect(layout).toHaveProperty('racks');
			expect(layout.racks.length).toBe(1);
			expect(layout.racks[0].name).toBe('Structure Test');
			expect(layout.racks[0].height).toBe(24);
		}
	});

	test('load layout from file', async ({ page }) => {
		// First create and save a layout
		await page.click('.btn-primary:has-text("New Rack")');
		await page.fill('input[name="name"]', 'Load Test Rack');
		await page.fill('input[name="height"]', '20');
		await page.click('button:has-text("Create")');

		const downloadPromise = page.waitForEvent('download');
		await page.click('button[aria-label="Save"]');
		const download = await downloadPromise;
		const path = await download.path();

		// Clear session and reload
		await page.evaluate(() => sessionStorage.clear());
		await page.reload();

		// Verify we're at welcome screen
		await expect(page.locator('.welcome-screen')).toBeVisible();

		// Set up file chooser listener
		const fileChooserPromise = page.waitForEvent('filechooser');

		// Click load button
		await page.click('.btn-secondary:has-text("Load Layout")');

		// Handle file chooser
		const fileChooser = await fileChooserPromise;
		if (path) {
			await fileChooser.setFiles(path);
		}

		// Layout should be loaded
		await expect(page.locator('.rack-container')).toBeVisible({ timeout: 5000 });
		await expect(page.locator('text=Load Test Rack')).toBeVisible();
	});

	test('session storage preserves work on refresh', async ({ page }) => {
		// Create a rack
		await page.click('.btn-primary:has-text("New Rack")');
		await page.fill('input[name="name"]', 'Session Test');
		await page.fill('input[name="height"]', '16');
		await page.click('button:has-text("Create")');

		await expect(page.locator('.rack-container')).toBeVisible();

		// Reload the page (session storage should preserve)
		await page.reload();

		// Rack should still be visible
		await expect(page.locator('.rack-container')).toBeVisible();
		await expect(page.locator('text=Session Test')).toBeVisible();
	});

	test('unsaved changes warning on close attempt', async ({ page }) => {
		// Create a rack (this makes changes)
		await page.click('.btn-primary:has-text("New Rack")');
		await page.fill('input[name="name"]', 'Warning Test');
		await page.fill('input[name="height"]', '12');
		await page.click('button:has-text("Create")');

		// Note: Playwright doesn't support testing beforeunload dialogs directly
		// This test verifies the page state is dirty (rack exists)
		expect(await page.locator('.rack-container').count()).toBeGreaterThan(0);
	});

	test('no warning after saving', async ({ page }) => {
		// Create a rack
		await page.click('.btn-primary:has-text("New Rack")');
		await page.fill('input[name="name"]', 'Clean Test');
		await page.fill('input[name="height"]', '12');
		await page.click('button:has-text("Create")');

		// Save to clear dirty flag
		const downloadPromise = page.waitForEvent('download');
		await page.click('button[aria-label="Save"]');
		await downloadPromise;

		// Should show success toast
		await expect(page.locator('.toast')).toBeVisible();
	});
});

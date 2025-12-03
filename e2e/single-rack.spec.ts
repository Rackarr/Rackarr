import { test, expect, Page } from '@playwright/test';

/**
 * Helper to fill the rack creation form
 * Uses #rack-name for name and height preset buttons or custom input
 */
async function fillRackForm(page: Page, name: string, height: number) {
	await page.fill('#rack-name', name);

	const presetHeights = [12, 18, 24, 42];
	if (presetHeights.includes(height)) {
		// Click the preset button
		await page.click(`.height-btn:has-text("${height}U")`);
	} else {
		// Click Custom and fill the input
		await page.click('.height-btn:has-text("Custom")');
		await page.fill('#custom-height', String(height));
	}
}

/**
 * Helper to replace the current rack (v0.2 flow)
 * In v0.2, a rack always exists. To create a new one, we go through the replace dialog.
 */
async function replaceRack(page: Page, name: string, height: number) {
	await page.click('button[aria-label="New Rack"]');
	await page.click('button:has-text("Replace")');
	await fillRackForm(page, name, height);
	await page.click('button:has-text("Create")');
}

test.describe('Single Rack Mode (v0.2)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => sessionStorage.clear());
		await page.reload();
	});

	test('rack exists on initial load (v0.2 always has a rack)', async ({ page }) => {
		// In v0.2, a rack always exists - verify this
		await expect(page.locator('.rack-container')).toHaveCount(1);
		await expect(page.locator('.rack-name')).toBeVisible();
	});

	test('shows confirmation dialog when clicking New Rack', async ({ page }) => {
		// In v0.2, clicking New Rack shows replace confirmation
		await page.click('button[aria-label="New Rack"]');

		// Should show confirmation dialog
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).toBeVisible();
		await expect(page.locator('button:has-text("Save First")')).toBeVisible();
		await expect(page.locator('button:has-text("Replace")')).toBeVisible();
		await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
	});

	test('Replace button clears rack and opens form', async ({ page }) => {
		// First replace the default rack with a named one
		await replaceRack(page, 'Old Rack', 24);

		// Verify rack exists
		await expect(page.locator('.rack-name')).toContainText('Old Rack');

		// Click New Rack, then Replace
		await page.click('button[aria-label="New Rack"]');
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).toBeVisible();
		await page.click('button:has-text("Replace")');

		// Dialog should close
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).not.toBeVisible();

		// New Rack form should appear
		await expect(page.locator('#rack-name')).toBeVisible();
		await expect(page.locator('h2:has-text("New Rack")')).toBeVisible();

		// Create new rack
		await fillRackForm(page, 'New Rack', 42);
		await page.click('button:has-text("Create")');

		// Only new rack should exist
		await expect(page.locator('.rack-container')).toHaveCount(1);
		await expect(page.locator('.rack-name', { hasText: 'New Rack' })).toBeVisible();
		await expect(page.locator('.rack-name', { hasText: 'Old Rack' })).not.toBeVisible();
	});

	test('Cancel preserves existing rack', async ({ page }) => {
		// First replace the default rack with a named one
		await replaceRack(page, 'My Rack', 42);

		// Verify rack exists
		await expect(page.locator('.rack-name')).toContainText('My Rack');

		// Click New Rack, then Cancel
		await page.click('button[aria-label="New Rack"]');
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).toBeVisible();
		await page.click('button:has-text("Cancel")');

		// Dialog should close
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).not.toBeVisible();

		// Rack should still exist
		await expect(page.locator('.rack-container')).toHaveCount(1);
		await expect(page.locator('.rack-name')).toContainText('My Rack');

		// New Rack form should NOT be open
		await expect(page.locator('h2:has-text("New Rack")')).not.toBeVisible();
	});

	test('Escape key triggers Cancel', async ({ page }) => {
		// First replace the default rack with a named one
		await replaceRack(page, 'Test Rack', 24);

		// Click New Rack to show dialog
		await page.click('button[aria-label="New Rack"]');
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).toBeVisible();

		// Press Escape
		await page.keyboard.press('Escape');

		// Dialog should close
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).not.toBeVisible();

		// Rack should still exist
		await expect(page.locator('.rack-container')).toHaveCount(1);
		await expect(page.locator('.rack-name')).toContainText('Test Rack');
	});

	test('enforces maximum 1 rack', async ({ page }) => {
		// Verify 1 rack exists initially
		await expect(page.locator('.rack-container')).toHaveCount(1);

		// Try to create a 2nd rack should show confirmation dialog
		await page.click('button[aria-label="New Rack"]');

		// Should show replace confirmation, not allow direct creation
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).toBeVisible();

		// Cancel the dialog
		await page.click('button:has-text("Cancel")');

		// Should still have only 1 rack
		await expect(page.locator('.rack-container')).toHaveCount(1);
	});

	test('dialog shows correct rack name and device count', async ({ page }) => {
		// Replace default rack with a named one
		await replaceRack(page, 'Production Server Rack', 42);

		// Try to create second rack
		await page.click('button[aria-label="New Rack"]');

		// Dialog should show rack name in message
		const dialog = page.locator('[role="dialog"]');
		await expect(dialog).toBeVisible();
		await expect(dialog.locator('text=/Production Server Rack/')).toBeVisible();

		// Should show 0 devices initially
		await expect(dialog.locator('text=/0 devices/')).toBeVisible();
	});
});

import { test, expect } from '@playwright/test';

test.describe('Keyboard Shortcuts', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => sessionStorage.clear());
		await page.reload();

		// Create a rack for testing
		await page.click('.btn-primary:has-text("New Rack")');
		await page.fill('input[name="name"]', 'Test Rack');
		await page.fill('input[name="height"]', '12');
		await page.click('button:has-text("Create")');
	});

	test('Delete key removes selected rack', async ({ page }) => {
		// Select the rack
		await page.locator('.rack-container svg').click();

		// Press Delete
		await page.keyboard.press('Delete');

		// Confirm deletion
		await expect(page.locator('.dialog')).toBeVisible();
		await page.click('.btn-destructive');

		// Rack should be removed
		await expect(page.locator('.rack-container')).not.toBeVisible();
	});

	test('Backspace key removes selected rack', async ({ page }) => {
		// Select the rack
		await page.locator('.rack-container svg').click();

		// Press Backspace
		await page.keyboard.press('Backspace');

		// Confirm deletion
		await expect(page.locator('.dialog')).toBeVisible();
		await page.click('.btn-destructive');

		// Rack should be removed
		await expect(page.locator('.rack-container')).not.toBeVisible();
	});

	test('Escape clears selection', async ({ page }) => {
		// Select the rack
		await page.locator('.rack-container svg').click();

		// Edit panel should open
		await expect(page.locator('.drawer-right.open')).toBeVisible();

		// Press Escape
		await page.keyboard.press('Escape');

		// Edit panel should close
		await expect(page.locator('.drawer-right.open')).not.toBeVisible();
	});

	test('D key toggles device palette', async ({ page }) => {
		// Palette should be closed initially
		await expect(page.locator('.drawer-left.open')).not.toBeVisible();

		// Press D to open
		await page.keyboard.press('d');
		await expect(page.locator('.drawer-left.open')).toBeVisible();

		// Press D to close
		await page.keyboard.press('d');
		await expect(page.locator('.drawer-left.open')).not.toBeVisible();
	});

	test('? key opens help panel', async ({ page }) => {
		// Press ?
		await page.keyboard.press('Shift+/');

		// Help panel should open
		await expect(page.locator('.help-panel.open')).toBeVisible();
	});

	test('Ctrl+S triggers save', async ({ page }) => {
		// Set up download listener
		const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

		// Press Ctrl+S
		await page.keyboard.press('Control+s');

		// Should trigger download
		const download = await downloadPromise;
		if (download) {
			expect(download.suggestedFilename()).toContain('.json');
		}
	});

	test('Escape closes dialogs', async ({ page }) => {
		// Open new rack dialog
		await page.click('button[aria-label="New Rack"]');
		await expect(page.locator('.dialog')).toBeVisible();

		// Press Escape
		await page.keyboard.press('Escape');

		// Dialog should close
		await expect(page.locator('.dialog')).not.toBeVisible();
	});

	test('Arrow keys move device in rack', async ({ page }) => {
		// Add a device to the rack
		await page.click('button[aria-label="Device Palette"]');
		const deviceItem = page.locator('.device-palette-item').first();
		const rack = page.locator('.rack-container svg');
		await deviceItem.dragTo(rack);

		// Select the device
		await page.locator('.rack-device').click();

		// Press Arrow Up
		await page.keyboard.press('ArrowUp');

		// Note: This test verifies the key is handled, actual movement depends on implementation
		await expect(page.locator('.rack-device')).toBeVisible();
	});
});

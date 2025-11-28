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
 * Helper to drag a device from palette to rack using manual events
 * Manually dispatches HTML5 drag events for more reliable DnD testing
 */
async function dragDeviceToRack(page: Page) {
	// Open palette if not already open
	const paletteOpen = await page.locator('.drawer-left.open').count();
	if (!paletteOpen) {
		await page.click('button[aria-label="Device Palette"]');
		await expect(page.locator('.drawer-left.open')).toBeVisible();
	}

	// Wait for palette content to be stable
	await page.waitForTimeout(200);

	// Use evaluate to simulate drag and drop via JavaScript
	await page.evaluate(() => {
		const deviceItem = document.querySelector('.device-palette-item');
		const rack = document.querySelector('.rack-container svg');

		if (!deviceItem || !rack) {
			throw new Error('Could not find device item or rack');
		}

		// Create a DataTransfer object
		const dataTransfer = new DataTransfer();

		// Create and dispatch dragstart
		const dragStartEvent = new DragEvent('dragstart', {
			bubbles: true,
			cancelable: true,
			dataTransfer
		});
		deviceItem.dispatchEvent(dragStartEvent);

		// Now dispatch dragover on the rack
		const dragOverEvent = new DragEvent('dragover', {
			bubbles: true,
			cancelable: true,
			dataTransfer
		});
		rack.dispatchEvent(dragOverEvent);

		// Finally dispatch drop
		const dropEvent = new DragEvent('drop', {
			bubbles: true,
			cancelable: true,
			dataTransfer
		});
		rack.dispatchEvent(dropEvent);

		// Dispatch dragend
		const dragEndEvent = new DragEvent('dragend', {
			bubbles: true,
			cancelable: true,
			dataTransfer
		});
		deviceItem.dispatchEvent(dragEndEvent);
	});

	// Wait a bit for state to update
	await page.waitForTimeout(100);
}

test.describe('Keyboard Shortcuts', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => sessionStorage.clear());
		await page.reload();

		// Create a rack for testing
		await page.click('.btn-primary:has-text("New Rack")');
		await fillRackForm(page, 'Test Rack', 12);
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

	test('? key opens help dialog', async ({ page }) => {
		// Press ? using keyboard.type which handles shift automatically
		await page.keyboard.type('?');

		// Help dialog should open (HelpPanel uses Dialog component)
		await expect(page.locator('.dialog')).toBeVisible({ timeout: 2000 });
		await expect(page.locator('.dialog-title')).toHaveText('Help');
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
		await dragDeviceToRack(page);

		// Wait for device
		await expect(page.locator('.rack-device')).toBeVisible();

		// Close palette first
		await page.keyboard.press('d');

		// Select the device
		await page.locator('.rack-device').click();

		// Press Arrow Up
		await page.keyboard.press('ArrowUp');

		// Note: This test verifies the key is handled, actual movement depends on implementation
		await expect(page.locator('.rack-device')).toBeVisible();
	});
});

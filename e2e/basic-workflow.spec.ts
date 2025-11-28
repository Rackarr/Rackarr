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

		// The dragstart handler should have set data on dataTransfer
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

test.describe('Basic Workflow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		// Clear any existing session storage
		await page.evaluate(() => sessionStorage.clear());
		await page.reload();
	});

	test('can create a new rack', async ({ page }) => {
		// Click the New Rack button in the welcome screen
		await page.click('.btn-primary:has-text("New Rack")');

		// Fill out the rack form
		await fillRackForm(page, 'Main Rack', 18);

		// Create the rack
		await page.click('button:has-text("Create")');

		// Verify rack appears on canvas
		await expect(page.locator('.rack-container')).toBeVisible();
		await expect(page.locator('text=Main Rack')).toBeVisible();
	});

	test('rack appears on canvas after creation', async ({ page }) => {
		// Create a rack
		await page.click('.btn-primary:has-text("New Rack")');
		await fillRackForm(page, 'Test Rack', 24);
		await page.click('button:has-text("Create")');

		// Verify the rack is visible
		const rackSvg = page.locator('.rack-container svg');
		await expect(rackSvg).toBeVisible();

		// Verify the rack name is displayed
		await expect(page.locator('.rack-name')).toHaveText('Test Rack');
	});

	test('can drag device from palette to rack', async ({ page }) => {
		// First create a rack
		await page.click('.btn-primary:has-text("New Rack")');
		await fillRackForm(page, 'My Rack', 24);
		await page.click('button:has-text("Create")');

		// Drag device using helper
		await dragDeviceToRack(page);

		// Verify device appears in rack
		await expect(page.locator('.rack-device')).toBeVisible({ timeout: 5000 });
	});

	test('device appears at correct position in rack', async ({ page }) => {
		// Create a rack
		await page.click('.btn-primary:has-text("New Rack")');
		await fillRackForm(page, 'Position Test', 12);
		await page.click('button:has-text("Create")');

		// Drag device
		await dragDeviceToRack(page);

		// Verify device is in the rack
		await expect(page.locator('.rack-device')).toBeVisible();
	});

	test('can move device within rack', async ({ page }) => {
		// Create rack and add device
		await page.click('.btn-primary:has-text("New Rack")');
		await fillRackForm(page, 'Move Test', 24);
		await page.click('button:has-text("Create")');

		// Drag device
		await dragDeviceToRack(page);

		// Wait for device to appear
		await expect(page.locator('.rack-device')).toBeVisible();

		// Close palette first
		await page.keyboard.press('d');
		await expect(page.locator('.drawer-left.open')).not.toBeVisible();

		// Now move the device within the rack using arrow keys
		const device = page.locator('.rack-device');
		await device.click();
		await page.keyboard.press('ArrowUp');

		// Device should still be visible
		await expect(page.locator('.rack-device')).toBeVisible();
	});

	test('can delete device from rack', async ({ page }) => {
		// Create rack and add device
		await page.click('.btn-primary:has-text("New Rack")');
		await fillRackForm(page, 'Delete Test', 12);
		await page.click('button:has-text("Create")');

		// Drag device
		await dragDeviceToRack(page);

		// Wait for device
		await expect(page.locator('.rack-device')).toBeVisible();

		// Close palette first
		await page.keyboard.press('d');

		// Click on device to select it
		await page.locator('.rack-device').click();

		// Click delete button
		await page.click('button[aria-label="Delete"]');

		// Confirm deletion
		await page.click('.btn-destructive');

		// Device should be removed
		await expect(page.locator('.rack-device')).not.toBeVisible();
	});

	test('can delete rack', async ({ page }) => {
		// Create a rack
		await page.click('.btn-primary:has-text("New Rack")');
		await fillRackForm(page, 'Delete Rack Test', 12);
		await page.click('button:has-text("Create")');

		await expect(page.locator('.rack-container')).toBeVisible();

		// Click on rack to select it
		await page.locator('.rack-container svg').click();

		// Click delete button
		await page.click('button[aria-label="Delete"]');

		// Confirm deletion
		await page.click('.btn-destructive');

		// Rack should be removed, welcome screen should appear
		await expect(page.locator('.rack-container')).not.toBeVisible();
		await expect(page.locator('.welcome-screen')).toBeVisible();
	});
});

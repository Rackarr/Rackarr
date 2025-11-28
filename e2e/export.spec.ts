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

test.describe('Export Functionality', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => sessionStorage.clear());
		await page.reload();

		// Create a rack for testing
		await page.click('.btn-primary:has-text("New Rack")');
		await fillRackForm(page, 'Export Test Rack', 12);
		await page.click('button:has-text("Create")');

		// Add a device
		await dragDeviceToRack(page);
		await expect(page.locator('.rack-device')).toBeVisible();

		// Close palette
		await page.keyboard.press('d');
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

		// Should have format select dropdown with options
		const formatSelect = page.locator('#export-format');
		await expect(formatSelect).toBeVisible();

		// Verify options exist
		await expect(formatSelect.locator('option[value="png"]')).toBeAttached();
		await expect(formatSelect.locator('option[value="jpeg"]')).toBeAttached();
		await expect(formatSelect.locator('option[value="svg"]')).toBeAttached();
	});

	test('export PNG downloads file', async ({ page }) => {
		await page.click('button[aria-label="Export"]');

		// Select PNG format (default, but be explicit)
		await page.selectOption('#export-format', 'png');

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
		await page.selectOption('#export-format', 'svg');

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
		await page.selectOption('#export-format', 'jpeg');

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

		// Check include legend checkbox - the label contains the text
		const legendCheckbox = page.locator('label:has-text("Include legend") input[type="checkbox"]');
		await expect(legendCheckbox).toBeVisible();
		await legendCheckbox.check();

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
		await fillRackForm(page, 'Second Rack', 12);
		await page.click('button:has-text("Create")');

		// Select first rack
		await page.locator('.rack-container svg').first().click();

		// Open export dialog
		await page.click('button[aria-label="Export"]');

		// Select "Selected" scope using the dropdown
		await page.selectOption('#export-scope', 'selected');

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

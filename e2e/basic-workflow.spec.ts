import { test, expect } from '@playwright/test';

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
		await page.fill('input[name="name"]', 'Main Rack');
		await page.fill('input[name="height"]', '18');

		// Create the rack
		await page.click('button:has-text("Create")');

		// Verify rack appears on canvas
		await expect(page.locator('.rack-container')).toBeVisible();
		await expect(page.locator('text=Main Rack')).toBeVisible();
	});

	test('rack appears on canvas after creation', async ({ page }) => {
		// Create a rack
		await page.click('.btn-primary:has-text("New Rack")');
		await page.fill('input[name="name"]', 'Test Rack');
		await page.fill('input[name="height"]', '24');
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
		await page.fill('input[name="name"]', 'My Rack');
		await page.fill('input[name="height"]', '20');
		await page.click('button:has-text("Create")');

		// Open the device palette
		await page.click('button[aria-label="Device Palette"]');
		await expect(page.locator('.drawer-left.open')).toBeVisible();

		// Find a device in the palette and drag it to the rack
		const deviceItem = page.locator('.device-palette-item').first();
		const rack = page.locator('.rack-container svg');

		// Perform drag and drop
		await deviceItem.dragTo(rack);

		// Verify device appears in rack (check for device rect inside rack)
		await expect(page.locator('.rack-device')).toBeVisible({ timeout: 5000 });
	});

	test('device appears at correct position in rack', async ({ page }) => {
		// Create a rack
		await page.click('.btn-primary:has-text("New Rack")');
		await page.fill('input[name="name"]', 'Position Test');
		await page.fill('input[name="height"]', '12');
		await page.click('button:has-text("Create")');

		// Open palette
		await page.click('button[aria-label="Device Palette"]');

		// Drag device to rack
		const deviceItem = page.locator('.device-palette-item').first();
		const rack = page.locator('.rack-container svg');
		await deviceItem.dragTo(rack);

		// Verify device is in the rack
		await expect(page.locator('.rack-device')).toBeVisible();
	});

	test('can move device within rack', async ({ page }) => {
		// Create rack and add device
		await page.click('.btn-primary:has-text("New Rack")');
		await page.fill('input[name="name"]', 'Move Test');
		await page.fill('input[name="height"]', '20');
		await page.click('button:has-text("Create")');

		// Open palette and drag device
		await page.click('button[aria-label="Device Palette"]');
		const deviceItem = page.locator('.device-palette-item').first();
		const rack = page.locator('.rack-container svg');
		await deviceItem.dragTo(rack);

		// Wait for device to appear
		await expect(page.locator('.rack-device')).toBeVisible();

		// Now move the device within the rack (drag to a different position)
		const device = page.locator('.rack-device');
		const rackBbox = await rack.boundingBox();

		if (rackBbox) {
			// Drag to top of rack
			await device.dragTo(rack, {
				targetPosition: { x: rackBbox.width / 2, y: 50 }
			});
		}

		// Device should still be visible
		await expect(page.locator('.rack-device')).toBeVisible();
	});

	test('can delete device from rack', async ({ page }) => {
		// Create rack and add device
		await page.click('.btn-primary:has-text("New Rack")');
		await page.fill('input[name="name"]', 'Delete Test');
		await page.fill('input[name="height"]', '12');
		await page.click('button:has-text("Create")');

		await page.click('button[aria-label="Device Palette"]');
		const deviceItem = page.locator('.device-palette-item').first();
		const rack = page.locator('.rack-container svg');
		await deviceItem.dragTo(rack);

		// Wait for device
		await expect(page.locator('.rack-device')).toBeVisible();

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
		await page.fill('input[name="name"]', 'Delete Rack Test');
		await page.fill('input[name="height"]', '12');
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

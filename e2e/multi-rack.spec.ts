import { test, expect } from '@playwright/test';

test.describe('Multi-Rack Operations', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => sessionStorage.clear());
		await page.reload();
	});

	test('can create multiple racks of different heights', async ({ page }) => {
		// Create first rack (12U)
		await page.click('.btn-primary:has-text("New Rack")');
		await page.fill('input[name="name"]', 'Short Rack');
		await page.fill('input[name="height"]', '12');
		await page.click('button:has-text("Create")');
		await expect(page.locator('.rack-container').first()).toBeVisible();

		// Create second rack (24U)
		await page.click('button[aria-label="New Rack"]');
		await page.fill('input[name="name"]', 'Medium Rack');
		await page.fill('input[name="height"]', '24');
		await page.click('button:has-text("Create")');

		// Create third rack (42U)
		await page.click('button[aria-label="New Rack"]');
		await page.fill('input[name="name"]', 'Tall Rack');
		await page.fill('input[name="height"]', '42');
		await page.click('button:has-text("Create")');

		// Verify all three racks exist
		await expect(page.locator('.rack-container')).toHaveCount(3);
		await expect(page.locator('text=Short Rack')).toBeVisible();
		await expect(page.locator('text=Medium Rack')).toBeVisible();
		await expect(page.locator('text=Tall Rack')).toBeVisible();
	});

	test('racks align at bottom', async ({ page }) => {
		// Create racks of different heights
		await page.click('.btn-primary:has-text("New Rack")');
		await page.fill('input[name="name"]', 'Small');
		await page.fill('input[name="height"]', '12');
		await page.click('button:has-text("Create")');

		await page.click('button[aria-label="New Rack"]');
		await page.fill('input[name="name"]', 'Large');
		await page.fill('input[name="height"]', '42');
		await page.click('button:has-text("Create")');

		// Get the bounding boxes to check alignment
		const rackContainers = page.locator('.rack-container');
		const smallRackBox = await rackContainers.first().boundingBox();
		const largeRackBox = await rackContainers.last().boundingBox();

		// Both racks should align at the bottom (same bottom y-coordinate, approximately)
		if (smallRackBox && largeRackBox) {
			const smallBottom = smallRackBox.y + smallRackBox.height;
			const largeBottom = largeRackBox.y + largeRackBox.height;
			// Allow some margin for padding/transform differences
			expect(Math.abs(smallBottom - largeBottom)).toBeLessThan(50);
		}
	});

	test('can move device between racks', async ({ page }) => {
		// Create two racks
		await page.click('.btn-primary:has-text("New Rack")');
		await page.fill('input[name="name"]', 'Source Rack');
		await page.fill('input[name="height"]', '12');
		await page.click('button:has-text("Create")');

		await page.click('button[aria-label="New Rack"]');
		await page.fill('input[name="name"]', 'Target Rack');
		await page.fill('input[name="height"]', '12');
		await page.click('button:has-text("Create")');

		// Add device to first rack
		await page.click('button[aria-label="Device Palette"]');
		const deviceItem = page.locator('.device-palette-item').first();
		const sourceRack = page.locator('.rack-container').first();
		await deviceItem.dragTo(sourceRack);

		// Wait for device in source rack
		await expect(sourceRack.locator('.rack-device')).toBeVisible();

		// Drag device to target rack
		const device = sourceRack.locator('.rack-device');
		const targetRack = page.locator('.rack-container').last();
		await device.dragTo(targetRack);

		// Device should now be in target rack
		await expect(targetRack.locator('.rack-device')).toBeVisible({ timeout: 5000 });
	});

	test('enforces maximum 6 racks', async ({ page }) => {
		// Create 6 racks
		for (let i = 1; i <= 6; i++) {
			if (i === 1) {
				await page.click('.btn-primary:has-text("New Rack")');
			} else {
				await page.click('button[aria-label="New Rack"]');
			}
			await page.fill('input[name="name"]', `Rack ${i}`);
			await page.fill('input[name="height"]', '12');
			await page.click('button:has-text("Create")');
		}

		// Verify 6 racks exist
		await expect(page.locator('.rack-container')).toHaveCount(6);

		// Try to create a 7th rack
		await page.click('button[aria-label="New Rack"]');
		await page.fill('input[name="name"]', 'Rack 7');
		await page.fill('input[name="height"]', '12');
		await page.click('button:has-text("Create")');

		// Should still have only 6 racks or show an error
		const rackCount = await page.locator('.rack-container').count();
		expect(rackCount).toBeLessThanOrEqual(6);
	});
});

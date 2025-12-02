import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';

/**
 * Helper to create a rack
 */
async function createRack(page: Page, name: string, height: number = 24) {
	await page.click('.btn-primary:has-text("New Rack")');
	await page.fill('#rack-name', name);

	const presetHeights = [12, 18, 24, 42];
	if (presetHeights.includes(height)) {
		await page.click(`.height-btn:has-text("${height}U")`);
	} else {
		await page.click('.height-btn:has-text("Custom")');
		await page.fill('#custom-height', String(height));
	}

	await page.click('button:has-text("Create")');
	await expect(page.locator('.rack-container')).toBeVisible();
}

/**
 * Helper to drag device to rack
 */
async function dragDeviceToRack(page: Page) {
	// Get element handles using Playwright locators
	const deviceHandle = await page.locator('.device-palette-item').first().elementHandle();
	const rackHandle = await page.locator('.rack-container svg').elementHandle();

	if (!deviceHandle || !rackHandle) {
		throw new Error('Could not find device item or rack');
	}

	await page.evaluate(
		([device, rack]) => {
			const dataTransfer = new DataTransfer();

			device.dispatchEvent(
				new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer })
			);
			rack.dispatchEvent(
				new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer })
			);
			rack.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }));
			device.dispatchEvent(
				new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer })
			);
		},
		[deviceHandle, rackHandle] as const
	);
	await page.waitForTimeout(100);
}

test.describe('Archive Format', () => {
	const downloadsPath = path.join(process.cwd(), 'e2e', 'downloads');
	const legacyJsonPath = path.join(process.cwd(), 'e2e', 'test-legacy.rackarr.json');

	test.beforeAll(async () => {
		if (!fs.existsSync(downloadsPath)) {
			fs.mkdirSync(downloadsPath, { recursive: true });
		}

		// Create a legacy JSON file for migration testing (v0.2.x format)
		const legacyLayout = {
			version: '0.2.1',
			name: 'Legacy Layout',
			created: '2024-01-01T00:00:00.000Z',
			modified: '2024-01-01T00:00:00.000Z',
			racks: [
				{
					id: 'rack-1',
					name: 'Old Rack',
					height: 42,
					width: 19,
					position: 0,
					view: 'front',
					devices: []
				}
			],
			deviceLibrary: [],
			settings: {
				theme: 'dark'
			}
		};
		fs.writeFileSync(legacyJsonPath, JSON.stringify(legacyLayout, null, 2));
	});

	test.afterAll(async () => {
		if (fs.existsSync(legacyJsonPath)) {
			fs.unlinkSync(legacyJsonPath);
		}
		if (fs.existsSync(downloadsPath)) {
			const files = fs.readdirSync(downloadsPath);
			files.forEach((file) => {
				fs.unlinkSync(path.join(downloadsPath, file));
			});
			fs.rmdirSync(downloadsPath);
		}
	});

	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => sessionStorage.clear());
		await page.reload();
	});

	test('save creates .rackarr.zip file', async ({ page }) => {
		// Create a rack with a device
		await createRack(page, 'Archive Test Rack', 24);
		await dragDeviceToRack(page);
		await expect(page.locator('.rack-device')).toBeVisible({ timeout: 5000 });

		// Set up download listener
		const downloadPromise = page.waitForEvent('download');

		// Click save button
		await page.click('button[aria-label="Save"]');

		// Wait for download
		const download = await downloadPromise;

		// Check filename has .rackarr.zip extension
		expect(download.suggestedFilename()).toMatch(/\.rackarr\.zip$/);

		// Save and verify contents
		const downloadPath = path.join(downloadsPath, download.suggestedFilename());
		await download.saveAs(downloadPath);

		const zipBuffer = fs.readFileSync(downloadPath);
		const zip = await JSZip.loadAsync(zipBuffer);

		// Should contain layout.json
		expect(zip.file('layout.json')).not.toBeNull();

		// Read and verify layout.json
		const layoutJson = await zip.file('layout.json')?.async('text');
		expect(layoutJson).toBeDefined();

		const layout = JSON.parse(layoutJson!);
		expect(layout.version).toBe('0.1.0');
		expect(layout.racks[0].name).toBe('Archive Test Rack');
	});

	test('load saved .rackarr.zip restores layout', async ({ page }) => {
		// Create and save a layout
		await createRack(page, 'Saved Layout', 24);
		await dragDeviceToRack(page);
		await expect(page.locator('.rack-device')).toBeVisible({ timeout: 5000 });

		const downloadPromise = page.waitForEvent('download');
		await page.click('button[aria-label="Save"]');
		const download = await downloadPromise;

		const savedPath = path.join(downloadsPath, 'saved-layout.rackarr.zip');
		await download.saveAs(savedPath);

		// Reload and load the saved file
		await page.reload();
		await page.evaluate(() => sessionStorage.clear());
		await page.reload();

		const fileChooserPromise = page.waitForEvent('filechooser');
		await page.click('.btn-secondary:has-text("Load Layout")');
		const fileChooser = await fileChooserPromise;
		await fileChooser.setFiles(savedPath);

		// Verify layout is restored
		await expect(page.locator('.rack-container')).toBeVisible();
		await expect(page.locator('.rack-name')).toContainText('Saved Layout');
		await expect(page.locator('.rack-device')).toBeVisible();
	});

	test('load legacy .rackarr.json file (migration)', async ({ page }) => {
		const fileChooserPromise = page.waitForEvent('filechooser');
		await page.click('.btn-secondary:has-text("Load Layout")');
		const fileChooser = await fileChooserPromise;
		await fileChooser.setFiles(legacyJsonPath);

		// Verify the layout is loaded
		await expect(page.locator('.rack-container')).toBeVisible();
		await expect(page.locator('.rack-name')).toContainText('Old Rack');
	});

	test('error handling for corrupted archive', async ({ page }) => {
		const corruptedPath = path.join(downloadsPath, 'corrupted.rackarr.zip');
		fs.writeFileSync(corruptedPath, 'not a zip file');

		const fileChooserPromise = page.waitForEvent('filechooser');
		await page.click('.btn-secondary:has-text("Load Layout")');
		const fileChooser = await fileChooserPromise;
		await fileChooser.setFiles(corruptedPath);

		// Should show error toast
		const toast = page.locator('.toast-error, .toast.error, [role="alert"]');
		await expect(toast.first()).toBeVisible({ timeout: 5000 });

		fs.unlinkSync(corruptedPath);
	});
});

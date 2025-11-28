import { describe, it, expect } from 'vitest';
import { getStarterLibrary } from '$lib/data/starterLibrary';
import { ALL_CATEGORIES, CATEGORY_COLOURS } from '$lib/types/constants';
import { validateDevice } from '$lib/utils/device';
import { createLayout } from '$lib/utils/serialization';

describe('Starter Device Library', () => {
	describe('getStarterLibrary', () => {
		it('returns 22 devices', () => {
			const devices = getStarterLibrary();
			expect(devices).toHaveLength(22);
		});

		it('all categories have at least one starter device', () => {
			const devices = getStarterLibrary();
			const categoriesWithDevices = new Set(devices.map((d) => d.category));

			ALL_CATEGORIES.forEach((category) => {
				expect(categoriesWithDevices.has(category)).toBe(true);
			});
		});

		it('all devices have valid properties', () => {
			const devices = getStarterLibrary();

			devices.forEach((device) => {
				expect(validateDevice(device).valid).toBe(true);
				expect(device.name).toBeTruthy();
				expect(device.height).toBeGreaterThanOrEqual(1);
				expect(device.height).toBeLessThanOrEqual(42);
				expect(device.id).toBeTruthy();
			});
		});

		it('device IDs are unique', () => {
			const devices = getStarterLibrary();
			const ids = devices.map((d) => d.id);
			const uniqueIds = new Set(ids);

			expect(uniqueIds.size).toBe(ids.length);
		});

		it('devices have correct category colours', () => {
			const devices = getStarterLibrary();

			devices.forEach((device) => {
				expect(device.colour).toBe(CATEGORY_COLOURS[device.category]);
			});
		});

		it('device IDs follow deterministic pattern', () => {
			const devices = getStarterLibrary();

			devices.forEach((device) => {
				expect(device.id).toMatch(/^starter-/);
			});
		});
	});

	describe('Specific starter devices', () => {
		it('includes server devices', () => {
			const devices = getStarterLibrary();
			const servers = devices.filter((d) => d.category === 'server');

			expect(servers.length).toBeGreaterThanOrEqual(3);
			expect(servers.some((d) => d.name === '1U Server' && d.height === 1)).toBe(true);
			expect(servers.some((d) => d.name === '2U Server' && d.height === 2)).toBe(true);
			expect(servers.some((d) => d.name === '4U Server' && d.height === 4)).toBe(true);
		});

		it('includes network devices', () => {
			const devices = getStarterLibrary();
			const network = devices.filter((d) => d.category === 'network');

			expect(network.length).toBeGreaterThanOrEqual(3);
			expect(network.some((d) => d.name === '1U Switch')).toBe(true);
			expect(network.some((d) => d.name === '1U Router')).toBe(true);
			expect(network.some((d) => d.name === '1U Firewall')).toBe(true);
		});

		it('includes patch panel devices', () => {
			const devices = getStarterLibrary();
			const patchPanels = devices.filter((d) => d.category === 'patch-panel');

			expect(patchPanels.length).toBeGreaterThanOrEqual(2);
			expect(patchPanels.some((d) => d.name === '1U Patch Panel')).toBe(true);
			expect(patchPanels.some((d) => d.name === '2U Patch Panel')).toBe(true);
		});

		it('includes power devices', () => {
			const devices = getStarterLibrary();
			const power = devices.filter((d) => d.category === 'power');

			expect(power.length).toBeGreaterThanOrEqual(3);
			expect(power.some((d) => d.name === '1U PDU')).toBe(true);
			expect(power.some((d) => d.name === '2U UPS')).toBe(true);
			expect(power.some((d) => d.name === '4U UPS')).toBe(true);
		});

		it('includes blank panels', () => {
			const devices = getStarterLibrary();
			const blanks = devices.filter((d) => d.category === 'blank');

			expect(blanks.length).toBeGreaterThanOrEqual(2);
			expect(blanks.some((d) => d.name === '1U Blank')).toBe(true);
			expect(blanks.some((d) => d.name === '2U Blank')).toBe(true);
		});
	});

	describe('Layout integration', () => {
		it('new layout includes starter library', () => {
			const layout = createLayout();

			expect(layout.deviceLibrary.length).toBe(22);
			expect(layout.deviceLibrary[0]?.id).toMatch(/^starter-/);
		});

		it('starter devices can be used like regular devices', () => {
			const layout = createLayout();
			const starterDevice = layout.deviceLibrary[0];

			expect(starterDevice).toBeDefined();
			expect(validateDevice(starterDevice!).valid).toBe(true);
		});
	});
});

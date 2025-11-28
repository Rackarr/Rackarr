import { describe, it, expect } from 'vitest';
import type { Device, PlacedDevice, Rack, Layout, DeviceCategory } from '$lib/types';
import { CATEGORY_COLOURS, ALL_CATEGORIES, CURRENT_VERSION } from '$lib/types/constants';

describe('Types', () => {
	describe('Device interface', () => {
		it('accepts valid device object', () => {
			const device: Device = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: '1U Server',
				height: 1,
				colour: '#4A90D9',
				category: 'server'
			};

			expect(device.id).toBe('123e4567-e89b-12d3-a456-426614174000');
			expect(device.name).toBe('1U Server');
			expect(device.height).toBe(1);
			expect(device.colour).toBe('#4A90D9');
			expect(device.category).toBe('server');
		});

		it('accepts device with optional notes', () => {
			const device: Device = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: '2U Server',
				height: 2,
				colour: '#4A90D9',
				category: 'server',
				notes: 'Primary application server'
			};

			expect(device.notes).toBe('Primary application server');
		});
	});

	describe('PlacedDevice interface', () => {
		it('references library device correctly', () => {
			const placedDevice: PlacedDevice = {
				libraryId: '123e4567-e89b-12d3-a456-426614174000',
				position: 5
			};

			expect(placedDevice.libraryId).toBe('123e4567-e89b-12d3-a456-426614174000');
			expect(placedDevice.position).toBe(5);
		});
	});

	describe('Rack interface', () => {
		it('accepts valid rack object', () => {
			const rack: Rack = {
				id: '123e4567-e89b-12d3-a456-426614174001',
				name: 'Main Rack',
				height: 42,
				width: 19,
				position: 0,
				devices: []
			};

			expect(rack.id).toBe('123e4567-e89b-12d3-a456-426614174001');
			expect(rack.name).toBe('Main Rack');
			expect(rack.height).toBe(42);
			expect(rack.width).toBe(19);
			expect(rack.position).toBe(0);
			expect(rack.devices).toEqual([]);
		});

		it('accepts rack with placed devices', () => {
			const rack: Rack = {
				id: '123e4567-e89b-12d3-a456-426614174001',
				name: 'Main Rack',
				height: 42,
				width: 19,
				position: 0,
				devices: [
					{ libraryId: 'device-1', position: 1 },
					{ libraryId: 'device-2', position: 5 }
				]
			};

			expect(rack.devices).toHaveLength(2);
			expect(rack.devices[0]?.libraryId).toBe('device-1');
			expect(rack.devices[0]?.position).toBe(1);
		});
	});

	describe('Layout interface', () => {
		it('accepts valid layout object', () => {
			const layout: Layout = {
				version: '1.0',
				name: 'My Homelab',
				created: '2025-01-15T10:30:00Z',
				modified: '2025-01-15T14:45:00Z',
				settings: {
					theme: 'dark'
				},
				deviceLibrary: [],
				racks: []
			};

			expect(layout.version).toBe('1.0');
			expect(layout.name).toBe('My Homelab');
			expect(layout.settings.theme).toBe('dark');
			expect(layout.deviceLibrary).toEqual([]);
			expect(layout.racks).toEqual([]);
		});

		it('accepts layout with devices and racks', () => {
			const device: Device = {
				id: 'device-1',
				name: '1U Server',
				height: 1,
				colour: '#4A90D9',
				category: 'server'
			};

			const rack: Rack = {
				id: 'rack-1',
				name: 'Main Rack',
				height: 42,
				width: 19,
				position: 0,
				devices: [{ libraryId: 'device-1', position: 1 }]
			};

			const layout: Layout = {
				version: '1.0',
				name: 'My Homelab',
				created: '2025-01-15T10:30:00Z',
				modified: '2025-01-15T14:45:00Z',
				settings: { theme: 'light' },
				deviceLibrary: [device],
				racks: [rack]
			};

			expect(layout.deviceLibrary).toHaveLength(1);
			expect(layout.racks).toHaveLength(1);
			expect(layout.settings.theme).toBe('light');
		});
	});
});

describe('Constants', () => {
	describe('CATEGORY_COLOURS', () => {
		it('has entry for every DeviceCategory', () => {
			const categories: DeviceCategory[] = [
				'server',
				'network',
				'patch-panel',
				'power',
				'storage',
				'kvm',
				'av-media',
				'cooling',
				'blank',
				'other'
			];

			categories.forEach((category) => {
				expect(CATEGORY_COLOURS[category]).toBeDefined();
				expect(CATEGORY_COLOURS[category]).toMatch(/^#[0-9A-Fa-f]{6}$/);
			});
		});

		it('returns correct colour for server category', () => {
			expect(CATEGORY_COLOURS.server).toBe('#4A90D9');
		});

		it('returns correct colour for network category', () => {
			expect(CATEGORY_COLOURS.network).toBe('#7B68EE');
		});
	});

	describe('ALL_CATEGORIES', () => {
		it('contains all 10 categories', () => {
			expect(ALL_CATEGORIES).toHaveLength(10);
		});

		it('includes all expected categories', () => {
			expect(ALL_CATEGORIES).toContain('server');
			expect(ALL_CATEGORIES).toContain('network');
			expect(ALL_CATEGORIES).toContain('patch-panel');
			expect(ALL_CATEGORIES).toContain('power');
			expect(ALL_CATEGORIES).toContain('storage');
			expect(ALL_CATEGORIES).toContain('kvm');
			expect(ALL_CATEGORIES).toContain('av-media');
			expect(ALL_CATEGORIES).toContain('cooling');
			expect(ALL_CATEGORIES).toContain('blank');
			expect(ALL_CATEGORIES).toContain('other');
		});
	});

	describe('CURRENT_VERSION', () => {
		it('is set to 1.0', () => {
			expect(CURRENT_VERSION).toBe('1.0');
		});
	});
});

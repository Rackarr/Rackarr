import { describe, it, expect } from 'vitest';
import type {
	Device,
	PlacedDevice,
	Rack,
	Layout,
	DeviceCategory,
	RackView,
	DeviceFace
} from '$lib/types';
import {
	CATEGORY_COLOURS,
	ALL_CATEGORIES,
	CURRENT_VERSION,
	DEFAULT_RACK_VIEW,
	DEFAULT_DEVICE_FACE
} from '$lib/types/constants';

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
				position: 5,
				face: 'front'
			};

			expect(placedDevice.libraryId).toBe('123e4567-e89b-12d3-a456-426614174000');
			expect(placedDevice.position).toBe(5);
			expect(placedDevice.face).toBe('front');
		});

		it('accepts all valid face values', () => {
			const frontDevice: PlacedDevice = {
				libraryId: 'dev-1',
				position: 1,
				face: 'front'
			};
			const rearDevice: PlacedDevice = {
				libraryId: 'dev-2',
				position: 2,
				face: 'rear'
			};
			const bothDevice: PlacedDevice = {
				libraryId: 'dev-3',
				position: 3,
				face: 'both'
			};

			expect(frontDevice.face).toBe('front');
			expect(rearDevice.face).toBe('rear');
			expect(bothDevice.face).toBe('both');
		});
	});

	describe('Rack interface', () => {
		it('accepts valid rack object with view', () => {
			const rack: Rack = {
				id: '123e4567-e89b-12d3-a456-426614174001',
				name: 'Main Rack',
				height: 42,
				width: 19,
				position: 0,
				view: 'front',
				devices: []
			};

			expect(rack.id).toBe('123e4567-e89b-12d3-a456-426614174001');
			expect(rack.name).toBe('Main Rack');
			expect(rack.height).toBe(42);
			expect(rack.width).toBe(19);
			expect(rack.position).toBe(0);
			expect(rack.view).toBe('front');
			expect(rack.devices).toEqual([]);
		});

		it('accepts rack with rear view', () => {
			const rack: Rack = {
				id: '123e4567-e89b-12d3-a456-426614174001',
				name: 'Rear Rack',
				height: 42,
				width: 19,
				position: 0,
				view: 'rear',
				devices: []
			};

			expect(rack.view).toBe('rear');
		});

		it('accepts rack with placed devices', () => {
			const rack: Rack = {
				id: '123e4567-e89b-12d3-a456-426614174001',
				name: 'Main Rack',
				height: 42,
				width: 19,
				position: 0,
				view: 'front',
				devices: [
					{ libraryId: 'device-1', position: 1, face: 'front' },
					{ libraryId: 'device-2', position: 5, face: 'both' }
				]
			};

			expect(rack.devices).toHaveLength(2);
			expect(rack.devices[0]?.libraryId).toBe('device-1');
			expect(rack.devices[0]?.position).toBe(1);
			expect(rack.devices[0]?.face).toBe('front');
		});
	});

	describe('RackView type', () => {
		it('accepts front view', () => {
			const view: RackView = 'front';
			expect(view).toBe('front');
		});

		it('accepts rear view', () => {
			const view: RackView = 'rear';
			expect(view).toBe('rear');
		});
	});

	describe('DeviceFace type', () => {
		it('accepts front, rear, and both', () => {
			const faces: DeviceFace[] = ['front', 'rear', 'both'];
			expect(faces).toHaveLength(3);
			expect(faces).toContain('front');
			expect(faces).toContain('rear');
			expect(faces).toContain('both');
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
				view: 'front',
				devices: [{ libraryId: 'device-1', position: 1, face: 'front' }]
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

	describe('DEFAULT_RACK_VIEW', () => {
		it('is front', () => {
			expect(DEFAULT_RACK_VIEW).toBe('front');
		});
	});

	describe('DEFAULT_DEVICE_FACE', () => {
		it('is front', () => {
			expect(DEFAULT_DEVICE_FACE).toBe('front');
		});
	});
});

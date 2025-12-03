/**
 * Layout Migration Tests
 * Tests for migrating v0.1/v0.3 layouts to v0.2 format
 */

import { describe, it, expect } from 'vitest';
import { migrateToV02, detectLayoutVersion } from '$lib/utils/migrate-v02';
import type { Layout, Device } from '$lib/types';
import { isValidSlug } from '$lib/utils/slug';

// Helper to create a minimal legacy layout
function createLegacyLayout(overrides: Partial<Layout> = {}): Layout {
	return {
		version: '0.3.0',
		name: 'Test Layout',
		created: '2024-01-01T00:00:00.000Z',
		modified: '2024-01-01T00:00:00.000Z',
		settings: {
			theme: 'dark',
			displayMode: 'label',
			showLabelsOnImages: false
		},
		deviceLibrary: [],
		racks: [
			{
				id: 'rack-uuid-1',
				name: 'Main Rack',
				height: 42,
				width: 19,
				position: 0,
				view: 'front',
				devices: [],
				form_factor: '4-post-cabinet',
				desc_units: false,
				starting_unit: 1
			}
		],
		...overrides
	};
}

// Helper to create a legacy device
function createLegacyDevice(overrides: Partial<Device> = {}): Device {
	return {
		id: 'device-uuid-1',
		name: 'Test Server',
		height: 2,
		colour: '#3b82f6',
		category: 'server',
		...overrides
	};
}

describe('detectLayoutVersion', () => {
	it('returns version string when present', () => {
		expect(detectLayoutVersion({ version: '0.3.0' })).toBe('0.3.0');
		expect(detectLayoutVersion({ version: '0.2.0' })).toBe('0.2.0');
		expect(detectLayoutVersion({ version: '1.0.0' })).toBe('1.0.0');
	});

	it('infers v0.3 from deviceLibrary field', () => {
		// Legacy format with deviceLibrary but no version
		const legacyData = {
			name: 'Test',
			deviceLibrary: [],
			racks: []
		};
		expect(detectLayoutVersion(legacyData)).toBe('0.3.0');
	});

	it('infers v0.2 from device_types field', () => {
		// New format with device_types but no version
		const v02Data = {
			name: 'Test',
			device_types: [],
			rack: { name: 'Test', devices: [] }
		};
		expect(detectLayoutVersion(v02Data)).toBe('0.2.0');
	});

	it('returns unknown for empty object', () => {
		expect(detectLayoutVersion({})).toBe('unknown');
	});

	it('returns unknown for null', () => {
		expect(detectLayoutVersion(null)).toBe('unknown');
	});

	it('returns unknown for non-object', () => {
		expect(detectLayoutVersion('string')).toBe('unknown');
		expect(detectLayoutVersion(123)).toBe('unknown');
		expect(detectLayoutVersion([])).toBe('unknown');
	});

	it('returns unknown for object without recognizable structure', () => {
		expect(detectLayoutVersion({ foo: 'bar' })).toBe('unknown');
	});
});

describe('migrateToV02', () => {
	describe('basic structure', () => {
		it('sets version to 0.2.0', () => {
			const legacy = createLegacyLayout();
			const { layout } = migrateToV02(legacy);
			expect(layout.version).toBe('0.2.0');
		});

		it('preserves layout name', () => {
			const legacy = createLegacyLayout({ name: 'My Homelab' });
			const { layout } = migrateToV02(legacy);
			expect(layout.name).toBe('My Homelab');
		});

		it('returns idToSlugMap', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [createLegacyDevice({ id: 'device-1', name: 'Server' })]
			});
			const { idToSlugMap } = migrateToV02(legacy);
			expect(idToSlugMap).toBeInstanceOf(Map);
			expect(idToSlugMap.has('device-1')).toBe(true);
		});
	});

	describe('device type conversion', () => {
		it('converts deviceLibrary to device_types', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [createLegacyDevice()]
			});
			const { layout } = migrateToV02(legacy);
			expect(layout.device_types).toHaveLength(1);
		});

		it('renames height to u_height', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [createLegacyDevice({ height: 4 })]
			});
			const { layout } = migrateToV02(legacy);
			expect(layout.device_types[0].u_height).toBe(4);
		});

		it('moves colour and category to rackarr extensions', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [createLegacyDevice({ colour: '#ff0000', category: 'storage' })]
			});
			const { layout } = migrateToV02(legacy);
			expect(layout.device_types[0].rackarr.colour).toBe('#ff0000');
			expect(layout.device_types[0].rackarr.category).toBe('storage');
		});

		it('converts notes to comments', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [createLegacyDevice({ notes: 'Important server' })]
			});
			const { layout } = migrateToV02(legacy);
			expect(layout.device_types[0].comments).toBe('Important server');
		});

		it('preserves manufacturer and model', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [createLegacyDevice({ manufacturer: 'Dell', model: 'R740' })]
			});
			const { layout } = migrateToV02(legacy);
			expect(layout.device_types[0].manufacturer).toBe('Dell');
			expect(layout.device_types[0].model).toBe('R740');
		});

		it('preserves is_full_depth', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [createLegacyDevice({ is_full_depth: false })]
			});
			const { layout } = migrateToV02(legacy);
			expect(layout.device_types[0].is_full_depth).toBe(false);
		});

		it('preserves weight and weight_unit', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [createLegacyDevice({ weight: 25.5, weight_unit: 'kg' })]
			});
			const { layout } = migrateToV02(legacy);
			expect(layout.device_types[0].weight).toBe(25.5);
			expect(layout.device_types[0].weight_unit).toBe('kg');
		});

		it('preserves airflow', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [createLegacyDevice({ airflow: 'front-to-rear' })]
			});
			const { layout } = migrateToV02(legacy);
			expect(layout.device_types[0].airflow).toBe('front-to-rear');
		});
	});

	describe('slug generation', () => {
		it('generates valid slug for device', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [createLegacyDevice({ name: 'Test Server' })]
			});
			const { layout } = migrateToV02(legacy);
			expect(isValidSlug(layout.device_types[0].slug)).toBe(true);
		});

		it('generates slug from manufacturer and model when available', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [
					createLegacyDevice({ name: 'Ignored', manufacturer: 'Dell', model: 'PowerEdge R740' })
				]
			});
			const { layout } = migrateToV02(legacy);
			expect(layout.device_types[0].slug).toBe('dell-poweredge-r740');
		});

		it('generates slug from name when no manufacturer/model', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [createLegacyDevice({ name: 'Synology DS920+' })]
			});
			const { layout } = migrateToV02(legacy);
			expect(layout.device_types[0].slug).toBe('synology-ds920-plus');
		});

		it('handles duplicate names with unique slugs', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [
					createLegacyDevice({ id: 'device-1', name: 'Test Server' }),
					createLegacyDevice({ id: 'device-2', name: 'Test Server' }),
					createLegacyDevice({ id: 'device-3', name: 'Test Server' })
				]
			});
			const { layout } = migrateToV02(legacy);
			const slugs = layout.device_types.map((dt) => dt.slug);
			// All slugs should be unique
			expect(new Set(slugs).size).toBe(3);
			expect(slugs).toContain('test-server');
			expect(slugs).toContain('test-server-2');
			expect(slugs).toContain('test-server-3');
		});

		it('maps device IDs to slugs correctly', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [
					createLegacyDevice({ id: 'uuid-123', name: 'Server One' }),
					createLegacyDevice({ id: 'uuid-456', name: 'Server Two' })
				]
			});
			const { idToSlugMap } = migrateToV02(legacy);
			expect(idToSlugMap.get('uuid-123')).toBe('server-one');
			expect(idToSlugMap.get('uuid-456')).toBe('server-two');
		});
	});

	describe('rack conversion', () => {
		it('converts first rack only', () => {
			const legacy = createLegacyLayout({
				racks: [
					{
						id: 'rack-1',
						name: 'First Rack',
						height: 42,
						width: 19,
						position: 0,
						view: 'front',
						devices: [],
						form_factor: '4-post-cabinet',
						desc_units: false,
						starting_unit: 1
					},
					{
						id: 'rack-2',
						name: 'Second Rack',
						height: 24,
						width: 19,
						position: 1,
						view: 'front',
						devices: [],
						form_factor: '4-post-cabinet',
						desc_units: false,
						starting_unit: 1
					}
				]
			});
			const { layout } = migrateToV02(legacy);
			expect(layout.rack.name).toBe('First Rack');
		});

		it('preserves rack name', () => {
			const legacy = createLegacyLayout();
			legacy.racks[0].name = 'Homelab Rack';
			const { layout } = migrateToV02(legacy);
			expect(layout.rack.name).toBe('Homelab Rack');
		});

		it('preserves rack height', () => {
			const legacy = createLegacyLayout();
			legacy.racks[0].height = 24;
			const { layout } = migrateToV02(legacy);
			expect(layout.rack.height).toBe(24);
		});

		it('preserves rack width', () => {
			const legacy = createLegacyLayout();
			legacy.racks[0].width = 10;
			const { layout } = migrateToV02(legacy);
			expect(layout.rack.width).toBe(10);
		});

		it('preserves form_factor', () => {
			const legacy = createLegacyLayout();
			legacy.racks[0].form_factor = 'wall-cabinet';
			const { layout } = migrateToV02(legacy);
			expect(layout.rack.form_factor).toBe('wall-cabinet');
		});

		it('preserves desc_units', () => {
			const legacy = createLegacyLayout();
			legacy.racks[0].desc_units = true;
			const { layout } = migrateToV02(legacy);
			expect(layout.rack.desc_units).toBe(true);
		});

		it('preserves starting_unit', () => {
			const legacy = createLegacyLayout();
			legacy.racks[0].starting_unit = 5;
			const { layout } = migrateToV02(legacy);
			expect(layout.rack.starting_unit).toBe(5);
		});

		it('preserves position', () => {
			const legacy = createLegacyLayout();
			legacy.racks[0].position = 3;
			const { layout } = migrateToV02(legacy);
			expect(layout.rack.position).toBe(3);
		});

		it('does not include view (runtime-only)', () => {
			const legacy = createLegacyLayout();
			legacy.racks[0].view = 'rear';
			const { layout } = migrateToV02(legacy);
			// view should not be set (or undefined) since it's runtime-only
			expect(layout.rack.view).toBeUndefined();
		});

		it('uses defaults for missing optional fields', () => {
			const legacy = createLegacyLayout();
			// Remove optional fields
			delete legacy.racks[0].form_factor;
			delete legacy.racks[0].desc_units;
			delete legacy.racks[0].starting_unit;
			const { layout } = migrateToV02(legacy);
			expect(layout.rack.form_factor).toBe('4-post-cabinet');
			expect(layout.rack.desc_units).toBe(false);
			expect(layout.rack.starting_unit).toBe(1);
		});
	});

	describe('placed device conversion', () => {
		it('maps libraryId to device_type slug', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [createLegacyDevice({ id: 'lib-device-1', name: 'My Server' })],
				racks: [
					{
						id: 'rack-1',
						name: 'Rack',
						height: 42,
						width: 19,
						position: 0,
						view: 'front',
						devices: [{ libraryId: 'lib-device-1', position: 10, face: 'front' }],
						form_factor: '4-post-cabinet',
						desc_units: false,
						starting_unit: 1
					}
				]
			});
			const { layout } = migrateToV02(legacy);
			expect(layout.rack.devices).toHaveLength(1);
			expect(layout.rack.devices[0].device_type).toBe('my-server');
		});

		it('preserves device position', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [createLegacyDevice({ id: 'dev-1' })],
				racks: [
					{
						id: 'rack-1',
						name: 'Rack',
						height: 42,
						width: 19,
						position: 0,
						view: 'front',
						devices: [{ libraryId: 'dev-1', position: 25, face: 'front' }],
						form_factor: '4-post-cabinet',
						desc_units: false,
						starting_unit: 1
					}
				]
			});
			const { layout } = migrateToV02(legacy);
			expect(layout.rack.devices[0].position).toBe(25);
		});

		it('preserves device face', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [createLegacyDevice({ id: 'dev-1' })],
				racks: [
					{
						id: 'rack-1',
						name: 'Rack',
						height: 42,
						width: 19,
						position: 0,
						view: 'front',
						devices: [{ libraryId: 'dev-1', position: 10, face: 'rear' }],
						form_factor: '4-post-cabinet',
						desc_units: false,
						starting_unit: 1
					}
				]
			});
			const { layout } = migrateToV02(legacy);
			expect(layout.rack.devices[0].face).toBe('rear');
		});

		it('handles multiple placed devices', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [
					createLegacyDevice({ id: 'dev-1', name: 'Server 1' }),
					createLegacyDevice({ id: 'dev-2', name: 'Server 2' })
				],
				racks: [
					{
						id: 'rack-1',
						name: 'Rack',
						height: 42,
						width: 19,
						position: 0,
						view: 'front',
						devices: [
							{ libraryId: 'dev-1', position: 1, face: 'front' },
							{ libraryId: 'dev-2', position: 5, face: 'rear' },
							{ libraryId: 'dev-1', position: 10, face: 'both' }
						],
						form_factor: '4-post-cabinet',
						desc_units: false,
						starting_unit: 1
					}
				]
			});
			const { layout } = migrateToV02(legacy);
			expect(layout.rack.devices).toHaveLength(3);
			expect(layout.rack.devices[0].device_type).toBe('server-1');
			expect(layout.rack.devices[1].device_type).toBe('server-2');
			expect(layout.rack.devices[2].device_type).toBe('server-1');
		});

		it('skips devices with unknown libraryId', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [createLegacyDevice({ id: 'dev-1', name: 'Server' })],
				racks: [
					{
						id: 'rack-1',
						name: 'Rack',
						height: 42,
						width: 19,
						position: 0,
						view: 'front',
						devices: [
							{ libraryId: 'dev-1', position: 1, face: 'front' },
							{ libraryId: 'unknown-id', position: 5, face: 'front' }
						],
						form_factor: '4-post-cabinet',
						desc_units: false,
						starting_unit: 1
					}
				]
			});
			const { layout } = migrateToV02(legacy);
			expect(layout.rack.devices).toHaveLength(1);
		});
	});

	describe('settings conversion', () => {
		it('converts displayMode to display_mode', () => {
			const legacy = createLegacyLayout({
				settings: {
					theme: 'dark',
					displayMode: 'image',
					showLabelsOnImages: false
				}
			});
			const { layout } = migrateToV02(legacy);
			expect(layout.settings.display_mode).toBe('image');
		});

		it('converts showLabelsOnImages to show_labels_on_images', () => {
			const legacy = createLegacyLayout({
				settings: {
					theme: 'dark',
					displayMode: 'label',
					showLabelsOnImages: true
				}
			});
			const { layout } = migrateToV02(legacy);
			expect(layout.settings.show_labels_on_images).toBe(true);
		});

		it('removes theme (not in v0.2)', () => {
			const legacy = createLegacyLayout({
				settings: {
					theme: 'light',
					displayMode: 'label',
					showLabelsOnImages: false
				}
			});
			const { layout } = migrateToV02(legacy);
			expect((layout.settings as Record<string, unknown>)['theme']).toBeUndefined();
		});

		it('uses defaults for missing settings', () => {
			const legacy = createLegacyLayout();
			delete (legacy.settings as Record<string, unknown>)['displayMode'];
			delete (legacy.settings as Record<string, unknown>)['showLabelsOnImages'];
			const { layout } = migrateToV02(legacy);
			expect(layout.settings.display_mode).toBe('label');
			expect(layout.settings.show_labels_on_images).toBe(true);
		});
	});

	describe('edge cases', () => {
		it('handles empty deviceLibrary', () => {
			const legacy = createLegacyLayout({ deviceLibrary: [] });
			const { layout } = migrateToV02(legacy);
			expect(layout.device_types).toEqual([]);
		});

		it('handles empty racks array with default rack', () => {
			const legacy = createLegacyLayout({ racks: [] });
			const { layout } = migrateToV02(legacy);
			// Should create a default empty rack
			expect(layout.rack).toBeDefined();
			expect(layout.rack.name).toBe('Rack');
			expect(layout.rack.devices).toEqual([]);
		});

		it('handles devices with special characters in name', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [
					createLegacyDevice({ id: 'dev-1', name: 'Server (Primary) #1' }),
					createLegacyDevice({ id: 'dev-2', name: 'UPS/PDU Unit' })
				]
			});
			const { layout } = migrateToV02(legacy);
			expect(isValidSlug(layout.device_types[0].slug)).toBe(true);
			expect(isValidSlug(layout.device_types[1].slug)).toBe(true);
		});

		it('handles devices with only whitespace name', () => {
			const legacy = createLegacyLayout({
				deviceLibrary: [createLegacyDevice({ id: 'dev-1', name: '   ' })]
			});
			const { layout } = migrateToV02(legacy);
			// Should generate a fallback slug
			expect(layout.device_types[0].slug).toBeTruthy();
			expect(isValidSlug(layout.device_types[0].slug)).toBe(true);
		});
	});
});

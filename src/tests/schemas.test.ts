/**
 * Schema Validation Tests
 * Comprehensive tests for Zod validation schemas
 */

import { describe, it, expect } from 'vitest';
import {
	SlugSchema,
	DeviceCategorySchema,
	FormFactorSchema,
	AirflowSchema,
	DeviceFaceSchema,
	WeightUnitSchema,
	DisplayModeSchema,
	RackarrExtensionsSchema,
	DeviceTypeSchema,
	PlacedDeviceSchema,
	RackSchema,
	LayoutSettingsSchema,
	LayoutSchema,
	validateSlugUniqueness
} from '$lib/schemas';

// ============================================================================
// SlugSchema Tests
// ============================================================================

describe('SlugSchema', () => {
	describe('valid slugs', () => {
		it('accepts simple lowercase slug', () => {
			expect(SlugSchema.safeParse('server').success).toBe(true);
		});

		it('accepts slug with numbers', () => {
			expect(SlugSchema.safeParse('server1').success).toBe(true);
		});

		it('accepts slug with hyphens', () => {
			expect(SlugSchema.safeParse('dell-r740').success).toBe(true);
		});

		it('accepts multi-hyphen slug', () => {
			expect(SlugSchema.safeParse('dell-poweredge-r740').success).toBe(true);
		});

		it('accepts single character slug', () => {
			expect(SlugSchema.safeParse('a').success).toBe(true);
		});

		it('accepts 100 character slug', () => {
			const slug = 'a'.repeat(100);
			expect(SlugSchema.safeParse(slug).success).toBe(true);
		});
	});

	describe('invalid slugs', () => {
		it('rejects empty string', () => {
			const result = SlugSchema.safeParse('');
			expect(result.success).toBe(false);
		});

		it('rejects uppercase letters', () => {
			const result = SlugSchema.safeParse('Server');
			expect(result.success).toBe(false);
		});

		it('rejects leading hyphen', () => {
			const result = SlugSchema.safeParse('-server');
			expect(result.success).toBe(false);
		});

		it('rejects trailing hyphen', () => {
			const result = SlugSchema.safeParse('server-');
			expect(result.success).toBe(false);
		});

		it('rejects consecutive hyphens', () => {
			const result = SlugSchema.safeParse('server--rack');
			expect(result.success).toBe(false);
		});

		it('rejects spaces', () => {
			const result = SlugSchema.safeParse('my server');
			expect(result.success).toBe(false);
		});

		it('rejects special characters', () => {
			const result = SlugSchema.safeParse('server_rack');
			expect(result.success).toBe(false);
		});

		it('rejects slug over 100 characters', () => {
			const slug = 'a'.repeat(101);
			const result = SlugSchema.safeParse(slug);
			expect(result.success).toBe(false);
		});
	});

	describe('error messages', () => {
		it('shows required message for empty slug', () => {
			const result = SlugSchema.safeParse('');
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0]?.message).toContain('required');
			}
		});

		it('shows pattern message for invalid format', () => {
			const result = SlugSchema.safeParse('UPPERCASE');
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0]?.message).toContain('lowercase');
			}
		});
	});
});

// ============================================================================
// Enum Schema Tests
// ============================================================================

describe('DeviceCategorySchema', () => {
	const validCategories = [
		'server',
		'network',
		'patch-panel',
		'power',
		'storage',
		'kvm',
		'av-media',
		'cooling',
		'shelf',
		'blank',
		'cable-management',
		'other'
	];

	it.each(validCategories)('accepts valid category: %s', (category) => {
		expect(DeviceCategorySchema.safeParse(category).success).toBe(true);
	});

	it('rejects invalid category', () => {
		expect(DeviceCategorySchema.safeParse('invalid').success).toBe(false);
	});

	it('rejects empty string', () => {
		expect(DeviceCategorySchema.safeParse('').success).toBe(false);
	});
});

describe('FormFactorSchema', () => {
	const validFormFactors = ['2-post', '4-post', '4-post-cabinet', 'wall-mount', 'open-frame'];

	it.each(validFormFactors)('accepts valid form factor: %s', (formFactor) => {
		expect(FormFactorSchema.safeParse(formFactor).success).toBe(true);
	});

	it('rejects invalid form factor', () => {
		expect(FormFactorSchema.safeParse('invalid').success).toBe(false);
	});
});

describe('AirflowSchema', () => {
	const validAirflows = ['passive', 'front-to-rear', 'rear-to-front', 'side-to-rear'];

	it.each(validAirflows)('accepts valid airflow: %s', (airflow) => {
		expect(AirflowSchema.safeParse(airflow).success).toBe(true);
	});

	it('rejects invalid airflow', () => {
		expect(AirflowSchema.safeParse('top-to-bottom').success).toBe(false);
	});
});

describe('DeviceFaceSchema', () => {
	it('accepts front', () => {
		expect(DeviceFaceSchema.safeParse('front').success).toBe(true);
	});

	it('accepts rear', () => {
		expect(DeviceFaceSchema.safeParse('rear').success).toBe(true);
	});

	it('accepts both', () => {
		expect(DeviceFaceSchema.safeParse('both').success).toBe(true);
	});

	it('rejects invalid face', () => {
		expect(DeviceFaceSchema.safeParse('side').success).toBe(false);
	});
});

describe('WeightUnitSchema', () => {
	it('accepts kg', () => {
		expect(WeightUnitSchema.safeParse('kg').success).toBe(true);
	});

	it('accepts lb', () => {
		expect(WeightUnitSchema.safeParse('lb').success).toBe(true);
	});

	it('rejects invalid unit', () => {
		expect(WeightUnitSchema.safeParse('oz').success).toBe(false);
	});
});

describe('DisplayModeSchema', () => {
	it('accepts label', () => {
		expect(DisplayModeSchema.safeParse('label').success).toBe(true);
	});

	it('accepts image', () => {
		expect(DisplayModeSchema.safeParse('image').success).toBe(true);
	});

	it('rejects invalid mode', () => {
		expect(DisplayModeSchema.safeParse('both').success).toBe(false);
	});
});

// ============================================================================
// RackarrExtensionsSchema Tests
// ============================================================================

describe('RackarrExtensionsSchema', () => {
	it('accepts valid extensions with required fields', () => {
		const result = RackarrExtensionsSchema.safeParse({
			colour: '#4A90D9',
			category: 'server'
		});
		expect(result.success).toBe(true);
	});

	it('accepts extensions with optional tags', () => {
		const result = RackarrExtensionsSchema.safeParse({
			colour: '#4A90D9',
			category: 'server',
			tags: ['production', 'critical']
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing colour', () => {
		const result = RackarrExtensionsSchema.safeParse({
			category: 'server'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing category', () => {
		const result = RackarrExtensionsSchema.safeParse({
			colour: '#4A90D9'
		});
		expect(result.success).toBe(false);
	});

	describe('colour validation', () => {
		it('accepts valid hex colour', () => {
			const result = RackarrExtensionsSchema.safeParse({
				colour: '#FF5733',
				category: 'server'
			});
			expect(result.success).toBe(true);
		});

		it('accepts lowercase hex colour', () => {
			const result = RackarrExtensionsSchema.safeParse({
				colour: '#ff5733',
				category: 'server'
			});
			expect(result.success).toBe(true);
		});

		it('rejects colour without hash', () => {
			const result = RackarrExtensionsSchema.safeParse({
				colour: 'FF5733',
				category: 'server'
			});
			expect(result.success).toBe(false);
		});

		it('rejects 3-character hex', () => {
			const result = RackarrExtensionsSchema.safeParse({
				colour: '#F00',
				category: 'server'
			});
			expect(result.success).toBe(false);
		});

		it('rejects 8-character hex (with alpha)', () => {
			const result = RackarrExtensionsSchema.safeParse({
				colour: '#FF5733FF',
				category: 'server'
			});
			expect(result.success).toBe(false);
		});

		it('rejects invalid hex characters', () => {
			const result = RackarrExtensionsSchema.safeParse({
				colour: '#GGGGGG',
				category: 'server'
			});
			expect(result.success).toBe(false);
		});
	});
});

describe('DeviceTypeSchema', () => {
	const validBaseDevice = {
		slug: 'test-device',
		u_height: 1,
		rackarr: {
			colour: '#4A90D9',
			category: 'server' as const
		}
	};

	describe('power device properties', () => {
		it('validates device type without power fields', () => {
			const result = DeviceTypeSchema.safeParse(validBaseDevice);
			expect(result.success).toBe(true);
		});

		it('validates device type with valid outlet_count', () => {
			const device = {
				...validBaseDevice,
				outlet_count: 8
			};
			const result = DeviceTypeSchema.safeParse(device);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.outlet_count).toBe(8);
			}
		});

		it('validates device type with valid va_rating', () => {
			const device = {
				...validBaseDevice,
				va_rating: 1500
			};
			const result = DeviceTypeSchema.safeParse(device);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.va_rating).toBe(1500);
			}
		});

		it('validates device type with both power fields', () => {
			const device = {
				...validBaseDevice,
				outlet_count: 6,
				va_rating: 3000
			};
			const result = DeviceTypeSchema.safeParse(device);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.outlet_count).toBe(6);
				expect(result.data.va_rating).toBe(3000);
			}
		});

		it('rejects negative outlet_count', () => {
			const device = {
				...validBaseDevice,
				outlet_count: -1
			};
			const result = DeviceTypeSchema.safeParse(device);
			expect(result.success).toBe(false);
		});

		it('rejects negative va_rating', () => {
			const device = {
				...validBaseDevice,
				va_rating: -500
			};
			const result = DeviceTypeSchema.safeParse(device);
			expect(result.success).toBe(false);
		});

		it('rejects non-integer outlet_count', () => {
			const device = {
				...validBaseDevice,
				outlet_count: 8.5
			};
			const result = DeviceTypeSchema.safeParse(device);
			expect(result.success).toBe(false);
		});

		it('rejects non-integer va_rating', () => {
			const device = {
				...validBaseDevice,
				va_rating: 1500.5
			};
			const result = DeviceTypeSchema.safeParse(device);
			expect(result.success).toBe(false);
		});

		it('rejects zero outlet_count', () => {
			const device = {
				...validBaseDevice,
				outlet_count: 0
			};
			const result = DeviceTypeSchema.safeParse(device);
			expect(result.success).toBe(false);
		});

		it('rejects zero va_rating', () => {
			const device = {
				...validBaseDevice,
				va_rating: 0
			};
			const result = DeviceTypeSchema.safeParse(device);
			expect(result.success).toBe(false);
		});
	});

	describe('existing field validation', () => {
		it('validates device type with all optional fields', () => {
			const device = {
				slug: 'full-device',
				u_height: 2,
				manufacturer: 'Test Mfg',
				model: 'Model X',
				is_full_depth: true,
				weight: 25.5,
				weight_unit: 'kg' as const,
				airflow: 'front-to-rear' as const,
				comments: 'Test comments',
				outlet_count: 8,
				va_rating: 1500,
				rackarr: {
					colour: '#4A90D9',
					category: 'power' as const,
					tags: ['test']
				}
			};
			const result = DeviceTypeSchema.safeParse(device);
			expect(result.success).toBe(true);
		});
	});

	describe('u_height validation', () => {
		it('accepts 0.5U height', () => {
			const device = { ...validBaseDevice, u_height: 0.5 };
			expect(DeviceTypeSchema.safeParse(device).success).toBe(true);
		});

		it('accepts 1.5U height', () => {
			const device = { ...validBaseDevice, u_height: 1.5 };
			expect(DeviceTypeSchema.safeParse(device).success).toBe(true);
		});

		it('accepts 50U height (max)', () => {
			const device = { ...validBaseDevice, u_height: 50 };
			expect(DeviceTypeSchema.safeParse(device).success).toBe(true);
		});

		it('rejects height less than 0.5U', () => {
			const device = { ...validBaseDevice, u_height: 0.25 };
			expect(DeviceTypeSchema.safeParse(device).success).toBe(false);
		});

		it('rejects height greater than 50U', () => {
			const device = { ...validBaseDevice, u_height: 51 };
			expect(DeviceTypeSchema.safeParse(device).success).toBe(false);
		});

		it('rejects non-0.5U multiple height', () => {
			const device = { ...validBaseDevice, u_height: 1.3 };
			expect(DeviceTypeSchema.safeParse(device).success).toBe(false);
		});

		it('rejects zero height', () => {
			const device = { ...validBaseDevice, u_height: 0 };
			expect(DeviceTypeSchema.safeParse(device).success).toBe(false);
		});

		it('rejects negative height', () => {
			const device = { ...validBaseDevice, u_height: -1 };
			expect(DeviceTypeSchema.safeParse(device).success).toBe(false);
		});
	});

	describe('required fields', () => {
		it('rejects missing slug', () => {
			const device = {
				u_height: 1,
				rackarr: { colour: '#4A90D9', category: 'server' }
			};
			expect(DeviceTypeSchema.safeParse(device).success).toBe(false);
		});

		it('rejects missing u_height', () => {
			const device = {
				slug: 'test-device',
				rackarr: { colour: '#4A90D9', category: 'server' }
			};
			expect(DeviceTypeSchema.safeParse(device).success).toBe(false);
		});

		it('rejects missing rackarr', () => {
			const device = {
				slug: 'test-device',
				u_height: 1
			};
			expect(DeviceTypeSchema.safeParse(device).success).toBe(false);
		});
	});
});

// ============================================================================
// PlacedDeviceSchema Tests
// ============================================================================

describe('PlacedDeviceSchema', () => {
	const validPlacedDevice = {
		device_type: 'test-device',
		position: 1,
		face: 'front' as const
	};

	describe('valid placed devices', () => {
		it('accepts minimal valid placed device', () => {
			expect(PlacedDeviceSchema.safeParse(validPlacedDevice).success).toBe(true);
		});

		it('accepts placed device with optional name', () => {
			const device = { ...validPlacedDevice, name: 'Web Server 1' };
			expect(PlacedDeviceSchema.safeParse(device).success).toBe(true);
		});

		it('accepts rear face', () => {
			const device = { ...validPlacedDevice, face: 'rear' as const };
			expect(PlacedDeviceSchema.safeParse(device).success).toBe(true);
		});

		it('accepts both face', () => {
			const device = { ...validPlacedDevice, face: 'both' as const };
			expect(PlacedDeviceSchema.safeParse(device).success).toBe(true);
		});
	});

	describe('position validation', () => {
		it('accepts position 1', () => {
			const device = { ...validPlacedDevice, position: 1 };
			expect(PlacedDeviceSchema.safeParse(device).success).toBe(true);
		});

		it('accepts high position numbers', () => {
			const device = { ...validPlacedDevice, position: 42 };
			expect(PlacedDeviceSchema.safeParse(device).success).toBe(true);
		});

		it('rejects position 0', () => {
			const device = { ...validPlacedDevice, position: 0 };
			expect(PlacedDeviceSchema.safeParse(device).success).toBe(false);
		});

		it('rejects negative position', () => {
			const device = { ...validPlacedDevice, position: -1 };
			expect(PlacedDeviceSchema.safeParse(device).success).toBe(false);
		});

		it('rejects non-integer position', () => {
			const device = { ...validPlacedDevice, position: 1.5 };
			expect(PlacedDeviceSchema.safeParse(device).success).toBe(false);
		});
	});

	describe('name validation', () => {
		it('accepts empty name', () => {
			const device = { ...validPlacedDevice, name: '' };
			expect(PlacedDeviceSchema.safeParse(device).success).toBe(true);
		});

		it('accepts name with 100 characters', () => {
			const device = { ...validPlacedDevice, name: 'a'.repeat(100) };
			expect(PlacedDeviceSchema.safeParse(device).success).toBe(true);
		});

		it('rejects name over 100 characters', () => {
			const device = { ...validPlacedDevice, name: 'a'.repeat(101) };
			expect(PlacedDeviceSchema.safeParse(device).success).toBe(false);
		});
	});
});

// ============================================================================
// RackSchema Tests
// ============================================================================

describe('RackSchema', () => {
	const validRack = {
		name: 'Main Rack',
		height: 42,
		width: 19 as const,
		desc_units: false,
		form_factor: '4-post-cabinet' as const,
		starting_unit: 1,
		position: 0,
		devices: []
	};

	describe('valid racks', () => {
		it('accepts minimal valid rack', () => {
			expect(RackSchema.safeParse(validRack).success).toBe(true);
		});

		it('accepts 10-inch rack', () => {
			const rack = { ...validRack, width: 10 as const };
			expect(RackSchema.safeParse(rack).success).toBe(true);
		});

		it('accepts rack with devices', () => {
			const rack = {
				...validRack,
				devices: [{ device_type: 'server', position: 1, face: 'front' as const }]
			};
			expect(RackSchema.safeParse(rack).success).toBe(true);
		});

		it('accepts desc_units true', () => {
			const rack = { ...validRack, desc_units: true };
			expect(RackSchema.safeParse(rack).success).toBe(true);
		});
	});

	describe('height validation', () => {
		it('accepts 1U rack (min)', () => {
			const rack = { ...validRack, height: 1 };
			expect(RackSchema.safeParse(rack).success).toBe(true);
		});

		it('accepts 50U rack (max)', () => {
			const rack = { ...validRack, height: 50 };
			expect(RackSchema.safeParse(rack).success).toBe(true);
		});

		it('rejects 0U rack', () => {
			const rack = { ...validRack, height: 0 };
			expect(RackSchema.safeParse(rack).success).toBe(false);
		});

		it('rejects 51U rack', () => {
			const rack = { ...validRack, height: 51 };
			expect(RackSchema.safeParse(rack).success).toBe(false);
		});

		it('rejects non-integer height', () => {
			const rack = { ...validRack, height: 42.5 };
			expect(RackSchema.safeParse(rack).success).toBe(false);
		});
	});

	describe('width validation', () => {
		it('rejects invalid width', () => {
			const rack = { ...validRack, width: 15 };
			expect(RackSchema.safeParse(rack).success).toBe(false);
		});
	});

	describe('name validation', () => {
		it('rejects empty name', () => {
			const rack = { ...validRack, name: '' };
			expect(RackSchema.safeParse(rack).success).toBe(false);
		});

		it('rejects name over 100 characters', () => {
			const rack = { ...validRack, name: 'a'.repeat(101) };
			expect(RackSchema.safeParse(rack).success).toBe(false);
		});
	});
});

// ============================================================================
// LayoutSettingsSchema Tests
// ============================================================================

describe('LayoutSettingsSchema', () => {
	it('accepts valid settings', () => {
		const settings = {
			display_mode: 'label' as const,
			show_labels_on_images: true
		};
		expect(LayoutSettingsSchema.safeParse(settings).success).toBe(true);
	});

	it('accepts image display mode', () => {
		const settings = {
			display_mode: 'image' as const,
			show_labels_on_images: false
		};
		expect(LayoutSettingsSchema.safeParse(settings).success).toBe(true);
	});

	it('rejects missing display_mode', () => {
		const settings = { show_labels_on_images: true };
		expect(LayoutSettingsSchema.safeParse(settings).success).toBe(false);
	});

	it('rejects missing show_labels_on_images', () => {
		const settings = { display_mode: 'label' };
		expect(LayoutSettingsSchema.safeParse(settings).success).toBe(false);
	});
});

// ============================================================================
// LayoutSchema Tests
// ============================================================================

describe('LayoutSchema', () => {
	const validLayout = {
		version: '0.2.0',
		name: 'My Homelab',
		rack: {
			name: 'Main Rack',
			height: 42,
			width: 19 as const,
			desc_units: false,
			form_factor: '4-post-cabinet' as const,
			starting_unit: 1,
			position: 0,
			devices: []
		},
		device_types: [],
		settings: {
			display_mode: 'label' as const,
			show_labels_on_images: true
		}
	};

	describe('valid layouts', () => {
		it('accepts minimal valid layout', () => {
			expect(LayoutSchema.safeParse(validLayout).success).toBe(true);
		});

		it('accepts layout with device types', () => {
			const layout = {
				...validLayout,
				device_types: [
					{
						slug: 'dell-r740',
						u_height: 2,
						rackarr: { colour: '#4A90D9', category: 'server' as const }
					}
				]
			};
			expect(LayoutSchema.safeParse(layout).success).toBe(true);
		});

		it('accepts layout with multiple device types', () => {
			const layout = {
				...validLayout,
				device_types: [
					{
						slug: 'server-1',
						u_height: 2,
						rackarr: { colour: '#4A90D9', category: 'server' as const }
					},
					{
						slug: 'switch-1',
						u_height: 1,
						rackarr: { colour: '#FF5733', category: 'network' as const }
					}
				]
			};
			expect(LayoutSchema.safeParse(layout).success).toBe(true);
		});
	});

	describe('slug uniqueness validation', () => {
		it('rejects duplicate device type slugs', () => {
			const layout = {
				...validLayout,
				device_types: [
					{
						slug: 'duplicate-slug',
						u_height: 2,
						rackarr: { colour: '#4A90D9', category: 'server' as const }
					},
					{
						slug: 'duplicate-slug',
						u_height: 1,
						rackarr: { colour: '#FF5733', category: 'network' as const }
					}
				]
			};
			const result = LayoutSchema.safeParse(layout);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0]?.message).toContain('Duplicate');
			}
		});

		it('allows empty device_types', () => {
			const layout = { ...validLayout, device_types: [] };
			expect(LayoutSchema.safeParse(layout).success).toBe(true);
		});
	});

	describe('name validation', () => {
		it('rejects empty layout name', () => {
			const layout = { ...validLayout, name: '' };
			expect(LayoutSchema.safeParse(layout).success).toBe(false);
		});

		it('rejects layout name over 100 characters', () => {
			const layout = { ...validLayout, name: 'a'.repeat(101) };
			expect(LayoutSchema.safeParse(layout).success).toBe(false);
		});
	});
});

// ============================================================================
// validateSlugUniqueness Tests
// ============================================================================

describe('validateSlugUniqueness', () => {
	it('returns empty array for unique slugs', () => {
		const types = [{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }];
		expect(validateSlugUniqueness(types)).toEqual([]);
	});

	it('returns empty array for empty input', () => {
		expect(validateSlugUniqueness([])).toEqual([]);
	});

	it('returns duplicate slug when found', () => {
		const types = [{ slug: 'a' }, { slug: 'b' }, { slug: 'a' }];
		expect(validateSlugUniqueness(types)).toEqual(['a']);
	});

	it('returns all duplicate slugs', () => {
		const types = [
			{ slug: 'a' },
			{ slug: 'b' },
			{ slug: 'a' },
			{ slug: 'b' },
			{ slug: 'c' }
		];
		const result = validateSlugUniqueness(types);
		expect(result).toContain('a');
		expect(result).toContain('b');
		expect(result).toHaveLength(2);
	});

	it('handles single item', () => {
		expect(validateSlugUniqueness([{ slug: 'a' }])).toEqual([]);
	});
});

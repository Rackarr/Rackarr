/**
 * Schema Validation Tests
 * Tests for Zod schemas validating DeviceType and other structures
 */

import { describe, it, expect } from 'vitest';
import { DeviceTypeSchema } from '$lib/schemas';

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
});

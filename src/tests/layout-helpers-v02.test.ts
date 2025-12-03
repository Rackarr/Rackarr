/**
 * v0.2 Layout Store Helpers Tests
 * Tests for helper functions that work with v0.2 types
 */

import { describe, it, expect } from 'vitest';
import {
	createDeviceType,
	createDevice,
	findDeviceType,
	getDeviceDisplayName
} from '$lib/stores/layout-helpers-v02';
import type { DeviceTypeV02, DeviceV02 } from '$lib/types/v02';
import { isValidSlug } from '$lib/utils/slug';

describe('createDeviceType', () => {
	it('generates valid slug from name', () => {
		const dt = createDeviceType({
			name: 'Test Server',
			u_height: 2,
			category: 'server',
			colour: '#3b82f6'
		});
		expect(isValidSlug(dt.slug)).toBe(true);
		expect(dt.slug).toBe('test-server');
	});

	it('sets all required fields', () => {
		const dt = createDeviceType({
			name: 'My Device',
			u_height: 4,
			category: 'storage',
			colour: '#10b981'
		});
		expect(dt.u_height).toBe(4);
		expect(dt.rackarr.colour).toBe('#10b981');
		expect(dt.rackarr.category).toBe('storage');
	});

	it('includes rackarr extensions', () => {
		const dt = createDeviceType({
			name: 'Tagged Device',
			u_height: 1,
			category: 'network',
			colour: '#000000',
			tags: ['production', 'core']
		});
		expect(dt.rackarr.tags).toEqual(['production', 'core']);
	});

	it('includes optional manufacturer and model', () => {
		const dt = createDeviceType({
			name: 'Dell Server',
			u_height: 2,
			category: 'server',
			colour: '#3b82f6',
			manufacturer: 'Dell',
			model: 'PowerEdge R740'
		});
		expect(dt.manufacturer).toBe('Dell');
		expect(dt.model).toBe('PowerEdge R740');
	});

	it('includes optional airflow', () => {
		const dt = createDeviceType({
			name: 'Server',
			u_height: 2,
			category: 'server',
			colour: '#000000',
			airflow: 'front-to-rear'
		});
		expect(dt.airflow).toBe('front-to-rear');
	});

	it('includes optional weight', () => {
		const dt = createDeviceType({
			name: 'Heavy Server',
			u_height: 4,
			category: 'server',
			colour: '#000000',
			weight: 25.5,
			weight_unit: 'kg'
		});
		expect(dt.weight).toBe(25.5);
		expect(dt.weight_unit).toBe('kg');
	});

	it('includes optional comments', () => {
		const dt = createDeviceType({
			name: 'Important Server',
			u_height: 2,
			category: 'server',
			colour: '#000000',
			comments: 'Primary production server'
		});
		expect(dt.comments).toBe('Primary production server');
	});

	it('includes optional is_full_depth', () => {
		const dt = createDeviceType({
			name: 'Short Device',
			u_height: 1,
			category: 'network',
			colour: '#000000',
			is_full_depth: false
		});
		expect(dt.is_full_depth).toBe(false);
	});

	it('uses manufacturer and model for slug when available', () => {
		const dt = createDeviceType({
			name: 'Ignored Name',
			u_height: 2,
			category: 'server',
			colour: '#000000',
			manufacturer: 'Dell',
			model: 'R740'
		});
		expect(dt.slug).toBe('dell-r740');
	});
});

describe('createDevice', () => {
	it('creates device with correct device_type reference', () => {
		const device = createDevice('my-server', 10, 'front');
		expect(device.device_type).toBe('my-server');
		expect(device.position).toBe(10);
		expect(device.face).toBe('front');
	});

	it('handles optional name correctly when provided', () => {
		const device = createDevice('my-server', 5, 'rear', 'Production DB');
		expect(device.name).toBe('Production DB');
	});

	it('handles optional name correctly when not provided', () => {
		const device = createDevice('my-server', 5, 'rear');
		expect(device.name).toBeUndefined();
	});

	it('creates device with both face option', () => {
		const device = createDevice('my-server', 1, 'both');
		expect(device.face).toBe('both');
	});
});

describe('findDeviceType', () => {
	const deviceTypes: DeviceTypeV02[] = [
		{
			slug: 'server-one',
			u_height: 2,
			rackarr: { colour: '#3b82f6', category: 'server' }
		},
		{
			slug: 'switch-core',
			u_height: 1,
			rackarr: { colour: '#10b981', category: 'network' }
		},
		{
			slug: 'nas-storage',
			u_height: 4,
			manufacturer: 'Synology',
			model: 'RS1221+',
			rackarr: { colour: '#f59e0b', category: 'storage' }
		}
	];

	it('finds existing device type by slug', () => {
		const found = findDeviceType(deviceTypes, 'switch-core');
		expect(found).toBeDefined();
		expect(found?.slug).toBe('switch-core');
		expect(found?.rackarr.category).toBe('network');
	});

	it('returns undefined for non-existent slug', () => {
		const found = findDeviceType(deviceTypes, 'non-existent');
		expect(found).toBeUndefined();
	});

	it('returns undefined for empty array', () => {
		const found = findDeviceType([], 'any-slug');
		expect(found).toBeUndefined();
	});

	it('finds device type with additional properties', () => {
		const found = findDeviceType(deviceTypes, 'nas-storage');
		expect(found?.manufacturer).toBe('Synology');
		expect(found?.model).toBe('RS1221+');
	});
});

describe('getDeviceDisplayName', () => {
	const deviceTypes: DeviceTypeV02[] = [
		{
			slug: 'server-basic',
			u_height: 2,
			rackarr: { colour: '#3b82f6', category: 'server' }
		},
		{
			slug: 'server-with-model',
			u_height: 2,
			model: 'PowerEdge R740',
			rackarr: { colour: '#3b82f6', category: 'server' }
		},
		{
			slug: 'nas-synology',
			u_height: 2,
			manufacturer: 'Synology',
			model: 'RS1221+',
			rackarr: { colour: '#f59e0b', category: 'storage' }
		}
	];

	it('returns device name if set', () => {
		const device: DeviceV02 = {
			device_type: 'server-basic',
			name: 'Primary Database',
			position: 10,
			face: 'front'
		};
		expect(getDeviceDisplayName(device, deviceTypes)).toBe('Primary Database');
	});

	it('returns model if name not set', () => {
		const device: DeviceV02 = {
			device_type: 'server-with-model',
			position: 10,
			face: 'front'
		};
		expect(getDeviceDisplayName(device, deviceTypes)).toBe('PowerEdge R740');
	});

	it('returns slug as fallback when no name or model', () => {
		const device: DeviceV02 = {
			device_type: 'server-basic',
			position: 10,
			face: 'front'
		};
		expect(getDeviceDisplayName(device, deviceTypes)).toBe('server-basic');
	});

	it('prefers device name over model', () => {
		const device: DeviceV02 = {
			device_type: 'nas-synology',
			name: 'Backup NAS',
			position: 5,
			face: 'rear'
		};
		expect(getDeviceDisplayName(device, deviceTypes)).toBe('Backup NAS');
	});

	it('returns slug when device type not found', () => {
		const device: DeviceV02 = {
			device_type: 'non-existent',
			position: 10,
			face: 'front'
		};
		expect(getDeviceDisplayName(device, deviceTypes)).toBe('non-existent');
	});

	it('handles empty device types array', () => {
		const device: DeviceV02 = {
			device_type: 'any-device',
			position: 10,
			face: 'front'
		};
		expect(getDeviceDisplayName(device, [])).toBe('any-device');
	});
});

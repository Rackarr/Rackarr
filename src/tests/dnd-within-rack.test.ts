import { describe, it, expect } from 'vitest';
import type { Device, Rack } from '$lib/types';
import {
	createRackDeviceDragData,
	serializeDragData,
	parseDragData,
	getDropFeedback
} from '$lib/utils/dragdrop';

describe('DnD Within Rack', () => {
	// Test device data
	const testDevice: Device = {
		id: 'device-1',
		name: 'Test Server',
		height: 2,
		colour: '#4A90D9',
		category: 'server'
	};

	const testDevice2: Device = {
		id: 'device-2',
		name: 'Test Switch',
		height: 1,
		colour: '#7B68EE',
		category: 'network'
	};

	const deviceLibrary: Device[] = [testDevice, testDevice2];

	const emptyRack: Rack = {
		id: 'rack-1',
		name: 'Test Rack',
		height: 12,
		width: 19,
		position: 0,
		devices: []
	};

	describe('createRackDeviceDragData', () => {
		it('creates drag data with rack-device type', () => {
			const dragData = createRackDeviceDragData(testDevice, 'rack-1', 0);
			expect(dragData.type).toBe('rack-device');
		});

		it('includes device reference', () => {
			const dragData = createRackDeviceDragData(testDevice, 'rack-1', 0);
			expect(dragData.device).toBe(testDevice);
		});

		it('includes source rack ID', () => {
			const dragData = createRackDeviceDragData(testDevice, 'rack-1', 0);
			expect(dragData.sourceRackId).toBe('rack-1');
		});

		it('includes source device index', () => {
			const dragData = createRackDeviceDragData(testDevice, 'rack-1', 2);
			expect(dragData.sourceIndex).toBe(2);
		});
	});

	describe('getDropFeedback with excludeIndex', () => {
		it('returns valid when excluding source device from collision check', () => {
			// Rack with device at U5-U6
			const rackWithDevice: Rack = {
				...emptyRack,
				devices: [{ libraryId: 'device-1', position: 5 }]
			};

			// Without exclusion, dropping at U5 would be blocked
			const feedbackBlocked = getDropFeedback(rackWithDevice, deviceLibrary, 2, 5);
			expect(feedbackBlocked).toBe('blocked');

			// With exclusion (moving the same device), dropping at U5 should be valid
			const feedbackValid = getDropFeedback(rackWithDevice, deviceLibrary, 2, 5, 0);
			expect(feedbackValid).toBe('valid');
		});

		it('returns blocked when collision with different device', () => {
			// Rack with two devices
			const rackWithDevices: Rack = {
				...emptyRack,
				devices: [
					{ libraryId: 'device-1', position: 5 }, // Index 0: U5-U6
					{ libraryId: 'device-2', position: 8 } // Index 1: U8
				]
			};

			// Trying to move device at index 0 to U7-U8 (collides with device-2 at U8)
			const feedback = getDropFeedback(rackWithDevices, deviceLibrary, 2, 7, 0);
			expect(feedback).toBe('blocked');
		});

		it('returns valid for same position (no-op move)', () => {
			const rackWithDevice: Rack = {
				...emptyRack,
				devices: [{ libraryId: 'device-1', position: 5 }]
			};

			// Moving device back to its original position is valid
			const feedback = getDropFeedback(rackWithDevice, deviceLibrary, 2, 5, 0);
			expect(feedback).toBe('valid');
		});

		it('returns valid for new position without collision', () => {
			const rackWithDevice: Rack = {
				...emptyRack,
				devices: [{ libraryId: 'device-1', position: 5 }]
			};

			// Moving device from U5 to U8 (empty space)
			const feedback = getDropFeedback(rackWithDevice, deviceLibrary, 2, 8, 0);
			expect(feedback).toBe('valid');
		});
	});

	describe('Drag data serialization', () => {
		it('serializes and deserializes rack-device drag data correctly', () => {
			const original = createRackDeviceDragData(testDevice, 'rack-1', 3);
			const serialized = serializeDragData(original);
			const deserialized = parseDragData(serialized);

			expect(deserialized).not.toBeNull();
			expect(deserialized?.type).toBe('rack-device');
			expect(deserialized?.device.id).toBe(testDevice.id);
			expect(deserialized?.sourceRackId).toBe('rack-1');
			expect(deserialized?.sourceIndex).toBe(3);
		});
	});

	describe('Keyboard movement logic', () => {
		// These tests verify the movement logic that will be used for keyboard navigation
		const deviceLibraryMultiple: Device[] = [
			{ id: 'dev-1', name: 'Server 1', height: 2, colour: '#4A90D9', category: 'server' },
			{ id: 'dev-2', name: 'Server 2', height: 2, colour: '#4A90D9', category: 'server' }
		];

		it('moving up 1U from valid position is valid', () => {
			// Device at U5, moving to U6
			const rack: Rack = {
				...emptyRack,
				devices: [{ libraryId: 'dev-1', position: 5 }]
			};

			const feedback = getDropFeedback(rack, deviceLibraryMultiple, 2, 6, 0);
			expect(feedback).toBe('valid');
		});

		it('moving down 1U from valid position is valid', () => {
			// Device at U5, moving to U4
			const rack: Rack = {
				...emptyRack,
				devices: [{ libraryId: 'dev-1', position: 5 }]
			};

			const feedback = getDropFeedback(rack, deviceLibraryMultiple, 2, 4, 0);
			expect(feedback).toBe('valid');
		});

		it('moving up beyond rack height is invalid', () => {
			// 2U device at U11, moving to U12 would go beyond rack (12U rack)
			const rack: Rack = {
				...emptyRack,
				devices: [{ libraryId: 'dev-1', position: 11 }]
			};

			// Device at U11-U12, moving to U12-U13 is invalid (beyond 12U)
			const feedback = getDropFeedback(rack, deviceLibraryMultiple, 2, 12, 0);
			expect(feedback).toBe('invalid');
		});

		it('moving down below U1 is invalid', () => {
			// Device at U1, cannot move below
			const rack: Rack = {
				...emptyRack,
				devices: [{ libraryId: 'dev-1', position: 1 }]
			};

			const feedback = getDropFeedback(rack, deviceLibraryMultiple, 2, 0, 0);
			expect(feedback).toBe('invalid');
		});

		it('moving into collision with another device is blocked', () => {
			// Two devices: one at U3-U4, one at U7-U8
			const rack: Rack = {
				...emptyRack,
				devices: [
					{ libraryId: 'dev-1', position: 3 },
					{ libraryId: 'dev-2', position: 7 }
				]
			};

			// Moving device at U3 up to U6 would overlap with device at U7 (2U device at U6 occupies U6-U7)
			const feedback = getDropFeedback(rack, deviceLibraryMultiple, 2, 6, 0);
			expect(feedback).toBe('blocked');
		});

		it('adjacent move does not collide', () => {
			// Two devices: one at U3-U4, one at U7-U8
			const rack: Rack = {
				...emptyRack,
				devices: [
					{ libraryId: 'dev-1', position: 3 },
					{ libraryId: 'dev-2', position: 7 }
				]
			};

			// Moving device at U3 up to U5 (occupies U5-U6) does not collide with device at U7
			const feedback = getDropFeedback(rack, deviceLibraryMultiple, 2, 5, 0);
			expect(feedback).toBe('valid');
		});
	});
});

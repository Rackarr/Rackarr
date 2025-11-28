import { describe, it, expect } from 'vitest';
import {
	getDeviceURange,
	doRangesOverlap,
	canPlaceDevice,
	findCollisions,
	findValidDropPositions,
	snapToNearestValidPosition
} from '$lib/utils/collision';
import type { Device, Rack } from '$lib/types';

// Helper to create test devices
function createTestDevice(id: string, height: number): Device {
	return {
		id,
		name: `Test Device ${id}`,
		height,
		colour: '#4A90D9',
		category: 'server'
	};
}

// Helper to create test rack
function createTestRack(
	height: number,
	devices: { libraryId: string; position: number }[] = []
): Rack {
	return {
		id: 'rack-1',
		name: 'Test Rack',
		height,
		width: 19,
		position: 0,
		devices
	};
}

describe('Collision Detection', () => {
	describe('getDeviceURange', () => {
		it('returns {bottom:5, top:5} for 1U device at position 5', () => {
			const range = getDeviceURange(5, 1);
			expect(range).toEqual({ bottom: 5, top: 5 });
		});

		it('returns {bottom:5, top:6} for 2U device at position 5', () => {
			const range = getDeviceURange(5, 2);
			expect(range).toEqual({ bottom: 5, top: 6 });
		});

		it('returns {bottom:10, top:13} for 4U device at position 10', () => {
			const range = getDeviceURange(10, 4);
			expect(range).toEqual({ bottom: 10, top: 13 });
		});
	});

	describe('doRangesOverlap', () => {
		it('returns false for {1,2} and {3,4} (adjacent)', () => {
			expect(doRangesOverlap({ bottom: 1, top: 2 }, { bottom: 3, top: 4 })).toBe(false);
		});

		it('returns true for {1,3} and {2,4} (partial overlap)', () => {
			expect(doRangesOverlap({ bottom: 1, top: 3 }, { bottom: 2, top: 4 })).toBe(true);
		});

		it('returns true for {1,4} and {2,3} (containment)', () => {
			expect(doRangesOverlap({ bottom: 1, top: 4 }, { bottom: 2, top: 3 })).toBe(true);
		});

		it('returns true for {2,3} and {1,4} (reverse containment)', () => {
			expect(doRangesOverlap({ bottom: 2, top: 3 }, { bottom: 1, top: 4 })).toBe(true);
		});

		it('returns true for {1,2} and {2,3} (edge touch)', () => {
			expect(doRangesOverlap({ bottom: 1, top: 2 }, { bottom: 2, top: 3 })).toBe(true);
		});
	});

	describe('canPlaceDevice', () => {
		it('returns true for empty rack', () => {
			const rack = createTestRack(42);
			const deviceLibrary: Device[] = [];

			expect(canPlaceDevice(rack, deviceLibrary, 1, 1)).toBe(true);
			expect(canPlaceDevice(rack, deviceLibrary, 4, 10)).toBe(true);
		});

		it('returns false when device would exceed rack top', () => {
			const rack = createTestRack(42);
			const deviceLibrary: Device[] = [];

			// 4U device at position 40 would occupy 40,41,42,43 - but rack only has 42
			expect(canPlaceDevice(rack, deviceLibrary, 4, 40)).toBe(false);
		});

		it('returns false for position less than 1', () => {
			const rack = createTestRack(42);
			const deviceLibrary: Device[] = [];

			expect(canPlaceDevice(rack, deviceLibrary, 1, 0)).toBe(false);
			expect(canPlaceDevice(rack, deviceLibrary, 1, -1)).toBe(false);
		});

		it('returns false for collision with existing device', () => {
			const device1 = createTestDevice('device-1', 2);
			const rack = createTestRack(42, [{ libraryId: 'device-1', position: 5 }]);

			// device-1 occupies 5,6. Placing 2U device at 4 would occupy 4,5 - collision!
			expect(canPlaceDevice(rack, [device1], 2, 4)).toBe(false);
			// Placing at 5 - collision!
			expect(canPlaceDevice(rack, [device1], 1, 5)).toBe(false);
			// Placing at 6 - collision!
			expect(canPlaceDevice(rack, [device1], 1, 6)).toBe(false);
		});

		it('returns true for position adjacent to existing device', () => {
			const device1 = createTestDevice('device-1', 2);
			const rack = createTestRack(42, [{ libraryId: 'device-1', position: 5 }]);

			// device-1 occupies 5,6. Position 7 is adjacent and valid
			expect(canPlaceDevice(rack, [device1], 1, 7)).toBe(true);
			// Position 4 with 1U device occupies only 4 - valid
			expect(canPlaceDevice(rack, [device1], 1, 4)).toBe(true);
		});
	});

	describe('findCollisions', () => {
		it('returns empty array when no collisions', () => {
			const device1 = createTestDevice('device-1', 2);
			const rack = createTestRack(42, [{ libraryId: 'device-1', position: 5 }]);

			const collisions = findCollisions(rack, [device1], 1, 10);
			expect(collisions).toEqual([]);
		});

		it('returns colliding devices', () => {
			const device1 = createTestDevice('device-1', 2);
			const rack = createTestRack(42, [{ libraryId: 'device-1', position: 5 }]);

			const collisions = findCollisions(rack, [device1], 2, 4);
			expect(collisions).toHaveLength(1);
			expect(collisions[0]).toEqual({ libraryId: 'device-1', position: 5 });
		});

		it('excludes device at excludeIndex (for move operations)', () => {
			const device1 = createTestDevice('device-1', 2);
			const device2 = createTestDevice('device-2', 1);
			const rack = createTestRack(42, [
				{ libraryId: 'device-1', position: 5 },
				{ libraryId: 'device-2', position: 10 }
			]);

			// Moving device at index 0 - should exclude it from collision check
			const collisions = findCollisions(rack, [device1, device2], 2, 5, 0);
			expect(collisions).toEqual([]);
		});
	});

	describe('findValidDropPositions', () => {
		it('returns [1..rackHeight-deviceHeight+1] for empty rack', () => {
			const rack = createTestRack(10);
			const deviceLibrary: Device[] = [];

			// 1U device can go in positions 1-10
			const positions1U = findValidDropPositions(rack, deviceLibrary, 1);
			expect(positions1U).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

			// 2U device can go in positions 1-9 (top at 10)
			const positions2U = findValidDropPositions(rack, deviceLibrary, 2);
			expect(positions2U).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
		});

		it('excludes positions that would collide', () => {
			const device1 = createTestDevice('device-1', 2);
			const rack = createTestRack(10, [{ libraryId: 'device-1', position: 5 }]);

			// 1U device: device-1 at 5,6 blocks positions 5 and 6
			const positions1U = findValidDropPositions(rack, [device1], 1);
			expect(positions1U).toEqual([1, 2, 3, 4, 7, 8, 9, 10]);

			// 2U device: positions 4,5,6 would collide with device at 5,6
			const positions2U = findValidDropPositions(rack, [device1], 2);
			expect(positions2U).toEqual([1, 2, 3, 7, 8, 9]);
		});

		it('returns empty array when rack is full', () => {
			// Fill rack completely with 1U devices
			const devices: Device[] = [];
			const placedDevices: { libraryId: string; position: number }[] = [];
			for (let i = 1; i <= 5; i++) {
				devices.push(createTestDevice(`device-${i}`, 1));
				placedDevices.push({ libraryId: `device-${i}`, position: i });
			}
			const rack = createTestRack(5, placedDevices);

			const positions = findValidDropPositions(rack, devices, 1);
			expect(positions).toEqual([]);
		});
	});

	describe('snapToNearestValidPosition', () => {
		const uHeight = 22; // pixels per U

		it('returns exact position if valid', () => {
			const rack = createTestRack(42);
			const deviceLibrary: Device[] = [];

			// Target Y for position 5 (from top of rack)
			const targetY = (42 - 5) * uHeight;
			const result = snapToNearestValidPosition(rack, deviceLibrary, 1, targetY, uHeight);
			expect(result).toBe(5);
		});

		it('returns nearest valid position', () => {
			const device1 = createTestDevice('device-1', 2);
			const rack = createTestRack(42, [{ libraryId: 'device-1', position: 5 }]);

			// Target somewhere near position 5 (which is blocked)
			const targetY = (42 - 5) * uHeight;
			const result = snapToNearestValidPosition(rack, [device1], 1, targetY, uHeight);
			// Should snap to nearest valid: either 4 or 7
			expect(result === 4 || result === 7).toBe(true);
		});

		it('returns null when no valid positions', () => {
			// Fill rack completely
			const devices: Device[] = [];
			const placedDevices: { libraryId: string; position: number }[] = [];
			for (let i = 1; i <= 5; i++) {
				devices.push(createTestDevice(`device-${i}`, 1));
				placedDevices.push({ libraryId: `device-${i}`, position: i });
			}
			const rack = createTestRack(5, placedDevices);

			const result = snapToNearestValidPosition(rack, devices, 1, 50, uHeight);
			expect(result).toBeNull();
		});
	});
});

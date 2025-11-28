/**
 * Collision Detection System
 * Functions for device placement validation
 */

import type { Device, PlacedDevice, Rack } from '$lib/types';

/**
 * Range of U positions occupied by a device
 */
export interface URange {
	bottom: number;
	top: number;
}

/**
 * Get the U range occupied by a device at a given position
 * @param position - Bottom U position (1-indexed)
 * @param height - Device height in U
 * @returns Range of U positions {bottom, top}
 */
export function getDeviceURange(position: number, height: number): URange {
	return {
		bottom: position,
		top: position + height - 1
	};
}

/**
 * Check if two U ranges overlap
 * @param rangeA - First range
 * @param rangeB - Second range
 * @returns true if ranges overlap (including edge touch)
 */
export function doRangesOverlap(rangeA: URange, rangeB: URange): boolean {
	// Ranges overlap if one starts before or at the other's end
	// and ends after or at the other's start
	return rangeA.bottom <= rangeB.top && rangeA.top >= rangeB.bottom;
}

/**
 * Check if a device can be placed at a given position
 * @param rack - The rack to check
 * @param deviceLibrary - The device library
 * @param deviceHeight - Height of device to place
 * @param targetPosition - Target bottom U position
 * @param excludeIndex - Optional index in rack.devices to exclude (for move operations)
 * @returns true if placement is valid
 */
export function canPlaceDevice(
	rack: Rack,
	deviceLibrary: Device[],
	deviceHeight: number,
	targetPosition: number,
	excludeIndex?: number
): boolean {
	// Position must be >= 1
	if (targetPosition < 1) {
		return false;
	}

	// Device must fit within rack height
	const topPosition = targetPosition + deviceHeight - 1;
	if (topPosition > rack.height) {
		return false;
	}

	// Check for collisions with existing devices
	const newRange = getDeviceURange(targetPosition, deviceHeight);

	for (let i = 0; i < rack.devices.length; i++) {
		// Skip the excluded device (for move operations)
		if (excludeIndex !== undefined && i === excludeIndex) {
			continue;
		}

		const placedDevice = rack.devices[i]!;
		const device = deviceLibrary.find((d) => d.id === placedDevice.libraryId);
		if (device) {
			const existingRange = getDeviceURange(placedDevice.position, device.height);
			if (doRangesOverlap(newRange, existingRange)) {
				return false;
			}
		}
	}

	return true;
}

/**
 * Find devices that would collide with a new device at given position
 * @param rack - The rack to check
 * @param deviceLibrary - The device library
 * @param newDeviceHeight - Height of new device
 * @param newPosition - Target position
 * @param excludeIndex - Optional index in rack.devices to exclude (for move operations)
 * @returns Array of colliding PlacedDevices
 */
export function findCollisions(
	rack: Rack,
	deviceLibrary: Device[],
	newDeviceHeight: number,
	newPosition: number,
	excludeIndex?: number
): PlacedDevice[] {
	const collisions: PlacedDevice[] = [];
	const newRange = getDeviceURange(newPosition, newDeviceHeight);

	rack.devices.forEach((placedDevice, index) => {
		// Skip the excluded device (for move operations)
		if (excludeIndex !== undefined && index === excludeIndex) {
			return;
		}

		const device = deviceLibrary.find((d) => d.id === placedDevice.libraryId);
		if (device) {
			const existingRange = getDeviceURange(placedDevice.position, device.height);
			if (doRangesOverlap(newRange, existingRange)) {
				collisions.push(placedDevice);
			}
		}
	});

	return collisions;
}

/**
 * Find all valid positions where a device of given height can be placed
 * @param rack - The rack to check
 * @param deviceLibrary - The device library
 * @param deviceHeight - Height of device to place
 * @returns Array of valid bottom U positions, sorted ascending
 */
export function findValidDropPositions(
	rack: Rack,
	deviceLibrary: Device[],
	deviceHeight: number
): number[] {
	const validPositions: number[] = [];

	// Check each possible position from 1 to (rack.height - deviceHeight + 1)
	const maxPosition = rack.height - deviceHeight + 1;
	for (let position = 1; position <= maxPosition; position++) {
		if (canPlaceDevice(rack, deviceLibrary, deviceHeight, position)) {
			validPositions.push(position);
		}
	}

	return validPositions;
}

/**
 * Convert Y coordinate to U position
 * @param y - Y coordinate (0 at top of rack SVG)
 * @param rackHeight - Total rack height in U
 * @param uHeight - Height of one U in pixels
 * @returns U position (1-indexed from bottom)
 */
function yToUPosition(y: number, rackHeight: number, uHeight: number): number {
	// SVG has y=0 at top, U=1 at bottom
	// position = rackHeight - floor(y / uHeight)
	return rackHeight - Math.floor(y / uHeight);
}

/**
 * Snap to the nearest valid drop position
 * @param rack - The rack to check
 * @param deviceLibrary - The device library
 * @param deviceHeight - Height of device to place
 * @param targetY - Target Y coordinate in pixels
 * @param uHeight - Height of one U in pixels
 * @returns Nearest valid U position, or null if no valid positions
 */
export function snapToNearestValidPosition(
	rack: Rack,
	deviceLibrary: Device[],
	deviceHeight: number,
	targetY: number,
	uHeight: number
): number | null {
	const validPositions = findValidDropPositions(rack, deviceLibrary, deviceHeight);

	if (validPositions.length === 0) {
		return null;
	}

	// Convert target Y to approximate U position
	const targetU = yToUPosition(targetY, rack.height, uHeight);

	// Find the closest valid position
	let closestPosition = validPositions[0]!;
	let closestDistance = Math.abs(targetU - closestPosition);

	for (const position of validPositions) {
		const distance = Math.abs(targetU - position);
		if (distance < closestDistance) {
			closestDistance = distance;
			closestPosition = position;
		}
	}

	return closestPosition;
}

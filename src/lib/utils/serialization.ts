/**
 * Layout Serialization and Persistence
 * JSON serialization, deserialization, and validation
 */

import type { Layout, Device, Rack } from '$lib/types';
import { CURRENT_VERSION } from '$lib/types/constants';
import { getDeviceURange, doRangesOverlap } from './collision';
import { getStarterLibrary } from '$lib/data/starterLibrary';

/**
 * Create a new empty layout
 * @param name - Layout name (default: "Untitled Layout")
 * @returns New Layout object with starter device library
 */
export function createLayout(name: string = 'Untitled Layout'): Layout {
	const now = new Date().toISOString();

	return {
		version: CURRENT_VERSION,
		name,
		created: now,
		modified: now,
		settings: {
			theme: 'dark'
		},
		deviceLibrary: getStarterLibrary(),
		racks: []
	};
}

/**
 * Serialize a layout to JSON string
 * Updates the modified timestamp
 * @param layout - Layout to serialize
 * @returns JSON string
 */
export function serializeLayout(layout: Layout): string {
	const serialized: Layout = {
		...layout,
		modified: new Date().toISOString()
	};

	return JSON.stringify(serialized, null, 2);
}

/**
 * Deserialize a layout from JSON string
 * @param json - JSON string to parse
 * @returns Layout object
 * @throws Error if JSON is invalid or layout structure is invalid
 */
export function deserializeLayout(json: string): Layout {
	let parsed: unknown;

	try {
		parsed = JSON.parse(json);
	} catch {
		throw new Error('Invalid JSON syntax');
	}

	if (!validateLayoutStructure(parsed)) {
		throw new Error('Invalid layout structure');
	}

	// Check version compatibility
	if (parsed.version !== CURRENT_VERSION) {
		throw new Error(`Unsupported layout version: ${parsed.version}`);
	}

	return parsed;
}

/**
 * Type guard to validate layout structure
 * @param obj - Object to validate
 * @returns true if obj is a valid Layout
 */
export function validateLayoutStructure(obj: unknown): obj is Layout {
	// Must be an object
	if (obj === null || obj === undefined || typeof obj !== 'object' || Array.isArray(obj)) {
		return false;
	}

	const layout = obj as Record<string, unknown>;

	// Check required fields exist
	if (
		typeof layout['version'] !== 'string' ||
		typeof layout['name'] !== 'string' ||
		typeof layout['created'] !== 'string' ||
		typeof layout['modified'] !== 'string' ||
		typeof layout['settings'] !== 'object' ||
		layout['settings'] === null ||
		!Array.isArray(layout['deviceLibrary']) ||
		!Array.isArray(layout['racks'])
	) {
		return false;
	}

	const settings = layout['settings'] as Record<string, unknown>;
	if (settings['theme'] !== 'dark' && settings['theme'] !== 'light') {
		return false;
	}

	const deviceLibrary = layout['deviceLibrary'] as Device[];
	const racks = layout['racks'] as Rack[];

	// Validate device references
	const deviceIds = new Set(deviceLibrary.map((d) => d.id));
	for (const rack of racks) {
		for (const placedDevice of rack.devices) {
			if (!deviceIds.has(placedDevice.libraryId)) {
				return false;
			}
		}
	}

	// Validate no overlapping devices in each rack
	for (const rack of racks) {
		const placedDevices = rack.devices;
		for (let i = 0; i < placedDevices.length; i++) {
			const deviceA = placedDevices[i]!;
			const deviceInfoA = deviceLibrary.find((d) => d.id === deviceA.libraryId);
			if (!deviceInfoA) continue;

			const rangeA = getDeviceURange(deviceA.position, deviceInfoA.height);

			for (let j = i + 1; j < placedDevices.length; j++) {
				const deviceB = placedDevices[j]!;
				const deviceInfoB = deviceLibrary.find((d) => d.id === deviceB.libraryId);
				if (!deviceInfoB) continue;

				const rangeB = getDeviceURange(deviceB.position, deviceInfoB.height);

				if (doRangesOverlap(rangeA, rangeB)) {
					return false;
				}
			}
		}
	}

	return true;
}

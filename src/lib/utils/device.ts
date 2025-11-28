/**
 * Device Utility Functions
 * Pure functions for device operations
 */

import type { Device, DeviceCategory } from '$lib/types';
import { CATEGORY_COLOURS, MIN_DEVICE_HEIGHT, MAX_DEVICE_HEIGHT } from '$lib/types/constants';

/**
 * Generate a unique UUID v4 identifier
 */
export function generateId(): string {
	return crypto.randomUUID();
}

/**
 * Get the default colour for a device category
 */
export function getDefaultColour(category: DeviceCategory): string {
	return CATEGORY_COLOURS[category];
}

/**
 * Parameters for creating a new device
 */
export interface CreateDeviceParams {
	name: string;
	height: number;
	category: DeviceCategory;
	id?: string;
	colour?: string;
	notes?: string;
}

/**
 * Create a new device with sensible defaults
 */
export function createDevice(params: CreateDeviceParams): Device {
	return {
		id: params.id ?? generateId(),
		name: params.name,
		height: params.height,
		colour: params.colour ?? getDefaultColour(params.category),
		category: params.category,
		notes: params.notes
	};
}

/**
 * Validation result for a device
 */
export interface ValidationResult {
	valid: boolean;
	errors: string[];
}

/**
 * Validate a device object
 */
export function validateDevice(device: Device): ValidationResult {
	const errors: string[] = [];

	// Validate name
	if (!device.name || device.name.trim() === '') {
		errors.push('Name is required');
	}

	// Validate height
	if (device.height < MIN_DEVICE_HEIGHT || device.height > MAX_DEVICE_HEIGHT) {
		errors.push(`Height must be between ${MIN_DEVICE_HEIGHT} and ${MAX_DEVICE_HEIGHT}`);
	}

	// Validate colour (hex format)
	const hexColourRegex = /^#[0-9A-Fa-f]{6}$/;
	if (!hexColourRegex.test(device.colour)) {
		errors.push('Colour must be a valid hex colour (e.g., #4A90D9)');
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

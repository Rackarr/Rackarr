/**
 * v0.2 Layout Store Helpers
 * Helper functions for working with v0.2 types in the layout store
 */

import type { DeviceTypeV02, DeviceV02, DeviceFaceV02 } from '$lib/types/v02';
import type { DeviceCategory } from '$lib/types';
import { generateDeviceSlug } from '$lib/utils/slug';
import type { AirflowV02, WeightUnitV02 } from '$lib/types/v02';

/**
 * Input data for creating a new device type
 */
export interface CreateDeviceTypeInput {
	name: string;
	u_height: number;
	category: DeviceCategory;
	colour: string;
	manufacturer?: string;
	model?: string;
	is_full_depth?: boolean;
	weight?: number;
	weight_unit?: WeightUnitV02;
	airflow?: AirflowV02;
	comments?: string;
	tags?: string[];
}

/**
 * Create a new DeviceType with auto-generated slug
 * @param data - Input data for the device type
 * @returns A complete DeviceTypeV02 object
 */
export function createDeviceType(data: CreateDeviceTypeInput): DeviceTypeV02 {
	// Generate slug from manufacturer/model or name
	const slug = generateDeviceSlug(data.manufacturer, data.model, data.name);

	const deviceType: DeviceTypeV02 = {
		slug,
		u_height: data.u_height,
		rackarr: {
			colour: data.colour,
			category: data.category
		}
	};

	// Add optional fields if provided
	if (data.manufacturer) {
		deviceType.manufacturer = data.manufacturer;
	}
	if (data.model) {
		deviceType.model = data.model;
	}
	if (data.is_full_depth !== undefined) {
		deviceType.is_full_depth = data.is_full_depth;
	}
	if (data.weight !== undefined) {
		deviceType.weight = data.weight;
	}
	if (data.weight_unit) {
		deviceType.weight_unit = data.weight_unit;
	}
	if (data.airflow) {
		deviceType.airflow = data.airflow;
	}
	if (data.comments) {
		deviceType.comments = data.comments;
	}
	if (data.tags && data.tags.length > 0) {
		deviceType.rackarr.tags = data.tags;
	}

	return deviceType;
}

/**
 * Create a placed device referencing a device type by slug
 * @param device_type - Slug of the device type
 * @param position - U position in rack
 * @param face - Which face(s) the device occupies
 * @param name - Optional display name override
 * @returns A DeviceV02 object
 */
export function createDevice(
	device_type: string,
	position: number,
	face: DeviceFaceV02,
	name?: string
): DeviceV02 {
	const device: DeviceV02 = {
		device_type,
		position,
		face
	};

	if (name !== undefined) {
		device.name = name;
	}

	return device;
}

/**
 * Find a device type by slug
 * @param device_types - Array of device types to search
 * @param slug - Slug to find
 * @returns The device type or undefined if not found
 */
export function findDeviceType(
	device_types: DeviceTypeV02[],
	slug: string
): DeviceTypeV02 | undefined {
	return device_types.find((dt) => dt.slug === slug);
}

/**
 * Get the display name for a placed device
 * Priority: device.name > deviceType.model > deviceType.slug
 * @param device - The placed device
 * @param device_types - Array of device types for lookup
 * @returns The display name string
 */
export function getDeviceDisplayName(device: DeviceV02, device_types: DeviceTypeV02[]): string {
	// Use device name if set
	if (device.name) {
		return device.name;
	}

	// Look up the device type
	const deviceType = findDeviceType(device_types, device.device_type);

	if (deviceType) {
		// Use model if available
		if (deviceType.model) {
			return deviceType.model;
		}
	}

	// Fall back to slug
	return device.device_type;
}

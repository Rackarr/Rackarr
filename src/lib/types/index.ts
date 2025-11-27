/**
 * Rackarr Core Type Definitions
 * Based on spec.md data model
 */

/**
 * Device category types - 10 predefined categories
 */
export type DeviceCategory =
	| 'server'
	| 'network'
	| 'patch-panel'
	| 'power'
	| 'storage'
	| 'kvm'
	| 'av-media'
	| 'cooling'
	| 'blank'
	| 'other';

/**
 * Device in the library (template)
 * Can be placed multiple times in racks
 */
export interface Device {
	/** Unique identifier (UUID) */
	id: string;
	/** Display name */
	name: string;
	/** Height in rack units (1-42U) */
	height: number;
	/** Hex colour for display (e.g., '#4A90D9') */
	colour: string;
	/** Device category */
	category: DeviceCategory;
	/** Optional notes/description */
	notes?: string;
}

/**
 * A device placed in a rack
 * References a device from the library by ID
 */
export interface PlacedDevice {
	/** Reference to Device.id in the library */
	libraryId: string;
	/** Bottom U position (1-indexed, U1 is at the bottom) */
	position: number;
}

/**
 * A rack unit container
 */
export interface Rack {
	/** Unique identifier (UUID) */
	id: string;
	/** Display name */
	name: string;
	/** Height in rack units (1-100U) */
	height: number;
	/** Width in inches (fixed at 19 for v0.1) */
	width: number;
	/** Order position in row (0-indexed) */
	position: number;
	/** Devices placed in this rack */
	devices: PlacedDevice[];
}

/**
 * Layout settings
 */
export interface LayoutSettings {
	/** Current theme */
	theme: 'dark' | 'light';
}

/**
 * Complete layout structure - matches JSON schema from spec Section 10
 */
export interface Layout {
	/** Schema version */
	version: string;
	/** Layout name */
	name: string;
	/** Creation timestamp (ISO 8601) */
	created: string;
	/** Last modified timestamp (ISO 8601) */
	modified: string;
	/** Layout settings */
	settings: LayoutSettings;
	/** Device library - all available devices */
	deviceLibrary: Device[];
	/** Racks in this layout */
	racks: Rack[];
}

/**
 * Layout Migration Utilities
 * Handles migration of layouts from older versions to current version
 * Supports: 0.1.0 -> 0.3.0, 0.2.0 -> 0.3.0, 1.0 -> 0.3.0
 */

import type { Layout, Rack, PlacedDevice, LayoutSettings } from '$lib/types';
import { CURRENT_VERSION, DEFAULT_RACK_VIEW, DEFAULT_DEVICE_FACE } from '$lib/types/constants';

/** Default values for new v0.3.0 settings fields */
const DEFAULT_DISPLAY_MODE = 'label' as const;
const DEFAULT_SHOW_LABELS_ON_IMAGES = false;

/** Default values for new v0.3.0 rack fields */
const DEFAULT_FORM_FACTOR = '4-post-cabinet' as const;
const DEFAULT_DESC_UNITS = false;
const DEFAULT_STARTING_UNIT = 1;

/**
 * Migrate a layout from any version to the current version
 * Adds missing fields with appropriate defaults
 * Returns a new layout object (does not modify original)
 */
export function migrateLayout(layout: Layout): Layout {
	// Deep clone to avoid modifying original
	const migrated: Layout = JSON.parse(JSON.stringify(layout));

	// Update version
	migrated.version = CURRENT_VERSION;

	// Migrate settings (v0.1/v0.2 -> v0.3)
	migrated.settings = migrateSettings(migrated.settings);

	// Migrate racks
	migrated.racks = migrated.racks.map(migrateRack);

	return migrated;
}

/**
 * Migrate layout settings
 * Adds displayMode, showLabelsOnImages, and view if missing
 */
function migrateSettings(settings: LayoutSettings): LayoutSettings {
	const migratedSettings = { ...settings };

	// Add displayMode if missing (v0.1/v0.2 -> v0.3)
	if (!('displayMode' in migratedSettings)) {
		migratedSettings.displayMode = DEFAULT_DISPLAY_MODE;
	}

	// Add showLabelsOnImages if missing (v0.1/v0.2 -> v0.3)
	if (!('showLabelsOnImages' in migratedSettings)) {
		migratedSettings.showLabelsOnImages = DEFAULT_SHOW_LABELS_ON_IMAGES;
	}

	// Add view if missing (default global view setting)
	if (!('view' in migratedSettings)) {
		migratedSettings.view = DEFAULT_RACK_VIEW;
	}

	return migratedSettings;
}

/**
 * Migrate a single rack
 * Adds view property if missing, migrates all devices
 * Adds form_factor, desc_units, starting_unit if missing (v0.3)
 */
function migrateRack(rack: Rack): Rack {
	const migratedRack = { ...rack };

	// Add view property if missing (v0.1 -> v0.2)
	if (!('view' in migratedRack)) {
		migratedRack.view = DEFAULT_RACK_VIEW;
	}

	// Add form_factor if missing (v0.2 -> v0.3)
	if (!('form_factor' in migratedRack)) {
		migratedRack.form_factor = DEFAULT_FORM_FACTOR;
	}

	// Add desc_units if missing (v0.2 -> v0.3)
	if (!('desc_units' in migratedRack)) {
		migratedRack.desc_units = DEFAULT_DESC_UNITS;
	}

	// Add starting_unit if missing (v0.2 -> v0.3)
	if (!('starting_unit' in migratedRack)) {
		migratedRack.starting_unit = DEFAULT_STARTING_UNIT;
	}

	// Migrate all placed devices
	migratedRack.devices = rack.devices.map(migrateDevice);

	return migratedRack;
}

/**
 * Migrate a single placed device
 * Adds face property if missing
 */
function migrateDevice(device: PlacedDevice): PlacedDevice {
	const migratedDevice = { ...device };

	// Add face property if missing (v0.1 -> v0.2)
	if (!('face' in migratedDevice)) {
		migratedDevice.face = DEFAULT_DEVICE_FACE;
	}

	return migratedDevice;
}

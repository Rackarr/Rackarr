/**
 * v0.2 Layout Serialization and Factory Functions
 */

import type { LayoutV02, RackV02 } from '$lib/types/v02';
import type { FormFactor } from '$lib/types';
import { getStarterLibraryV02 } from '$lib/data/starterLibraryV02';

/**
 * Create a new empty v0.2 layout
 * @param name - Layout name (default: "Racky McRackface")
 * @returns New LayoutV02 object with starter device type library
 */
export function createLayoutV02(name: string = 'Racky McRackface'): LayoutV02 {
	return {
		version: '0.2.0',
		name,
		rack: createDefaultRack(name),
		device_types: getStarterLibraryV02(),
		settings: {
			display_mode: 'label',
			show_labels_on_images: false
		}
	};
}

/**
 * Create a default rack for a new layout
 * @param name - Rack name
 * @returns A default RackV02 with empty devices
 */
function createDefaultRack(name: string): RackV02 {
	return {
		name,
		height: 42,
		width: 19,
		desc_units: false,
		form_factor: '4-post-cabinet',
		starting_unit: 1,
		position: 0,
		devices: [],
		view: 'front' // Runtime only
	};
}

/**
 * Create a v0.2 rack with the given parameters
 * @param name - Rack name
 * @param height - Rack height in U
 * @param width - Rack width (10 or 19)
 * @param form_factor - Form factor
 * @param desc_units - Whether units are numbered top-down
 * @param starting_unit - First U number
 * @returns A new RackV02 object
 */
export function createRackV02(
	name: string,
	height: number,
	width: 10 | 19 = 19,
	form_factor: FormFactor = '4-post-cabinet',
	desc_units: boolean = false,
	starting_unit: number = 1
): RackV02 {
	return {
		name,
		height,
		width,
		desc_units,
		form_factor,
		starting_unit,
		position: 0,
		devices: [],
		view: 'front' // Runtime only
	};
}

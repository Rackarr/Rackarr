/**
 * Selection Store
 * Manages selection state for racks and devices using Svelte 5 runes
 */

// Selection types
type SelectionType = 'rack' | 'device' | null;

// Module-level state (using $state rune)
let selectedId = $state<string | null>(null);
let selectedType = $state<SelectionType>(null);
let selectedRackId = $state<string | null>(null);
let selectedDeviceIndex = $state<number | null>(null);

// Derived values (using $derived rune)
const hasSelection = $derived(selectedId !== null);
const isRackSelected = $derived(selectedType === 'rack');
const isDeviceSelected = $derived(selectedType === 'device');

/**
 * Reset the store to initial state (primarily for testing)
 */
export function resetSelectionStore(): void {
	selectedId = null;
	selectedType = null;
	selectedRackId = null;
	selectedDeviceIndex = null;
}

/**
 * Get access to the selection store
 * @returns Store object with state and actions
 */
export function getSelectionStore() {
	return {
		// State getters
		get selectedId() {
			return selectedId;
		},
		get selectedType() {
			return selectedType;
		},
		get selectedRackId() {
			return selectedRackId;
		},
		get selectedDeviceIndex() {
			return selectedDeviceIndex;
		},

		// Derived getters
		get hasSelection() {
			return hasSelection;
		},
		get isRackSelected() {
			return isRackSelected;
		},
		get isDeviceSelected() {
			return isDeviceSelected;
		},

		// Actions
		selectRack,
		selectDevice,
		clearSelection
	};
}

/**
 * Select a rack
 * @param rackId - ID of the rack to select
 */
function selectRack(rackId: string): void {
	selectedId = rackId;
	selectedType = 'rack';
	selectedRackId = null;
	selectedDeviceIndex = null;
}

/**
 * Select a device within a rack
 * @param rackId - ID of the rack containing the device
 * @param deviceIndex - Index of the device in the rack's devices array
 * @param deviceLibraryId - Library ID of the device
 */
function selectDevice(rackId: string, deviceIndex: number, deviceLibraryId: string): void {
	selectedId = deviceLibraryId;
	selectedType = 'device';
	selectedRackId = rackId;
	selectedDeviceIndex = deviceIndex;
}

/**
 * Clear the current selection
 */
function clearSelection(): void {
	selectedId = null;
	selectedType = null;
	selectedRackId = null;
	selectedDeviceIndex = null;
}

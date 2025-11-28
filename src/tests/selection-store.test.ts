import { describe, it, expect, beforeEach } from 'vitest';
import { getSelectionStore, resetSelectionStore } from '$lib/stores/selection.svelte';

describe('Selection Store', () => {
	beforeEach(() => {
		resetSelectionStore();
	});

	describe('initial state', () => {
		it('has no selection', () => {
			const store = getSelectionStore();
			expect(store.selectedId).toBeNull();
			expect(store.selectedType).toBeNull();
			expect(store.selectedRackId).toBeNull();
			expect(store.selectedDeviceIndex).toBeNull();
		});

		it('hasSelection returns false', () => {
			const store = getSelectionStore();
			expect(store.hasSelection).toBe(false);
		});

		it('isRackSelected returns false', () => {
			const store = getSelectionStore();
			expect(store.isRackSelected).toBe(false);
		});

		it('isDeviceSelected returns false', () => {
			const store = getSelectionStore();
			expect(store.isDeviceSelected).toBe(false);
		});
	});

	describe('selectRack', () => {
		it('sets selectedId and selectedType to rack', () => {
			const store = getSelectionStore();
			store.selectRack('rack-123');
			expect(store.selectedId).toBe('rack-123');
			expect(store.selectedType).toBe('rack');
		});

		it('clears previous device selection', () => {
			const store = getSelectionStore();
			store.selectDevice('rack-1', 0, 'device-123');
			expect(store.selectedType).toBe('device');

			store.selectRack('rack-2');
			expect(store.selectedType).toBe('rack');
			expect(store.selectedRackId).toBeNull();
			expect(store.selectedDeviceIndex).toBeNull();
		});

		it('hasSelection returns true when rack selected', () => {
			const store = getSelectionStore();
			store.selectRack('rack-123');
			expect(store.hasSelection).toBe(true);
		});

		it('isRackSelected returns true when rack selected', () => {
			const store = getSelectionStore();
			store.selectRack('rack-123');
			expect(store.isRackSelected).toBe(true);
		});

		it('isDeviceSelected returns false when rack selected', () => {
			const store = getSelectionStore();
			store.selectRack('rack-123');
			expect(store.isDeviceSelected).toBe(false);
		});
	});

	describe('selectDevice', () => {
		it('sets selectedId, selectedType, selectedRackId, and selectedDeviceIndex', () => {
			const store = getSelectionStore();
			store.selectDevice('rack-1', 5, 'device-123');
			expect(store.selectedId).toBe('device-123');
			expect(store.selectedType).toBe('device');
			expect(store.selectedRackId).toBe('rack-1');
			expect(store.selectedDeviceIndex).toBe(5);
		});

		it('clears previous rack selection', () => {
			const store = getSelectionStore();
			store.selectRack('rack-1');
			expect(store.selectedType).toBe('rack');

			store.selectDevice('rack-2', 0, 'device-123');
			expect(store.selectedType).toBe('device');
			expect(store.selectedId).toBe('device-123');
		});

		it('hasSelection returns true when device selected', () => {
			const store = getSelectionStore();
			store.selectDevice('rack-1', 0, 'device-123');
			expect(store.hasSelection).toBe(true);
		});

		it('isRackSelected returns false when device selected', () => {
			const store = getSelectionStore();
			store.selectDevice('rack-1', 0, 'device-123');
			expect(store.isRackSelected).toBe(false);
		});

		it('isDeviceSelected returns true when device selected', () => {
			const store = getSelectionStore();
			store.selectDevice('rack-1', 0, 'device-123');
			expect(store.isDeviceSelected).toBe(true);
		});
	});

	describe('clearSelection', () => {
		it('resets all selection state', () => {
			const store = getSelectionStore();
			store.selectDevice('rack-1', 0, 'device-123');
			expect(store.hasSelection).toBe(true);

			store.clearSelection();
			expect(store.selectedId).toBeNull();
			expect(store.selectedType).toBeNull();
			expect(store.selectedRackId).toBeNull();
			expect(store.selectedDeviceIndex).toBeNull();
		});

		it('hasSelection returns false after clearing', () => {
			const store = getSelectionStore();
			store.selectRack('rack-1');
			store.clearSelection();
			expect(store.hasSelection).toBe(false);
		});
	});

	describe('hasSelection derived', () => {
		it('returns true when rack selected', () => {
			const store = getSelectionStore();
			store.selectRack('rack-1');
			expect(store.hasSelection).toBe(true);
		});

		it('returns true when device selected', () => {
			const store = getSelectionStore();
			store.selectDevice('rack-1', 0, 'device-1');
			expect(store.hasSelection).toBe(true);
		});

		it('returns false when nothing selected', () => {
			const store = getSelectionStore();
			expect(store.hasSelection).toBe(false);
		});
	});
});

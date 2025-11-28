import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import DevicePalette from '$lib/components/DevicePalette.svelte';
import DevicePaletteItem from '$lib/components/DevicePaletteItem.svelte';
import { getLayoutStore, resetLayoutStore } from '$lib/stores/layout.svelte';
import { CATEGORY_COLOURS } from '$lib/types/constants';

describe('DevicePalette Component', () => {
	beforeEach(() => {
		resetLayoutStore();
	});

	describe('Device Rendering', () => {
		it('renders all devices from library', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addDeviceToLibrary({
				name: 'Server 1',
				height: 1,
				category: 'server',
				colour: CATEGORY_COLOURS.server
			});
			layoutStore.addDeviceToLibrary({
				name: 'Switch 1',
				height: 1,
				category: 'network',
				colour: CATEGORY_COLOURS.network
			});

			render(DevicePalette);

			expect(screen.getByText('Server 1')).toBeInTheDocument();
			expect(screen.getByText('Switch 1')).toBeInTheDocument();
		});

		it('shows starter library devices on initial load', () => {
			render(DevicePalette);

			// Starter library includes common devices
			expect(screen.getByText('1U Server')).toBeInTheDocument();
			expect(screen.getByText('1U Switch')).toBeInTheDocument();
		});
	});

	describe('Search', () => {
		it('has search input', () => {
			render(DevicePalette);

			const searchInput = screen.getByRole('searchbox');
			expect(searchInput).toBeInTheDocument();
		});

		it('filters devices by name', async () => {
			const layoutStore = getLayoutStore();
			layoutStore.addDeviceToLibrary({
				name: 'Server 1',
				height: 1,
				category: 'server',
				colour: CATEGORY_COLOURS.server
			});
			layoutStore.addDeviceToLibrary({
				name: 'Switch 1',
				height: 1,
				category: 'network',
				colour: CATEGORY_COLOURS.network
			});

			render(DevicePalette);

			const searchInput = screen.getByRole('searchbox');
			await fireEvent.input(searchInput, { target: { value: 'Server' } });

			expect(screen.getByText('Server 1')).toBeInTheDocument();
			expect(screen.queryByText('Switch 1')).not.toBeInTheDocument();
		});

		it('search is case-insensitive', async () => {
			const layoutStore = getLayoutStore();
			layoutStore.addDeviceToLibrary({
				name: 'Server 1',
				height: 1,
				category: 'server',
				colour: CATEGORY_COLOURS.server
			});

			render(DevicePalette);

			const searchInput = screen.getByRole('searchbox');
			await fireEvent.input(searchInput, { target: { value: 'server' } });

			expect(screen.getByText('Server 1')).toBeInTheDocument();
		});

		it('shows no results message when search has no matches', async () => {
			const layoutStore = getLayoutStore();
			layoutStore.addDeviceToLibrary({
				name: 'Server 1',
				height: 1,
				category: 'server',
				colour: CATEGORY_COLOURS.server
			});

			render(DevicePalette);

			const searchInput = screen.getByRole('searchbox');
			await fireEvent.input(searchInput, { target: { value: 'xyz' } });

			expect(screen.getByText(/no devices match/i)).toBeInTheDocument();
		});
	});

	describe('Category Grouping', () => {
		it('groups devices by category', () => {
			// Starter library already has devices in all 10 categories
			const { container } = render(DevicePalette);

			// Should show category headers for all 10 categories
			const categoryHeaders = container.querySelectorAll('.category-header');
			expect(categoryHeaders.length).toBe(10);
			// Servers and Network headers should exist
			expect(screen.getByText('Servers')).toBeInTheDocument();
			expect(screen.getByText('Network')).toBeInTheDocument();
		});
	});

	describe('Add Device Button', () => {
		it('has Add Device button', () => {
			render(DevicePalette);

			const addButton = screen.getByRole('button', { name: /add device/i });
			expect(addButton).toBeInTheDocument();
		});

		it('dispatches addDevice event when clicked', async () => {
			const handleAdd = vi.fn();

			render(DevicePalette, { props: { onadddevice: handleAdd } });

			const addButton = screen.getByRole('button', { name: /add device/i });
			await fireEvent.click(addButton);

			expect(handleAdd).toHaveBeenCalledTimes(1);
		});
	});
});

describe('DevicePaletteItem Component', () => {
	const mockDevice = {
		id: 'device-1',
		name: 'Test Server',
		height: 2,
		colour: '#4A90D9',
		category: 'server' as const
	};

	describe('Display', () => {
		it('displays device name', () => {
			render(DevicePaletteItem, { props: { device: mockDevice } });

			expect(screen.getByText('Test Server')).toBeInTheDocument();
		});

		it('displays height as badge', () => {
			render(DevicePaletteItem, { props: { device: mockDevice } });

			expect(screen.getByText('2U')).toBeInTheDocument();
		});

		it('shows colour swatch', () => {
			const { container } = render(DevicePaletteItem, { props: { device: mockDevice } });

			const swatch = container.querySelector('.colour-swatch');
			expect(swatch).toBeInTheDocument();
			// Browser converts hex to rgb, so check for either format
			const style = swatch?.getAttribute('style') ?? '';
			expect(style).toContain('background-color');
		});
	});

	describe('Interaction', () => {
		it('dispatches select event on click', async () => {
			const handleSelect = vi.fn();

			render(DevicePaletteItem, {
				props: { device: mockDevice, onselect: handleSelect }
			});

			const item = screen.getByText('Test Server').closest('.device-palette-item');
			await fireEvent.click(item!);

			expect(handleSelect).toHaveBeenCalledTimes(1);
		});
	});
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import Toolbar from '$lib/components/Toolbar.svelte';

describe('Toolbar Tooltips', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('Tooltip presence', () => {
		it('every toolbar button has a tooltip wrapper', async () => {
			const { container } = render(Toolbar, {
				props: {
					hasSelection: true,
					paletteOpen: false,
					theme: 'dark'
				}
			});

			// All ToolbarButtons should be wrapped in tooltip-wrapper
			const tooltipWrappers = container.querySelectorAll('.tooltip-wrapper');
			// New Rack, Save, Load, Export, Delete, Zoom Out, Zoom In, Fit All, Theme, Help = 10 buttons
			expect(tooltipWrappers.length).toBeGreaterThanOrEqual(10);
		});
	});

	describe('Tooltip content', () => {
		it('New Rack button shows correct tooltip text', async () => {
			const { container } = render(Toolbar, {
				props: { theme: 'dark' }
			});

			// Find the New Rack button's tooltip trigger
			const tooltipWrappers = container.querySelectorAll('.tooltip-wrapper');
			const newRackWrapper = Array.from(tooltipWrappers).find((wrapper) =>
				wrapper.querySelector('[aria-label="New Rack"]')
			);

			expect(newRackWrapper).toBeTruthy();

			const trigger = newRackWrapper!.querySelector('.tooltip-trigger');
			await fireEvent.mouseEnter(trigger!);
			vi.advanceTimersByTime(500);
			await tick();

			const tooltip = newRackWrapper!.querySelector('.tooltip');
			expect(tooltip).toHaveTextContent('New Rack');
		});

		it('Save button shows shortcut in tooltip', async () => {
			const { container } = render(Toolbar, {
				props: { theme: 'dark' }
			});

			const tooltipWrappers = container.querySelectorAll('.tooltip-wrapper');
			const saveWrapper = Array.from(tooltipWrappers).find((wrapper) =>
				wrapper.querySelector('[aria-label="Save"]')
			);

			expect(saveWrapper).toBeTruthy();

			const trigger = saveWrapper!.querySelector('.tooltip-trigger');
			await fireEvent.mouseEnter(trigger!);
			vi.advanceTimersByTime(500);
			await tick();

			const shortcut = saveWrapper!.querySelector('.tooltip-shortcut');
			expect(shortcut).toBeInTheDocument();
			expect(shortcut).toHaveTextContent('Ctrl+S');
		});

		it('Delete button shows shortcut in tooltip', async () => {
			const { container } = render(Toolbar, {
				props: { hasSelection: true, theme: 'dark' }
			});

			const tooltipWrappers = container.querySelectorAll('.tooltip-wrapper');
			const deleteWrapper = Array.from(tooltipWrappers).find((wrapper) =>
				wrapper.querySelector('[aria-label="Delete"]')
			);

			expect(deleteWrapper).toBeTruthy();

			const trigger = deleteWrapper!.querySelector('.tooltip-trigger');
			await fireEvent.mouseEnter(trigger!);
			vi.advanceTimersByTime(500);
			await tick();

			const shortcut = deleteWrapper!.querySelector('.tooltip-shortcut');
			expect(shortcut).toBeInTheDocument();
			expect(shortcut).toHaveTextContent('Del');
		});

		it('Zoom Out button shows shortcut in tooltip', async () => {
			const { container } = render(Toolbar, {
				props: { theme: 'dark' }
			});

			const tooltipWrappers = container.querySelectorAll('.tooltip-wrapper');
			const zoomOutWrapper = Array.from(tooltipWrappers).find((wrapper) =>
				wrapper.querySelector('[aria-label="Zoom Out"]')
			);

			expect(zoomOutWrapper).toBeTruthy();

			const trigger = zoomOutWrapper!.querySelector('.tooltip-trigger');
			await fireEvent.mouseEnter(trigger!);
			vi.advanceTimersByTime(500);
			await tick();

			const shortcut = zoomOutWrapper!.querySelector('.tooltip-shortcut');
			expect(shortcut).toBeInTheDocument();
			expect(shortcut).toHaveTextContent('-');
		});

		it('Help button shows shortcut in tooltip', async () => {
			const { container } = render(Toolbar, {
				props: { theme: 'dark' }
			});

			const tooltipWrappers = container.querySelectorAll('.tooltip-wrapper');
			const helpWrapper = Array.from(tooltipWrappers).find((wrapper) =>
				wrapper.querySelector('[aria-label="Help"]')
			);

			expect(helpWrapper).toBeTruthy();

			const trigger = helpWrapper!.querySelector('.tooltip-trigger');
			await fireEvent.mouseEnter(trigger!);
			vi.advanceTimersByTime(500);
			await tick();

			const shortcut = helpWrapper!.querySelector('.tooltip-shortcut');
			expect(shortcut).toBeInTheDocument();
			expect(shortcut).toHaveTextContent('?');
		});

		it('Theme toggle does not show shortcut', async () => {
			const { container } = render(Toolbar, {
				props: { theme: 'dark' }
			});

			const tooltipWrappers = container.querySelectorAll('.tooltip-wrapper');
			const themeWrapper = Array.from(tooltipWrappers).find((wrapper) =>
				wrapper.querySelector('[aria-label="Toggle Theme"]')
			);

			expect(themeWrapper).toBeTruthy();

			const trigger = themeWrapper!.querySelector('.tooltip-trigger');
			await fireEvent.mouseEnter(trigger!);
			vi.advanceTimersByTime(500);
			await tick();

			const shortcut = themeWrapper!.querySelector('.tooltip-shortcut');
			expect(shortcut).not.toBeInTheDocument();
		});
	});

	describe('Toolbar layout', () => {
		it('toolbar has visual dividers between button groups', () => {
			const { container } = render(Toolbar, {
				props: { theme: 'dark' }
			});

			const dividers = container.querySelectorAll('.separator, .toolbar-divider');
			expect(dividers.length).toBeGreaterThan(0);
		});

		it('zoom display shows percentage', () => {
			const { container } = render(Toolbar, {
				props: { theme: 'dark' }
			});

			const zoomDisplay = container.querySelector('.zoom-display');
			expect(zoomDisplay).toBeInTheDocument();
			expect(zoomDisplay?.textContent).toMatch(/%/);
		});
	});

	describe('Tooltip styling', () => {
		it('tooltips have consistent position', async () => {
			const { container } = render(Toolbar, {
				props: { theme: 'dark' }
			});

			const tooltipWrappers = container.querySelectorAll('.tooltip-wrapper');
			const firstWrapper = tooltipWrappers[0];

			const trigger = firstWrapper?.querySelector('.tooltip-trigger');
			await fireEvent.mouseEnter(trigger!);
			vi.advanceTimersByTime(500);
			await tick();

			const tooltip = firstWrapper?.querySelector('.tooltip');
			// Default position should be bottom for toolbar (below the buttons)
			expect(tooltip).toHaveClass('position-bottom');
		});
	});
});

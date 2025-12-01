import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import Tooltip from '$lib/components/Tooltip.svelte';

describe('Tooltip Component', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('Visibility', () => {
		it('tooltip is hidden by default', () => {
			const { container } = render(Tooltip, {
				props: { text: 'Test tooltip' }
			});

			const tooltip = container.querySelector('.tooltip');
			expect(tooltip).not.toBeInTheDocument();
		});

		it('tooltip appears after 500ms hover on trigger', async () => {
			const { container } = render(Tooltip, {
				props: { text: 'Test tooltip' }
			});

			const trigger = container.querySelector('.tooltip-trigger');
			expect(trigger).toBeInTheDocument();

			await fireEvent.mouseEnter(trigger!);

			// Tooltip should not be visible immediately
			expect(container.querySelector('.tooltip')).not.toBeInTheDocument();

			// Advance timers by 500ms
			vi.advanceTimersByTime(500);
			await tick();

			// Now tooltip should be visible
			const tooltip = container.querySelector('.tooltip');
			expect(tooltip).toBeInTheDocument();
		});

		it('tooltip hides on mouse leave', async () => {
			const { container } = render(Tooltip, {
				props: { text: 'Test tooltip' }
			});

			const trigger = container.querySelector('.tooltip-trigger');
			await fireEvent.mouseEnter(trigger!);
			vi.advanceTimersByTime(500);
			await tick();

			// Tooltip should be visible
			expect(container.querySelector('.tooltip')).toBeInTheDocument();

			// Mouse leave
			await fireEvent.mouseLeave(trigger!);
			await tick();

			// Tooltip should be hidden
			expect(container.querySelector('.tooltip')).not.toBeInTheDocument();
		});

		it('tooltip does not appear if mouse leaves before delay', async () => {
			const { container } = render(Tooltip, {
				props: { text: 'Test tooltip' }
			});

			const trigger = container.querySelector('.tooltip-trigger');
			await fireEvent.mouseEnter(trigger!);

			// Advance only 300ms (less than 500ms delay)
			vi.advanceTimersByTime(300);
			await tick();

			// Mouse leave before delay completes
			await fireEvent.mouseLeave(trigger!);
			await tick();

			// Advance remaining time
			vi.advanceTimersByTime(200);
			await tick();

			// Tooltip should not appear
			expect(container.querySelector('.tooltip')).not.toBeInTheDocument();
		});
	});

	describe('Content', () => {
		it('tooltip shows text content', async () => {
			const { container } = render(Tooltip, {
				props: { text: 'Add new rack' }
			});

			const trigger = container.querySelector('.tooltip-trigger');
			await fireEvent.mouseEnter(trigger!);
			vi.advanceTimersByTime(500);
			await tick();

			const tooltip = container.querySelector('.tooltip');
			expect(tooltip).toHaveTextContent('Add new rack');
		});

		it('tooltip shows keyboard shortcut when provided', async () => {
			const { container } = render(Tooltip, {
				props: { text: 'Add new rack', shortcut: 'Ctrl+N' }
			});

			const trigger = container.querySelector('.tooltip-trigger');
			await fireEvent.mouseEnter(trigger!);
			vi.advanceTimersByTime(500);
			await tick();

			const shortcut = container.querySelector('.tooltip-shortcut');
			expect(shortcut).toBeInTheDocument();
			expect(shortcut).toHaveTextContent('Ctrl+N');
		});

		it('tooltip does not show shortcut element when not provided', async () => {
			const { container } = render(Tooltip, {
				props: { text: 'Simple tooltip' }
			});

			const trigger = container.querySelector('.tooltip-trigger');
			await fireEvent.mouseEnter(trigger!);
			vi.advanceTimersByTime(500);
			await tick();

			const shortcut = container.querySelector('.tooltip-shortcut');
			expect(shortcut).not.toBeInTheDocument();
		});
	});

	describe('Positioning', () => {
		it('tooltip has top position class by default', async () => {
			const { container } = render(Tooltip, {
				props: { text: 'Test tooltip' }
			});

			const trigger = container.querySelector('.tooltip-trigger');
			await fireEvent.mouseEnter(trigger!);
			vi.advanceTimersByTime(500);
			await tick();

			const tooltip = container.querySelector('.tooltip');
			expect(tooltip).toHaveClass('position-top');
		});

		it('tooltip has bottom position class when specified', async () => {
			const { container } = render(Tooltip, {
				props: { text: 'Test tooltip', position: 'bottom' }
			});

			const trigger = container.querySelector('.tooltip-trigger');
			await fireEvent.mouseEnter(trigger!);
			vi.advanceTimersByTime(500);
			await tick();

			const tooltip = container.querySelector('.tooltip');
			expect(tooltip).toHaveClass('position-bottom');
		});

		it('tooltip has left position class when specified', async () => {
			const { container } = render(Tooltip, {
				props: { text: 'Test tooltip', position: 'left' }
			});

			const trigger = container.querySelector('.tooltip-trigger');
			await fireEvent.mouseEnter(trigger!);
			vi.advanceTimersByTime(500);
			await tick();

			const tooltip = container.querySelector('.tooltip');
			expect(tooltip).toHaveClass('position-left');
		});

		it('tooltip has right position class when specified', async () => {
			const { container } = render(Tooltip, {
				props: { text: 'Test tooltip', position: 'right' }
			});

			const trigger = container.querySelector('.tooltip-trigger');
			await fireEvent.mouseEnter(trigger!);
			vi.advanceTimersByTime(500);
			await tick();

			const tooltip = container.querySelector('.tooltip');
			expect(tooltip).toHaveClass('position-right');
		});
	});

	describe('Accessibility', () => {
		it('tooltip has role="tooltip"', async () => {
			const { container } = render(Tooltip, {
				props: { text: 'Test tooltip' }
			});

			const trigger = container.querySelector('.tooltip-trigger');
			await fireEvent.mouseEnter(trigger!);
			vi.advanceTimersByTime(500);
			await tick();

			const tooltip = container.querySelector('.tooltip');
			expect(tooltip).toHaveAttribute('role', 'tooltip');
		});

		it('tooltip has unique id for accessibility linking', async () => {
			const { container } = render(Tooltip, {
				props: { text: 'Test tooltip' }
			});

			const trigger = container.querySelector('.tooltip-trigger');
			await fireEvent.mouseEnter(trigger!);
			vi.advanceTimersByTime(500);
			await tick();

			const tooltip = container.querySelector('.tooltip');
			expect(tooltip).toHaveAttribute('id');
			expect(tooltip?.getAttribute('id')).toMatch(/^tooltip-/);
		});
	});

	describe('Focus behavior', () => {
		it('tooltip appears on focusin event (from child elements)', async () => {
			const { container } = render(Tooltip, {
				props: { text: 'Test tooltip' }
			});

			const trigger = container.querySelector('.tooltip-trigger');
			// Use focusIn to simulate focus bubbling from a child element
			await fireEvent.focusIn(trigger!);
			vi.advanceTimersByTime(500);
			await tick();

			const tooltip = container.querySelector('.tooltip');
			expect(tooltip).toBeInTheDocument();
		});

		it('tooltip hides on focusout event', async () => {
			const { container } = render(Tooltip, {
				props: { text: 'Test tooltip' }
			});

			const trigger = container.querySelector('.tooltip-trigger');
			await fireEvent.focusIn(trigger!);
			vi.advanceTimersByTime(500);
			await tick();

			expect(container.querySelector('.tooltip')).toBeInTheDocument();

			await fireEvent.focusOut(trigger!);
			await tick();

			expect(container.querySelector('.tooltip')).not.toBeInTheDocument();
		});
	});
});

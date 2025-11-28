import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { getToastStore, resetToastStore, type ToastType } from '$lib/stores/toast.svelte';
import ToastContainer from '$lib/components/ToastContainer.svelte';
import Toast from '$lib/components/Toast.svelte';

describe('Toast Store', () => {
	beforeEach(() => {
		resetToastStore();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('showToast', () => {
		it('adds toast to store', () => {
			const toastStore = getToastStore();

			toastStore.showToast('Test message', 'success');

			expect(toastStore.toasts.length).toBe(1);
			expect(toastStore.toasts[0]?.message).toBe('Test message');
		});

		it('assigns unique ID to each toast', () => {
			const toastStore = getToastStore();

			const id1 = toastStore.showToast('First', 'success');
			const id2 = toastStore.showToast('Second', 'error');

			expect(id1).not.toBe(id2);
		});

		it('sets correct type', () => {
			const toastStore = getToastStore();

			toastStore.showToast('Success', 'success');
			toastStore.showToast('Error', 'error');
			toastStore.showToast('Warning', 'warning');
			toastStore.showToast('Info', 'info');

			expect(toastStore.toasts[0]?.type).toBe('success');
			expect(toastStore.toasts[1]?.type).toBe('error');
			expect(toastStore.toasts[2]?.type).toBe('warning');
			expect(toastStore.toasts[3]?.type).toBe('info');
		});

		it('uses default duration of 5000ms', () => {
			const toastStore = getToastStore();

			toastStore.showToast('Test', 'info');

			expect(toastStore.toasts[0]?.duration).toBe(5000);
		});

		it('accepts custom duration', () => {
			const toastStore = getToastStore();

			toastStore.showToast('Test', 'info', 10000);

			expect(toastStore.toasts[0]?.duration).toBe(10000);
		});

		it('duration of 0 means permanent', () => {
			const toastStore = getToastStore();

			toastStore.showToast('Permanent', 'info', 0);

			expect(toastStore.toasts[0]?.duration).toBe(0);
		});
	});

	describe('dismissToast', () => {
		it('removes toast from store', () => {
			const toastStore = getToastStore();

			const id = toastStore.showToast('Test', 'success');
			expect(toastStore.toasts.length).toBe(1);

			toastStore.dismissToast(id);
			expect(toastStore.toasts.length).toBe(0);
		});

		it('only removes specified toast', () => {
			const toastStore = getToastStore();

			const id1 = toastStore.showToast('First', 'success');
			toastStore.showToast('Second', 'error');

			toastStore.dismissToast(id1);

			expect(toastStore.toasts.length).toBe(1);
			expect(toastStore.toasts[0]?.message).toBe('Second');
		});

		it('does nothing for non-existent ID', () => {
			const toastStore = getToastStore();

			toastStore.showToast('Test', 'success');
			toastStore.dismissToast('non-existent-id');

			expect(toastStore.toasts.length).toBe(1);
		});
	});

	describe('clearAllToasts', () => {
		it('removes all toasts', () => {
			const toastStore = getToastStore();

			toastStore.showToast('First', 'success');
			toastStore.showToast('Second', 'error');
			toastStore.showToast('Third', 'info');

			toastStore.clearAllToasts();

			expect(toastStore.toasts.length).toBe(0);
		});
	});

	describe('Auto-dismiss', () => {
		it('auto-dismisses toast after duration', async () => {
			const toastStore = getToastStore();

			toastStore.showToast('Auto-dismiss', 'success', 3000);
			expect(toastStore.toasts.length).toBe(1);

			// Advance time by 3 seconds
			await vi.advanceTimersByTimeAsync(3000);

			expect(toastStore.toasts.length).toBe(0);
		});

		it('does not auto-dismiss toast with duration 0', async () => {
			const toastStore = getToastStore();

			toastStore.showToast('Permanent', 'info', 0);
			expect(toastStore.toasts.length).toBe(1);

			// Advance time significantly
			await vi.advanceTimersByTimeAsync(60000);

			expect(toastStore.toasts.length).toBe(1);
		});
	});
});

describe('Toast Component', () => {
	const mockToast = {
		id: 'toast-1',
		message: 'Test message',
		type: 'success' as ToastType,
		duration: 5000
	};

	it('shows message text', () => {
		render(Toast, { props: { toast: mockToast } });

		expect(screen.getByText('Test message')).toBeInTheDocument();
	});

	it('has dismiss button', () => {
		render(Toast, { props: { toast: mockToast } });

		const dismissBtn = screen.getByRole('button', { name: /dismiss/i });
		expect(dismissBtn).toBeInTheDocument();
	});

	it('shows correct icon for success type', () => {
		render(Toast, { props: { toast: { ...mockToast, type: 'success' } } });

		// Check for success styling/icon
		const toast = screen.getByRole('alert');
		expect(toast).toHaveClass('toast--success');
	});

	it('shows correct icon for error type', () => {
		render(Toast, { props: { toast: { ...mockToast, type: 'error' } } });

		const toast = screen.getByRole('alert');
		expect(toast).toHaveClass('toast--error');
	});

	it('shows correct icon for warning type', () => {
		render(Toast, { props: { toast: { ...mockToast, type: 'warning' } } });

		const toast = screen.getByRole('alert');
		expect(toast).toHaveClass('toast--warning');
	});

	it('shows correct icon for info type', () => {
		render(Toast, { props: { toast: { ...mockToast, type: 'info' } } });

		const toast = screen.getByRole('alert');
		expect(toast).toHaveClass('toast--info');
	});
});

describe('ToastContainer Component', () => {
	beforeEach(() => {
		resetToastStore();
	});

	it('renders all toasts from store', () => {
		const toastStore = getToastStore();
		toastStore.showToast('First message', 'success');
		toastStore.showToast('Second message', 'error');

		render(ToastContainer);

		expect(screen.getByText('First message')).toBeInTheDocument();
		expect(screen.getByText('Second message')).toBeInTheDocument();
	});

	it('renders empty when no toasts', () => {
		const { container } = render(ToastContainer);

		const toasts = container.querySelectorAll('.toast');
		expect(toasts.length).toBe(0);
	});

	it('has aria-live attribute for accessibility', () => {
		const { container } = render(ToastContainer);

		const toastContainer = container.querySelector('.toast-container');
		expect(toastContainer).toHaveAttribute('aria-live', 'polite');
	});
});

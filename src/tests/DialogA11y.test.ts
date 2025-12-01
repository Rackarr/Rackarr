import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Dialog from '$lib/components/Dialog.svelte';

describe('Dialog Accessibility', () => {
	describe('ARIA attributes', () => {
		it('dialog has role="dialog"', () => {
			render(Dialog, {
				props: { open: true, title: 'Test Dialog' }
			});

			const dialog = screen.getByRole('dialog');
			expect(dialog).toBeInTheDocument();
		});

		it('dialog has aria-modal="true"', () => {
			render(Dialog, {
				props: { open: true, title: 'Test Dialog' }
			});

			const dialog = screen.getByRole('dialog');
			expect(dialog).toHaveAttribute('aria-modal', 'true');
		});

		it('dialog has aria-labelledby pointing to title', () => {
			render(Dialog, {
				props: { open: true, title: 'Test Dialog' }
			});

			const dialog = screen.getByRole('dialog');
			const labelledById = dialog.getAttribute('aria-labelledby');
			expect(labelledById).toBeTruthy();

			const title = document.getElementById(labelledById!);
			expect(title).toBeInTheDocument();
			expect(title?.textContent).toBe('Test Dialog');
		});

		it('close button has aria-label', () => {
			render(Dialog, {
				props: { open: true, title: 'Test Dialog' }
			});

			const closeButton = screen.getByRole('button', { name: /close/i });
			expect(closeButton).toHaveAttribute('aria-label', 'Close dialog');
		});
	});

	describe('Focus management', () => {
		it('focus moves to dialog on open', async () => {
			render(Dialog, {
				props: { open: true, title: 'Test Dialog' }
			});

			// Wait for effect to run
			await vi.waitFor(() => {
				const dialog = screen.getByRole('dialog');
				const focusedElement = document.activeElement;
				// Should focus something within the dialog
				expect(dialog.contains(focusedElement)).toBe(true);
			});
		});

		it('focus is trapped within dialog', async () => {
			const { container } = render(Dialog, {
				props: { open: true, title: 'Test Dialog' }
			});

			const dialog = container.querySelector('.dialog');
			expect(dialog).toBeInTheDocument();

			// The dialog should have trapFocus action
			// When Tab is pressed on last element, it should wrap to first
			const closeButton = screen.getByRole('button', { name: /close/i });
			closeButton.focus();

			const tabEvent = new KeyboardEvent('keydown', {
				key: 'Tab',
				bubbles: true,
				cancelable: true
			});

			dialog!.dispatchEvent(tabEvent);

			// Should prevent default (indicating focus trap is working)
			expect(tabEvent.defaultPrevented).toBe(true);
		});
	});

	describe('Keyboard interaction', () => {
		it('Escape key closes dialog', async () => {
			const closeMock = vi.fn();
			render(Dialog, {
				props: { open: true, title: 'Test Dialog', onclose: closeMock }
			});

			await fireEvent.keyDown(document, { key: 'Escape' });

			expect(closeMock).toHaveBeenCalled();
		});

		it('Escape key does not close when dialog is closed', async () => {
			const closeMock = vi.fn();
			render(Dialog, {
				props: { open: false, title: 'Test Dialog', onclose: closeMock }
			});

			await fireEvent.keyDown(document, { key: 'Escape' });

			expect(closeMock).not.toHaveBeenCalled();
		});
	});

	describe('Click outside', () => {
		it('clicking backdrop closes dialog', async () => {
			const closeMock = vi.fn();
			render(Dialog, {
				props: { open: true, title: 'Test Dialog', onclose: closeMock }
			});

			const backdrop = screen.getByTestId('dialog-backdrop');
			await fireEvent.click(backdrop);

			expect(closeMock).toHaveBeenCalled();
		});

		it('clicking inside dialog does not close it', async () => {
			const closeMock = vi.fn();
			render(Dialog, {
				props: { open: true, title: 'Test Dialog', onclose: closeMock }
			});

			const dialog = screen.getByRole('dialog');
			await fireEvent.click(dialog);

			expect(closeMock).not.toHaveBeenCalled();
		});
	});

	describe('Screen reader text', () => {
		it('decorative icons have aria-hidden', () => {
			render(Dialog, {
				props: { open: true, title: 'Test Dialog' }
			});

			const closeButton = screen.getByRole('button', { name: /close/i });
			const svg = closeButton.querySelector('svg');
			expect(svg).toHaveAttribute('aria-hidden', 'true');
		});
	});
});

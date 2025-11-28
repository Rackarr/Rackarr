import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Dialog from '$lib/components/Dialog.svelte';

describe('Dialog Component', () => {
	describe('Open state', () => {
		it('renders when open=true', () => {
			render(Dialog, { props: { open: true, title: 'Test Dialog' } });
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('is hidden when open=false', () => {
			render(Dialog, { props: { open: false, title: 'Test Dialog' } });
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});
	});

	describe('Title', () => {
		it('shows title', () => {
			render(Dialog, { props: { open: true, title: 'My Title' } });
			expect(screen.getByText('My Title')).toBeInTheDocument();
		});
	});

	describe('Slot content', () => {
		it('renders slot content', () => {
			const { container } = render(Dialog, {
				props: { open: true, title: 'Test' }
			});
			const content = container.querySelector('.dialog-content');
			expect(content).toBeInTheDocument();
		});
	});

	describe('Escape key', () => {
		it('dispatches close event on Escape key', async () => {
			const onClose = vi.fn();
			render(Dialog, { props: { open: true, title: 'Test', onclose: onClose } });

			await fireEvent.keyDown(document, { key: 'Escape' });
			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	describe('Backdrop click', () => {
		it('dispatches close event when backdrop clicked', async () => {
			const onClose = vi.fn();
			render(Dialog, { props: { open: true, title: 'Test', onclose: onClose } });

			const backdrop = screen.getByTestId('dialog-backdrop');
			await fireEvent.click(backdrop);
			expect(onClose).toHaveBeenCalledTimes(1);
		});

		it('does not close when clicking inside dialog', async () => {
			const onClose = vi.fn();
			render(Dialog, { props: { open: true, title: 'Test', onclose: onClose } });

			const dialogBox = screen.getByRole('dialog');
			await fireEvent.click(dialogBox);
			expect(onClose).not.toHaveBeenCalled();
		});
	});

	describe('Close button', () => {
		it('has a close button', () => {
			render(Dialog, { props: { open: true, title: 'Test' } });
			expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
		});

		it('dispatches close event when close button clicked', async () => {
			const onClose = vi.fn();
			render(Dialog, { props: { open: true, title: 'Test', onclose: onClose } });

			await fireEvent.click(screen.getByRole('button', { name: /close/i }));
			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	describe('Accessibility', () => {
		it('has correct ARIA attributes', () => {
			render(Dialog, { props: { open: true, title: 'Test Dialog' } });
			const dialog = screen.getByRole('dialog');
			expect(dialog).toHaveAttribute('aria-modal', 'true');
			expect(dialog).toHaveAttribute('aria-labelledby');
		});

		it('title has correct id for aria-labelledby', () => {
			render(Dialog, { props: { open: true, title: 'Test Dialog' } });
			const dialog = screen.getByRole('dialog');
			const labelledBy = dialog.getAttribute('aria-labelledby');
			const titleElement = document.getElementById(labelledBy!);
			expect(titleElement).toBeInTheDocument();
			expect(titleElement).toHaveTextContent('Test Dialog');
		});
	});

	describe('Width prop', () => {
		it('applies custom width when provided', () => {
			render(Dialog, { props: { open: true, title: 'Test', width: '500px' } });
			const dialog = screen.getByRole('dialog');
			expect(dialog).toHaveStyle({ width: '500px' });
		});

		it('uses default width when not provided', () => {
			render(Dialog, { props: { open: true, title: 'Test' } });
			const dialog = screen.getByRole('dialog');
			expect(dialog).toHaveStyle({ width: '400px' });
		});
	});
});

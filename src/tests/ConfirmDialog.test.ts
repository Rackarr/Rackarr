import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

describe('ConfirmDialog Component', () => {
	describe('Open state', () => {
		it('renders when open=true', () => {
			render(ConfirmDialog, {
				props: { open: true, title: 'Confirm', message: 'Are you sure?' }
			});
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('is hidden when open=false', () => {
			render(ConfirmDialog, {
				props: { open: false, title: 'Confirm', message: 'Are you sure?' }
			});
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});
	});

	describe('Content', () => {
		it('shows title and message', () => {
			render(ConfirmDialog, {
				props: { open: true, title: 'Delete Item', message: 'This action cannot be undone.' }
			});
			expect(screen.getByText('Delete Item')).toBeInTheDocument();
			expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
		});
	});

	describe('Buttons', () => {
		it('confirm button has correct label', () => {
			render(ConfirmDialog, {
				props: { open: true, title: 'Confirm', message: 'Are you sure?', confirmLabel: 'Yes' }
			});
			expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
		});

		it('uses default confirm label "Delete"', () => {
			render(ConfirmDialog, {
				props: { open: true, title: 'Confirm', message: 'Are you sure?' }
			});
			expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
		});

		it('cancel button has correct label', () => {
			render(ConfirmDialog, {
				props: { open: true, title: 'Confirm', message: 'Are you sure?', cancelLabel: 'No' }
			});
			expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
		});

		it('uses default cancel label "Cancel"', () => {
			render(ConfirmDialog, {
				props: { open: true, title: 'Confirm', message: 'Are you sure?' }
			});
			expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
		});
	});

	describe('Destructive mode', () => {
		it('shows red confirm button when destructive=true (default)', () => {
			render(ConfirmDialog, {
				props: { open: true, title: 'Confirm', message: 'Are you sure?' }
			});
			const confirmBtn = screen.getByRole('button', { name: 'Delete' });
			expect(confirmBtn).toHaveClass('btn-destructive');
		});

		it('shows primary confirm button when destructive=false', () => {
			render(ConfirmDialog, {
				props: { open: true, title: 'Confirm', message: 'Are you sure?', destructive: false }
			});
			const confirmBtn = screen.getByRole('button', { name: 'Delete' });
			expect(confirmBtn).toHaveClass('btn-primary');
		});
	});

	describe('Events', () => {
		it('confirm click dispatches confirm event', async () => {
			const onConfirm = vi.fn();
			render(ConfirmDialog, {
				props: { open: true, title: 'Confirm', message: 'Are you sure?', onconfirm: onConfirm }
			});

			const confirmBtn = screen.getByRole('button', { name: 'Delete' });
			await fireEvent.click(confirmBtn);

			expect(onConfirm).toHaveBeenCalledTimes(1);
		});

		it('cancel click dispatches cancel event', async () => {
			const onCancel = vi.fn();
			render(ConfirmDialog, {
				props: { open: true, title: 'Confirm', message: 'Are you sure?', oncancel: onCancel }
			});

			const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
			await fireEvent.click(cancelBtn);

			expect(onCancel).toHaveBeenCalledTimes(1);
		});
	});

	describe('Keyboard shortcuts', () => {
		it('Escape key dispatches cancel event', async () => {
			const onCancel = vi.fn();
			render(ConfirmDialog, {
				props: { open: true, title: 'Confirm', message: 'Are you sure?', oncancel: onCancel }
			});

			await fireEvent.keyDown(document, { key: 'Escape' });

			expect(onCancel).toHaveBeenCalledTimes(1);
		});

		it('Enter key dispatches confirm event', async () => {
			const onConfirm = vi.fn();
			render(ConfirmDialog, {
				props: { open: true, title: 'Confirm', message: 'Are you sure?', onconfirm: onConfirm }
			});

			await fireEvent.keyDown(document, { key: 'Enter' });

			expect(onConfirm).toHaveBeenCalledTimes(1);
		});
	});
});

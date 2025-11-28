import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ExportDialog from '$lib/components/ExportDialog.svelte';
import type { Rack } from '$lib/types';

describe('ExportDialog', () => {
	const mockRacks: Rack[] = [
		{
			id: 'rack-1',
			name: 'Rack 1',
			height: 42,
			width: 19,
			position: 0,
			devices: []
		},
		{
			id: 'rack-2',
			name: 'Rack 2',
			height: 24,
			width: 19,
			position: 1,
			devices: []
		}
	];

	describe('Dialog Visibility', () => {
		it('renders when open=true', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, selectedRackId: null }
			});

			expect(screen.getByRole('dialog')).toBeInTheDocument();
			// Check for title (heading element)
			expect(screen.getByRole('heading', { name: /export/i })).toBeInTheDocument();
		});

		it('hidden when open=false', () => {
			render(ExportDialog, {
				props: { open: false, racks: mockRacks, selectedRackId: null }
			});

			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});
	});

	describe('Format Options', () => {
		it('shows all format options', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, selectedRackId: null }
			});

			const formatSelect = screen.getByLabelText(/format/i);
			expect(formatSelect).toBeInTheDocument();

			// Check all options exist
			expect(screen.getByRole('option', { name: /png/i })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /jpeg/i })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /svg/i })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /pdf/i })).toBeInTheDocument();
		});

		it('defaults to PNG format', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, selectedRackId: null }
			});

			const formatSelect = screen.getByLabelText(/format/i) as HTMLSelectElement;
			expect(formatSelect.value).toBe('png');
		});
	});

	describe('Scope Options', () => {
		it('shows scope dropdown with all racks option', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, selectedRackId: null }
			});

			const scopeSelect = screen.getByLabelText(/scope/i);
			expect(scopeSelect).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /all racks/i })).toBeInTheDocument();
		});

		it('selected rack option disabled when no rack selected', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, selectedRackId: null }
			});

			const selectedOption = screen.getByRole('option', { name: /selected rack/i });
			expect(selectedOption).toBeDisabled();
		});

		it('selected rack option enabled when rack is selected', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, selectedRackId: 'rack-1' }
			});

			const selectedOption = screen.getByRole('option', { name: /selected rack/i });
			expect(selectedOption).not.toBeDisabled();
		});
	});

	describe('Include Options', () => {
		it('shows include rack names checkbox (default checked)', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, selectedRackId: null }
			});

			const checkbox = screen.getByLabelText(/include rack names/i) as HTMLInputElement;
			expect(checkbox).toBeInTheDocument();
			expect(checkbox.checked).toBe(true);
		});

		it('shows include legend checkbox (default unchecked)', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, selectedRackId: null }
			});

			const checkbox = screen.getByLabelText(/include legend/i) as HTMLInputElement;
			expect(checkbox).toBeInTheDocument();
			expect(checkbox.checked).toBe(false);
		});
	});

	describe('Background Options', () => {
		it('shows background dropdown with dark, light options', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, selectedRackId: null }
			});

			const bgSelect = screen.getByLabelText(/background/i);
			expect(bgSelect).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /dark/i })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: /light/i })).toBeInTheDocument();
		});

		it('transparent option only enabled for SVG format', async () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, selectedRackId: null }
			});

			// Default is PNG - transparent should be disabled
			const transparentOption = screen.getByRole('option', { name: /transparent/i });
			expect(transparentOption).toBeDisabled();

			// Change to SVG format
			const formatSelect = screen.getByLabelText(/format/i);
			await fireEvent.change(formatSelect, { target: { value: 'svg' } });

			// Now transparent should be enabled
			expect(transparentOption).not.toBeDisabled();
		});
	});

	describe('Export Action', () => {
		it('export button dispatches event with options', async () => {
			const onExport = vi.fn();

			render(ExportDialog, {
				props: {
					open: true,
					racks: mockRacks,
					selectedRackId: null,
					onexport: (e: CustomEvent) => onExport(e.detail)
				}
			});

			const exportButton = screen.getByRole('button', { name: /^export$/i });
			await fireEvent.click(exportButton);

			expect(onExport).toHaveBeenCalledTimes(1);
			expect(onExport).toHaveBeenCalledWith({
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark'
			});
		});

		it('export button includes selected options', async () => {
			const onExport = vi.fn();

			render(ExportDialog, {
				props: {
					open: true,
					racks: mockRacks,
					selectedRackId: 'rack-1',
					onexport: (e: CustomEvent) => onExport(e.detail)
				}
			});

			// Change format to SVG
			const formatSelect = screen.getByLabelText(/format/i);
			await fireEvent.change(formatSelect, { target: { value: 'svg' } });

			// Change scope to selected
			const scopeSelect = screen.getByLabelText(/scope/i);
			await fireEvent.change(scopeSelect, { target: { value: 'selected' } });

			// Toggle legend on
			const legendCheckbox = screen.getByLabelText(/include legend/i);
			await fireEvent.click(legendCheckbox);

			// Change background to transparent
			const bgSelect = screen.getByLabelText(/background/i);
			await fireEvent.change(bgSelect, { target: { value: 'transparent' } });

			const exportButton = screen.getByRole('button', { name: /^export$/i });
			await fireEvent.click(exportButton);

			expect(onExport).toHaveBeenCalledWith({
				format: 'svg',
				scope: 'selected',
				includeNames: true,
				includeLegend: true,
				background: 'transparent'
			});
		});
	});

	describe('Cancel Action', () => {
		it('cancel button dispatches cancel event', async () => {
			const onCancel = vi.fn();

			render(ExportDialog, {
				props: {
					open: true,
					racks: mockRacks,
					selectedRackId: null,
					oncancel: onCancel
				}
			});

			const cancelButton = screen.getByRole('button', { name: /cancel/i });
			await fireEvent.click(cancelButton);

			expect(onCancel).toHaveBeenCalledTimes(1);
		});

		it('escape key dispatches cancel event', async () => {
			const onCancel = vi.fn();

			render(ExportDialog, {
				props: {
					open: true,
					racks: mockRacks,
					selectedRackId: null,
					oncancel: onCancel
				}
			});

			await fireEvent.keyDown(window, { key: 'Escape' });

			expect(onCancel).toHaveBeenCalledTimes(1);
		});
	});

	describe('Export disabled state', () => {
		it('export button disabled when no racks', () => {
			render(ExportDialog, {
				props: { open: true, racks: [], selectedRackId: null }
			});

			const exportButton = screen.getByRole('button', { name: /^export$/i });
			expect(exportButton).toBeDisabled();
		});

		it('export button enabled when racks exist', () => {
			render(ExportDialog, {
				props: { open: true, racks: mockRacks, selectedRackId: null }
			});

			const exportButton = screen.getByRole('button', { name: /^export$/i });
			expect(exportButton).not.toBeDisabled();
		});
	});
});

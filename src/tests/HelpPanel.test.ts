import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import HelpPanel from '$lib/components/HelpPanel.svelte';
import { VERSION } from '$lib/version';

describe('HelpPanel', () => {
	describe('Visibility', () => {
		it('renders when open=true', () => {
			render(HelpPanel, { props: { open: true } });

			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('hidden when open=false', () => {
			render(HelpPanel, { props: { open: false } });

			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});
	});

	describe('App Information', () => {
		it('shows app name', () => {
			render(HelpPanel, { props: { open: true } });

			expect(screen.getByText('Rackarr')).toBeInTheDocument();
		});

		it('shows version number', () => {
			render(HelpPanel, { props: { open: true } });

			expect(screen.getByText(new RegExp(VERSION))).toBeInTheDocument();
		});
	});

	describe('Keyboard Shortcuts', () => {
		it('shows shortcut categories', () => {
			render(HelpPanel, { props: { open: true } });

			expect(screen.getByText('General')).toBeInTheDocument();
			expect(screen.getByText('Editing')).toBeInTheDocument();
			expect(screen.getByText('File')).toBeInTheDocument();
		});

		it('lists common shortcuts', () => {
			render(HelpPanel, { props: { open: true } });

			// Check for some key shortcuts
			expect(screen.getByText('Escape')).toBeInTheDocument();
			expect(screen.getByText('Delete')).toBeInTheDocument();
		});

		it('shows Ctrl/Cmd shortcuts', () => {
			render(HelpPanel, { props: { open: true } });

			// Should show save shortcut (Ctrl/Cmd + S)
			expect(screen.getByText('Ctrl/Cmd + S')).toBeInTheDocument();
		});
	});

	describe('Quick Links', () => {
		it('shows Project link with GitHub logo', () => {
			render(HelpPanel, { props: { open: true } });

			const projectLink = screen.getByRole('link', { name: /project/i });
			expect(projectLink).toBeInTheDocument();
		});

		it('Project link points to GitHub repository', () => {
			render(HelpPanel, { props: { open: true } });

			const projectLink = screen.getByRole('link', { name: /project/i });
			expect(projectLink.getAttribute('href')).toBe('https://github.com/rackarr/rackarr');
		});

		it('shows Report Bug link', () => {
			render(HelpPanel, { props: { open: true } });

			const bugLink = screen.getByRole('link', { name: /report bug/i });
			expect(bugLink).toBeInTheDocument();
		});

		it('Report Bug link pre-fills browser info', () => {
			render(HelpPanel, { props: { open: true } });

			const bugLink = screen.getByRole('link', { name: /report bug/i });
			const href = bugLink.getAttribute('href');
			expect(href).toContain('template=bug-report.yml');
			expect(href).toContain('browser=');
			// URLSearchParams encodes spaces as + not %20
			expect(href).toContain(`Rackarr+v${VERSION}`);
		});

		it('shows Request Feature link', () => {
			render(HelpPanel, { props: { open: true } });

			const featureLink = screen.getByRole('link', { name: /request feature/i });
			expect(featureLink).toBeInTheDocument();
		});

		it('Request Feature link uses correct template', () => {
			render(HelpPanel, { props: { open: true } });

			const featureLink = screen.getByRole('link', { name: /request feature/i });
			expect(featureLink.getAttribute('href')).toContain('template=feature-request.yml');
		});

		it('all quick links open in new tab', () => {
			render(HelpPanel, { props: { open: true } });

			const projectLink = screen.getByRole('link', { name: /project/i });
			const bugLink = screen.getByRole('link', { name: /report bug/i });
			const featureLink = screen.getByRole('link', { name: /request feature/i });

			expect(projectLink.getAttribute('target')).toBe('_blank');
			expect(bugLink.getAttribute('target')).toBe('_blank');
			expect(featureLink.getAttribute('target')).toBe('_blank');
		});

		it('all quick links have rel="noopener noreferrer" for security', () => {
			render(HelpPanel, { props: { open: true } });

			const projectLink = screen.getByRole('link', { name: /project/i });
			const bugLink = screen.getByRole('link', { name: /report bug/i });
			const featureLink = screen.getByRole('link', { name: /request feature/i });

			expect(projectLink.getAttribute('rel')).toContain('noopener');
			expect(bugLink.getAttribute('rel')).toContain('noopener');
			expect(featureLink.getAttribute('rel')).toContain('noopener');
		});
	});

	describe('Close Actions', () => {
		it('escape key dispatches close event', async () => {
			const onClose = vi.fn();

			render(HelpPanel, {
				props: { open: true, onclose: onClose }
			});

			await fireEvent.keyDown(window, { key: 'Escape' });

			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});
});

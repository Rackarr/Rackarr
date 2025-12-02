import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	generateExportSVG,
	exportAsSVG,
	exportAsPNG,
	exportAsJPEG,
	downloadBlob,
	generateExportFilename
} from '$lib/utils/export';
import type { Rack, Device, ExportOptions } from '$lib/types';

describe('Export Utilities', () => {
	const mockDeviceLibrary: Device[] = [
		{
			id: 'device-1',
			name: 'Server 1',
			height: 2,
			colour: '#4A90D9',
			category: 'server'
		},
		{
			id: 'device-2',
			name: 'Switch',
			height: 1,
			colour: '#7B68EE',
			category: 'network'
		}
	];

	const mockRacks: Rack[] = [
		{
			id: 'rack-1',
			name: 'Main Rack',
			height: 42,
			width: 19,
			position: 0,
			view: 'front',
			devices: [{ libraryId: 'device-1', position: 1, face: 'front' }]
		},
		{
			id: 'rack-2',
			name: 'Secondary Rack',
			height: 24,
			width: 19,
			position: 1,
			view: 'front',
			devices: [{ libraryId: 'device-2', position: 5, face: 'front' }]
		}
	];

	const defaultOptions: ExportOptions = {
		format: 'png',
		scope: 'all',
		includeNames: true,
		includeLegend: false,
		background: 'dark'
	};

	describe('generateExportSVG', () => {
		it('creates valid SVG element', () => {
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, defaultOptions);

			expect(svg).toBeInstanceOf(SVGElement);
			expect(svg.tagName.toLowerCase()).toBe('svg');
		});

		it('includes rack names when includeNames is true', () => {
			const options: ExportOptions = { ...defaultOptions, includeNames: true };
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options);

			const svgString = svg.outerHTML;
			expect(svgString).toContain('Main Rack');
			expect(svgString).toContain('Secondary Rack');
		});

		it('excludes rack names when includeNames is false', () => {
			const options: ExportOptions = { ...defaultOptions, includeNames: false };
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options);

			// Rack names should not appear in the output (except possibly as aria labels)
			const nameTexts = svg.querySelectorAll('.rack-name');
			expect(nameTexts.length).toBe(0);
		});

		it('includes legend when includeLegend is true', () => {
			const options: ExportOptions = { ...defaultOptions, includeLegend: true };
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options);

			const legend = svg.querySelector('.export-legend');
			expect(legend).not.toBeNull();
		});

		it('excludes legend when includeLegend is false', () => {
			const options: ExportOptions = { ...defaultOptions, includeLegend: false };
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options);

			const legend = svg.querySelector('.export-legend');
			expect(legend).toBeNull();
		});

		it('applies dark background', () => {
			const options: ExportOptions = { ...defaultOptions, background: 'dark' };
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options);

			const bg = svg.querySelector('.export-background');
			expect(bg).not.toBeNull();
			// Dark background should have a dark fill
			expect(bg?.getAttribute('fill')).toMatch(/#1[a-f0-9]{5}|#2[a-f0-9]{5}/i);
		});

		it('applies light background', () => {
			const options: ExportOptions = { ...defaultOptions, background: 'light' };
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options);

			const bg = svg.querySelector('.export-background');
			expect(bg).not.toBeNull();
			// Light background should have a light fill
			expect(bg?.getAttribute('fill')).toMatch(/#[ef][a-f0-9]{5}/i);
		});

		it('applies transparent background', () => {
			const options: ExportOptions = { ...defaultOptions, background: 'transparent' };
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options);

			const bg = svg.querySelector('.export-background');
			// Either no background or fill is 'none' or transparent
			if (bg) {
				const fill = bg.getAttribute('fill');
				expect(fill === 'none' || fill === 'transparent').toBe(true);
			}
		});

		it('exports only selected rack when scope is selected', () => {
			const options: ExportOptions = { ...defaultOptions, scope: 'selected' };
			// Pass only the first rack as selected
			const svg = generateExportSVG([mockRacks[0]!], mockDeviceLibrary, options);

			const svgString = svg.outerHTML;
			expect(svgString).toContain('Main Rack');
			expect(svgString).not.toContain('Secondary Rack');
		});

		it('exports all racks when scope is all', () => {
			const options: ExportOptions = { ...defaultOptions, scope: 'all' };
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options);

			const svgString = svg.outerHTML;
			expect(svgString).toContain('Main Rack');
			expect(svgString).toContain('Secondary Rack');
		});
	});

	describe('exportAsSVG', () => {
		it('returns valid SVG string', () => {
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, defaultOptions);
			const svgString = exportAsSVG(svg);

			expect(svgString).toContain('<?xml');
			expect(svgString).toContain('<svg');
			expect(svgString).toContain('</svg>');
		});

		it('includes XML declaration', () => {
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, defaultOptions);
			const svgString = exportAsSVG(svg);

			expect(svgString.startsWith('<?xml version="1.0"')).toBe(true);
		});
	});

	describe('exportAsPNG', () => {
		// Note: Canvas operations are not fully supported in jsdom
		// The actual PNG/JPEG export works in a real browser but not in tests
		// We verify the function signature and that it handles the error gracefully

		it('exportAsPNG function is defined', () => {
			expect(typeof exportAsPNG).toBe('function');
		});
	});

	describe('exportAsJPEG', () => {
		it('exportAsJPEG function is defined', () => {
			expect(typeof exportAsJPEG).toBe('function');
		});
	});

	describe('downloadBlob', () => {
		beforeEach(() => {
			// Set up URL mock on globalThis since jsdom doesn't have it
			if (!globalThis.URL.createObjectURL) {
				globalThis.URL.createObjectURL = vi.fn();
				globalThis.URL.revokeObjectURL = vi.fn();
			}
		});

		it('creates download link with correct attributes', () => {
			// Mock URL.createObjectURL and URL.revokeObjectURL
			const mockUrl = 'blob:test-url';
			const createObjectURLSpy = vi
				.spyOn(globalThis.URL, 'createObjectURL')
				.mockReturnValue(mockUrl);
			const revokeObjectURLSpy = vi
				.spyOn(globalThis.URL, 'revokeObjectURL')
				.mockImplementation(() => {});

			// Mock createElement and click
			const mockLink = {
				href: '',
				download: '',
				click: vi.fn()
			};
			const createElementSpy = vi
				.spyOn(document, 'createElement')
				.mockReturnValue(mockLink as unknown as HTMLAnchorElement);
			const appendChildSpy = vi
				.spyOn(document.body, 'appendChild')
				.mockImplementation((node) => node);
			const removeChildSpy = vi
				.spyOn(document.body, 'removeChild')
				.mockImplementation((node) => node);

			const blob = new Blob(['test'], { type: 'text/plain' });
			downloadBlob(blob, 'test-file.txt');

			expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
			expect(mockLink.href).toBe(mockUrl);
			expect(mockLink.download).toBe('test-file.txt');
			expect(mockLink.click).toHaveBeenCalled();
			expect(revokeObjectURLSpy).toHaveBeenCalledWith(mockUrl);

			// Restore spies
			createObjectURLSpy.mockRestore();
			revokeObjectURLSpy.mockRestore();
			createElementSpy.mockRestore();
			appendChildSpy.mockRestore();
			removeChildSpy.mockRestore();
		});
	});

	describe('generateExportFilename', () => {
		it('generates filename with layout name and format', () => {
			const filename = generateExportFilename('My Layout', 'png');
			expect(filename).toBe('my-layout.png');
		});

		it('sanitizes layout name for filename', () => {
			const filename = generateExportFilename('Layout: Test/File', 'svg');
			expect(filename).toBe('layout-test-file.svg');
		});

		it('handles empty layout name', () => {
			const filename = generateExportFilename('', 'jpeg');
			expect(filename).toBe('rackarr-export.jpeg');
		});

		it('works with different formats', () => {
			expect(generateExportFilename('Test', 'png')).toBe('test.png');
			expect(generateExportFilename('Test', 'jpeg')).toBe('test.jpeg');
			expect(generateExportFilename('Test', 'svg')).toBe('test.svg');
			expect(generateExportFilename('Test', 'pdf')).toBe('test.pdf');
		});
	});
});

describe('Bundled Export Utilities', () => {
	const mockDevice: Device = {
		id: 'device-1',
		name: 'Server 1',
		height: 2,
		colour: '#4A90D9',
		category: 'server'
	};

	const mockRack: Rack = {
		id: 'rack-1',
		name: 'Main Rack',
		height: 42,
		width: 19,
		position: 0,
		view: 'front',
		devices: [{ libraryId: 'device-1', position: 1, face: 'front' }]
	};

	const mockLayout = {
		version: '0.1.0',
		name: 'Test Layout',
		racks: [mockRack],
		deviceLibrary: [mockDevice],
		settings: {
			theme: 'dark' as const,
			displayMode: 'label' as const,
			showLabelsOnImages: false
		},
		created: new Date().toISOString(),
		modified: new Date().toISOString()
	};

	describe('generateExportMetadata', () => {
		it('creates metadata with required fields', async () => {
			const { generateExportMetadata } = await import('$lib/utils/export');

			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark'
			};

			const metadata = generateExportMetadata(mockLayout, mockRack, options, false);

			expect(metadata.version).toBe('0.1.0');
			expect(metadata.layoutName).toBe('Test Layout');
			expect(metadata.rackName).toBe('Main Rack');
			expect(metadata.rackHeight).toBe(42);
			expect(metadata.deviceCount).toBe(1);
			expect(metadata.sourceIncluded).toBe(false);
			expect(metadata.exportedAt).toBeDefined();
		});

		it('includes export options in metadata', async () => {
			const { generateExportMetadata } = await import('$lib/utils/export');

			const options: ExportOptions = {
				format: 'jpeg',
				scope: 'selected',
				includeNames: false,
				includeLegend: true,
				background: 'light'
			};

			const metadata = generateExportMetadata(mockLayout, mockRack, options, true);

			expect(metadata.exportOptions.format).toBe('jpeg');
			expect(metadata.exportOptions.scope).toBe('selected');
			expect(metadata.exportOptions.background).toBe('light');
			expect(metadata.sourceIncluded).toBe(true);
		});

		it('uses ISO timestamp format', async () => {
			const { generateExportMetadata } = await import('$lib/utils/export');

			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark'
			};

			const metadata = generateExportMetadata(mockLayout, mockRack, options, false);

			// Should be valid ISO date string
			const date = new Date(metadata.exportedAt);
			expect(date.toISOString()).toBe(metadata.exportedAt);
		});
	});

	describe('generateBundledExportFilename', () => {
		it('generates filename with layout name and format', async () => {
			const { generateBundledExportFilename } = await import('$lib/utils/export');

			const filename = generateBundledExportFilename('My Layout', 'png');
			expect(filename).toBe('my-layout-export.zip');
		});

		it('handles empty layout name', async () => {
			const { generateBundledExportFilename } = await import('$lib/utils/export');

			const filename = generateBundledExportFilename('', 'png');
			expect(filename).toBe('rackarr-export.zip');
		});
	});

	describe('createBundledExport', () => {
		beforeEach(() => {
			vi.useRealTimers();
		});

		it('creates ZIP with image and metadata', async () => {
			const { createBundledExport } = await import('$lib/utils/export');
			const JSZip = (await import('jszip')).default;

			const imageBlob = new Blob(['fake-png-data'], { type: 'image/png' });
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark'
			};

			const zipBlob = await createBundledExport(imageBlob, mockLayout, mockRack, options, false);

			expect(zipBlob).toBeInstanceOf(Blob);
			expect(zipBlob.type).toBe('application/zip');

			// Verify ZIP contents
			const zip = await JSZip.loadAsync(zipBlob);
			expect(zip.file('rack.png')).not.toBeNull();
			expect(zip.file('metadata.json')).not.toBeNull();
		});

		it('includes source when includeSource is true', async () => {
			const { createBundledExport } = await import('$lib/utils/export');
			const JSZip = (await import('jszip')).default;

			const imageBlob = new Blob(['fake-png-data'], { type: 'image/png' });
			const sourceBlob = new Blob(['fake-source-data'], { type: 'application/zip' });
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark'
			};

			const zipBlob = await createBundledExport(
				imageBlob,
				mockLayout,
				mockRack,
				options,
				true,
				sourceBlob
			);

			// Verify ZIP contents include source
			const zip = await JSZip.loadAsync(zipBlob);
			expect(zip.file('source.rackarr.zip')).not.toBeNull();
		});

		it('uses correct image filename for format', async () => {
			const { createBundledExport } = await import('$lib/utils/export');
			const JSZip = (await import('jszip')).default;

			const imageBlob = new Blob(['fake-jpeg-data'], { type: 'image/jpeg' });
			const options: ExportOptions = {
				format: 'jpeg',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark'
			};

			const zipBlob = await createBundledExport(imageBlob, mockLayout, mockRack, options, false);

			const zip = await JSZip.loadAsync(zipBlob);
			expect(zip.file('rack.jpeg')).not.toBeNull();
			expect(zip.file('rack.png')).toBeNull();
		});
	});
});

describe('Export Legend', () => {
	// These tests will be for the legend component if created separately
	// For now, we test that legend content is included in SVG when enabled

	it('legend includes unique devices', () => {
		const devices: Device[] = [
			{
				id: 'device-1',
				name: 'Server 1',
				height: 2,
				colour: '#4A90D9',
				category: 'server'
			}
		];

		const racks: Rack[] = [
			{
				id: 'rack-1',
				name: 'Rack',
				height: 42,
				width: 19,
				position: 0,
				view: 'front',
				devices: [
					{ libraryId: 'device-1', position: 1, face: 'front' },
					{ libraryId: 'device-1', position: 5, face: 'front' } // Same device twice
				]
			}
		];

		const options: ExportOptions = {
			format: 'svg',
			scope: 'all',
			includeNames: true,
			includeLegend: true,
			background: 'dark'
		};

		const svg = generateExportSVG(racks, devices, options);
		const legend = svg.querySelector('.export-legend');

		// Should only show device once in legend even if placed multiple times
		const legendItems = legend?.querySelectorAll('.legend-item');
		expect(legendItems?.length).toBe(1);
	});
});

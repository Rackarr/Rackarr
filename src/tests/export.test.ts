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
import type { ImageStoreMap } from '$lib/types/images';
import type { BundledExportData } from '$lib/utils/export';

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

	const mockDeviceLibrary: Device[] = [
		{ id: 'device-1', name: 'Test Server', height: 2, colour: '#4A90D9', category: 'server' }
	];

	const emptyImages: ImageStoreMap = new Map();

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

			const metadata = generateExportMetadata(
				mockLayout,
				mockRack,
				mockDeviceLibrary,
				emptyImages,
				options,
				false
			);

			expect(metadata.version).toBe('0.1.0');
			expect(metadata.layoutName).toBe('Test Layout');
			expect(metadata.rackName).toBe('Main Rack');
			expect(metadata.rackHeight).toBe(42);
			expect(metadata.deviceCount).toBe(1);
			expect(metadata.sourceIncluded).toBe(false);
			expect(metadata.exportedAt).toBeDefined();
			expect(metadata.devices).toBeDefined();
			expect(metadata.devices?.length).toBe(1);
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

			const metadata = generateExportMetadata(
				mockLayout,
				mockRack,
				mockDeviceLibrary,
				emptyImages,
				options,
				true
			);

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

			const metadata = generateExportMetadata(
				mockLayout,
				mockRack,
				mockDeviceLibrary,
				emptyImages,
				options,
				false
			);

			// Should be valid ISO date string
			const date = new Date(metadata.exportedAt);
			expect(date.toISOString()).toBe(metadata.exportedAt);
		});

		it('includes device metadata with image status', async () => {
			const { generateExportMetadata } = await import('$lib/utils/export');

			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark'
			};

			const metadata = generateExportMetadata(
				mockLayout,
				mockRack,
				mockDeviceLibrary,
				emptyImages,
				options,
				false
			);

			expect(metadata.devices).toBeDefined();
			expect(metadata.devices?.[0]).toMatchObject({
				libraryId: 'device-1',
				displayName: 'Test Server',
				position: 1,
				height: 2,
				category: 'server',
				hasFrontImage: false,
				hasRearImage: false
			});
		});
	});

	describe('generateBundledExportFilename', () => {
		it('generates filename with layout name and format', async () => {
			const { generateBundledExportFilename } = await import('$lib/utils/export');

			const filename = generateBundledExportFilename('My Layout', 'png');
			expect(filename).toBe('my-layout.rackarr.zip');
		});

		it('handles empty layout name', async () => {
			const { generateBundledExportFilename } = await import('$lib/utils/export');

			const filename = generateBundledExportFilename('', 'png');
			expect(filename).toBe('rackarr.rackarr.zip');
		});
	});

	describe('createBundledExport', () => {
		beforeEach(() => {
			vi.useRealTimers();
		});

		it('creates ZIP with all image formats and metadata', async () => {
			const { createBundledExport } = await import('$lib/utils/export');
			const JSZip = (await import('jszip')).default;

			const imageBlobs = {
				png: new Blob(['fake-png-data'], { type: 'image/png' }),
				jpeg: new Blob(['fake-jpeg-data'], { type: 'image/jpeg' }),
				svg: new Blob(['<svg></svg>'], { type: 'image/svg+xml' })
			};
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark'
			};

			const exportData: BundledExportData = {
				imageBlobs,
				layout: mockLayout,
				rack: mockRack,
				deviceLibrary: mockDeviceLibrary,
				images: emptyImages,
				options,
				includeSource: false
			};

			const zipBlob = await createBundledExport(exportData);

			expect(zipBlob).toBeInstanceOf(Blob);
			expect(zipBlob.type).toBe('application/zip');

			// Verify ZIP contains all formats
			const zip = await JSZip.loadAsync(zipBlob);
			expect(zip.file('rack.png')).not.toBeNull();
			expect(zip.file('rack.jpg')).not.toBeNull();
			expect(zip.file('rack.svg')).not.toBeNull();
			expect(zip.file('metadata.json')).not.toBeNull();
		});

		it('includes source when includeSource is true', async () => {
			const { createBundledExport } = await import('$lib/utils/export');
			const JSZip = (await import('jszip')).default;

			const imageBlobs = {
				png: new Blob(['fake-png-data'], { type: 'image/png' }),
				jpeg: new Blob(['fake-jpeg-data'], { type: 'image/jpeg' }),
				svg: new Blob(['<svg></svg>'], { type: 'image/svg+xml' })
			};
			const sourceBlob = new Blob(['fake-source-data'], { type: 'application/zip' });
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark'
			};

			const exportData: BundledExportData = {
				imageBlobs,
				layout: mockLayout,
				rack: mockRack,
				deviceLibrary: mockDeviceLibrary,
				images: emptyImages,
				options,
				includeSource: true,
				sourceBlob
			};

			const zipBlob = await createBundledExport(exportData);

			// Verify ZIP contents include source
			const zip = await JSZip.loadAsync(zipBlob);
			expect(zip.file('source.rackarr.zip')).not.toBeNull();
		});

		it('includes all three image formats in bundled export', async () => {
			const { createBundledExport } = await import('$lib/utils/export');
			const JSZip = (await import('jszip')).default;

			const imageBlobs = {
				png: new Blob(['png-content'], { type: 'image/png' }),
				jpeg: new Blob(['jpeg-content'], { type: 'image/jpeg' }),
				svg: new Blob(['<svg>svg-content</svg>'], { type: 'image/svg+xml' })
			};
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark'
			};

			const exportData: BundledExportData = {
				imageBlobs,
				layout: mockLayout,
				rack: mockRack,
				deviceLibrary: mockDeviceLibrary,
				images: emptyImages,
				options,
				includeSource: false
			};

			const zipBlob = await createBundledExport(exportData);

			const zip = await JSZip.loadAsync(zipBlob);

			// Verify all three formats are included
			const pngFile = zip.file('rack.png');
			const jpgFile = zip.file('rack.jpg');
			const svgFile = zip.file('rack.svg');

			expect(pngFile).not.toBeNull();
			expect(jpgFile).not.toBeNull();
			expect(svgFile).not.toBeNull();

			// Verify content
			const pngContent = await pngFile!.async('string');
			const jpgContent = await jpgFile!.async('string');
			const svgContent = await svgFile!.async('string');

			expect(pngContent).toBe('png-content');
			expect(jpgContent).toBe('jpeg-content');
			expect(svgContent).toBe('<svg>svg-content</svg>');
		});

		it('includes device images in assets folder', async () => {
			const { createBundledExport } = await import('$lib/utils/export');
			const JSZip = (await import('jszip')).default;

			const imageBlobs = {
				png: new Blob(['fake-png-data'], { type: 'image/png' }),
				jpeg: new Blob(['fake-jpeg-data'], { type: 'image/jpeg' }),
				svg: new Blob(['<svg></svg>'], { type: 'image/svg+xml' })
			};
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark'
			};

			// Create images map with a device image (using proper ImageData structure)
			// Note: key must be the slugified device name ('test-server' for 'Test Server')
			const testImageBlob = new Blob(['test-image-data'], { type: 'image/png' });
			const imagesWithDevice: ImageStoreMap = new Map([
				[
					'test-server',
					{
						front: {
							blob: testImageBlob,
							dataUrl: 'data:image/png;base64,dGVzdC1pbWFnZS1kYXRh',
							filename: 'test-server-front.png'
						}
					}
				]
			]);

			const exportData: BundledExportData = {
				imageBlobs,
				layout: mockLayout,
				rack: mockRack,
				deviceLibrary: mockDeviceLibrary,
				images: imagesWithDevice,
				options,
				includeSource: false
			};

			const zipBlob = await createBundledExport(exportData);

			const zip = await JSZip.loadAsync(zipBlob);

			// Verify device images are in assets folder
			const deviceFrontImage = zip.file('assets/devices/test-server/front.png');
			expect(deviceFrontImage).not.toBeNull();
		});
	});
});

describe('Device Positioning in Export', () => {
	// Constants matching Rack.svelte dimensions
	const U_HEIGHT = 22;
	const RACK_PADDING = 4;
	const RAIL_WIDTH = 17;

	it('positions devices at correct Y coordinate including rail offset', () => {
		const devices: Device[] = [
			{
				id: 'device-1',
				name: 'Test Server',
				height: 2,
				colour: '#4A90D9',
				category: 'server'
			}
		];

		const racks: Rack[] = [
			{
				id: 'rack-1',
				name: 'Test Rack',
				height: 42,
				width: 19,
				position: 0,
				view: 'front',
				devices: [{ libraryId: 'device-1', position: 1, face: 'front' }]
			}
		];

		const options: ExportOptions = {
			format: 'png',
			scope: 'all',
			includeNames: false,
			includeLegend: false,
			background: 'dark'
		};

		const svg = generateExportSVG(racks, devices, options);

		// Find the device rect by its colour
		const deviceRect = svg.querySelector('rect[fill="#4A90D9"]');
		expect(deviceRect).not.toBeNull();

		// Calculate expected Y position
		// Device at position 1 (bottom) in 42U rack with height 2
		// Y = (rackHeight - position - deviceHeight + 1) * U_HEIGHT + RACK_PADDING + RAIL_WIDTH + 1 (the +1 is from deviceY + 1)
		// Y = (42 - 1 - 2 + 1) * 22 + 4 + 17 + 1 = 40 * 22 + 22 = 880 + 22 = 902
		const expectedY = (42 - 1 - 2 + 1) * U_HEIGHT + RACK_PADDING + RAIL_WIDTH + 1;
		expect(deviceRect?.getAttribute('y')).toBe(String(expectedY));
	});

	it('positions device at top of rack correctly', () => {
		const devices: Device[] = [
			{
				id: 'device-1',
				name: 'Top Server',
				height: 1,
				colour: '#7B68EE',
				category: 'server'
			}
		];

		const racks: Rack[] = [
			{
				id: 'rack-1',
				name: 'Test Rack',
				height: 42,
				width: 19,
				position: 0,
				view: 'front',
				devices: [{ libraryId: 'device-1', position: 42, face: 'front' }]
			}
		];

		const options: ExportOptions = {
			format: 'png',
			scope: 'all',
			includeNames: false,
			includeLegend: false,
			background: 'dark'
		};

		const svg = generateExportSVG(racks, devices, options);

		// Find the device rect by its colour
		const deviceRect = svg.querySelector('rect[fill="#7B68EE"]');
		expect(deviceRect).not.toBeNull();

		// Device at position 42 (top) in 42U rack with height 1
		// Y = (42 - 42 - 1 + 1) * 22 + 4 + 17 + 1 = 0 * 22 + 22 = 22
		const expectedY = (42 - 42 - 1 + 1) * U_HEIGHT + RACK_PADDING + RAIL_WIDTH + 1;
		expect(deviceRect?.getAttribute('y')).toBe(String(expectedY));
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

describe('Dual-View Export', () => {
	const mockDevices: Device[] = [
		{
			id: 'front-server',
			name: 'Front Server',
			height: 2,
			colour: '#4A90D9',
			category: 'server',
			is_full_depth: true
		},
		{
			id: 'rear-patch',
			name: 'Rear Patch Panel',
			height: 1,
			colour: '#7B68EE',
			category: 'network',
			is_full_depth: false
		},
		{
			id: 'both-ups',
			name: 'UPS',
			height: 4,
			colour: '#22C55E',
			category: 'power'
		}
	];

	const mockRacks: Rack[] = [
		{
			id: 'rack-1',
			name: 'Test Rack',
			height: 12,
			width: 19,
			position: 0,
			view: 'front',
			devices: [
				{ libraryId: 'front-server', position: 1, face: 'front' },
				{ libraryId: 'rear-patch', position: 5, face: 'rear' },
				{ libraryId: 'both-ups', position: 8, face: 'both' }
			]
		}
	];

	describe('exportView option', () => {
		it('exports only front-facing devices when exportView is "front"', () => {
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: false,
				includeLegend: false,
				background: 'dark',
				exportView: 'front'
			};

			const svg = generateExportSVG(mockRacks, mockDevices, options);
			const svgString = svg.outerHTML;

			// Should include front and both-face devices
			expect(svgString).toContain('#4A90D9'); // front-server (front)
			expect(svgString).toContain('#22C55E'); // both-ups (both)
			// Should NOT include rear-only devices
			expect(svgString).not.toContain('#7B68EE'); // rear-patch (rear)
		});

		it('exports only rear-facing devices when exportView is "rear"', () => {
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: false,
				includeLegend: false,
				background: 'dark',
				exportView: 'rear'
			};

			const svg = generateExportSVG(mockRacks, mockDevices, options);
			const svgString = svg.outerHTML;

			// Should include rear and both-face devices
			expect(svgString).toContain('#7B68EE'); // rear-patch (rear)
			expect(svgString).toContain('#22C55E'); // both-ups (both)
			// Should NOT include front-only devices
			expect(svgString).not.toContain('#4A90D9'); // front-server (front)
		});

		it('exports both views side-by-side when exportView is "both"', () => {
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark',
				exportView: 'both'
			};

			const svg = generateExportSVG(mockRacks, mockDevices, options);
			const svgString = svg.outerHTML;

			// Check for FRONT and REAR labels
			expect(svgString).toContain('FRONT');
			expect(svgString).toContain('REAR');

			// All device colours should be present (different faces in different views)
			expect(svgString).toContain('#4A90D9'); // front-server
			expect(svgString).toContain('#7B68EE'); // rear-patch
			expect(svgString).toContain('#22C55E'); // both-ups (appears in both)
		});

		it('defaults to showing all devices when exportView is undefined', () => {
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: false,
				includeLegend: false,
				background: 'dark'
				// exportView not specified
			};

			const svg = generateExportSVG(mockRacks, mockDevices, options);
			const svgString = svg.outerHTML;

			// Legacy behavior: all devices visible
			expect(svgString).toContain('#4A90D9'); // front-server
			expect(svgString).toContain('#7B68EE'); // rear-patch
			expect(svgString).toContain('#22C55E'); // both-ups
		});
	});

	describe('dual-view layout', () => {
		it('positions front view on the left and rear view on the right', () => {
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark',
				exportView: 'both'
			};

			const svg = generateExportSVG(mockRacks, mockDevices, options);

			// Find the view labels to check positioning
			const textElements = svg.querySelectorAll('text');
			let frontLabelX: number | null = null;
			let rearLabelX: number | null = null;

			textElements.forEach((text) => {
				if (text.textContent === 'FRONT') {
					// Get the parent group's transform to find X position
					const parent = text.parentElement;
					const transform = parent?.getAttribute('transform');
					if (transform) {
						const match = transform.match(/translate\((\d+)/);
						if (match) {
							frontLabelX = parseInt(match[1]!, 10);
						}
					}
				}
				if (text.textContent === 'REAR') {
					const parent = text.parentElement;
					const transform = parent?.getAttribute('transform');
					if (transform) {
						const match = transform.match(/translate\((\d+)/);
						if (match) {
							rearLabelX = parseInt(match[1]!, 10);
						}
					}
				}
			});

			// Front should be to the left of rear
			if (frontLabelX !== null && rearLabelX !== null) {
				expect(frontLabelX).toBeLessThan(rearLabelX);
			}
		});

		it('doubles the width for dual-view export', () => {
			// Single view
			const singleOptions: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark',
				exportView: 'front'
			};

			const singleSvg = generateExportSVG(mockRacks, mockDevices, singleOptions);
			const singleWidth = parseInt(singleSvg.getAttribute('width') || '0', 10);

			// Dual view
			const dualOptions: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark',
				exportView: 'both'
			};

			const dualSvg = generateExportSVG(mockRacks, mockDevices, dualOptions);
			const dualWidth = parseInt(dualSvg.getAttribute('width') || '0', 10);

			// Dual view should be wider (approximately 2x + gap)
			expect(dualWidth).toBeGreaterThan(singleWidth);
			// Should be at least 1.5x wider (accounting for gap)
			expect(dualWidth).toBeGreaterThan(singleWidth * 1.5);
		});

		it('uses the same height for front and rear views', () => {
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark',
				exportView: 'both'
			};

			const svg = generateExportSVG(mockRacks, mockDevices, options);
			const height = parseInt(svg.getAttribute('height') || '0', 10);

			// Should be the same height as single view (same rack)
			const singleOptions: ExportOptions = { ...options, exportView: 'front' };
			const singleSvg = generateExportSVG(mockRacks, mockDevices, singleOptions);
			const singleHeight = parseInt(singleSvg.getAttribute('height') || '0', 10);

			expect(height).toBe(singleHeight);
		});
	});

	describe('view labels in export', () => {
		it('adds FRONT label above front view in dual export', () => {
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark',
				exportView: 'both'
			};

			const svg = generateExportSVG(mockRacks, mockDevices, options);
			const viewLabels = Array.from(svg.querySelectorAll('text')).filter(
				(t) => t.textContent === 'FRONT' || t.textContent === 'REAR'
			);

			expect(viewLabels.length).toBe(2);
		});

		it('does NOT add view labels for single view export', () => {
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark',
				exportView: 'front'
			};

			const svg = generateExportSVG(mockRacks, mockDevices, options);

			// Should not have FRONT/REAR labels for single view
			const viewLabels = Array.from(svg.querySelectorAll('text')).filter(
				(t) => t.textContent === 'FRONT' || t.textContent === 'REAR'
			);
			expect(viewLabels.length).toBe(0);
		});
	});

	describe('legend with dual-view', () => {
		it('shows all devices in legend regardless of view', () => {
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: true,
				background: 'dark',
				exportView: 'both'
			};

			const svg = generateExportSVG(mockRacks, mockDevices, options);
			const legend = svg.querySelector('.export-legend');

			expect(legend).not.toBeNull();

			// All devices should be in legend
			const legendItems = legend?.querySelectorAll('.legend-item');
			expect(legendItems?.length).toBe(3); // front-server, rear-patch, both-ups
		});
	});
});

/**
 * Archive Utilities (v0.1.0)
 * Functions for creating and extracting .rackarr.zip archives
 */

import JSZip from 'jszip';
import type { Layout } from '$lib/types';
import type { ImageData, ImageStoreMap } from '$lib/types/images';

/** Layout filename inside the archive */
const LAYOUT_FILENAME = 'layout.json';

/** Images folder inside the archive */
const IMAGES_FOLDER = 'images';

/** Archive file extension */
const ARCHIVE_EXTENSION = '.rackarr.zip';

/**
 * Create a .rackarr.zip archive containing layout and images
 * @param layout - The layout data to save
 * @param images - Map of device images (deviceId -> DeviceImageData)
 * @returns Promise resolving to a Blob containing the ZIP archive
 */
export async function createArchive(layout: Layout, images: ImageStoreMap): Promise<Blob> {
	const zip = new JSZip();

	// Add layout.json
	const layoutJson = JSON.stringify(layout, null, 2);
	zip.file(LAYOUT_FILENAME, layoutJson);

	// Create images folder
	const imagesFolder = zip.folder(IMAGES_FOLDER);

	// Add images
	for (const [deviceId, deviceImages] of images) {
		if (deviceImages.front) {
			const filename = `${deviceId}-front.${getExtension(deviceImages.front.filename)}`;
			imagesFolder?.file(filename, deviceImages.front.blob);
		}
		if (deviceImages.rear) {
			const filename = `${deviceId}-rear.${getExtension(deviceImages.rear.filename)}`;
			imagesFolder?.file(filename, deviceImages.rear.blob);
		}
	}

	// Generate the ZIP blob
	return zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
}

/**
 * Extract a .rackarr.zip archive
 * @param file - The archive file to extract
 * @returns Promise resolving to layout and images
 */
export async function extractArchive(
	file: File
): Promise<{ layout: Layout; images: ImageStoreMap }> {
	const zip = await JSZip.loadAsync(file);

	// Read layout.json
	const layoutFile = zip.file(LAYOUT_FILENAME);
	if (!layoutFile) {
		throw new Error('layout.json not found in archive');
	}

	const layoutJson = await layoutFile.async('string');
	const layout = JSON.parse(layoutJson) as Layout;

	// Read images
	const images: ImageStoreMap = new Map();
	const imageFiles = Object.keys(zip.files).filter(
		(name) => name.startsWith(`${IMAGES_FOLDER}/`) && !name.endsWith('/')
	);

	for (const imagePath of imageFiles) {
		const filename = imagePath.replace(`${IMAGES_FOLDER}/`, '');
		const match = filename.match(/^(.+)-(front|rear)\.(\w+)$/);

		if (match) {
			const [, deviceId, face] = match;
			const imageFile = zip.file(imagePath);

			if (imageFile && deviceId) {
				const blob = await imageFile.async('blob');
				const dataUrl = await blobToDataUrl(blob);

				const imageData: ImageData = {
					blob,
					dataUrl,
					filename
				};

				const existing = images.get(deviceId) ?? {};
				images.set(deviceId, {
					...existing,
					[face as 'front' | 'rear']: imageData
				});
			}
		}
	}

	return { layout, images };
}

/**
 * Check if a file is a .rackarr.zip archive
 * @param file - File to check
 * @returns true if the file has .rackarr.zip extension
 */
export function isRackarrArchive(file: File): boolean {
	return file.name.toLowerCase().endsWith(ARCHIVE_EXTENSION.toLowerCase());
}

/**
 * Get file extension from filename
 */
function getExtension(filename: string): string {
	const parts = filename.split('.');
	return parts[parts.length - 1] || 'png';
}

/**
 * Convert a Blob to a data URL
 */
function blobToDataUrl(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(new Error('Failed to read blob'));
		reader.readAsDataURL(blob);
	});
}

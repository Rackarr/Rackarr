/**
 * Image Store (v0.1.0)
 * Manages device images in memory during the session
 * Uses Svelte 5 runes for reactivity
 */

import { SvelteMap } from 'svelte/reactivity';
import type { ImageData, DeviceImageData, ImageStoreMap } from '$lib/types/images';

// Module-level store instance (singleton pattern matching other stores)
let imageStoreInstance: ReturnType<typeof createImageStore> | null = null;

/**
 * Create the image store with Svelte 5 runes
 */
function createImageStore() {
	// Internal state using SvelteMap for reactivity
	const images = new SvelteMap<string, DeviceImageData>();

	// Computed count of all images
	const imageCount = $derived(() => {
		let count = 0;
		for (const deviceImages of images.values()) {
			if (deviceImages.front) count++;
			if (deviceImages.rear) count++;
		}
		return count;
	});

	/**
	 * Set an image for a device face
	 */
	function setDeviceImage(deviceId: string, face: 'front' | 'rear', data: ImageData): void {
		const existing = images.get(deviceId) ?? {};
		images.set(deviceId, {
			...existing,
			[face]: data
		});
	}

	/**
	 * Get an image for a device face
	 */
	function getDeviceImage(deviceId: string, face: 'front' | 'rear'): ImageData | undefined {
		return images.get(deviceId)?.[face];
	}

	/**
	 * Remove a specific face image from a device
	 */
	function removeDeviceImage(deviceId: string, face: 'front' | 'rear'): void {
		const existing = images.get(deviceId);
		if (!existing) return;

		const updated: DeviceImageData = { ...existing };
		delete updated[face];

		// If no images left for this device, remove the entry
		if (!updated.front && !updated.rear) {
			images.delete(deviceId);
		} else {
			images.set(deviceId, updated);
		}
	}

	/**
	 * Remove all images for a device
	 */
	function removeAllDeviceImages(deviceId: string): void {
		images.delete(deviceId);
	}

	/**
	 * Clear all images from the store
	 */
	function clearAllImages(): void {
		images.clear();
	}

	/**
	 * Get all images (returns a copy for serialization)
	 */
	function getAllImages(): ImageStoreMap {
		return new Map(images);
	}

	/**
	 * Check if an image exists for a device face
	 */
	function hasImage(deviceId: string, face: 'front' | 'rear'): boolean {
		return !!images.get(deviceId)?.[face];
	}

	return {
		// Methods
		setDeviceImage,
		getDeviceImage,
		removeDeviceImage,
		removeAllDeviceImages,
		clearAllImages,
		getAllImages,
		hasImage,

		// Computed (as getter)
		get imageCount() {
			return imageCount();
		}
	};
}

/**
 * Get the image store singleton
 */
export function getImageStore() {
	if (!imageStoreInstance) {
		imageStoreInstance = createImageStore();
	}
	return imageStoreInstance;
}

/**
 * Reset the image store (for testing)
 */
export function resetImageStore() {
	if (imageStoreInstance) {
		imageStoreInstance.clearAllImages();
	}
	imageStoreInstance = null;
}

/**
 * UI Store
 * Manages theme, zoom, and drawer state using Svelte 5 runes
 */

import {
	loadThemeFromStorage,
	saveThemeToStorage,
	applyThemeToDocument,
	type Theme
} from '$lib/utils/theme';

// Zoom constants
export const ZOOM_MIN = 50;
export const ZOOM_MAX = 200;
export const ZOOM_STEP = 25;

// Load initial theme from storage
const initialTheme = loadThemeFromStorage();

// Module-level state (using $state rune)
let theme = $state<Theme>(initialTheme);
let zoom = $state(100);
let leftDrawerOpen = $state(false);
let rightDrawerOpen = $state(false);

// Derived values (using $derived rune)
const canZoomIn = $derived(zoom < ZOOM_MAX);
const canZoomOut = $derived(zoom > ZOOM_MIN);
const zoomScale = $derived(zoom / 100);

// Apply initial theme to document (using the non-reactive initial value)
applyThemeToDocument(initialTheme);

/**
 * Reset the store to initial state (primarily for testing)
 */
export function resetUIStore(): void {
	theme = loadThemeFromStorage();
	zoom = 100;
	leftDrawerOpen = false;
	rightDrawerOpen = false;
	applyThemeToDocument(theme);
}

/**
 * Get access to the UI store
 * @returns Store object with state and actions
 */
export function getUIStore() {
	return {
		// Theme state getters
		get theme() {
			return theme;
		},

		// Zoom state getters
		get zoom() {
			return zoom;
		},
		get canZoomIn() {
			return canZoomIn;
		},
		get canZoomOut() {
			return canZoomOut;
		},
		get zoomScale() {
			return zoomScale;
		},

		// Drawer state getters
		get leftDrawerOpen() {
			return leftDrawerOpen;
		},
		get rightDrawerOpen() {
			return rightDrawerOpen;
		},

		// Theme actions
		toggleTheme,
		setTheme,

		// Zoom actions
		zoomIn,
		zoomOut,
		setZoom,
		resetZoom,

		// Drawer actions
		toggleLeftDrawer,
		toggleRightDrawer,
		openLeftDrawer,
		closeLeftDrawer,
		openRightDrawer,
		closeRightDrawer
	};
}

/**
 * Toggle between dark and light themes
 */
function toggleTheme(): void {
	const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
	setTheme(newTheme);
}

/**
 * Set a specific theme
 * @param newTheme - Theme to set
 */
function setTheme(newTheme: Theme): void {
	theme = newTheme;
	saveThemeToStorage(newTheme);
	applyThemeToDocument(newTheme);
}

/**
 * Zoom in by one step
 */
function zoomIn(): void {
	if (zoom < ZOOM_MAX) {
		zoom = Math.min(zoom + ZOOM_STEP, ZOOM_MAX);
	}
}

/**
 * Zoom out by one step
 */
function zoomOut(): void {
	if (zoom > ZOOM_MIN) {
		zoom = Math.max(zoom - ZOOM_STEP, ZOOM_MIN);
	}
}

/**
 * Set zoom level (clamped to valid range)
 * @param value - Zoom percentage
 */
function setZoom(value: number): void {
	zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, value));
}

/**
 * Reset zoom to 100%
 */
function resetZoom(): void {
	zoom = 100;
}

/**
 * Toggle left drawer visibility
 */
function toggleLeftDrawer(): void {
	leftDrawerOpen = !leftDrawerOpen;
}

/**
 * Toggle right drawer visibility
 */
function toggleRightDrawer(): void {
	rightDrawerOpen = !rightDrawerOpen;
}

/**
 * Open left drawer
 */
function openLeftDrawer(): void {
	leftDrawerOpen = true;
}

/**
 * Close left drawer
 */
function closeLeftDrawer(): void {
	leftDrawerOpen = false;
}

/**
 * Open right drawer
 */
function openRightDrawer(): void {
	rightDrawerOpen = true;
}

/**
 * Close right drawer
 */
function closeRightDrawer(): void {
	rightDrawerOpen = false;
}

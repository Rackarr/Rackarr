/**
 * Debug logging utilities
 * Automatically enabled in development mode (npm run dev)
 * Can be manually toggled in production via window.RACKARR_DEBUG
 *
 * Log format: [rackarr:category] message
 */

// Log prefix constant for consistency
const LOG_PREFIX = 'rackarr';

// Extend Window interface for debug flag
declare global {
	interface Window {
		RACKARR_DEBUG?: boolean;
		enableRackarrDebug?: () => void;
		disableRackarrDebug?: () => void;
	}
}

// Check for debug flag - automatically enabled in dev mode
const getDebugFlag = (): boolean => {
	// Always enable in development mode
	if ((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV) {
		return true;
	}

	// In production, check for manual override
	if (typeof window === 'undefined') return false;

	// Check window flag (manual override in production)
	if (window.RACKARR_DEBUG !== undefined) {
		return window.RACKARR_DEBUG === true;
	}

	return false;
};

export const debug = {
	/**
	 * General info logging: [rackarr] message
	 */
	info(...args: unknown[]) {
		if (getDebugFlag()) {
			console.log(`[${LOG_PREFIX}]`, ...args);
		}
	},

	/**
	 * Debug logging: [rackarr:debug] message
	 */
	log(...args: unknown[]) {
		if (getDebugFlag()) {
			console.log(`[${LOG_PREFIX}:debug]`, ...args);
		}
	},

	/**
	 * Warning logging: [rackarr:debug:warn] message
	 */
	warn(...args: unknown[]) {
		if (getDebugFlag()) {
			console.warn(`[${LOG_PREFIX}:debug:warn]`, ...args);
		}
	},

	/**
	 * Error logging: [rackarr:debug:error] message
	 */
	error(...args: unknown[]) {
		if (getDebugFlag()) {
			console.error(`[${LOG_PREFIX}:debug:error]`, ...args);
		}
	},

	/**
	 * Group logging: [rackarr:debug] label
	 */
	group(label: string) {
		if (getDebugFlag()) {
			console.group(`[${LOG_PREFIX}:debug] ${label}`);
		}
	},

	groupEnd() {
		if (getDebugFlag()) {
			console.groupEnd();
		}
	},

	isEnabled(): boolean {
		return getDebugFlag();
	},

	/**
	 * Device placement logging: [rackarr:device:place] message
	 */
	devicePlace(data: {
		slug: string;
		position: number;
		passedFace: string | undefined;
		effectiveFace: string;
		deviceName: string;
		isFullDepth: boolean;
		result: 'success' | 'collision' | 'not_found';
	}) {
		if (getDebugFlag()) {
			console.log(
				`[${LOG_PREFIX}:device:place] slug=${data.slug} pos=${data.position} face=${data.effectiveFace}`,
				`\n  deviceType: ${data.deviceName} is_full_depth=${data.isFullDepth}`,
				`\n  passed face=${data.passedFace ?? 'undefined'} → effective face=${data.effectiveFace}`,
				`\n  result: ${data.result}`
			);
		}
	},

	/**
	 * Device movement logging: [rackarr:device:move] message
	 */
	deviceMove(data: {
		index: number;
		deviceName: string;
		face: string;
		fromPosition: number;
		toPosition: number;
		result: 'success' | 'collision' | 'out_of_bounds' | 'not_found';
	}) {
		if (getDebugFlag()) {
			console.log(
				`[${LOG_PREFIX}:device:move] idx=${data.index} from=${data.fromPosition} to=${data.toPosition}`,
				`\n  device: ${data.deviceName} face=${data.face}`,
				`\n  result: ${data.result}`
			);
		}
	},

	/**
	 * Collision detection logging: [rackarr:collision] message
	 */
	collision(data: {
		position: number;
		height: number;
		face: string;
		isFullDepth: boolean;
		existingDevices: Array<{ position: number; height: number; face: string }>;
		result: 'clear' | string; // 'clear' or 'blocked by device at U{n}'
	}) {
		if (getDebugFlag()) {
			console.log(
				`[${LOG_PREFIX}:collision] checking pos=${data.position} height=${data.height} face=${data.face} isFullDepth=${data.isFullDepth}`,
				`\n  existing devices: ${JSON.stringify(data.existingDevices)}`,
				`\n  result: ${data.result}`
			);
		}
	}
};

// Expose control functions to window (for production debugging)
if (typeof window !== 'undefined') {
	window.enableRackarrDebug = () => {
		window.RACKARR_DEBUG = true;
		console.log(`[${LOG_PREFIX}] debug logging enabled`);
	};

	window.disableRackarrDebug = () => {
		window.RACKARR_DEBUG = false;
		console.log(`[${LOG_PREFIX}] debug logging disabled`);
	};

	// Log mode on startup
	if ((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV) {
		console.log(`[${LOG_PREFIX}] running in development mode - debug logging enabled`);
	}
}

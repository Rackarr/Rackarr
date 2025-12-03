import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';

// Read version from package.json
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig(() => ({
	// VITE_BASE_PATH env var allows different base paths per deployment:
	// - GitHub Pages: /rackarr/ (set in workflow)
	// - Docker/local: / (default)
	base: process.env.VITE_BASE_PATH || '/',
	publicDir: 'static',
	plugins: [svelte()],
	define: {
		// Inject version at build time
		__APP_VERSION__: JSON.stringify(pkg.version)
	},
	resolve: {
		alias: {
			$lib: '/src/lib'
		}
	}
}));

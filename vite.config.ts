import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
	base: '/',
	publicDir: 'static',
	plugins: [svelte()],
	resolve: {
		alias: {
			$lib: '/src/lib'
		}
	}
}));

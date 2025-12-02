import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Read the CSS file directly
const appCss = readFileSync(join(__dirname, '../app.css'), 'utf-8');

describe('Animation System', () => {
	describe('Animation Keyframes Defined', () => {
		it('device-settle keyframe is defined', () => {
			expect(appCss).toContain('@keyframes device-settle');
		});

		it('drawer-slide-in-left keyframe is defined', () => {
			expect(appCss).toContain('@keyframes drawer-slide-in-left');
		});

		it('drawer-slide-in-right keyframe is defined', () => {
			expect(appCss).toContain('@keyframes drawer-slide-in-right');
		});

		it('toast-slide-up keyframe is defined', () => {
			expect(appCss).toContain('@keyframes toast-slide-up');
		});

		it('dialog-fade-in keyframe is defined', () => {
			expect(appCss).toContain('@keyframes dialog-fade-in');
		});

		it('dialog-scale-in keyframe is defined', () => {
			expect(appCss).toContain('@keyframes dialog-scale-in');
		});

		it('selection-pulse keyframe is defined', () => {
			expect(appCss).toContain('@keyframes selection-pulse');
		});

		it('shake keyframe is defined', () => {
			expect(appCss).toContain('@keyframes shake');
		});
	});

	describe('Animation Classes Defined', () => {
		it('device-just-dropped class is defined with animation', () => {
			expect(appCss).toContain('.device-just-dropped');
			expect(appCss).toMatch(/\.device-just-dropped\s*\{[^}]*animation:\s*device-settle/);
		});

		it('drawer-left class is defined with animation', () => {
			expect(appCss).toContain('.drawer-left');
			expect(appCss).toMatch(/\.drawer-left\s*\{[^}]*animation:\s*drawer-slide-in-left/);
		});

		it('drawer-right class is defined with animation', () => {
			expect(appCss).toContain('.drawer-right');
			expect(appCss).toMatch(/\.drawer-right\s*\{[^}]*animation:\s*drawer-slide-in-right/);
		});

		it('toast-enter class is defined with animation', () => {
			expect(appCss).toContain('.toast-enter');
			expect(appCss).toMatch(/\.toast-enter\s*\{[^}]*animation:\s*toast-slide-up/);
		});

		it('error-shake class is defined with animation', () => {
			expect(appCss).toContain('.error-shake');
			expect(appCss).toMatch(/\.error-shake\s*\{[^}]*animation:\s*shake/);
		});

		it('dialog-backdrop class is defined with animation', () => {
			expect(appCss).toContain('.dialog-backdrop');
			expect(appCss).toMatch(/\.dialog-backdrop\s*\{[^}]*animation:\s*dialog-fade-in/);
		});

		it('dialog class is defined with animation', () => {
			expect(appCss).toContain('.dialog {');
			expect(appCss).toMatch(/\.dialog\s*\{[^}]*animation:\s*dialog-scale-in/);
		});
	});

	describe('Device Settle Animation Properties', () => {
		it('device-settle animation has scale transform', () => {
			const keyframeMatch = appCss.match(/@keyframes device-settle\s*\{[\s\S]*?\n\}/);
			expect(keyframeMatch).not.toBeNull();
			expect(keyframeMatch![0]).toContain('scale');
		});

		it('device-settle animation has opacity transition', () => {
			const keyframeMatch = appCss.match(/@keyframes device-settle\s*\{[\s\S]*?\n\}/);
			expect(keyframeMatch).not.toBeNull();
			expect(keyframeMatch![0]).toContain('opacity');
		});

		it('device-just-dropped uses spring easing', () => {
			expect(appCss).toMatch(/\.device-just-dropped\s*\{[^}]*--ease-spring/);
		});
	});

	describe('Animation Uses Design Tokens', () => {
		it('animations use --duration-normal token', () => {
			expect(appCss).toMatch(/animation:.*var\(--duration-normal\)/);
		});

		it('animations use --duration-fast token', () => {
			expect(appCss).toMatch(/animation:.*var\(--duration-fast\)/);
		});

		it('animations use --ease-out token', () => {
			expect(appCss).toMatch(/animation:.*var\(--ease-out\)/);
		});

		it('device-settle animation uses --ease-spring token', () => {
			expect(appCss).toMatch(/\.device-just-dropped\s*\{[^}]*var\(--ease-spring\)/);
		});
	});
});

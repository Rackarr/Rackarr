/**
 * YAML Utilities Tests
 * Verifies js-yaml dependency and basic operations
 */

import { describe, it, expect } from 'vitest';
import { serializeToYaml, parseYaml } from '$lib/utils/yaml';

describe('YAML Utilities', () => {
	describe('js-yaml dependency', () => {
		it('can be imported', () => {
			expect(serializeToYaml).toBeDefined();
			expect(parseYaml).toBeDefined();
		});
	});

	describe('serializeToYaml', () => {
		it('serializes simple object', () => {
			const data = { name: 'Test', value: 42 };
			const result = serializeToYaml(data);
			expect(result).toContain('name: Test');
			expect(result).toContain('value: 42');
		});

		it('serializes nested object', () => {
			const data = {
				rack: {
					name: 'Homelab',
					height: 42
				}
			};
			const result = serializeToYaml(data);
			expect(result).toContain('rack:');
			expect(result).toContain('name: Homelab');
			expect(result).toContain('height: 42');
		});

		it('serializes arrays', () => {
			const data = {
				items: ['one', 'two', 'three']
			};
			const result = serializeToYaml(data);
			expect(result).toContain('items:');
			expect(result).toContain('- one');
			expect(result).toContain('- two');
			expect(result).toContain('- three');
		});
	});

	describe('parseYaml', () => {
		it('parses simple YAML', () => {
			const yaml = 'name: Test\nvalue: 42';
			const result = parseYaml<{ name: string; value: number }>(yaml);
			expect(result.name).toBe('Test');
			expect(result.value).toBe(42);
		});

		it('parses nested YAML', () => {
			const yaml = `
rack:
  name: Homelab
  height: 42
`;
			const result = parseYaml<{ rack: { name: string; height: number } }>(yaml);
			expect(result.rack.name).toBe('Homelab');
			expect(result.rack.height).toBe(42);
		});

		it('parses arrays', () => {
			const yaml = `
items:
  - one
  - two
  - three
`;
			const result = parseYaml<{ items: string[] }>(yaml);
			expect(result.items).toEqual(['one', 'two', 'three']);
		});
	});

	describe('round-trip', () => {
		it('preserves data through serialize then parse', () => {
			const original = {
				version: '0.4.0',
				name: 'Test Layout',
				rack: {
					name: 'Homelab Rack',
					height: 42,
					width: 19
				},
				device_types: [
					{
						slug: 'test-device',
						u_height: 2
					}
				]
			};

			const yaml = serializeToYaml(original);
			const parsed = parseYaml(yaml);

			expect(parsed).toEqual(original);
		});
	});
});

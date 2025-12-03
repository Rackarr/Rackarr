/**
 * YAML Serialization Utilities
 * For v0.4 folder-based project format
 */

import yaml from 'js-yaml';

/**
 * Serialize object to YAML string
 */
export function serializeToYaml(data: unknown): string {
	return yaml.dump(data, {
		indent: 2,
		lineWidth: 120,
		noRefs: true,
		sortKeys: false,
		quotingType: '"'
	});
}

/**
 * Parse YAML string to object
 */
export function parseYaml<T = unknown>(yamlString: string): T {
	return yaml.load(yamlString) as T;
}

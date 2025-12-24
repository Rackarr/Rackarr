/**
 * HPE Brand Pack
 * Pre-defined device types for HPE ProLiant servers and Aruba networking equipment
 * Source: NetBox community devicetype-library
 */

import type { DeviceType } from '$lib/types';
import { CATEGORY_COLOURS } from '$lib/types/constants';

/**
 * HPE device definitions (homelab-relevant rack-mountable devices)
 */
export const hpeDevices: DeviceType[] = [
	// ============================================
	// ProLiant DL Series - 1U Servers
	// ============================================
	{
		slug: 'hpe-proliant-dl20-gen11',
		u_height: 1,
		manufacturer: 'HPE',
		model: 'ProLiant DL20 Gen11',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server',
		front_image: true,
		rear_image: true,
		airflow: 'front-to-rear'
	},
	{
		slug: 'hpe-proliant-dl360-gen11',
		u_height: 1,
		manufacturer: 'HPE',
		model: 'ProLiant DL360 Gen11',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server',
		front_image: true,
		rear_image: true,
		airflow: 'front-to-rear'
	},
	{
		slug: 'hpe-proliant-dl360-gen10',
		u_height: 1,
		manufacturer: 'HPE',
		model: 'ProLiant DL360 Gen10',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server',
		front_image: true,
		rear_image: true,
		airflow: 'front-to-rear'
	},
	{
		slug: 'hpe-proliant-dl360-gen9',
		u_height: 1,
		manufacturer: 'HPE',
		model: 'ProLiant DL360 Gen9',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server',
		front_image: true,
		rear_image: true,
		airflow: 'front-to-rear'
	},

	// ============================================
	// ProLiant DL Series - 2U Servers
	// ============================================
	{
		slug: 'hpe-proliant-dl380-gen11',
		u_height: 2,
		manufacturer: 'HPE',
		model: 'ProLiant DL380 Gen11',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server',
		front_image: true,
		rear_image: true,
		airflow: 'front-to-rear'
	},
	{
		slug: 'hpe-proliant-dl380-gen10',
		u_height: 2,
		manufacturer: 'HPE',
		model: 'ProLiant DL380 Gen10',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server',
		front_image: true,
		rear_image: true,
		airflow: 'front-to-rear'
	},
	{
		slug: 'hpe-proliant-dl380-gen9',
		u_height: 2,
		manufacturer: 'HPE',
		model: 'ProLiant DL380 Gen9',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server',
		airflow: 'front-to-rear'
	},
	{
		slug: 'hpe-proliant-dl380p-gen8',
		u_height: 2,
		manufacturer: 'HPE',
		model: 'ProLiant DL380p Gen8',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server',
		front_image: true,
		rear_image: true,
		airflow: 'front-to-rear'
	},

	// ============================================
	// Aruba Switches - 1930 Series (Entry-Level Smart Managed)
	// ============================================
	{
		slug: 'hpe-aruba-1930-24g',
		u_height: 1,
		manufacturer: 'HPE',
		model: 'Aruba 1930 24G',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network',
		airflow: 'passive'
	},
	{
		slug: 'hpe-aruba-1930-48g',
		u_height: 1,
		manufacturer: 'HPE',
		model: 'Aruba 1930 48G',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network',
		front_image: true,
		rear_image: true,
		airflow: 'passive'
	},

	// ============================================
	// Aruba Switches - 2530 Series (Layer 2+ Managed)
	// ============================================
	{
		slug: 'hpe-aruba-2530-24g',
		u_height: 1,
		manufacturer: 'HPE',
		model: 'Aruba 2530-24G',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network',
		front_image: true
	},
	{
		slug: 'hpe-aruba-2530-48g',
		u_height: 1,
		manufacturer: 'HPE',
		model: 'Aruba 2530-48G',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network',
		front_image: true
	},

	// ============================================
	// Aruba Switches - 6000 Series (Layer 3 Managed)
	// ============================================
	{
		slug: 'hpe-aruba-6000-24g-4sfp',
		u_height: 1,
		manufacturer: 'HPE',
		model: 'Aruba 6000-24G-4SFP',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network',
		front_image: true,
		rear_image: true
	},
	{
		slug: 'hpe-aruba-6000-48g-4sfp',
		u_height: 1,
		manufacturer: 'HPE',
		model: 'Aruba 6000-48G-4SFP',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network',
		front_image: true,
		rear_image: true
	}
];

/**
 * Mikrotik Brand Pack
 * Pre-defined device types for Mikrotik networking equipment
 */

import type { DeviceType } from '$lib/types';
import { CATEGORY_COLOURS } from '$lib/types/constants';

/**
 * Mikrotik device definitions
 * Based on SPEC.md Section 11.6.4
 */
export const mikrotikDevices: DeviceType[] = [
	// Cloud Router Switches
	{
		slug: 'crs326-24g-2s-plus',
		u_height: 1,
		manufacturer: 'Mikrotik',
		model: 'CRS326-24G-2S+',
		is_full_depth: true,
		airflow: 'side-to-rear',
		rackarr: {
			colour: CATEGORY_COLOURS.network,
			category: 'network'
		}
	},
	{
		slug: 'crs328-24p-4s-plus',
		u_height: 1,
		manufacturer: 'Mikrotik',
		model: 'CRS328-24P-4S+',
		is_full_depth: true,
		airflow: 'side-to-rear',
		rackarr: {
			colour: CATEGORY_COLOURS.network,
			category: 'network'
		}
	},
	{
		slug: 'crs309-1g-8s-plus',
		u_height: 1,
		manufacturer: 'Mikrotik',
		model: 'CRS309-1G-8S+',
		is_full_depth: true,
		airflow: 'side-to-rear',
		rackarr: {
			colour: CATEGORY_COLOURS.network,
			category: 'network'
		}
	},
	// Cloud Core Routers
	{
		slug: 'ccr2004-1g-12s-plus-2xs',
		u_height: 1,
		manufacturer: 'Mikrotik',
		model: 'CCR2004-1G-12S+2XS',
		is_full_depth: true,
		airflow: 'front-to-rear',
		rackarr: {
			colour: CATEGORY_COLOURS.network,
			category: 'network'
		}
	},
	// RouterBOARD
	{
		slug: 'rb5009ug-plus-s-plus-in',
		u_height: 1,
		manufacturer: 'Mikrotik',
		model: 'RB5009UG+S+IN',
		is_full_depth: true,
		airflow: 'front-to-rear',
		rackarr: {
			colour: CATEGORY_COLOURS.network,
			category: 'network'
		}
	}
];

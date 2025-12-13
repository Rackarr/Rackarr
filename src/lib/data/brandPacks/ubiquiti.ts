/**
 * Ubiquiti Brand Pack
 * Pre-defined device types for Ubiquiti networking equipment
 */

import type { DeviceType } from '$lib/types';
import { CATEGORY_COLOURS } from '$lib/types/constants';

/**
 * Ubiquiti device definitions
 * Based on SPEC.md Section 11.6.3
 */
export const ubiquitiDevices: DeviceType[] = [
	// UniFi Switches
	{
		slug: 'usw-pro-24',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Pro-24',
		is_full_depth: true,
		airflow: 'side-to-rear',
		rackarr: {
			colour: CATEGORY_COLOURS.network,
			category: 'network'
		}
	},
	{
		slug: 'usw-pro-48',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Pro-48',
		is_full_depth: true,
		airflow: 'side-to-rear',
		rackarr: {
			colour: CATEGORY_COLOURS.network,
			category: 'network'
		}
	},
	{
		slug: 'usw-pro-24-poe',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Pro-24-PoE',
		is_full_depth: true,
		airflow: 'side-to-rear',
		rackarr: {
			colour: CATEGORY_COLOURS.network,
			category: 'network'
		}
	},
	{
		slug: 'usw-pro-48-poe',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Pro-48-PoE',
		is_full_depth: true,
		airflow: 'side-to-rear',
		rackarr: {
			colour: CATEGORY_COLOURS.network,
			category: 'network'
		}
	},
	{
		slug: 'usw-aggregation',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Aggregation',
		is_full_depth: true,
		airflow: 'side-to-rear',
		rackarr: {
			colour: CATEGORY_COLOURS.network,
			category: 'network'
		}
	},
	// UniFi Dream Machines
	{
		slug: 'udm-pro',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'UDM-Pro',
		is_full_depth: true,
		airflow: 'front-to-rear',
		rackarr: {
			colour: CATEGORY_COLOURS.network,
			category: 'network'
		}
	},
	{
		slug: 'udm-se',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'UDM-SE',
		is_full_depth: true,
		airflow: 'front-to-rear',
		rackarr: {
			colour: CATEGORY_COLOURS.network,
			category: 'network'
		}
	},
	// UniFi NVRs
	{
		slug: 'unvr',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'UNVR',
		is_full_depth: true,
		airflow: 'front-to-rear',
		rackarr: {
			colour: CATEGORY_COLOURS.storage,
			category: 'storage'
		}
	},
	{
		slug: 'unvr-pro',
		u_height: 2,
		manufacturer: 'Ubiquiti',
		model: 'UNVR-Pro',
		is_full_depth: true,
		airflow: 'front-to-rear',
		rackarr: {
			colour: CATEGORY_COLOURS.storage,
			category: 'storage'
		}
	},
	// UniFi Power
	{
		slug: 'usp-pdu-pro',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USP-PDU-Pro',
		is_full_depth: false,
		airflow: 'passive',
		rackarr: {
			colour: CATEGORY_COLOURS.power,
			category: 'power'
		}
	}
];

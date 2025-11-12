// src/constants/usConstants.ts

export const US_STATES = [
	'AL',
	'AK',
	'AZ',
	'AR',
	'CA',
	'CO',
	'CT',
	'DE',
	'FL',
	'GA',
	'HI',
	'ID',
	'IL',
	'IN',
	'IA',
	'KS',
	'KY',
	'LA',
	'ME',
	'MD',
	'MA',
	'MI',
	'MN',
	'MS',
	'MO',
	'MT',
	'NE',
	'NV',
	'NH',
	'NJ',
	'NM',
	'NY',
	'NC',
	'ND',
	'OH',
	'OK',
	'OR',
	'PA',
	'RI',
	'SC',
	'SD',
	'TN',
	'TX',
	'UT',
	'VT',
	'VA',
	'WA',
	'WV',
	'WI',
	'WY',
];

export const US_TIME_ZONES = [
	'Pacific Time (GMT-8)',
	'Mountain Time (GMT-7)',
	'Central Time (GMT-6)',
	'Eastern Time (GMT-5)',
	'Alaska Time (GMT-9)',
	'Hawaii-Aleutian Time (GMT-10)',
];

export const toolOptions = [
	{ label: '3oz Scoop(Ivory #10)', value: '3oz Scoop' },
	{ label: 'teaspoon', value: 'teaspoon' },
	{ label: '1oz Ladel', value: '1oz Ladel' },
	{ label: '2oz Ladel', value: '2oz Ladel' },
	{ label: '3oz Ladel', value: '3oz Ladel' },
	{ label: '4oz Ladel', value: '4oz Ladel' },
	{ label: '5oz Ladel', value: '5oz Ladel' },
	{ label: '6oz Ladel', value: '6oz Ladel' },
];


export const shelfLifeOptions = [
	{ label: '4 Hours', value: '4 hours' },
	{ label: '8 Hours', value: '8 hours' },
	{ label: '1 Day', value: '1 Day' },
	{ label: '2 Days', value: '2 Days' },
	{ label: '3 Days', value: '3 Days' },
	{ label: '4 Days', value: '4 Days' },
	{ label: '5 Days', value: '5 Days' },
	{ label: '6 Days', value: '6 Days' },
	{ label: '7 Days', value: '7 Days' },
	{ label: '30 Days', value: '30 Days' },
	
];

export const panSizeOptions = [
	{ label: 'Original Package', value: 'Original Package' },
	{ label: '1/9 Pan', value: '1/9 Pan' },
	{ label: '1/6 Pan', value: '1/6 Pan' },
	{ label: '1/3 Pan', value: '1/3 Pan' },
	{ label: '1/2 Pan', value: '1/2 Pan' },
	{ label: 'Tray', value: 'Tray' },
	{ label: 'Squeeze Bottle', value: 'Squeeze Bottle' },
	{ label: 'Yellow Lid Shaker', value: 'Yellow Lid Shaker' },
];

export const portionSizeOptions = [
	{ label: '1 oz', value: '1 oz' },
	{ label: '2 oz', value: '2 oz' },
	{ label: '3 oz', value: '3 oz' },
	{ label: '4 oz', value: '4 oz' },
	{ label: '5 oz', value: '5 oz' },
	{ label: '6 oz', value: '6 oz' },
	{ label: '7 oz', value: '7 oz' },
	{ label: '8 oz', value: '8 oz' },
];

export const tempCategoryRanges: Record<string, { min: number; max: number }> = {
	FROZEN: { min: -100, max: 32 },
	REFRIGERATED: { min: 33, max: 41 },
	ROOM_TEMP: { min: 42, max: 90 },
	HOT_HOLDING: { min: 120, max: 200 },
};

export const tempCategories = [
	{ label: 'Frozen (-100°F to 32°F)', value: 'FROZEN' },
	{ label: 'Refrigerated (33°F to 41°F)', value: 'REFRIGERATED' },
	{ label: 'Room Temp (42°F to 90°F)', value: 'ROOM_TEMP' },
	{ label: 'Hot Holding (120°F to 200°F)', value: 'HOT_HOLDING' },
];
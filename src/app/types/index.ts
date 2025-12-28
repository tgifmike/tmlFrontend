export const AppRole = {

    MEMBER: 'MEMBER',
    MANAGER: 'MANAGER',
    CONTRIBUTOR: 'CONTRIBUTOR',
} as const ;

export type AppRole = (typeof AppRole)[keyof typeof AppRole];   

export const AccessRole = {
	ADMIN: 'ADMIN',
	USER: 'USER',
	SRADMIN: 'SRADMIN',
} as const;

export type AccessRole = (typeof AccessRole)[keyof typeof AccessRole];

export interface User {
	id?: string;
	userName?: string | null;
	userEmail?: string | null;
	userImage?: string | null;
	userActive?: boolean | null;
	accountId?: string | null;
	accessRole?: string | null;
	appRole?: string | null;
	firstLogin?: boolean | null;
	googleId?: string | null;
	createdAt?: string | null;
	updatedAt?: string | null;
}

export interface Account {
	id?: string;
	accountName: string;
	accountActive: boolean;
	accountImage: string;
	imageBase64?: string | null;	
	createdAt?: string | null;
	updatedAt?: string | null;
}

export interface Locations {
	id?: string;
	accountId?: string | null;
	locationName: string;
	locationActive: boolean;
	locationStreet: string;
	locationTown: string;
	locationState: string;
	locationZipCode: string;
	locationTimeZone: string;
	locationLatitude: number;
	locationLongitude: number;
	geocodedFromZipFallback: boolean;
	lineCheckDailyGoal: number;
	startOfWeek: string;
	createdAt?: string | null;
	updatedAt?: string | null;
}

export interface Station {
	id?: string;
	items: any[];
	stationName: string;
	stationActive: boolean;
	location: Location;
	sortOrder: number;
	createdAt?: string | null;
	updatedAt?: string | null;
}

export interface Item {
	id?: string;
	itemName: string;
	shelfLife: string;
	panSize: string;
	toolName: string;
	isTool: boolean;
	portionSize: string;
	portioned: boolean;
	temperature: number;
	itemTemperature: number;
	tempCategory: string;
	minTemp: number;
	maxTemp: number;
	isTempTaken: boolean;
	ischecked: boolean;
	isCheckMark: boolean;
	templateNotes: string;
	observations: string;
	itemActive: boolean;
	sortOrder: number;
	location: Location;
	items?: Item[];
	itemNotes?: string;
	checkMark?: boolean;
	itemChecked?: boolean;
	tool?: boolean;
	tempTaken?: boolean;
	completedAt?: string | null;
	createdAt?: string | null;
	updatedAt?: string | null;
}
// types/lineCheck.ts
// export interface Item {
//   id: string;
//   itemName: string;
//   isChecked: boolean;
//   notes?: string;
//   temperature?: number;
// }

export interface LineCheckStation {
	id: string;
	stationName: string;
	sortOrder: number;
	items: Item[];
}

export interface LineCheck {
	id: string;
	checkTime: string;
	completedAt: string;
	stations: LineCheckStation[];
	username?: string;
}

interface LineCheckItem {
	id: string;
	itemName: string;
	isTool: boolean;
	isPortioned: boolean;
	isTempTaken: boolean;
	isCheckMark: boolean;
	shelfLife?: string;
	panSize?: string;
	itemNotes?: string;
	temperature?: number;
	minTemp: number;
	maxTemp: number; // user input
	checked?: boolean; // user input
	observations?: string;
	 // user input per item
}

export interface LineCheckSettings {
	startOfWeek:
		| 'SUNDAY'
		| 'MONDAY'
		| 'TUESDAY'
		| 'WEDNESDAY'
		| 'THURSDAY'
		| 'FRIDAY'
		| 'SATURDAY';
	dailyGoal: number;
}
export enum OptionType {
	TOOL = 'TOOL',
	SHELF_LIFE = 'SHELF_LIFE',
	PAN_SIZE = 'PAN_SIZE',
	PORTION_SIZE = 'PORTION_SIZE',
};



export interface OptionEntity {
	id: string;
	optionName: string;
	optionActive: boolean;
	sortOrder: number;
	optionType: OptionType;
	accountId: string;
	account: {
		id: string;
		name?: string;
		// add other account fields if needed
	};
	createdAt?: string;
	updatedAt?: string;
	createdBy?: string;
	updatedBy?: string;
	deletedAt?: string | null;
	deletedBy?: string | null;
}

export const OptionTypeLabels: Record<OptionType, string> = {
	[OptionType.TOOL]: 'Tool',
	[OptionType.SHELF_LIFE]: 'Shelf Life',
	[OptionType.PAN_SIZE]: 'Pan Size',
	[OptionType.PORTION_SIZE]: 'Portion Size',
};

export type OptionAudit = {
	optionName: string;
	optionActive: boolean;
	optionType: string;
	sortOrder: number;
	createdAt: string;
	createdBy: string;
	updatedAt?: string;
	updatedBy?: string;
	deletedAt?: string;
	deletedBy?: string;

	// optional previous values for diffing
	previousOptionName?: string;
	previousOptionType?: string;
	previousSortOrder?: number;
	previousActive?: boolean;
};

export interface OptionHistory {
	id: string;
	optionId: string;
	accountId: string;
	optionName: string;
	optionActive: boolean;
	optionType: string;
	sortOrder: number;
	changedBy: string;
	changedByName: string;
	changeAt: string;
	changeType: 'CREATED' | 'UPDATED' | 'DELETED';
	oldValues: Record<string, any>; // This is key
}


// export type Option = {
// 	id: string;
// 	optionName: string;
// 	optionActive: boolean;
// 	sortOrder: number;
// 	optionType: string;
// };

export interface AccountHistory {
	id: string;
	accountId: string;
	accountName?: string;
	accountActive?: boolean;
	imageBase64?: string;
	changedBy: string;
	changedByName: string;
	changeAt: string; // ISO string from backend
	changeType: 'CREATED' | 'UPDATED' | 'DELETED';
	oldValues?: Record<string, string>;
}

export interface LocationHistoryEntity {
	id: string;
	locationId: string;
	locationName: string;
	changeType: 'CREATED' | 'UPDATED' | 'DELETED';
	changeAt: string;
	changedBy?: string;
	changedByName?: string;
	oldValues?: string;
	newValues?: string;
}

// ---------------- StationEntity ----------------
export interface StationEntity {
	id: string; // UUID
	currentUserId: string;
	stationName: string;
	description?: string;
	sortOrder?: number;
	stationActive?: boolean;
	locationId: string; // ID of the parent location
	createdAt?: string; // ISO timestamp
	updatedAt?: string; // ISO timestamp
}

// ---------------- StationDto ----------------
// DTO used for listing stations (can omit some fields if needed)
export interface StationDto {
	id?: string;
	stationName: string;
	sortOrder?: number;
	stationActive: boolean;
}

export interface StationHistoryEntity {
	id: string;
	stationName: string;
	changeType: 'CREATED' | 'UPDATED' | 'DELETED';
	changeAt: string;
	changedBy?: string;
	changedByName?: string;
	oldValues?: Record<string, string>;
}

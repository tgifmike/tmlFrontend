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
	createdAt?: string | null;
	updatedAt?: string | null;
}

export interface Station {
	id?: string;
	stationName: string;
	stationActive: boolean;
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
	isPortioned: boolean;
	temperature: number;
	itemTemperature: number;
	tempCategory: string;
	minTemp: number;
	maxTemp: number;
	isTempTaken: boolean;
	ischecked: boolean;
	isCheckMark: boolean;
	itemNotes: string;
	lineCheckNotes: string;
	itemActive: boolean;
	sortOrder: number;
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
	lineNotes?: string; // user input per item
}


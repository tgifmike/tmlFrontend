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
	locationLatitude: string;
	locationLongitude: string;
	createdAt?: string | null;
	updatedAt?: string | null;
}

export interface Station {
	id?: string;
	stationName: string;
	stationActive: boolean;
	createdAt?: string | null;
	updatedAt?: string | null;
}

export interface Item {
	id?: string;
	itemName: string;
	itemTemperature: number;
	isTempTaken: boolean;
	isCheckMark: boolean;
	notes: string;
	itemActive: boolean;
	sortOrder: number;
	createdAt?: string | null;
	updatedAt?: string | null;
}
import { StationEntity, StationDto, StationHistoryEntity } from '../types';
import { request } from './axios';


// ---------------- CREATE ----------------


export const createStation = async (
	locationId: string,
	data: Partial<StationDto>,
	userId: string
): Promise<StationDto> => {
	const res = await request<StationDto>({
		method: 'POST',
		url: `/stations/location/${locationId}`,
		data,
		headers: { 'X-User-Id': userId },
	});

	return res.data as StationDto;
}

// ---------------- TOGGLE ACTIVE ----------------

export const toggleStationActive = async (
	stationId: string,
	active: boolean,
	userId: string,
) => {
	return request({
		method: 'PATCH',
		url: `/stations/${stationId}/active`,
		params: { active },
		headers: { 'X-User-Id': userId },
	})
}



// ---------------- READ ----------------

// Get all stations
export const getAllStations = async () => {
	return request<StationEntity[]>({
		method: 'GET',
		url: '/stations',
	});
};

// Get stations by location
export const getStationsByLocation = async (locationId: string) => {
	return request<StationDto[]>({
		method: 'GET',
		url: `/stations/by-location/${locationId}`,
	});
};

// Get station by name
export const getStationByName = async (stationName: string) => {
	return request<StationEntity>({
		method: 'GET',
		url: `/stations/by-name/${stationName}`,
	});
};

// Get station by ID
export const getStationById = async (id: string) => {
	return request<StationEntity>({
		method: 'GET',
		url: `/stations/${id}`,
	});
};




// ---------------- PARTIAL UPDATE ----------------

// Partial update
export const updateStation = async (
	stationId: string,
	data: Partial<StationEntity>,
	userId: string,
): Promise<StationEntity> => {
	const res = await request<StationEntity>({
		method: 'PUT',
		url: `/stations/${stationId}`,
		data,
		headers: { 'X-User-Id': userId },
	});

	return res.data as StationEntity;
}



// ---------------- DELETE ----------------

export const deleteStation = async (stationId: string, userId: string) => {
	return request<void>({
		method: 'DELETE',
		url: `/stations/${stationId}`,
		headers: { 'X-User-Id': userId },
	});
};


// ---------------- REORDER ----------------


export const reorderStations = async (
    locationId: string,
    stationIdsInOrder: string[],
    userId: string
) => {
    return request<void>({
        method: 'PUT',
        url: `/stations/${locationId}/stations/reorder?userId=${userId}`,
		data: stationIdsInOrder,
		headers: { 'X-User-Id': userId },
    });
};

export const getStationHistory = async (locationId?: string) => {
	if (!locationId) return [];

	return request<StationHistoryEntity[]>({
		method: 'GET',
		url: `/stations/history?locationId=${locationId}`, // use query param
	});
};


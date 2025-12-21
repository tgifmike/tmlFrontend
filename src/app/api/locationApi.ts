import { LineCheckFormValues } from '@/components/locaitons/LineCheckSettingsForm';
import { LocationHistoryEntity, Locations } from '../types';
import { request } from './axios';

// Get all locations
export const getAllLocations = async () => {
	return request<Locations[]>({
		method: 'GET',
		url: '/locations/getAllLocations',
	});
};

// Get locations by account ID
export const getLocationsByAccountId = async (accountId: string) => {
	return request<Locations[]>({
		method: 'GET',
		url: `/locations/accounts/${accountId}/locations`,
	});
};

// Delete location
export const deleteLocation = async (id: string, userId: string) => {
	return request<Locations>({
		method: 'DELETE',
		url: `/locations/${id}?userId=${userId}`,
	});
};

// Create location
export const createLocation = async (
	accountId: string,
	userId: string,
	data: any
) => {
	const payload = {
		locationName: data.locationName,
		locationStreet: data.street,
		locationTown: data.town,
		locationState: data.state,
		locationZipCode: data.zipCode,
		locationTimeZone: data.timeZone,
	};

	return request<Locations>({
		method: 'POST',
		url: `/locations/${accountId}/createLocation?userId=${userId}`,
		data: payload,
	});
};

// Toggle active
export const toggleLocationActive = async (
	id: string,
	locationActive: boolean,
	userId: string
) => {
	return request<Locations>({
		method: 'PATCH',
		url: `/locations/${id}/active?active=${locationActive}&userId=${userId}`,
	});
};

// Update location
export const updateLocation = async (id: string, userId: string, data: any) => {
	const payload = {
		locationName: data.locationName,
		locationStreet: data.locationStreet,
		locationTown: data.locationTown,
		locationState: data.locationState,
		locationZipCode: data.locationZipCode,
		locationTimeZone: data.locationTimeZone,
	};

	return request<Locations>({
		method: 'PATCH',
		url: `/locations/${id}/updateLocation?userId=${userId}`,
		data: payload,
	});
};

// Grant access to location
export const grantLocationAccess = async (
	userId: string,
	locationId: string
) => {
	return request({
		method: 'POST',
		url: `/user-access-locations/${userId}/locations/${locationId}`,
	});
};

// Revoke access to location
export const revokeLocationAccess = async (
	userId: string,
	locationId: string
) => {
	return request({
		method: 'DELETE',
		url: `/user-access-locations/${userId}/locations/${locationId}`,
	});
};

// Get user access to locations
export const getUserLocationAccess = async (userId: string) => {
	return request<Locations[]>({
		method: 'GET',
		url: `/user-access-locations/${userId}/locations`,
	});
};

// Get weather for location
export const getWeather = async (lat: number, lon: number) => {
	return request({
		method: 'GET',
		url: `/api/weather/getWeather?lat=${lat}&lon=${lon}`,
	});
};

// Get line check settings
export const getLineCheckSettings = async (locationId: string) => {
	return request<LineCheckFormValues>({
		method: 'GET',
		url: `/locations/${locationId}/line-check-settings`,
	});
};

// Update line check settings
export const updateLineCheckSettings = async (
	locationId: string,
	userId: string,
	data: LineCheckFormValues
) => {
	const payload = {
		dayOfWeek: data.dayOfWeek.toLowerCase(),
		dailyGoal: data.dailyGoal,
	};

	return request<LineCheckFormValues>({
		method: 'PUT',
		url: `/locations/${locationId}/line-check-settings?userId=${userId}`,
		data: payload,
	});
};

/**
 * Fetch location history.
 * If `locationId` is provided, fetch history for that specific location.
 * Otherwise, fetch all location history.
 */
export const getLocationHistory = async (
  locationId?: string
): Promise<LocationHistoryEntity[]> => {
  const url = locationId
    ? `/locations/history?locationId=${locationId}`
    : '/locations/history';

  const response = await request<LocationHistoryEntity[]>({
    method: 'GET',
    url,
  });

  return (response as { data: LocationHistoryEntity[] }).data;
};
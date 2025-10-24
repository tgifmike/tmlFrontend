
import { Locations } from '../types';
import { request } from './axios';




//get all locaitons
export const getAllLocations = async () => {
    return request<Locations[]>({
        method: 'GET',
        url: '/locations/getAllLocations'
    })
}

//get locations by account id
export const getLocationsByAccountId = async (accountId: string) => {
    return request<Locations[]>({
        method: 'GET',
        url: `/locations/accounts/${accountId}/locations`,
    });
}

export const deleteLocation = async (id: string) => {
    return request<Locations>({
        method: 'DELETE',
        url: `/locations/${id}`,
    });
}

export const createLocation = async (accountId: string, data: any) => {
	
    
    // map frontend form keys to backend DTO keys
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
		url: `/locations/${accountId}/createLocation`,
		data: payload,
	});
};

export const toggleLocationActive = async (id: string, locationActive: boolean) => {
    return request<Locations>({
        method: 'PATCH',
        url: `/locations/${id}/active?active=${locationActive}`
    });
}

export const updateLocation = async (id: string, data: any) => {
    

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
        url: `/locations/${id}/updateLocation`,
        data: payload,
    });
}

//grant access to location
export const grantLocationAccess = async (userId: string, locationId: string) => {
    return request({
            method: 'POST',
            url: `/user-access-locations/${userId}/locations/${locationId}`,
        });
}

//revoke access to location
export const revokeLocationAccess = async (userId: string, locationId: string) => {
    return request({
            method: 'DELETE',
            url: `/user-access-locations/${userId}/locations/${locationId}`,
        });
}

//get user access to locations
export const getUserLocationAccess = async (userId: string) => {
    return request<Locations[]>({
            method: 'GET',
            url: `/user-access-locations/${userId}/locations`,
        });
}
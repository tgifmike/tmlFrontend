
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
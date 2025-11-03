import { request } from './axios';
import { Station } from '../types';


//get all stations
export const getAllStations = async () => {
    return request<Station[]>({
        method: 'GET',
        url: '/stations/getAll'
    })
}

export const getStationsByLocation = async (locationId: string) => {
	return request<Station[]>({
		method: 'GET',
		url: `/stations/${locationId}/getStationByLocation`,
	});
};


//create station
export const createStation = async (locationId: string, data: any) => {
	return request<Station>({
		method: 'POST',
		url: `/stations/${locationId}/createStation`,
		data,
	});
};

//toggle station active
export const toggleStationActive = async (
	locationId: string,
	stationId: string,
	stationActive: boolean
) => {
	return request<Station>({
		method: 'PATCH',
		url: `/stations/${locationId}/stations/${stationId}/active?active=${stationActive}`,
	});
};

//update station
export const updateStation = async (
	locationId: string,
	stationId: string,
	stationName: string
) => {
	return request<Station>({
		method: 'PATCH',
		url: `/stations/${locationId}/updateStation/${stationId}`,
        data: { stationName },
         
    });
   
};

//delte station
export const deleteStation = async(
    locationId: string,
    stationId: string
) => {
    return request<Station>({
        method: 'DELETE',
        url: `/stations/${locationId}/deleteStation/${stationId}`
    })
}

//reorder
export const reorderStations = async (locationId: string, stationIdsInOrder: string[]) => {
	return request({
		method: 'PUT',
		url: `/stations/${locationId}/stations/reorder`,
		data: stationIdsInOrder,
	})
}
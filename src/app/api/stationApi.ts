import { request } from './axios';
import { Account, Station } from '../types';


//get all stations
export const getAllStations = async () => {
    return request<Station[]>({
        method: 'GET',
        url: '/stations/getAll'
    })
}

//create station
export const createStation = async (data: any) => {
    return request<Station>({
        method: 'POST',
        url: '/stations/createStation',
        data: data,
    })
}

//toggle station active
export const toggleStationActive = async (id: string, stationActive: boolean) => {
    return request<Station>({
        method: 'PATCH',
        url: `/stations/${id}/active?active=${stationActive}`
    })
}

//update station
export const updateStation = async (id: string, stationName: string) => {
    return request<Station>({
        method: 'PATCH',
        url: `/stations/${id}`,
        data: {stationName}
    })
}
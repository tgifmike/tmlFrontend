import { Item } from '../types';
import { request } from './axios';


//create item
export const createItem = async (stationId: string, data: any) => {
    return request<Item>({
        method: 'POST',
        url: `/items/${stationId}/createItem`,
        data,
    })
}

//get all items for stations
export const getItemsByStation = async (stationId: string) => {
    return request<Item[]>({
        method: 'GET',
        url: `/items/${stationId}/getAllItems`
    })
}

//get item by id
export const getItemsById = async (stationId: string, itemId: string) => {
	return request<Item[]>({
		method: 'GET',
		url: `/items/${stationId}/getItem/${itemId}`,
	});
};

//update item
export const updateItem = async (stationId: string, itemId: string, data: any) => {
    return request<Item[]>({
		method: 'PATCH',
		url: `/items/${stationId}/updateItem/${itemId}`,
		data,
	});
}

//toggle active
export const toggleItemActive = async (stationId: string, itemId: string, itemActive:boolean) =>{
    return request<Item[]>({
		method: 'PATCH',
		url: `/items/${stationId}/${itemId}/active?active=${itemActive}`,
	});
}

//update item
export const deleteItem = async (stationId: string, itemId: string) => {
    return request<Item[]>({
		method: 'DELETE',
		url: `/items/${stationId}/deleteItem/${itemId}`,
	});
}

//reooder sort
export const reorderItems = async (stationId: string, items: Item[]) => {
	return request({
		method: 'PUT',
		url: `/items/${stationId}/items/reorder`,
		data: items,
	});
};

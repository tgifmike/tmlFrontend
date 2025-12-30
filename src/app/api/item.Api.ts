import { Item, ItemHistory } from '../types';
import { request } from './axios';


//create item
export const createItem = async (stationId: string, data: any, userId: string) => {
    
	 if (!userId) throw new Error('User ID is required');

		// Make sure the DTO includes stationId
		const dto = {
			stationId,
			...data,
		};
	
	return request<Item>({
        method: 'POST',
        url: `/items/${stationId}/createItem`,
		data: dto,
		headers: { 'X-User-Id': userId },
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
export const updateItem = async (
	stationId: string,
	itemId: string,
	data: Partial<Item>,
	userId: string
): Promise<Item> => {
	const res = await request<Item>({
		method: 'PUT',
		url: `/items/${stationId}/updateItem/${itemId}`, 
		data,
		headers: { 'X-User-Id': userId },
	});
	console.log('updateItem response:', res);
	return res.data as Item;
};


//toggle active
export const toggleItemActive = async (
	stationId: string,
	itemId: string,
	active: boolean,
	userId: string
) => {
    return request<Item>({
		method: 'PATCH',
		url: `/items/${stationId}/${itemId}/active`,
		params: {active},
		headers: { 'X-User-Id': userId },
	});
}

//delete item
export const deleteItem = async (itemId: string, userId: string) => {
	return request<void>({
		method: 'DELETE',
		url: `/items/${itemId}`,
		headers: { 'X-User-Id': userId },
	});
};


//reooder sort
export const reorderItems = async (
	stationId: string,
	orderedIds: string[],
	userId: string
) => {
	return request<void>({
		method: 'PUT',
		url: `/items/${stationId}/reorder`,
		data: orderedIds,
		headers: { 'X-User-Id': userId },
	});
};


//get item history
export const getItemHistory = async (stationId: string): Promise<ItemHistory[]> => {
	const response = await request<ItemHistory[]>({
		method: 'GET',
		url: `/items/history`,
		params: { stationId },
	});
	return (response as { data: ItemHistory[] }).data;
};



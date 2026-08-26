import {
	Item,
	ItemCriterion,
	ItemHistory,
	ItemType,
} from '../types';
import { request } from './axios';

export type ItemPayload = Partial<Item> & {
	itemName: string;
	itemType: ItemType;
	stationId?: string;
};

export type ItemCriterionPayload = Omit<
	ItemCriterion,
	'id' | 'itemId'
>;

//create item
export const createItem = async (
	stationId: string,
	data: ItemPayload,
	userId: string,
) => {
	if (!userId) throw new Error('User ID is required');
	if (!stationId?.trim()) throw new Error('Station ID is required');

	// Put stationId last so stale or undefined form data can never overwrite it.
	const dto = {
		...data,
		stationId: stationId.trim(),
	};
	
	return request<Item>({
		method: 'POST',
		url: `/items/${stationId.trim()}/createItem`,
		data: dto,
		headers: { 'X-User-Id': userId },
	});
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
	return request<Item>({
		method: 'GET',
		url: `/items/${stationId}/getItem/${itemId}`,
	});
};

//update item
export const updateItem = async (
	stationId: string,
	itemId: string,
	data: Partial<ItemPayload>,
	userId: string
): Promise<Item> => {
	const res = await request<Item>({
		method: 'PUT',
		url: `/items/${stationId}/updateItem/${itemId}`, 
		data,
		headers: { 'X-User-Id': userId },
	});
	if (res.error || !res.data) {
		throw new Error(res.error || 'Failed to update item');
	}
	return res.data as Item;
};

// item criteria
export const getItemCriteria = async (itemId: string) => {
	return request<ItemCriterion[]>({
		method: 'GET',
		url: `/items/${itemId}/criteria`,
	});
};

export const createItemCriterion = async (
	itemId: string,
	data: ItemCriterionPayload,
) => {
	return request<ItemCriterion>({
		method: 'POST',
		url: `/items/${itemId}/criteria`,
		data,
	});
};

export const updateItemCriterion = async (
	itemId: string,
	criterionId: string,
	data: ItemCriterionPayload,
) => {
	return request<ItemCriterion>({
		method: 'PUT',
		url: `/items/${itemId}/criteria/${criterionId}`,
		data,
	});
};

export const deleteItemCriterion = async (
	itemId: string,
	criterionId: string,
) => {
	return request<void>({
		method: 'DELETE',
		url: `/items/${itemId}/criteria/${criterionId}`,
	});
};

export const setItemCriterionActive = async (
	itemId: string,
	criterionId: string,
	active: boolean,
) => {
	return request<ItemCriterion>({
		method: 'PATCH',
		url: `/items/${itemId}/criteria/${criterionId}/active`,
		params: { active },
	});
};

export const reorderItemCriteria = async (
	itemId: string,
	orderedCriterionIds: string[],
) => {
	return request<void>({
		method: 'PUT',
		url: `/items/${itemId}/criteria/reorder`,
		data: orderedCriterionIds,
	});
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

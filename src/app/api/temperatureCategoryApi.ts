import type { TemperatureCategory } from '../types';
import { request } from './axios';

export type TemperatureCategoryInput = Pick<
	TemperatureCategory,
	'name' | 'code' | 'minTemp' | 'maxTemp' | 'unit' | 'active'
>;

export const getTemperatureCategories = (locationId: string) =>
	request<TemperatureCategory[]>({
		method: 'GET',
		url: '/temperature-categories',
		params: { locationId },
	});

export const createTemperatureCategory = async (
	locationId: string,
	data: TemperatureCategoryInput,
	userId: string,
): Promise<TemperatureCategory> => {
	const response = await request<TemperatureCategory>({
		method: 'POST',
		url: '/temperature-categories',
		data: { ...data, locationId },
		headers: { 'X-User-Id': userId },
	});

	if (!response.data) {
		throw new Error(response.error || 'Failed to create temperature category');
	}

	return response.data;
};

export const updateTemperatureCategory = async (
	categoryId: string,
	data: Partial<TemperatureCategoryInput>,
	userId: string,
): Promise<TemperatureCategory> => {
	const response = await request<TemperatureCategory>({
		method: 'PUT',
		url: `/temperature-categories/${categoryId}`,
		data,
		headers: { 'X-User-Id': userId },
	});

	if (!response.data) {
		throw new Error(response.error || 'Failed to update temperature category');
	}

	return response.data;
};

export const toggleTemperatureCategory = async (
	categoryId: string,
	active: boolean,
	userId: string,
): Promise<TemperatureCategory> => {
	const response = await request<TemperatureCategory>({
		method: 'PATCH',
		url: `/temperature-categories/${categoryId}/active`,
		params: { active },
		headers: { 'X-User-Id': userId },
	});

	if (!response.data) {
		throw new Error(response.error || 'Failed to update temperature category status');
	}

	return response.data;
};

export const deleteTemperatureCategory = async (
	categoryId: string,
	userId: string,
) => {
	const response = await request<void>({
		method: 'DELETE',
		url: `/temperature-categories/${categoryId}`,
		headers: { 'X-User-Id': userId },
	});

	if (response.error) throw new Error(response.error);
};

export const addDefaultTemperatureCategories = async (
	locationId: string,
	userId: string,
): Promise<TemperatureCategory[]> => {
	const response = await request<TemperatureCategory[]>({
		method: 'POST',
		url: `/temperature-categories/location/${locationId}/defaults`,
		headers: { 'X-User-Id': userId },
	});

	if (!response.data) {
		throw new Error(response.error || 'Failed to add default temperature categories');
	}

	return response.data;
};

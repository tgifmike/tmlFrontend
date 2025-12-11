
import { OptionEntity, OptionType } from '../types';
import { request } from './axios';

/**
 * Create a new option
 */
export const createOption = async (
	data: Partial<OptionEntity>,
	userId: string
): Promise<OptionEntity> => {
	const res = await request<OptionEntity>({
		method: 'POST',
		url: '/options',
		data,
		headers: { 'X-User-Id': userId },
	});

	// Make sure to return the data itself, not the Axios response wrapper
	return res.data as OptionEntity;
};


/**
 * Get all options for an account, optionally filtered by optionType
 */
export const getOptions = async (
	accountId: string,
	optionType?: OptionType
) => {
	const params: Record<string, any> = { accountId };
	if (optionType) params.optionType = optionType;

	return request<OptionEntity[]>({
		method: 'GET',
		url: `/options`,
		params,
	});
};

/**
 * Get options by type (alternative endpoint)
 */
export const getOptionsByType = async (
	accountId: string,
	optionType: OptionType
) => {
	return request<OptionEntity[]>({
		method: 'GET',
		url: `/options/by-type`,
		params: { accountId, optionType },
	});
};

/**
 * Update an existing option
 */
export const updateOption = async (
	optionId: string,
	data: Partial<OptionEntity>,
	userId: string
) => {
	return request<OptionEntity>({
		method: 'PUT',
		url: `/options/${optionId}`,
		data,
		headers: {
			'X-User-Id': userId,
		},
	});
};

/**
 * Soft delete an option
 */
export const deleteOption = async (optionId: string, userId: string) => {
	return request<void>({
		method: 'DELETE',
		url: `/options/${optionId}`,
		headers: {
			'X-User-Id': userId,
		},
	});
};

/**
 * Reorder options after drag & drop
 * `orderedOptionIds` is an array of option UUIDs in the new order
 */
export const reorderOptions = async (
	accountId: string,
	optionType: OptionType | null,
	orderedIds: string[],
	userId: string
) => {
	const params: Record<string, any> = { accountId };
	if (optionType) params.optionType = optionType;

	return request<void>({
		method: 'PUT',
		url: '/options/reorder',
		params,
		data: orderedIds,
		headers: { 'X-User-Id': userId },
	});
};




//toggle option active status
export const toggleOptionActive = async (
	optionId: string,
	active: boolean,
	userId: string
) => {
	return request({
		method: 'PUT',
		url: `/options/${optionId}/active`,
		params: { active },
		headers: { 'X-User-Id': userId },
	});
};

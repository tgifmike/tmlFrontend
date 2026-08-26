
import { OptionAudit, OptionEntity, OptionHistory, OptionType } from '../types';
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

	if (res.error) throw new Error(res.error);
	if (!res.data) throw new Error('The server did not return the created option.');
	return res.data;
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
): Promise<OptionEntity> => {
	const res = await request<OptionEntity>({
		method: 'PUT',
		url: `/options/${optionId}`,
		data,
		headers: { 'X-User-Id': userId },
	});

	if (res.error) throw new Error(res.error);
	if (!res.data) throw new Error('The server did not return the updated option.');
	return res.data;
};



/**
 * Soft delete an option
 */
export const deleteOption = async (optionId: string, userId: string) => {
	const response = await request<void>({
		method: 'DELETE',
		url: `/options/${optionId}`,
		headers: {
			'X-User-Id': userId,
		},
	});

	if (response.error) throw new Error(response.error);
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

	const response = await request<void>({
		method: 'PUT',
		url: '/options/reorder',
		params,
		data: orderedIds,
		headers: { 'X-User-Id': userId },
	});

	if (response.error) throw new Error(response.error);
};




//toggle option active status
export const toggleOptionActive = async (
	optionId: string,
	active: boolean,
	userId: string
) => {
	const response = await request({
		method: 'PUT',
		url: `/options/${optionId}/active`,
		params: { active },
		headers: { 'X-User-Id': userId },
	});

	if (response.error) throw new Error(response.error);
	return response.data;
};

//logs
export const getOptionHistory = async (
	accountId: string
): Promise<OptionHistory[]> => {
	const response = await request<OptionHistory[]>({
		method: 'GET',
		url: '/options/history',
		params: { accountId },
	});

	if (response.error) throw new Error(response.error);
	return response.data ?? [];
};


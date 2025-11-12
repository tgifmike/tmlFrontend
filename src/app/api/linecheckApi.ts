import { LineCheck } from "../types";
import { request } from './axios';

//create linecheck
export const createLineCheckApi = async (
	userId: string,
	stationIds: string[]
) => {
	return request<LineCheck>({
		method: 'POST',
		url: `/line-checks/create?userId=${userId}`,
		data: stationIds,
	});
};

// Fetch all line checks for a location or user
export const getLineChecksApi = async () => {
    return request<LineCheck[]>({
        method: 'GET',
        url: `/line-checks/getAllLineChecks`,
    });
};

// Fetch single line check by ID
export const getLineCheckByIdApi = async (id: string) => {
    return request<LineCheck>({
        method: 'GET',
        url: `/line-checks/${id}`,
    });
};

export const recordLineCheckApi = (payload: any) => {
	return request<LineCheck>({
		method: 'POST',
		url: `/line-checks/save`,
		data: payload,
	});
};


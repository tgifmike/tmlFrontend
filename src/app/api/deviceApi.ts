import { IpadDevice } from '../types';
import { request } from './axios';

export const getDevicesForAccount = async (accountId: string) =>
	request<IpadDevice[]>({
		method: 'GET',
		url: `/ipad/devices/accounts/${accountId}`,
	});

export const revokeIpadDevice = async (deviceId: string) =>
	request<void>({
		method: 'DELETE',
		url: `/ipad/devices/${deviceId}`,
	});

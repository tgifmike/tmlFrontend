import axios, { AxiosRequestConfig } from "axios";
import { User } from "../types";
import api from "./axios";







// Generic helper for GET, POST, etc.
export async function request<T>(
	config: AxiosRequestConfig
): Promise<{ data?: T; error?: string }> {
	try {
		const response = await api.request<T>(config);
		return { data: response.data };
	} catch (err) {
		let errorMsg = 'An unexpected error occurred';
		if (axios.isAxiosError(err)) {
			errorMsg = err.response?.data?.message || err.message;
		}
		console.error(errorMsg);
		return { error: errorMsg };
	}
}

// get all users
export const getAllUsers = async () => {
	return request<User[]>({ method: 'GET', url: '/users/all' });
};

//toggle active flag
export const toggleUserActive = async (id: string, active: boolean) => {
    return request<User>({ method: 'PATCH', url: `/users/${id}/active?active=${active}` });
}

//update user access role
export const updateUserAccessRole = async (id: string, accessRole: string) => {
	return request<User>({
		method: 'PATCH',
		url: `/users/${id}/accessRole?role=${accessRole}`, 
	});
};

//update user app role
export const updateUserAppRole = async (id: string, appRole: string) => {
    return request<User>({ method: 'PATCH', url: `/users/${id}/appRole?role=${appRole}` });

};


// Example usage: create a user
// export const createUser = async (user: User) => {
// 	return request<User>({ method: 'POST', url: '/users', data: user });
// };


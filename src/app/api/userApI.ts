import axios, { AxiosRequestConfig } from "axios";
import { User } from "../types";
import api from "./axios";
import { toast } from "sonner";







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

//delete user
export const deleteUser = async (id: string) => {
	return await api.delete(`/users/delete/${id}`);
};

//update user name and email
export interface UpdateUserPayload {
	name?: string;
	email?: string;
}

export const updateUser = async (userId: string, data: UpdateUserPayload) => {
	try {
		const response = await api.put(
			`/users/update/${userId}`, // URL
			{
				name: data.name, // <-- body
				email: data.email, // <-- body
			}
			// optional config as third argument
		);
		return response.data;
	} catch (error: any) {
		if (axios.isAxiosError(error) && error.response) {
			// throw meaningful error up to caller
			const message =
				error.response.data?.message ||
				error.response.data?.error ||
				'Failed to update user';
			throw new Error(message);
		}
		throw new Error('Failed to update user');
	}
};



// create a user
type CreateUserPayload = {
	userName: string;
	userEmail: string;
	userImage?: string;
};

export const createUser = async (
	data: CreateUserPayload
): Promise<User | null> => {
	try {
		const response = await api.post<User>(
			'/users/create',
			data
		);
		//toast.success(`User ${data.userName} was created successfully`);
		return response.data;
	} catch (error: any) {
		// Axios error with response
		if (axios.isAxiosError(error) && error.response) {
			const message =
				error.response.data?.message ||
				error.response.data ||
				'Failed to create user';
			toast.error(message);
		} else {
			toast.error('Failed to create user');
		}
		return null;
	}
};


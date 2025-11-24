import axios, { AxiosRequestConfig } from "axios";
import { User } from "../types";
import api, { request } from "./axios";
import { toast } from "sonner";


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
	image?: string;
	appRole?: string;
	accessRole?: string;
}

export const updateUser = async (userId: string, data: UpdateUserPayload) => {
	try {
		const response = await api.put(
			`/users/update/${userId}`, // URL
			{
				name: data.name, // <-- body
				email: data.email,
				image: data.image,
				appRole: data.appRole,
				acccessRole: data.accessRole,
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
	userAppRole?: string;
	userAccessRole?: string;
	googleId?: string;
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

//server safe version
//used for google to sign in and save to db
export const createUserServer = async (
	data: CreateUserPayload
): Promise<User | null> => {
	try {
		const response = await api.post<User>(
			`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/create/google`,
			data,
			{
				headers: { 'Content-Type': 'application/json' },
				timeout: 5000, // optional safeguard
			}
		);

		return response.data;
	} catch (error: any) {
		if (axios.isAxiosError(error)) {
			console.error('Failed to create user (server)');
			console.error('Status:', error.response?.status);
			console.error('Response:', error.response?.data);
		} else {
			console.error('Unexpected error creating user:', error);
		}
		return null;
	}
};



//get users attaced to account
export const getUsersForAccount = async (accountId: string) => {
	return request<User[]>({
		method: 'GET',
		url: `/user-access/${accountId}/getUsersForAccount`
	})
}
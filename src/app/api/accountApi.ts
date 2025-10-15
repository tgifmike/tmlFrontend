import  { request } from './axios';
import { Account } from '../types';
import { UserRoundIcon } from 'lucide-react';


//get all accounts
export const getAllAccounts = async () => {
    return request<Account[]>({
        method: 'GET',
        url: '/accounts/getAll'
    })
}

//get accounts availble by user
export const getAccountsForUser = async (userId: string) => {
    return request<Account[]>({
        method: 'GET',
        url: `/user-access/${userId}/accounts`
    })
}

//toggle acount active
export const toggleAccountActive = async (id: string, accountActive: boolean) => {
    return request<Account>({
        method: 'PATCH',
        url: `/accounts/${id}/active?active=${accountActive}`
    });
}


export const updateAccountName = async (id: string, accountName: string) => {
    return request<Account>({
        method: 'PUT',
        url: `/accounts/${id}`,
        data: {accountName},
    });
}

export const deleteAccount = async (id: string) => {
    return request<Account>({
        method: 'DELETE',
        url: `/accounts/${id}`,
    });
}

export const createAccount = async (data:any) => {
    return request<Account>({
        method: 'POST',
        url: `/accounts/createAccount`,
        data: data,
    })
}

//create account with access
export const createAccountWithAccess = async (userId: string, data:any) => {
    return request<Account>({
			method: 'POST',
			url: `/accounts/createAccountWithAccess/${userId}`,
			data: data,
		});
}

//grant user access to account
export const grantAccess = async (userId: string, accoundId: string) => {
    return request({
			method: 'POST',
			url: `/user-access/${userId}/accounts/${accoundId}`,
		});
};

//revoke user access to account
export const revokeAccess = async (userId: string, accoundId: string) => {
    return request({
			method: 'DELETE',
			url: `/user-access/${userId}/accounts/${accoundId}`,
		});
}
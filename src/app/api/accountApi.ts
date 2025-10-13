import  { request } from './axios';
import { Account } from '../types';


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

//update account name
// export interface UpdatedAccountPayload {
//     accountName?: string;
// }

// export const updateAccount = async (accountId: string, data: UpdatedAccountPayload) => {
//     try {
//         const response = await api.put(`/accounts`)
//     }
// }

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
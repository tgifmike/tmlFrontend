import  { request } from './axios';
import { Account, AccountHistory } from '../types';



//get all accounts
export const getAllAccounts = async () => {
    return request<Account[]>({
        method: 'GET',
        url: '/accounts/getAll'
    })
}

// get one account by ID
export const getAccountById = async (accountId: string) => {
	return request<Account>({
		method: 'GET',
		url: `/accounts/by-id/${accountId}`,
	});
};

//get accounts availble by user
export const getAccountsForUser = async (userId: string) => {
    if (!userId) throw new Error('userId is required');
    return request<Account[]>({
        method: 'GET',
        url: `/user-access/${userId}/accounts`
    })
}

export const toggleAccountActive = async (
	id: string,
	accountActive: boolean,
	userId: string,
	userName: string
) => {
	return request<Account>({
		method: 'PATCH',
		url: `/accounts/${id}/active`,
		params: {
			active: accountActive,
			userId,
			userName,
		},
	});
};




export const updateAccountName = async (
	id: string,
	accountName: string,
	userId: string
) => {
	return request<Account>({
		method: 'PATCH',
		url: `/accounts/${id}?userId=${userId}`,
		data: { accountName },
	});
};



// export const deleteAccount = async (id: string) => {
//     return request<Account>({
//         method: 'DELETE',
//         url: `/accounts/${id}`,
//     });
// }

export const deleteAccount = async (id: string, userId: string) => {
	return request<void>({
		method: 'DELETE',
		url: `/accounts/${id}`,
		params: { userId },
	});
};


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

//update account image
export const updateAccountImage = async (accountId: string, base64Image: string) => {
    return request<Account>({
        method: 'PUT',
        url: `/accounts/${accountId}/image`,
        data: { imageBase64: base64Image },
    })
};


// fetch all account history (manager view, no accountId needed)
export const getAllAccountHistory = async (): Promise<AccountHistory[]> => {
  const response = await request<AccountHistory[]>({
    method: 'GET',
    url: '/accounts/history', // matches the backend endpoint
  });

  return (response as { data: AccountHistory[] }).data;
};


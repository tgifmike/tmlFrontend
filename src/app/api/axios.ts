import axios, { AxiosRequestConfig } from 'axios';

const cleanBaseUrl = (url?: string): string => {
	if (!url) throw new Error('NEXT_PUBLIC_BACKEND_URL is not defined');
	return url.endsWith('/') ? url.slice(0, -1) : url;
};

const api = axios.create({
	baseURL: cleanBaseUrl(process.env.NEXT_PUBLIC_BACKEND_URL),
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 5000,
});

// const api = axios.create({
// 	baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
// 	headers: {
// 		'Content-Type': 'application/json',
// 	},
// });


export async function request<T>(
	config: AxiosRequestConfig
): Promise<{ data?: T; error?: string }> {
	try {
		const response = await api.request<T>(config);
		return { data: response.data };
	} catch (err: unknown) {
		let errorMsg = 'An unexpected error occurred';

		if (axios.isAxiosError(err)) {
			errorMsg =
				err.response?.data?.message || err.response?.data?.error || err.message;
		}

		// ✅ Only log in development mode
		if (process.env.NODE_ENV === 'development') {
			console.warn(`[API Error] ${errorMsg}`);
		}

		return { error: errorMsg };
	}
}


export default api;

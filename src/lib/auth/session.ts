export function getToken() {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem('jwt');
}

export function logout() {
	localStorage.removeItem('jwt');
	window.location.href = '/login';
}

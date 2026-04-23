// src/lib/auth/login.ts

export async function loginWithBackend(provider: string, idToken: string) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/oauth-login`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ provider, idToken }),
		},
	);

	if (!res.ok) {
		const msg = await res.text();
		throw new Error(msg);
	}

	const data = await res.json();

	localStorage.setItem('jwt', data.token);

	return data;
}

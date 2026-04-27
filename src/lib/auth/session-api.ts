import { SessionUser } from '@/app/types';

export async function fetchMe(): Promise<SessionUser | null> {
	const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me`, {
		credentials: 'include',
	});

	if (res.status === 401) {
		return null;
	}

	if (!res.ok) {
		throw new Error('Failed to fetch session');
	}

	return res.json();
}

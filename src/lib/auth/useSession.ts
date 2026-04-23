'use client';

import { useEffect, useState } from 'react';

export type SessionUser = {
	id: string;
	name?: string;
	email: string;
	appRole: string;
	accessRole: string;
	image?: string;
};

type Status = 'loading' | 'authenticated' | 'unauthenticated';

export function useSession() {
	const [user, setUser] = useState<SessionUser | null>(null);
	const [status, setStatus] = useState<Status>('loading');

	const loadSession = async () => {
		const token = localStorage.getItem('jwt');

		if (!token) {
			setUser(null);
			setStatus('unauthenticated');
			return;
		}

		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!res.ok) throw new Error();

			const data = await res.json();

			setUser(data);
			setStatus('authenticated');
		} catch {
			localStorage.removeItem('jwt');
			setUser(null);
			setStatus('unauthenticated');
		}
    };
    
    useEffect(() => {
			loadSession();

			const onAuthChange = () => loadSession();

			const onStorage = (e: StorageEvent) => {
				if (e.key === 'jwt') {
					loadSession();
				}
			};

			window.addEventListener('auth-change', onAuthChange);
			window.addEventListener('storage', onStorage);

			return () => {
				window.removeEventListener('auth-change', onAuthChange);
				window.removeEventListener('storage', onStorage);
			};
		}, []);

	return { user, status, refresh: loadSession };
}

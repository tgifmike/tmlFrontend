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

	const loadSession = async (source = 'unknown') => {
		console.log('\n==============================');
		console.log('🚀 loadSession TRIGGERED');
		console.log('📍 source:', source);
		console.log('🕒 time:', new Date().toISOString());

		const token = localStorage.getItem('jwt');

		console.log('🔑 token exists:', !!token);
		console.log('🔥 RAW JWT:', token);
		console.log('📦 storage snapshot:', {
			length: localStorage.length,
			keys: Object.keys(localStorage),
		});

		if (!token) {
			console.log('❌ NO TOKEN FOUND → setting unauthenticated');
			setUser(null);
			setStatus('unauthenticated');
			return;
		}

		console.log('🌐 calling /users/me...');

		const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me`;

		try {
			const res = await fetch(url, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			console.log('📡 RESPONSE STATUS:', res.status);
			console.log('📡 RESPONSE OK:', res.ok);

			const text = await res.text();
			console.log('📨 RAW RESPONSE TEXT:', text);

			if (!res.ok) {
				throw new Error(`HTTP ${res.status}`);
			}

			const data = JSON.parse(text);

			console.log('✅ PARSED USER:', data);

			setUser(data);
			setStatus('authenticated');
		} catch (err) {
			console.log('💥 FETCH ERROR:', err);
			console.error('Auth failed but keeping token for debug', err);
			//localStorage.removeItem('jwt');

			setUser(null);
			setStatus('unauthenticated');
		}
	};

	useEffect(() => {
		console.log('🧠 useSession mounted');

		loadSession('initial-mount');

		const onAuthChange = () => {
			console.log('🔔 auth-change event fired');
			loadSession('event:auth-change');
		};

		const onStorage = (e: StorageEvent) => {
			console.log('🧲 storage event:', {
				key: e.key,
				oldValue: e.oldValue,
				newValue: e.newValue,
			});

			if (e.key === 'jwt') {
				loadSession('event:storage');
			}
		};

		window.addEventListener('auth-change', onAuthChange);
		window.addEventListener('storage', onStorage);

		return () => {
			window.removeEventListener('auth-change', onAuthChange);
			window.removeEventListener('storage', onStorage);
		};
	}, []);

	console.log('🔁 render state:', { status, hasUser: !!user });

	return { user, status, refresh: () => loadSession('manual-refresh') };
}

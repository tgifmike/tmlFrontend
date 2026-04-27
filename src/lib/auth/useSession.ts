// 'use client';

// import { useEffect, useState } from 'react';

// export type SessionUser = {
// 	id: string;
// 	name?: string;
// 	email: string;
// 	appRole: string;
// 	accessRole: string;
// 	image?: string;
// };

// type Status = 'loading' | 'authenticated' | 'unauthenticated';

// export function useSession() {
// 	const [user, setUser] = useState<SessionUser | null>(null);
// 	const [status, setStatus] = useState<Status>('loading');

// 	const loadSession = async (source = 'unknown') => {
// 		console.log('\n==============================');
// 		console.log('🚀 loadSession TRIGGERED');
// 		console.log('📍 source:', source);
// 		console.log('🕒 time:', new Date().toISOString());

// 		setStatus('loading');

// 		try {
// 			const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me`;

// 			console.log('🌐 calling /users/me with cookies');

// 			const res = await fetch(url, {
// 				method: 'GET',
// 				credentials: 'include',
// 			});

// 			console.log('📡 RESPONSE STATUS:', res.status);
// 			console.log('📡 RESPONSE OK:', res.ok);

// 			if (!res.ok) {
// 				throw new Error(`HTTP ${res.status}`);
// 			}

// 			const data: SessionUser = await res.json();

// 			console.log('✅ SESSION USER:', data);

// 			setUser(data);
// 			setStatus('authenticated');
// 		} catch (err) {
// 			console.error('💥 SESSION LOAD FAILED:', err);

// 			setUser(null);
// 			setStatus('unauthenticated');
// 		}
// 	};

// 	const logout = async () => {
// 		try {
// 			await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
// 				method: 'POST',
// 				credentials: 'include',
// 			});
// 		} catch (err) {
// 			console.error('Logout request failed:', err);
// 		}

// 		setUser(null);
// 		setStatus('unauthenticated');
// 	};

// 	useEffect(() => {
// 		console.log('🧠 useSession mounted');

// 		loadSession('initial-mount');

// 		const onAuthChange = () => {
// 			console.log('🔔 auth-change event fired');
// 			loadSession('event:auth-change');
// 		};

// 		window.addEventListener('auth-change', onAuthChange);

// 		return () => {
// 			window.removeEventListener('auth-change', onAuthChange);
// 		};
// 	}, []);

// 	console.log('🔁 render state:', {
// 		status,
// 		hasUser: !!user,
// 	});

// 	return {
// 		user,
// 		status,
// 		refresh: () => loadSession('manual-refresh'),
// 		logout,
// 	};
// }

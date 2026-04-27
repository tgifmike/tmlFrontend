'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchMe } from './session-api';
import { SessionUser } from '@/app/types';
import { tr } from 'date-fns/locale';

type Ctx = {
	user: SessionUser | null;
	loading: boolean;
	refreshSession: () => Promise<void>;
	logout: () => Promise<void>;
};

const SessionContext = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<SessionUser | null>(null);
	const [loading, setLoading] = useState(true);

	const refreshSession = async () => {
		setLoading(true);

		try {
			const me = await fetchMe();
			setUser(me);
		} catch {
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	const logout = async () => {
		try {
			await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
				method: 'POST',
				credentials: 'include',
			});
		} finally {
			setUser(null);
			setLoading(false);
			await refreshSession();
			window.dispatchEvent(new Event('auth-change'));
		}
	};

	useEffect(() => {
		refreshSession();
	}, []);

	useEffect(() => {
		const onAuthChange = () => refreshSession();

		window.addEventListener('auth-change', onAuthChange);
		return () => window.removeEventListener('auth-change', onAuthChange);
	}, []);

	return (
		<SessionContext.Provider value={{ user, loading, refreshSession, logout }}>
			{children}
		</SessionContext.Provider>
	);
}
export function useSession() {
	const ctx = useContext(SessionContext);
	if (!ctx) throw new Error('useSession must be used inside SessionProvider');
	return ctx;
}
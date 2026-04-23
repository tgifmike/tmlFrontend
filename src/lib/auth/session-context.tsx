'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { fetchMe } from './session-api';
import { SessionState } from '@/app/types';

type Ctx = {
	session: SessionState;
	refreshSession: () => Promise<void>;
	logout: () => void;
};

const SessionContext = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
	const [session, setSession] = useState<SessionState>({
		user: null,
		loading: true,
	});

	const refreshSession = async () => {
		try {
			setSession((s) => ({ ...s, loading: true }));

			const user = await fetchMe();

			setSession({
				user,
				loading: false,
			});
		} catch {
			setSession({
				user: null,
				loading: false,
			});
		}
	};

	const logout = () => {
		localStorage.removeItem('jwt');
		setSession({ user: null, loading: false });
	};

	useEffect(() => {
		const token = localStorage.getItem('jwt');

		if (!token) {
			setSession({ user: null, loading: false });
			return;
		}

		refreshSession();
	}, []);

	return (
		<SessionContext.Provider value={{ session, refreshSession, logout }}>
			{children}
		</SessionContext.Provider>
	);
}

export function useSession() {
	const ctx = useContext(SessionContext);
	if (!ctx) throw new Error('useSession must be used inside SessionProvider');
	return ctx;
}

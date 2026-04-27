'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/spinner/Spinner';
import { useSession } from './session-context';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { user, loading, logout } = useSession();

	useEffect(() => {
		if (!loading && !user) {
			router.replace('/login');
		}
	}, [user, loading, router]);

	// IMPORTANT FIX ↓↓↓
	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen gap-3">
				<Spinner />
				Loading...
			</div>
		);
	}

	// don't render anything until decision is made
	if (!user) {
		return null;
	}

	return <>{children}</>;
}

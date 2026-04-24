'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/useSession';
import Spinner from '@/components/spinner/Spinner';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { status } = useSession();

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.replace('/login');
		}
	}, [status, router]);

	// IMPORTANT FIX ↓↓↓
	if (status === 'loading') {
		return (
			<div className="flex items-center justify-center h-screen gap-3">
				<Spinner />
				Loading...
			</div>
		);
	}

	// don't render anything until decision is made
	if (status === 'unauthenticated') {
		return null;
	}

	return <>{children}</>;
}

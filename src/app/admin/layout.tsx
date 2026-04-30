'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/session-context';
import Spinner from '@/components/spinner/Spinner';

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { user, loading } = useSession();

	useEffect(() => {
		if (loading) return;

		// not logged in
		if (!user) {
			router.replace('/login');
			return;
		}

		// only SRADMIN allowed
		if (user.accessRole !== 'SRADMIN') {
			router.replace('/unauthorized');
			return;
		}
	}, [user, loading, router]);

	// while checking session
	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen gap-3">
				<Spinner />
				Loading...
			</div>
		);
	}

	// prevent flash before redirect
	if (!user || user.accessRole !== 'SRADMIN') {
		return null;
	}

	return <>{children}</>;
}

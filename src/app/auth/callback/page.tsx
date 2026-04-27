'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/spinner/Spinner';

export default function AuthCallback() {
	const router = useRouter();

	useEffect(() => {
		// 🔥 Just verify session via cookie
		const checkSession = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
					{ credentials: 'include' },
				);

				if (!res.ok) {
					throw new Error('Not authenticated');
				}

				router.replace('/dashboard');
			} catch {
				router.replace('/login');
			}
		};

		checkSession();
	}, [router]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<Spinner className="h-12 w-12 text-chart-3" />
		</div>
	);
}

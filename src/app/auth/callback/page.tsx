'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Spinner from '@/components/spinner/Spinner';

export default function AuthCallback() {
	const params = useSearchParams();
	const router = useRouter();

	useEffect(() => {
		const token = params.get('token');

		// IMPORTANT: wait until params are actually ready
		if (token === null) return;

		if (!token) {
			router.replace('/login');
			return;
		}

		localStorage.setItem('jwt', token);

		router.replace('/dashboard');
	}, [params, router]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="flex flex-col items-center gap-4">
				<Spinner className="h-12 w-12 text-chart-3" />

				<div className="text-center space-y-1">
					<p className="text-lg font-medium">Signing you in…</p>
					<p className="text-sm text-muted-foreground">Securing your session</p>
				</div>
			</div>
		</div>
	);
}
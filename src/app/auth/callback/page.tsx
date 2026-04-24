'use client';

console.log('🔥 CALLBACK FILE LOADED');

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/spinner/Spinner';

export default function AuthCallback() {

    console.log('🔥 COMPONENT RENDERED');
    console.log('AUTH CALLBACK RENDERED');


	const router = useRouter();

	useEffect(() => {
		const search = window.location.search;
		const token = new URLSearchParams(search).get('token');

		console.log('TOKEN FROM URL:', token);

		if (!token) {
			router.replace('/login');
			return;
		}

		try {
			localStorage.setItem('jwt', token);

			console.log('JWT AFTER SAVE:', localStorage.getItem('jwt'));

			window.dispatchEvent(new Event('auth-change'));

			setTimeout(() => {
				router.replace('/dashboard');
			}, 150);
		} catch (e) {
			console.error('Failed to save JWT', e);
			router.replace('/login');
		}
	}, [router]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<Spinner className="h-12 w-12 text-chart-3" />
		</div>
	);
}

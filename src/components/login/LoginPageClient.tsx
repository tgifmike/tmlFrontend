'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaApple } from 'react-icons/fa';

import { loginWithBackend } from '@/lib/auth/login';
import { getAppleIdToken } from '@/lib/auth/apple';
import { emitAuthChange } from '@/lib/auth/authEvents';

export default function LoginPageClient() {
	const router = useRouter();
	const params = useSearchParams();

	const [authLoading, setAuthLoading] = useState(false);
	const [authError, setAuthError] = useState<string | null>(null);

	const error = params.get('error');

	//////////////////////////////////////////////////////////////
	// INITIAL ERROR FROM URL
	//////////////////////////////////////////////////////////////
	useEffect(() => {
		if (error) setAuthError('Login failed. Please try again.');
	}, [error]);

	//////////////////////////////////////////////////////////////
	// GOOGLE INIT (BUTTON MODE ONLY)
	//////////////////////////////////////////////////////////////
	useEffect(() => {
		const google = (window as any).google;
		if (!google) return;

		google.accounts.id.initialize({
			client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
			callback: async (res: any) => {
				try {
					setAuthLoading(true);
					setAuthError(null);

					// await loginWithBackend('google', res.credential);

					// // smooth UX transition
					// setTimeout(() => router.push('/dashboard'), 150);
					const result = await loginWithBackend('google', res.credential);

					localStorage.setItem('jwt', result.token);
					emitAuthChange();
					router.push('/dashboard');
				} catch {
					setAuthError('Google login failed');
					setAuthLoading(false);
				}
			},
			use_fedcm_for_prompt: false,
		});

		const el = document.getElementById('googleBtn');

		if (el) {
			google.accounts.id.renderButton(el, {
				theme: 'filled_black',
				size: 'large',
				shape: 'pill',
				text: 'signin_with',
			});
		}
	}, [router]);

	//////////////////////////////////////////////////////////////
	// APPLE LOGIN
	//////////////////////////////////////////////////////////////
	const loginWithApple = async () => {
		if (authLoading) return;

		try {
			setAuthLoading(true);
			setAuthError(null);

			const idToken = await getAppleIdToken();

			console.log('APPLE TOKEN:', idToken);

			const result = await loginWithBackend('apple', idToken);

			localStorage.setItem('jwt', result.token);
			emitAuthChange();

			router.push('/dashboard');
		} catch (err) {
			console.error('APPLE LOGIN ERROR:', err);

			setAuthError('Apple login failed');
			setAuthLoading(false);
		}
	};

	//////////////////////////////////////////////////////////////
	// UI
	//////////////////////////////////////////////////////////////
	return (
		<div className="flex flex-col justify-center bg-accent-75 p-4 mt-20">
			<div className="w-full max-w-xl mx-auto flex flex-col justify-center">
				{/* GLOBAL LOADING OVERLAY */}
				{authLoading && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
						<div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
					</div>
				)}

				{/* ERROR */}
				{authError && (
					<Alert variant="destructive" className="mb-6">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{authError}</AlertDescription>
					</Alert>
				)}

				<Card className="rounded-2xl shadow-2xl max-h-[90vh] overflow-visible">
					<CardHeader className="text-center">
						<div className="flex justify-center mb-4">
							<Image
								src="/newLogo.png"
								alt="Logo"
								width={100}
								height={100}
								className="w-24 h-auto rounded-full"
								unoptimized
							/>
						</div>

						<CardTitle className="text-2xl md:text-3xl font-semibold italic text-chart-1">
							Welcome Back!
						</CardTitle>
					</CardHeader>

					<CardContent>
						<div
							className={`flex flex-col items-center space-y-4 ${authLoading ? 'pointer-events-none opacity-60' : ''}`}
						>
							{/* GOOGLE BUTTON (RENDERED BY GIS) */}
							<div className="flex justify-center w-full min-h-[48px]">
								<div id="googleBtn" />
							</div>

							{/* APPLE BUTTON */}
							<Button
								onClick={loginWithApple}
								disabled={authLoading}
								variant="outline"
								size="lg"
								className="flex items-center justify-center space-x-3 px-4 py-3 w-3/4 bg-black text-white"
							>
								<FaApple className="h-8 w-8" />
								<span className="text-lg font-medium">Sign in with Apple</span>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
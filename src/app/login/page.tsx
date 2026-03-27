// 'use client';

// import { Button } from '@/components/ui/button';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { signIn, useSession } from 'next-auth/react';
// import React, { useEffect, useState } from 'react';
// import { toast } from 'sonner';
// import Image from 'next/image';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { FaApple } from 'react-icons/fa';
// import { FcGoogle } from 'react-icons/fc';

// const LoginPage = () => {
// 	const { data: session, status } = useSession();
// 	const router = useRouter();
// 	const params = useSearchParams();
// 	const errorParam = params.get('error');

// 	const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
// 	const [isLoadingApple, setIsLoadingApple] = useState(false);

// 	// Show toast if redirected with AccessDenied
// 	useEffect(() => {
// 		if (typeof window === 'undefined') return; // make sure we are client

// 		const params = new URLSearchParams(window.location.search);
// 		const errorParam = params.get('error');

// 		if (errorParam === 'AccessDenied') {
// 			toast.error(
// 				'Your account exists but has not been activated yet. Contact your administrator.',
// 			);
// 		}
// 	}, [params]); // run once on mount

// 	// Redirect if authenticated
// 	useEffect(() => {
// 		if (status === 'authenticated') {
// 			router.push('/dashboard');
// 		}
// 	}, [status, router]);

// 	const loginWithGoogle = async () => {
// 		setIsLoadingGoogle(true);
// 		try {
// 			await signIn('google', { callbackUrl: '/dashboard' });
// 		} catch {
// 			toast.error('There was an error logging in with Google');
// 		} finally {
// 			setIsLoadingGoogle(false);
// 		}
// 	};

// 	const loginWithApple = async () => {
// 		setIsLoadingApple(true);
// 		try {
// 			await signIn('apple', { callbackUrl: '/dashboard' });
// 		} catch {
// 			toast.error('There was an error logging in with Apple');
// 		} finally {
// 			setIsLoadingApple(false);
// 		}
// 	};

// 	return (
// 		<div className="flex flex-col justify-center bg-accent-75 p-4 mt-20">
// 			<div className="w-full max-w-xl mx-auto flex flex-col justify-center">
// 				<Card className="rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
// 					<CardHeader className="text-center">
// 						<div className="flex justify-center mb-4">
// 							<Image
// 								src="/newLogo.png"
// 								alt="Logo"
// 								width={100}
// 								height={100}
// 								className="w-24 h-auto rounded-full"
// 							/>
// 						</div>
// 						<CardTitle className="text-2xl md:text-3xl font-semibold tracking-tight italic text-chart-1">
// 							Welcome Back!
// 						</CardTitle>
// 					</CardHeader>
// 					<CardContent>
// 						<div className="flex flex-col items-center space-y-4">
// 							<Button
// 								onClick={loginWithGoogle}
// 								disabled={isLoadingGoogle}
// 								variant="outline"
// 								size="lg"
// 								className="flex items-center justify-center space-x-3 px-4 py-3 w-3/4 transform transition-transform duration-200 hover:scale-105"
// 							>
// 								{isLoadingGoogle ? (
// 									<span className="h-6 w-6 md:h-8 md:w-8 animate-spin rounded-full border-2 border-ring border-t-transparent" />
// 								) : (
// 									<FcGoogle className="h-6 w-6 md:h-10 md:w-10" />
// 								)}
// 								<span className="text-sm md:text-lg font-medium whitespace-nowrap">
// 									Sign in with Google
// 								</span>
// 							</Button>

// 							<Button
// 								onClick={loginWithApple}
// 								disabled={isLoadingApple}
// 								variant="outline"
// 								size="lg"
// 								className="flex items-center justify-center space-x-3 px-4 py-3 w-3/4 bg-black text-white transform transition-transform duration-200 hover:scale-105"
// 							>
// 								{isLoadingApple ? (
// 									<span className="h-6 w-6 md:h-8 md:w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
// 								) : (
// 									<FaApple className="h-6 w-6 md:h-10 md:w-10" />
// 								)}
// 								<span className="text-sm md:text-lg font-medium whitespace-nowrap">
// 									Sign in with Apple
// 								</span>
// 							</Button>
// 						</div>
// 					</CardContent>
// 				</Card>
// 			</div>
// 		</div>
// 	);
// };

// export default LoginPage;

'use client';

export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

const LoginPage = () => {
	const { status } = useSession();
	const router = useRouter();
	const params = useSearchParams();

	const error = params.get('error');

	const [showError, setShowError] = useState(false);
	const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
	const [isLoadingApple, setIsLoadingApple] = useState(false);

	useEffect(() => {
		if (status === 'authenticated') {
			router.push('/dashboard');
		}
	}, [status, router]);

	useEffect(() => {
		if (error === 'AccessDenied') {
			setShowError(true);
		}
	}, [error]);

	const loginWithGoogle = async () => {
		setShowError(false); // clear alert before retry
		setIsLoadingGoogle(true);

		await signIn('google', {
			callbackUrl: '/login',
		});
	};

	const loginWithApple = async () => {
		setShowError(false);
		setIsLoadingApple(true);

		await signIn('apple', {
			callbackUrl: '/login',
		});
	};

	return (
		<div className="flex flex-col justify-center bg-accent-75 p-4 mt-20">
			<div className="w-full max-w-xl mx-auto flex flex-col justify-center">
				{/* Inline error alert */}
				{showError && (
					<Alert variant="destructive" className="mb-6">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							This email address is not authorized to access the system. Please
							contact your administrator if you believe this is incorrect.
						</AlertDescription>
					</Alert>
				)}

				<Card className="rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
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

						<CardTitle className="text-2xl md:text-3xl font-semibold tracking-tight italic text-chart-1">
							Welcome Back!
						</CardTitle>
					</CardHeader>

					<CardContent>
						<div className="flex flex-col items-center space-y-4">
							<Button
								onClick={loginWithGoogle}
								disabled={isLoadingGoogle}
								variant="outline"
								size="lg"
								className="flex items-center justify-center space-x-3 px-4 py-3 w-3/4"
							>
								{isLoadingGoogle ? (
									<span className="h-6 w-6 animate-spin rounded-full border-2 border-ring border-t-transparent" />
								) : (
									<FcGoogle className="h-8 w-8" />
								)}

								<span className="text-lg font-medium">Sign in with Google</span>
							</Button>

							<Button
								onClick={loginWithApple}
								disabled={isLoadingApple}
								variant="outline"
								size="lg"
								className="flex items-center justify-center space-x-3 px-4 py-3 w-3/4 bg-black text-white"
							>
								{isLoadingApple ? (
									<span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
								) : (
									<FaApple className="h-8 w-8" />
								)}

								<span className="text-lg font-medium">Sign in with Apple</span>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default LoginPage;
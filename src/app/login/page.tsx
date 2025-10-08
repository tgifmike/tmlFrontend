'use client';
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GoogleIcon from '@/components/login/GoogleIcon';

const LoginPage = () => {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
	
	
	useEffect(() => {
		if (status === 'authenticated') {
			router.push('/dashboard');
		}
	}, [status, router]);

	const loginWithGoogle = async () => {
		setIsLoadingGoogle(true);

		try {
			await signIn('google');
		} catch (error) {
			toast.error('There was an error logging in with Google');
		} finally {
			setIsLoadingGoogle(false);
		}
	};
	return (
		<main className="flex flex-col justify-center bg-accent-75 p-4 mt-20">
			<div className="w-full max-w-md mx-auto flex flex-col justify-center">
				<Card className="rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
					<CardHeader className="text-center">
						<div className="flex justify-center mb-4">
							<Image
								src="/newLogo.png"
								alt="Logo"
								width={100}
								height={100}
								className="w-24 h-auto rounded-full"
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
								className="flex items-center justify-center space-x-3 px-4 py-3 md:py-4 w-full md:w-auto"
							>
								{isLoadingGoogle ? (
									<span className="h-6 w-6 md:h-8 md:w-8 animate-spin rounded-full border-2 border-ring border-t-transparent" />
								) : (
									<GoogleIcon className="h-6 w-6 md:h-8 md:w-8" />
								)}
								<span className="text-sm md:text-base font-medium whitespace-nowrap">
									Sign in with Google
								</span>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
};

export default LoginPage
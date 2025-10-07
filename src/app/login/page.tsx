'use client';
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

const LoginPage = () => {
    const { data: session, status } = useSession();
		const router = useRouter();
		const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

		// useEffect(() => {
		// 	if (status === 'authenticated') {
		// 		router.push('/dashboard');
		// 	}
		// }, [status, router]);

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
		<main>
			LoginPage
			<Button
				onClick={loginWithGoogle}
				disabled={isLoadingGoogle}
				variant="outline"
				size="lg"
				className="flex items-center space-x-3 px-4 py-3 md:py-4 w-auto"
			>
				{isLoadingGoogle ? (
					<span className="h-8 w-8 animate-spin rounded-full border-2 border-ring border-t-transparent" />
				) : (
					<div className="transform scale-150 md:scale-175">
                          {/* <FcGoogle /> */}
                          Google
					</div>
				)}
				<span className="text-base md:text-lg font-medium whitespace-nowrap">
					Sign in with Google
				</span>
			</Button>
		</main>
	);
}

export default LoginPage
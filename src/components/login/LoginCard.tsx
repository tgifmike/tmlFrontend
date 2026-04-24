'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FcGoogle } from 'react-icons/fc';
import { BsApple } from 'react-icons/bs';
import { Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useAuthLogin } from '@/lib/auth/useOAuthLogin';
import { OAuthButton } from './OAuthButton';

export default function LoginCard() {
    const {
        loginGoogle,
		loginApple,
		loginPasskey,
		loading,
		errors,
		userPreview,
	} = useAuthLogin();

	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	/**
	 * future: hydrate biometrics / last user session
	 */
	// useEffect(() => {
	// 	initGoogle();

	// 	const google = window.google;
	// 	if (!google?.accounts?.id) return;

	// 	const el = document.getElementById('googleBtn');

	// 	if (el) {
	// 		google.accounts.id.renderButton(el, {
	// 			type: 'standard',
	// 			theme: 'filled_black',
	// 			size: 'large',
	// 			shape: 'pill',
	// 			text: 'signin_with',
	// 			width: 320,
	// 		});
	// 	}
    // }, [initGoogle]);
    
    // const loginWithGoogle = () => {
	// 		window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`;
	// 	};

	const lastUser = userPreview; // 👈 biometric-first hook

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-accent/40 px-4">
			<div className="absolute w-[420px] h-[420px] bg-primary/20 blur-3xl rounded-full opacity-30" />

			<Card className="relative w-full max-w-md shadow-2xl border rounded-2xl">
				{/* HEADER */}
				<CardHeader className="flex flex-col items-center text-center space-y-3">
					<Image
						src="/newLogo.png"
						alt="logo"
						width={90}
						height={90}
						className="rounded-full"
					/>

					<CardTitle className="text-2xl font-semibold tracking-tight">
						Welcome Back
					</CardTitle>

					{/* <p className="text-sm text-muted-foreground">
						Biometric-first secure access
					</p> */}

					{/* 🧠 LAST USER (BIOMETRIC-FIRST PATTERN) */}
					{lastUser && (
						<motion.div
							initial={{ opacity: 0, y: 5 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex items-center gap-2 pt-2 px-3 py-1 rounded-full bg-muted/50"
						>
							<Image
								src={lastUser.image || '/avatar.png'}
								alt="user"
								width={26}
								height={26}
								className="rounded-full"
							/>
							<span className="text-xs text-muted-foreground">
								Continue as {lastUser.email}
							</span>
						</motion.div>
					)}
				</CardHeader>

				<CardContent className="space-y-5">
					{/* GOOGLE ERROR */}
					{errors.google && (
						<Alert variant="destructive">
							<AlertDescription>{errors.google}</AlertDescription>
						</Alert>
					)}

					{/* GOOGLE */}
					{/* <OAuthButton
						onClick={startGoogleLogin}
						loading={loading === 'google'}
					>
						<FcGoogle className="text-2xl" />
						Continue with Google
					</OAuthButton> */}

					{/* <div className="flex justify-center w-full min-h-[48px]">
						<div id="googleBtn" />
					</div>

					<div className="relative">
						<OAuthButton
							onClick={() =>
								document
									.querySelector('#googleHiddenBtn div[role=button]')
									?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
							}
							loading={loading === 'google'}
						>
							<FcGoogle className="text-2xl" />
							Continue with Google
						</OAuthButton>

						<div id="googleHiddenBtn" className="absolute inset-0 opacity-0" />
					</div> */}

					<OAuthButton onClick={loginGoogle}>
						<FcGoogle className="text-2xl" />
						Continue with Google
					</OAuthButton>

					{/* DIVIDER */}
					<div className="flex items-center gap-3">
						<Separator className="flex-1" />
						<span className="text-xs text-muted-foreground">or</span>
						<Separator className="flex-1" />
					</div>

					{/* APPLE */}
					<OAuthButton
						variant={isDark ? 'light' : 'dark'}
						onClick={loginApple}
						loading={loading === 'apple'}
					>
						<BsApple className="text-2xl" />
						Continue with Apple
					</OAuthButton>

					{/* PASSKEY (NOW PRIMARY FEELING ACTION) */}
					{/* {errors.passkey && (
						<Alert variant="destructive">
							<AlertDescription>{errors.passkey}</AlertDescription>
						</Alert>
					)}

					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={loginPasskey}
						disabled={loading === 'passkey'}
						className="w-full h-11 rounded-lg border flex items-center justify-center gap-2 text-sm font-medium bg-background hover:bg-muted transition"
					>
						{loading === 'passkey' ? (
							<span className="animate-pulse">Unlocking Face ID…</span>
						) : (
							<>
								<Fingerprint className="h-5 w-5" />
								Continue with Face ID / Passkey
							</>
						)}
					</motion.button> */}
				</CardContent>

				{/* FOOTER */}
				<CardFooter className="flex flex-col items-center text-center gap-1 pt-2">
					<p className="text-xs text-muted-foreground">
						Secure login powered by OAuth + biometrics
					</p>

					<p className="text-[11px] text-muted-foreground/70">
						We never store passwords or expose credentials
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}

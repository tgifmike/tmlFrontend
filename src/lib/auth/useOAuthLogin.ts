'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { loginWithBackend } from '@/lib/auth/login';
import { emitAuthChange } from '@/lib/auth/authEvents';
import { getAppleIdToken } from '@/lib/auth/apple';

type Provider = 'google' | 'apple' | 'passkey' | null;

type Errors = {
	google?: string;
	apple?: string;
	passkey?: string;
};

type UserPreview = {
	name?: string;
	email?: string;
	image?: string;
} | null;

declare global {
	interface Window {
		google?: any;
	}
}

export function useAuthLogin() {
	const router = useRouter();

	const [loading, setLoading] = useState<Provider>(null);
	const [errors, setErrors] = useState<Errors>({});
	const [userPreview, setUserPreview] = useState<UserPreview>(null);

	/**
	 * 🔐 GOOGLE INIT (ONE TIME ONLY)
	 */
	const initGoogle = useCallback(() => {
		if (typeof window === 'undefined') return;

		const google = window.google;
		if (!google?.accounts?.id) return;

		google.accounts.id.initialize({
			client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
			callback: async (res: any) => {
				await loginGoogle(res.credential);
			},
			auto_select: false,
			use_fedcm_for_prompt: false,
		});
	}, []);

	/**
	 * 🔐 GOOGLE LOGIN (CUSTOM BUTTON TRIGGER)
	 */
	const loginGoogle = useCallback(
		async (credential: string) => {
			try {
				setLoading('google');
				setErrors((p) => ({ ...p, google: undefined }));

				const result = await loginWithBackend('google', credential);

				setUserPreview(result.user ?? null);

				localStorage.setItem('jwt', result.token);
				emitAuthChange();

				router.push('/dashboard');
			} catch {
				setErrors((p) => ({
					...p,
					google: 'Google sign-in failed. Please try again.',
				}));
			} finally {
				setLoading(null);
			}
		},
		[router],
	);

	/**
	 * 👉 THIS is the ONLY trigger you need
	 */
	const startGoogleLogin = useCallback(() => {
		if (typeof window === 'undefined') return;

		const google = window.google;

		if (!google?.accounts?.id) {
			setErrors((p) => ({
				...p,
				google: 'Google SDK not ready',
			}));
			return;
		}

		google.accounts.id.prompt();
	}, []);

	/**
	 * 🍏 APPLE LOGIN
	 */
	const loginApple = async () => {
		try {
			setLoading('apple');
			setErrors((p) => ({ ...p, apple: undefined }));

			const idToken = await getAppleIdToken();

			const result = await loginWithBackend('apple', idToken);

			setUserPreview(result.user ?? null);

			localStorage.setItem('jwt', result.token);
			emitAuthChange();

			router.push('/dashboard');
		} catch {
			setErrors((p) => ({
				...p,
				apple: 'Apple sign-in failed. Please try again.',
			}));
		} finally {
			setLoading(null);
		}
	};

	/**
	 * 🔑 PASSKEY (future)
	 */
	const loginPasskey = async () => {
		setErrors((p) => ({ ...p, passkey: undefined }));
		setLoading('passkey');

		try {
			await new Promise((r) => setTimeout(r, 600));

			setErrors((p) => ({
				...p,
				passkey: 'Passkeys not enabled yet',
			}));
		} finally {
			setLoading(null);
		}
	};

	return {
		initGoogle,
		startGoogleLogin,
		loginGoogle,
		loginApple,
		loginPasskey,

		loading,
		errors,
		userPreview,
	};
}

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';


type Provider = 'google' | 'apple' | 'passkey' | null;

type Errors = {
	auth?: string;
	google?: string;
	apple?: string;
	passkey?: string;
};

type UserPreview = {
	name?: string;
	email?: string;
	image?: string;
} | null;

export function useAuthLogin() {
	const searchParams = useSearchParams();

	const [loading, setLoading] = useState<Provider>(null);
	const [errors, setErrors] = useState<Errors>({});
	const [userPreview, setUserPreview] = useState<UserPreview>(null);

	useEffect(() => {
		const authError = searchParams.get('authError') ?? searchParams.get('error');

		if (!authError) return;

		const normalizedError = authError.toLowerCase();
		const wasCancelled = [
			'access_denied',
			'cancelled',
			'oauth_cancelled',
			'user_cancelled_authorize',
		].includes(normalizedError);

		setErrors((current) => ({
			...current,
			auth: wasCancelled
				? 'Sign-in was cancelled. You can try again whenever you’re ready.'
				: 'Sign-in could not be completed. Please try again.',
		}));
	}, [searchParams]);

	/**
	 * GOOGLE LOGIN (Spring redirect flow)
	 */
	const loginGoogle = () => {
		window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google/login`;
	};

	/**
	 * APPLE LOGIN
	 */

	const loginApple = () => {
		window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/apple/login`;
	};



	/**
	 * PASSKEY (future)
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
		loginGoogle,
		loginApple,
		loginPasskey,
		loading,
		errors,
		userPreview,
	};
}

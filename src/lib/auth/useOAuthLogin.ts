'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
// import { loginWithBackend } from '@/lib/auth/login';
import { emitAuthChange } from '@/lib/auth/authEvents';


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

export function useAuthLogin() {
	const router = useRouter();

	const [loading, setLoading] = useState<Provider>(null);
	const [errors, setErrors] = useState<Errors>({});
	const [userPreview, setUserPreview] = useState<UserPreview>(null);

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

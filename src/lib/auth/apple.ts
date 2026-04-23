import { loginWithBackend } from './login';

export async function signInWithApple(idToken: string) {
	return loginWithBackend('apple', idToken);
}

export async function getAppleIdToken(): Promise<string> {
	return new Promise((resolve, reject) => {
		const AppleID = (window as any).AppleID;

		if (!AppleID) {
			reject('Apple SDK not loaded');
			return;
		}

		AppleID.auth.init({
			clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
			scope: 'name email',
			redirectURI: process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI,
			usePopup: true,
		});

		AppleID.auth
			.signIn()
			.then((response: any) => {
				resolve(response.authorization.id_token);
			})
			.catch(reject);
	});
}
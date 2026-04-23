import { loginWithBackend } from './login';

export async function signInWithApple(idToken: string) {
	return loginWithBackend('apple', idToken);
}

export function getAppleIdToken(): Promise<string> {
	return new Promise((resolve, reject) => {
		const AppleID = (window as any).AppleID;

		if (!AppleID) {
			reject('Apple JS not loaded');
			return;
		}

		AppleID.auth.init({
			clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
			scope: 'name email',
			redirectURI: window.location.origin,
			usePopup: true,
		});

		AppleID.auth
			.signIn()
			.then((response: any) => {
				if (!response?.authorization?.id_token) {
					reject('No Apple ID token returned');
					return;
				}

				resolve(response.authorization.id_token);
			})
			.catch((err: any) => {
				reject(err);
			});
	});
}
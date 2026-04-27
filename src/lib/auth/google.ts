// import { loginWithBackend } from './login';

// export async function signInWithGoogle(idToken: string) {
// 	return loginWithBackend('google', idToken);
// }

// export function getGoogleIdToken(): Promise<string> {
// 	return new Promise((resolve, reject) => {
// 		const google = (window as any).google;

// 		if (!google) return reject('Google not loaded');

// 		google.accounts.id.initialize({
// 			client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
// 			callback: (response: any) => {
// 				if (!response.credential) {
// 					reject('No credential returned');
// 					return;
// 				}
// 				resolve(response.credential); // ID token
// 			},
// 			use_fedcm_for_prompt: false,
// 		});

		

// 		google.accounts.id.renderButton(document.getElementById('googleBtn'), {
// 			theme: 'filled_black',
// 			size: 'large',
// 			shape: 'pill',
// 			text: 'signin_with',
// 		});

		
// 	});
	
// }
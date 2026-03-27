// import type { NextAuthOptions } from 'next-auth';
// import GoogleProvider from 'next-auth/providers/google';
// import AppleProvider from 'next-auth/providers/apple';

// export const authOptions: NextAuthOptions = {
// 	debug: true,
// 	providers: [
// 		GoogleProvider({
// 			clientId: process.env.GOOGLE_CLIENT_ID!,
// 			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
// 		}),
// 		AppleProvider({
// 			clientId: process.env.APPLE_WEB_ID!,
// 			clientSecret: process.env.APPLE_CLIENT_SECRET!,
// 			authorization: {
// 				params: {
// 					scope: 'name email',
// 					response_mode: 'form_post',
// 				},
// 			},
// 		}),
// 	],
// 	secret: process.env.NEXTAUTH_SECRET!,
// 	session: { strategy: 'jwt' },
// 	pages: { signIn: '/login', error: '/login' },
// 	callbacks: {
// 		async signIn({ user, account }) {
// 			try {
// 				if (!account) return false;

// 				const payload = {
// 					userEmail: user.email ?? null,
// 					googleId:
// 						account.provider === 'google' ? account.providerAccountId : null,
// 					appleId:
// 						account.provider === 'apple' ? account.providerAccountId : null,
// 					userName: user.name ?? null,
// 					userImage: user.image ?? null,
// 				};

// 				console.log('Sending OAuth login payload:', payload);

// 				const res = await fetch(
// 					`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/oauth-login`,
// 					{
// 						method: 'POST',
// 						headers: {
// 							'Content-Type': 'application/json',
// 						},
// 						body: JSON.stringify(payload),
// 					},
// 				);

// 				if (!res.ok) {
// 					console.log('Backend rejected login');
// 					return '/login?error=AccessDenied';
// 				}

// 				const dbUser = await res.json();

// 				// attach DB values for jwt callback
// 				(user as any).id = dbUser.id;
// 				(user as any).appRole = dbUser.appRole ?? 'MEMBER';
// 				(user as any).accessRole = dbUser.accessRole ?? 'USER';
// 				(user as any).googleId = dbUser.googleId ?? '';
// 				(user as any).appleId = dbUser.appleId ?? '';

// 				return true;
// 			} catch (err) {
// 				console.error('OAuth login error:', err);
// 				return '/login?error=AccessDenied';
// 			}
// 		},
// 	},
// };
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';

export const authOptions: NextAuthOptions = {
	debug: true,
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		AppleProvider({
			clientId: process.env.APPLE_WEB_ID!,
			clientSecret: process.env.APPLE_CLIENT_SECRET!,
			authorization: {
				params: {
					scope: 'name email',
					response_mode: 'form_post',
				},
			},
		}),
	],
	secret: process.env.NEXTAUTH_SECRET!,
	session: { strategy: 'jwt' },
	pages: { signIn: '/login', error: '/login' },
	callbacks: {
		async signIn({ user, account }) {
			if (!account) return false;

			try {
				const provider = account.provider; // 'google' or 'apple'
				const idToken = account.id_token ?? account.oauthToken ?? null;

				if (!idToken) {
					console.error('Missing idToken from provider');
					return '/login?error=AccessDenied';
				}

				const payload = {
					provider,
					idToken,
				};

				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/oauth-login`,
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(payload),
					},
				);

				if (!res.ok) {
					console.error('Backend rejected login', await res.text());
					return '/login?error=AccessDenied';
				}

				const dbUser = await res.json();

				// Attach DB user info for jwt callback
				(user as any).id = dbUser.user.id;
				(user as any).appRole = dbUser.user.appRole ?? 'MEMBER';
				(user as any).accessRole = dbUser.user.accessRole ?? 'USER';
				(user as any).googleId = dbUser.user.googleId ?? '';
				(user as any).appleId = dbUser.user.appleId ?? '';

				return true;
			} catch (err) {
				console.error('OAuth login error:', err);
				return '/login?error=AccessDenied';
			}
		},
	},
};
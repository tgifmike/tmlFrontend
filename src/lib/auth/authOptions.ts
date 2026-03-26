import { createUserServer } from '@/app/api/userApI';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';

export const authOptions: NextAuthOptions = {
	debug: true,
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		}),
		AppleProvider({
			clientId: process.env.APPLE_WEB_ID!, // e.g., com.themanagerlife.web
			clientSecret: process.env.APPLE_CLIENT_SECRET!,
			authorization: {
				params: {
					scope: 'name email',
					response_mode: 'form_post', // works with PKCE
				},
			},
		}),
	],
	secret: process.env.NEXTAUTH_SECRET as string,
	session: { strategy: 'jwt' },
	pages: { signIn: '/login' },
	cookies: {
		pkceCodeVerifier: {
			name: '__Host-next-auth.pkce.code_verifier',
			options: {
				httpOnly: true,
				sameSite: 'lax', // MUST be lax for Apple
				path: '/',
				secure: process.env.NODE_ENV === 'production',
			},
		},
		sessionToken: {
			name: '__Secure-next-auth.session-token',
			options: {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				secure: process.env.NODE_ENV === 'production',
			},
		},
	},

	callbacks: {
		async signIn({ user, account }) {
			console.log('SIGNIN CALLBACK HIT', account?.provider);
			try {
				if (!account) return false;

				// Create or update user in your backend
				const dbUser = await createUserServer({
					userName: user?.name ?? '',
					userEmail: user?.email ?? `${account.providerAccountId}@apple.local`,
					userImage: user?.image ?? undefined,
					googleId:
						account.provider === 'google'
							? account.providerAccountId
							: undefined,
					appleId:
						account.provider === 'apple'
							? account.providerAccountId
							: undefined,
					userAppRole: (user as any)?.appRole ?? undefined,
					userAccessRole: (user as any)?.accessRole ?? undefined,
				});

				if (!dbUser) {
					console.error('User creation failed');
					return false;
				}

				// Attach DB info to user for jwt callback
				(user as any).id = dbUser.id;
				(user as any).appRole = dbUser.appRole ?? 'MEMBER';
				(user as any).accessRole = dbUser.accessRole ?? 'USER';
				(user as any).googleId = dbUser.googleId ?? '';
				(user as any).appleId = dbUser.appleId ?? '';

				return true;
			} catch (error) {
				console.error('signIn callback failed:', error);
				return false;
			}
		},

		async jwt({ token, user }) {
			// Only runs on first sign-in
			if (user) {
				token.id = (user as any).id;
				token.name = user.name ?? '';
				token.email = user.email ?? '';
				token.picture = user.image ?? '';
				token.appRole = (user as any).appRole ?? 'MEMBER';
				token.accessRole = (user as any).accessRole ?? 'USER';
				token.googleId = (user as any).googleId ?? '';
				token.appleId = (user as any).appleId ?? '';
			}
			return token;
		},

		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.name = token.name;
				session.user.email = token.email;
				session.user.image = token.picture;
				session.user.appRole = token.appRole as string;
				session.user.accessRole = token.accessRole as string;
			}
			return session;
		},
	},
};

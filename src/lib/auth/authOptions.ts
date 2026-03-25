import { createUser, createUserServer } from '@/app/api/userApI';
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
			clientId: process.env.APPLE_ID!,
			clientSecret: process.env.APPLE_CLIENT_SECRET!,
			authorization: {
				params: {
					scope: 'name email',
					response_mode: 'form_post',
				},
			},
		}),
	],
	secret: process.env.NEXTAUTH_SECRET as string,
	session: { strategy: 'jwt' },
	pages: { signIn: '/login' },
	callbacks: {
		async signIn({ user, account }) {
			try {
				if (!account) return false;

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

				// Attach DB values back onto user object for jwt()
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
			try {
				// Runs only immediately after sign-in
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
			} catch (error) {
				console.error('JWT callback failed:', error);
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

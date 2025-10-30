import { createUser, createUserServer } from '@/app/api/userApI';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		}),
	],
	secret: process.env.NEXTAUTH_SECRET as string,
	session: { strategy: 'jwt' },
	pages: { signIn: '/login' },
	callbacks: {
		async jwt({ token, user }) {
			try {
				if (user && user.email) {
					const dbUser = await createUserServer({
						userName: user.name ?? '',
						userEmail: user.email,
						userImage: user.image ?? undefined,
						userAppRole: user.appRole ?? undefined,
						userAccessRole: user.accessRole ?? undefined,
					});
					if (dbUser) {
						token.id = dbUser.id as string;
						token.name = dbUser.userName ?? '';
						token.email = dbUser.userEmail ?? '';
						token.picture = dbUser.userImage ?? '';
						token.appRole = dbUser.appRole ?? 'MEMBER';
						token.accessRole = dbUser.accessRole ?? 'USER';
					}
				}
			} catch (error: unknown) {
				if (error instanceof Error) {
					// Standard JS Error object
					console.error('JWT callback failed:', error.message);
				} else if (
					typeof error === 'object' &&
					error !== null &&
					'response' in error
				) {
					// Axios-like error with response
					// @ts-ignore
					console.error('Response error:', await error.response?.text?.());
				} else {
					console.error('Unknown error in JWT callback:', error);
				}
			}
             console.log(token)
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

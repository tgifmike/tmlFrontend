import { createUser } from '@/app/api/userApI';
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
					const dbUser = await createUser({
						userName: user.name ?? '',
						userEmail: user.email,
						userImage: user.image ?? undefined,
					});
					if (dbUser) {
						token.id = dbUser.id as string;
						token.name = dbUser.userName;
						token.email = dbUser.userEmail;
						token.picture = dbUser.userImage;
					}
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
			}
			return session;
		},
	},
};


import { authOptions } from '@/lib/auth/authOptions';
import NextAuth from 'next-auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// import type { NextApiRequest, NextApiResponse } from 'next';
// import NextAuth from 'next-auth';
// import GoogleProvider from 'next-auth/providers/google';
// import axios from 'axios';

// // User type returned by your backend
// type User = {
// 	id: string;
// 	userName: string;
// 	userEmail: string;
// 	userImage?: string;
// 	// role?: string; // Uncomment if your backend supports roles
// };

// // Payload for creating a user
// type CreateUserPayload = {
// 	userName: string;
// 	userEmail: string;
// 	userImage?: string;
// };

// // Helper to create a user via your API
// const createUser = async (data: CreateUserPayload): Promise<User | null> => {
// 	try {
// 		const response = await axios.post<User>(
// 			`${process.env.API_BASE_URL}/users/create`,
// 			data
// 		);
// 		return response.data;
// 	} catch (error: any) {
// 		console.error('Failed to create user:', error?.response?.data || error);
// 		return null;
// 	}
// };

// export default async function auth(req: NextApiRequest, res: NextApiResponse) {
// 	return await NextAuth(req, res, {
// 		providers: [
// 			GoogleProvider({
// 				clientId: process.env.GOOGLE_CLIENT_ID!,
// 				clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
// 			}),
// 		],
// 		session: { strategy: 'jwt' },
// 		pages: { signIn: '/login' },
// 		secret: process.env.NEXTAUTH_SECRET,
// 		callbacks: {
// 			async jwt({ token, user }) {
// 				try {
// 					let dbUser: User | null = null;

// 					if (user) {
// 						if (!user.email)
// 							throw new Error('Missing user email from provider');

// 						// Map NextAuth user to backend payload
// 						dbUser = await createUser({
// 							userName: user.name ?? '',
// 							userEmail: user.email,
// 							userImage: user.image ?? undefined,
// 						});
// 					}

// 					// Attach DB user data to token
// 					token.id = dbUser?.id ?? token.id;
// 					token.name = dbUser?.userName ?? token.name;
// 					token.email = dbUser?.userEmail ?? token.email;
// 					token.picture = dbUser?.userImage ?? token.picture;
// 					// token.role = dbUser?.role ?? token.role;
// 				} catch (error) {
// 					console.error('Error in jwt callback:', error);
// 				}

// 				return token;
// 			},

// 			async session({ session, token }) {
// 				if (session.user) {
// 					session.user.id = token.id as string;
// 					session.user.name = token.name;
// 					session.user.email = token.email;
// 					session.user.image = token.picture;
// 					// session.user.role = token.role as string;
// 				}
// 				return session;
// 			},
// 		},
// 	});
// }

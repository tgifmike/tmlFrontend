import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
	interface Session {
		user: {
			id: string;
			name: string;
			email: string;
			picture?: string;
			appRole: string;
			accessRole: string;
			googleId?: string;
			appleId?: string;
			jwt: string;
		} & DefaultSession['user'];
	}

	interface User extends DefaultUser {
		id: string;
		name: string;
		email: string;
		picture?: string;
		appRole: string;
		accessRole: string;
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id: string;
		name: string;
		email: string;
		picture?: string;
		appRole: string;
		accessRole: string;
		jwt?: string;
	}
}

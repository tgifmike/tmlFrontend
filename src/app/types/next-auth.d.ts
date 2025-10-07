import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
	interface Session {
		user: {
			id: string; // <-- add id
			// role?: string; // add if you want
		} & DefaultSession['user'];
	}

	interface User extends DefaultUser {
		id: string; // <-- add id
		// role?: string;
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id: string; // <-- add id
		// role?: string;
	}
}

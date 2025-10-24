// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	// Allow Next.js internals and login page
	if (
		pathname.startsWith('/_next') ||
		pathname.startsWith('/api/auth') ||
		pathname === '/login'
	) {
		return NextResponse.next();
	}

	const token = await getToken({
		req,
		secret: process.env.NEXTAUTH_SECRET,
		secureCookie: process.env.NODE_ENV === 'production',
	});

	// Not logged in → redirect to login
	if (!token) {
		const loginUrl = new URL('/login', req.url);
		loginUrl.searchParams.set('callbackUrl', req.url);
		return NextResponse.redirect(loginUrl);
	}

	// SRADMIN-only access for /admin
	if (pathname.startsWith('/admin')) {
		const role = (token as any)?.appRole || (token as any)?.role;
		if (role !== 'SRADMIN') {
			return NextResponse.redirect(new URL('/dashboard', req.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/admin/:path*', '/accounts/:path*', '/locations/:path*'],
};

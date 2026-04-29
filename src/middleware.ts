import { NextRequest, NextResponse } from 'next/server';

/**
 * Production-grade middleware
 * 3-cookie architecture
 *
 * Cookies expected:
 * - accessToken   (httpOnly auth cookie)
 * - userRole      (ADMIN / SRADMIN / USER)
 * - userAppRole   (MEMBER / MANAGER / OWNER ...)
 */

const PUBLIC_ROUTES = ['/', '/pricing', '/privacy', '/terms'];
const AUTH_ROUTES = ['/login', '/register'];

const PROTECTED_ROUTES = [
	'/dashboard',
	'/accounts',
	'/locations',
	'/metrics',
	'/profile',
	'/settings',
];

const ADMIN_ROUTES = ['/admin'];

function matches(path: string, routes: string[]) {
	return routes.some((route) => path === route || path.startsWith(route + '/'));
}

function isAdmin(role?: string) {
	return role === 'ADMIN' || role === 'SRADMIN';
}

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// -----------------------------------
	// Skip static / internals
	// -----------------------------------
	if (
		pathname.startsWith('/_next') ||
		pathname.startsWith('/favicon.ico') ||
		pathname.includes('.')
	) {
		return NextResponse.next();
	}

	// -----------------------------------
	// Read cookies
	// -----------------------------------
	const token = request.cookies.get('accessToken')?.value;
	const accessRole = request.cookies.get('userRole')?.value;
	const appRole = request.cookies.get('userAppRole')?.value;

	const loggedIn = !!token;

	// -----------------------------------
	// AUTH ROUTES
	// Logged in users should not see login
	// -----------------------------------
	if (matches(pathname, AUTH_ROUTES)) {
		if (loggedIn) {
			return NextResponse.redirect(new URL('/dashboard', request.url));
		}

		return NextResponse.next();
	}

	// -----------------------------------
	// PUBLIC ROUTES
	// -----------------------------------
	if (matches(pathname, PUBLIC_ROUTES)) {
		return NextResponse.next();
	}

	// -----------------------------------
	// ADMIN ROUTES
	// -----------------------------------
	if (matches(pathname, ADMIN_ROUTES)) {
		if (!loggedIn) {
			return NextResponse.redirect(new URL('/login', request.url));
		}

		if (!isAdmin(accessRole)) {
			return NextResponse.redirect(new URL('/unauthorized', request.url));
		}

		return NextResponse.next();
	}

	// -----------------------------------
	// PROTECTED ROUTES
	// Future appRole checks can go here
	// -----------------------------------
	if (matches(pathname, PROTECTED_ROUTES)) {
		if (!loggedIn) {
			return NextResponse.redirect(new URL('/login', request.url));
		}

		// Example future:
		// if (pathname.startsWith('/metrics') && appRole !== 'MANAGER') {
		//   return NextResponse.redirect(
		//     new URL('/unauthorized', request.url)
		//   );
		// }

		return NextResponse.next();
	}

	// -----------------------------------
	// DEFAULT
	// -----------------------------------
	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image).*)'],
};

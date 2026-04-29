import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/pricing', '/privacy', '/terms'];
const AUTH_ROUTES = ['/login', '/register'];
const PROTECTED_ROUTES = ['/dashboard', '/accounts', '/locations', '/metrics'];
const ADMIN_ROUTES = ['/admin'];

type JwtPayload = {
	accessRole?: string;
	exp?: number;
};

function matches(path: string, routes: string[]) {
	return routes.some((r) => path === r || path.startsWith(r + '/'));
}

function decodeJwt(token?: string): JwtPayload | null {
	if (!token) return null;

	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;

		let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');

		while (payload.length % 4 !== 0) {
			payload += '=';
		}

		return JSON.parse(atob(payload));
	} catch {
		return null;
	}
}

function isValidToken(token?: string) {
	const decoded = decodeJwt(token);

	if (!decoded?.exp) return false;

	return decoded.exp > Math.floor(Date.now() / 1000);
}

function getRole(token?: string) {
	return decodeJwt(token)?.accessRole;
}

function isAdmin(role?: string) {
	return role === 'ADMIN' || role === 'SRADMIN';
}

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (
		pathname.startsWith('/_next') ||
		pathname.startsWith('/favicon.ico') ||
		pathname.includes('.')
	) {
		return NextResponse.next();
	}

	const token = request.cookies.get('accessToken')?.value;

	const loggedIn = isValidToken(token);
	const role = getRole(token);

	// auth routes
	if (matches(pathname, AUTH_ROUTES)) {
		if (loggedIn) {
			return NextResponse.redirect(new URL('/dashboard', request.url));
		}
		return NextResponse.next();
	}

	// public
	if (matches(pathname, PUBLIC_ROUTES)) {
		return NextResponse.next();
	}

	// admin
	if (matches(pathname, ADMIN_ROUTES)) {
		if (!loggedIn) {
			return NextResponse.redirect(new URL('/login', request.url));
		}

		if (!isAdmin(role)) {
			return NextResponse.redirect(new URL('/unauthorized', request.url));
		}

		return NextResponse.next();
	}

	// protected
	if (matches(pathname, PROTECTED_ROUTES)) {
		if (!loggedIn) {
			return NextResponse.redirect(new URL('/login', request.url));
		}

		return NextResponse.next();
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image).*)'],
};

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

function decodeJwt(token: string): JwtPayload | null {
	try {
		const payload = token.split('.')[1];
		return JSON.parse(atob(payload));
	} catch {
		return null;
	}
}

function isExpired(exp?: number) {
	if (!exp) return true;
	return exp < Math.floor(Date.now() / 1000);
}

function getRole(token?: string): string | undefined {
	if (!token) return undefined;
	const decoded = decodeJwt(token);
	return decoded?.accessRole;
}

function isValidToken(token?: string) {
	if (!token) return false;
	const decoded = decodeJwt(token);
	if (!decoded) return false;
	if (isExpired(decoded.exp)) return false;
	return true;
}

function isAdmin(role?: string) {
	return role === 'ADMIN' || role === 'SRADMIN';
}

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// -----------------------------------
	// Skip internals
	// -----------------------------------
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

	const isAuthRoute = matches(pathname, AUTH_ROUTES);
	const isProtected = matches(pathname, PROTECTED_ROUTES);
	const isAdminRoute = matches(pathname, ADMIN_ROUTES);

	// -----------------------------------
	// 1. AUTH ROUTES (login/register)
	// -----------------------------------
	if (isAuthRoute) {
		if (loggedIn) {
			return NextResponse.redirect(new URL('/dashboard', request.url));
		}
		return NextResponse.next();
	}

	// -----------------------------------
	// 2. PUBLIC ROUTES
	// -----------------------------------
	if (matches(pathname, PUBLIC_ROUTES)) {
		return NextResponse.next();
	}

	// -----------------------------------
	// 3. PROTECTED ROUTES (auth required)
	// -----------------------------------
	if (isProtected) {
		if (!loggedIn) {
			return NextResponse.redirect(new URL('/login', request.url));
		}
		return NextResponse.next();
	}

	// -----------------------------------
	// 4. ADMIN ROUTES (role required)
	// -----------------------------------
if (isAdminRoute) {
	if (!loggedIn) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	if (!isAdmin(role)) {
		return NextResponse.redirect(new URL('/unauthorized', request.url));
	}

	return NextResponse.next();
}

	// -----------------------------------
	// 5. DEFAULT
	// -----------------------------------
	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image).*)'],
};

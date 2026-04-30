import { NextRequest, NextResponse } from 'next/server';

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
	return routes.some((r) => path === r || path.startsWith(r + '/'));
}

function normalizeRole(role?: string) {
	return role?.toUpperCase();
}

function isAdmin(role?: string) {
	const r = normalizeRole(role);
	return r === 'ADMIN' || r === 'SRADMIN';
}

function isLoggedIn(token?: string) {
	return !!token; // IMPORTANT: middleware does NOT validate JWT signature
}

export function middleware(request: NextRequest) {

     const { pathname } = request.nextUrl;
     const cookieHeader = request.headers.get('cookie');

			console.log('PATH:', request.nextUrl.pathname);
    console.log('COOKIE HEADER RAW:', cookieHeader);
    
  

			const token = request.cookies.get('accessToken')?.value;

			console.log('PARSED TOKEN:', token);

   
    
    console.log('COOKIE HEADER:', request.headers.get('cookie'));

	// -----------------------------------
	// Skip static files
	// -----------------------------------
	if (
		pathname.startsWith('/_next') ||
		pathname.startsWith('/favicon.ico') ||
		pathname.includes('.')
	) {
		return NextResponse.next();
	}

	// -----------------------------------
	// Cookies
	// -----------------------------------
	//const token = request.cookies.get('accessToken')?.value;
	const accessRole = request.cookies.get('userRole')?.value;
	const appRole = request.cookies.get('userAppRole')?.value;

    const loggedIn = Boolean(token);
    
    console.log({
			pathname,
			hasCookie: !!cookieHeader,
			hasToken: !!token,
			tokenPreview: token?.slice(0, 20),
		});

	// -----------------------------------
	// AUTH ROUTES
	// -----------------------------------
	if (matches(pathname, AUTH_ROUTES)) {
        if (loggedIn) {
					console.log('PATH:', pathname);
					console.log('COOKIE HEADER:', request.headers.get('cookie'));
					console.log('ACCESS TOKEN:', token);
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
	// -----------------------------------
	if (matches(pathname, PROTECTED_ROUTES)) {
		if (!loggedIn) {
			return NextResponse.redirect(new URL('/login', request.url));
		}

		// Future appRole gating example:
		// if (pathname.startsWith('/metrics') && normalizeRole(appRole) !== 'MANAGER') {
		// 	return NextResponse.redirect(new URL('/unauthorized', request.url));
		// }

		return NextResponse.next();
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image).*)'],
};
// import { NextRequest, NextResponse } from 'next/server';

// export function middleware(request: NextRequest) {
// 	return NextResponse.next();
// }

// export const config = {
// 	matcher: ['/((?!api|_next/static|_next/image).*)'],
// };
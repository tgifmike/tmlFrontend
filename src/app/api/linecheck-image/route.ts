import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export async function POST(request: NextRequest) {
	let source: URL;
	try {
		const body = (await request.json()) as { url?: unknown };
		if (typeof body.url !== 'string') throw new Error('Missing image URL.');
		source = new URL(body.url);
	} catch {
		return NextResponse.json({ error: 'Invalid image URL.' }, { status: 400 });
	}

	if (!isAllowedLineCheckImage(source)) {
		return NextResponse.json(
			{ error: 'Only signed line-check images can be loaded.' },
			{ status: 400 },
		);
	}

	try {
		const response = await fetch(source, {
			cache: 'no-store',
			redirect: 'error',
		});
		if (!response.ok) {
			return NextResponse.json(
				{ error: 'The line-check image could not be loaded.' },
				{ status: 502 },
			);
		}

		const contentType = response.headers.get('content-type') ?? '';
		if (!contentType.toLowerCase().startsWith('image/')) {
			return NextResponse.json(
				{ error: 'The requested file is not an image.' },
				{ status: 415 },
			);
		}

		const declaredLength = Number(response.headers.get('content-length') ?? 0);
		if (declaredLength > MAX_IMAGE_BYTES) {
			return NextResponse.json({ error: 'The image is too large.' }, { status: 413 });
		}

		const image = await response.arrayBuffer();
		if (image.byteLength > MAX_IMAGE_BYTES) {
			return NextResponse.json({ error: 'The image is too large.' }, { status: 413 });
		}

		return new NextResponse(image, {
			headers: {
				'Cache-Control': 'private, no-store',
				'Content-Type': contentType,
			},
		});
	} catch {
		return NextResponse.json(
			{ error: 'The line-check image could not be loaded.' },
			{ status: 502 },
		);
	}
}

function isAllowedLineCheckImage(source: URL) {
	if (source.protocol !== 'https:') return false;
	if (
		source.hostname !== 's3.amazonaws.com' &&
		!source.hostname.endsWith('.amazonaws.com')
	) {
		return false;
	}
	if (!source.pathname.includes('/line-check-items/')) return false;

	const parameterNames = new Set(
		[...source.searchParams.keys()].map((name) => name.toLowerCase()),
	);
	return parameterNames.has('x-amz-signature');
}

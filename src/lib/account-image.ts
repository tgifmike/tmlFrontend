/** Accept raw base64 uploads, complete image data URLs, and hosted image URLs. */
export function accountImageSrc(value?: string | null): string | undefined {
	const image = value?.trim();
	if (!image) return undefined;
	if (/^(data:image\/|https?:\/\/|blob:)/i.test(image)) return image;

	const base64 = image.replace(/\s/g, '');
	const mimeType = base64.startsWith('/9j/') ? 'image/jpeg'
		: base64.startsWith('R0lGOD') ? 'image/gif'
		: base64.startsWith('UklGR') ? 'image/webp'
		: 'image/png';

	// JPEG base64 also starts with a slash, so recognize it before local paths.
	if (image.startsWith('/') && !base64.startsWith('/9j/')) return image;
	return `data:${mimeType};base64,${base64}`;
}

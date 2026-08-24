import type { MetadataRoute } from 'next';

const SITE_URL = 'https://www.themanagerlife.com';

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: SITE_URL,
		},
		{
			url: `${SITE_URL}/blog`,
			lastModified: new Date('2026-08-24'),
		},
		{
			url: `${SITE_URL}/blog/why-line-checks-matter`,
			lastModified: new Date('2026-08-24'),
		},
		{
			url: `${SITE_URL}/contact`,
		},
		{
			url: `${SITE_URL}/contact-sales`,
		},
		{
			url: `${SITE_URL}/free-trial`,
		},
		{
			url: `${SITE_URL}/privacy`,
		},
		{
			url: `${SITE_URL}/terms`,
		},
	];
}

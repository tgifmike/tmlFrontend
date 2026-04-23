'use client';

import Link from 'next/link';

const links = [
	{ label: 'Why', href: '#why' },
	{ label: 'Features', href: '#features' },
	{ label: 'Dashboard', href: '#dashboard' },
	{ label: 'Pricing', href: '#pricing' },
	{ label: 'Benefits', href: '#headlines' },
];

export default function SectionNav() {
	return (
		<div className="hidden md:flex items-center gap-6 text-sm font-medium">
			{links.map((link) => {
				const fullHref = `/${link.href}`;

				return (
					<Link
						key={link.href}
						href={fullHref}
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						{link.label}
					</Link>
				);
			})}
		</div>
	);
}

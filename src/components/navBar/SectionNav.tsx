'use client';

import Link from 'next/link';

const links = [
	{ label: 'Why', href: '/#why' },
	{ label: 'Features', href: '/#features' },
	{ label: 'Dashboard', href: '/#dashboard' },
	{ label: 'Pricing', href: '/#pricing' },
	{ label: 'Blog', href: '/blog' },
	{ label: 'Get Started', href: '/#headlines' },
];

export default function SectionNav() {
	return (
		<div className="flex items-center gap-4 text-xs font-medium lg:gap-5 lg:text-sm xl:gap-6">
			{links.map((link) => {
				return (
					<Link
						key={link.href}
						href={link.href}
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						{link.label}
					</Link>
				);
			})}
		</div>
	);
}

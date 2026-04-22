'use client';

import Link from 'next/link';

const links = [
	{ label: 'Why', href: '#why' },
	{ label: 'Features', href: '#features' },
	{ label: 'Dashboard', href: '#dashboard' },
	{ label: 'Pricing', href: '#pricing' },
	{ label: 'Headlines', href: '#headlines' },
];

export default function LandingSectionLinks({
	onNavigate,
}: {
	onNavigate?: () => void;
}) {
	return (
		<div className="flex flex-col gap-4 px-6 pb-6">
			{links.map((link) => (
				<Link
					key={link.href}
					href={link.href}
					onClick={onNavigate}
					className="text-lg font-medium hover:text-primary transition"
				>
					{link.label}
				</Link>
			))}
		</div>
	);
}

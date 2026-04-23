'use client';

import Link from 'next/link';

type Props = {
	onNavigate?: () => void;
};

const links = [
	{ label: 'Why', href: '#why' },
	{ label: 'Features', href: '#features' },
	{ label: 'Dashboard', href: '#dashboard' },
	{ label: 'Pricing', href: '#pricing' },
	{ label: 'Benefits', href: '#headlines' },
];

export default function LandingSectionLinks({ onNavigate }: Props) {
	return (
		<div className="flex flex-col gap-4 px-6 pb-6">
			{links.map((link) => (
				<Link
					key={link.href}
					href={`/${link.href}`}
					onClick={onNavigate}
					className="text-muted-foreground hover:text-foreground transition-colors"
				>
					{link.label}
				</Link>
			))}
		</div>
	);
}
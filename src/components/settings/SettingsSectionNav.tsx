'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardCheck, History, MapPin, Thermometer } from 'lucide-react';

import { cn } from '@/lib/utils';

export default function SettingsSectionNav({
	accountId,
	locationId,
	canViewActivity,
}: {
	accountId: string;
	locationId: string;
	canViewActivity: boolean;
}) {
	const pathname = usePathname();
	const basePath = `/accounts/${accountId}/locations/${locationId}/settings`;
	const links = [
		{ label: 'General', href: basePath, icon: MapPin },
		{ label: 'Line Checks', href: `${basePath}/line-checks`, icon: ClipboardCheck },
		{ label: 'Temperature Categories', href: `${basePath}/temperature-categories`, icon: Thermometer },
		...(canViewActivity
			? [{ label: 'Activity', href: `${basePath}/activity`, icon: History }]
			: []),
	];

	return (
		<nav aria-label="Settings sections" className="overflow-x-auto rounded-2xl border bg-card p-1.5 shadow-sm">
			<div className="flex min-w-max gap-1">
				{links.map(({ label, href, icon: Icon }) => {
					const active = pathname === href;
					return (
						<Link
							key={href}
							href={href}
							aria-current={active ? 'page' : undefined}
							className={cn(
								'inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
								active
									? 'bg-primary text-primary-foreground shadow-sm'
									: 'text-muted-foreground hover:bg-muted hover:text-foreground',
							)}
						>
							<Icon className="size-4" aria-hidden="true" />
							{label}
						</Link>
					);
				})}
			</div>
		</nav>
	);
}

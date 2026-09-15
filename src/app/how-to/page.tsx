import type { Metadata } from 'next';
import { BookOpenCheck, CheckCircle2 } from 'lucide-react';

import HowToLibrary from '@/components/how-to/HowToLibrary';
import HowToBreadcrumbs from '@/components/how-to/HowToBreadcrumbs';
import { howToGuides } from '@/content/how-to-guides';

export const metadata: Metadata = {
	title: 'How To Use The Manager Life',
	description:
		'Step-by-step guides for setting up accounts, locations, stations, options, items, users, devices, goals, and temperature categories in The Manager Life.',
	alternates: { canonical: '/how-to' },
	openGraph: {
		title: 'How To Use The Manager Life',
		description: 'Practical setup and operations guides for The Manager Life.',
		url: '/how-to',
		type: 'website',
	},
};

export default function HowToPage() {
	const howToJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'The Manager Life how-to guides',
		itemListElement: howToGuides.map((guide, index) => ({
			'@type': 'HowTo',
			position: index + 1,
			name: guide.title,
			description: guide.summary,
			url: `https://www.themanagerlife.com/how-to#${guide.id}`,
			step: guide.steps.map((step, stepIndex) => ({
				'@type': 'HowToStep',
				position: stepIndex + 1,
				text: step,
			})),
		})),
	};

	return (
		<div className="min-h-screen bg-background">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd).replace(/</g, '\\u003c') }}
			/>

			<section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/70 to-background">
				<div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-destructive/5 blur-3xl" />
				<div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
					<HowToBreadcrumbs />
					<div className="mt-8 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary shadow-sm">
						<BookOpenCheck className="size-3.5" aria-hidden="true" />
						Help center
					</div>
					<h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl sm:leading-[1.08]">
						How to use
						<span className="mt-1 block text-destructive">The Manager Life.</span>
					</h1>
					<p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
						Clear, step-by-step guides for building your operation, preparing your team, and understanding the information you see each day.
					</p>
					<div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
						{['Start with the setup order', 'Search by task', `${howToGuides.length} practical guides`].map((item) => (
							<span key={item} className="inline-flex items-center gap-2">
								<CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
								{item}
							</span>
						))}
					</div>
				</div>
			</section>

			<HowToLibrary />
		</div>
	);
}

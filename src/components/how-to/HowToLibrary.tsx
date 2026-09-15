'use client';

import { useMemo, useState } from 'react';
import {
	BookOpenCheck,
	ChevronDown,
	ClipboardList,
	Search,
	Settings2,
	UsersRound,
	X,
} from 'lucide-react';

import {
	HOW_TO_CATEGORIES,
	howToGuides,
	type HowToCategory,
} from '@/content/how-to-guides';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const categoryIcons = {
	'Start here': BookOpenCheck,
	'Build your line check': ClipboardList,
	'People & devices': UsersRound,
	'Settings & reporting': Settings2,
} satisfies Record<HowToCategory, typeof BookOpenCheck>;

export default function HowToLibrary() {
	const [query, setQuery] = useState('');
	const normalizedQuery = query.trim().toLocaleLowerCase();
	const filteredGuides = useMemo(
		() =>
			howToGuides.filter((guide) =>
				[
					guide.title,
					guide.summary,
					guide.category,
					guide.audience,
					guide.note ?? '',
					...guide.steps,
					...guide.keywords,
				]
					.join(' ')
					.toLocaleLowerCase()
					.includes(normalizedQuery),
			),
		[normalizedQuery],
	);

	return (
		<div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:py-20 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-14">
			<aside>
				<div className="lg:sticky lg:top-28">
					<label htmlFor="how-to-search" className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
						Find a guide
					</label>
					<div className="relative mt-3">
						<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
						<Input
							id="how-to-search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search how-to guides"
							className="h-11 pl-9 pr-9"
						/>
						{query && (
							<button
								type="button"
								onClick={() => setQuery('')}
								className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								aria-label="Clear search"
							>
								<X className="size-4" aria-hidden="true" />
							</button>
						)}
					</div>

					<nav aria-label="How-to topics" className="mt-6 hidden space-y-2 lg:block">
						{HOW_TO_CATEGORIES.map((category) => {
							const Icon = categoryIcons[category];
							return (
								<a key={category} href={`#${toId(category)}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
									<Icon className="size-4 text-primary" aria-hidden="true" />
									{category}
								</a>
							);
						})}
					</nav>

					<div className="mt-7 rounded-2xl bg-muted/60 p-5 text-sm leading-6 text-muted-foreground">
						<p className="font-semibold text-foreground">A useful rule</p>
						<p className="mt-2">Build options before items, and test one complete line check before rolling setup out to the team.</p>
					</div>
				</div>
			</aside>

			<div className="min-w-0 space-y-12" aria-live="polite">
				{HOW_TO_CATEGORIES.map((category) => {
					const guides = filteredGuides.filter((guide) => guide.category === category);
					if (guides.length === 0) return null;
					const Icon = categoryIcons[category];

					return (
						<section key={category} id={toId(category)} className="scroll-mt-28" aria-labelledby={`${toId(category)}-title`}>
							<div className="mb-5 flex items-center gap-3">
								<span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<Icon className="size-5" aria-hidden="true" />
								</span>
								<div>
									<h2 id={`${toId(category)}-title`} className="text-2xl font-bold tracking-tight">{category}</h2>
									<p className="text-sm text-muted-foreground">{guides.length} guide{guides.length === 1 ? '' : 's'}</p>
								</div>
							</div>

							<div className="space-y-4">
								{guides.map((guide, index) => (
									<article key={guide.id} id={guide.id} className="scroll-mt-28 overflow-hidden rounded-2xl border bg-card shadow-sm">
										<details className="group" open={!normalizedQuery && category === 'Start here' && index === 0}>
											<summary className="flex cursor-pointer list-none items-start justify-between gap-5 px-5 py-5 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6 [&::-webkit-details-marker]:hidden">
												<div className="min-w-0">
													<div className="flex flex-wrap items-center gap-2">
														<h3 className="text-lg font-semibold tracking-tight sm:text-xl">{guide.title}</h3>
														<span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{guide.audience}</span>
													</div>
													<p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">{guide.summary}</p>
												</div>
												<ChevronDown className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
											</summary>

											<div className="border-t bg-muted/15 px-5 py-6 sm:px-6">
												<ol className="space-y-4">
													{guide.steps.map((step, stepIndex) => (
														<li key={`${guide.id}-step-${stepIndex}`} className="flex gap-4">
															<span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{stepIndex + 1}</span>
															<p className="pt-0.5 leading-7">{step}</p>
														</li>
													))}
												</ol>
												{guide.note && (
													<div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-6">
														<span className="font-semibold">Good to know: </span>{guide.note}
													</div>
												)}
											</div>
										</details>
									</article>
								))}
							</div>
						</section>
					);
				})}

				{filteredGuides.length === 0 && (
					<div className="rounded-3xl border border-dashed px-6 py-14 text-center">
						<BookOpenCheck className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
						<h2 className="mt-4 text-xl font-semibold">No guide matches “{query.trim()}”</h2>
						<p className="mt-2 text-sm text-muted-foreground">Try another phrase, or clear the search to browse every guide.</p>
						<Button variant="outline" className="mt-5" onClick={() => setQuery('')}>Clear search</Button>
					</div>
				)}
			</div>
		</div>
	);
}

function toId(value: string) {
	return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

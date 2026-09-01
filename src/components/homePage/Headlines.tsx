import { ArrowRight, CircleCheck, MessageCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

const outcomes = [
	'Catch unsafe temperatures before service',
	'Keep inspection-ready records automatically',
	'Give every shift the same clear standards',
];

export default function Headlines() {
	return (
		<section className="py-20 sm:py-24">
			<div className="mx-auto max-w-6xl px-6">
				<div className="relative overflow-hidden rounded-3xl bg-ring px-6 py-12 text-background shadow-xl sm:px-10 sm:py-14 lg:px-14 lg:py-16">
					<div className="absolute -right-28 -top-28 size-80 rounded-full bg-destructive/20 blur-3xl" />
					<div className="absolute -bottom-36 left-1/3 size-80 rounded-full bg-primary/20 blur-3xl" />

					<div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
						<div>
							<div className="inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-background">
								<Sparkles className="size-3.5" aria-hidden="true" />
								Ready for your next shift?
							</div>
							<h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
								Ditch the paper.
								<span className="mt-1 block text-destructive">Run a safer shift.</span>
							</h2>
							<p className="mt-5 max-w-2xl text-lg leading-8 text-background/75">
								Replace paper checklists with a workflow your team can complete from
								any phone or tablet—even when the internet drops.
							</p>

							<div className="mt-8 flex flex-col gap-3 sm:flex-row">
								<Button
									size="lg"
									asChild
									className="bg-destructive text-white shadow-lg hover:bg-destructive/90"
								>
									<Link href="/free-trial?plan=starter-trial">
										Start Free Trial
										<ArrowRight aria-hidden="true" />
									</Link>
								</Button>
								<Button
									size="lg"
									variant="outline"
									asChild
									className="border-background/20 bg-background text-foreground hover:bg-background/90"
								>
									<Link href="/contact-sales">
										Contact Sales
										<MessageCircle aria-hidden="true" />
									</Link>
								</Button>
							</div>
						</div>

						<div className="rounded-3xl border border-background/15 bg-background/5 p-5 backdrop-blur sm:p-6">
							<p className="text-xs font-semibold uppercase tracking-[0.14em] text-background/65">
								Start with outcomes that matter
							</p>
							<ul className="mt-5 space-y-3">
								{outcomes.map((outcome) => (
									<li
										key={outcome}
										className="flex items-start gap-3 rounded-2xl border border-background/10 bg-background/5 p-4 text-sm leading-6 sm:text-base"
									>
										<CircleCheck className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
										<span>{outcome}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

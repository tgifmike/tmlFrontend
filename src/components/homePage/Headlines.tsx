import Link from 'next/link';
import { ArrowRight, CircleCheck, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const outcomes = [
	'Catch unsafe temperatures before service',
	'Keep inspection-ready records automatically',
	'Give every shift the same clear standards',
];

export default function Headlines() {
	return (
		<section className="bg-ring px-6 py-24 text-background">
			<div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.2fr_0.8fr]">
				<div>
					<p className="mb-4 text-sm font-semibold uppercase tracking-widest text-destructive">
						Ready for your next shift?
					</p>
					<h2 className="text-4xl font-bold tracking-tight md:text-5xl">
						Make every kitchen inspection-ready.
					</h2>
					<p className="mt-5 max-w-2xl text-lg text-background/80">
						Replace paper checklists with a workflow your team can complete from
						any phone or tablet.
					</p>

					<div className="mt-8 flex flex-col gap-3 sm:flex-row">
						<Button size="lg" asChild>
							<Link href="/free-trial?plan=starter-trial">
								Start Free Trial <ArrowRight />
							</Link>
						</Button>
						<Button size="lg" variant="outline" asChild>
							<Link
								href="/contact-sales"
								className="font-semibold text-foreground"
							>
								Contact Sales
								<MessageCircle aria-hidden="true" />
							</Link>
						</Button>
					</div>
				</div>

				<ul className="space-y-5 rounded-2xl border border-background/15 bg-background/5 p-7">
					{outcomes.map((outcome) => (
						<li key={outcome} className="flex items-start gap-3 text-lg">
							<CircleCheck className="mt-1 size-5 shrink-0 text-destructive" />
							<span>{outcome}</span>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}

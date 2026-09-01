import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, Clock3, MessageCircle, ShieldCheck } from 'lucide-react';

import ContactForm from '@/components/contact/contact-form';

export const metadata: Metadata = {
	title: 'Contact Our Restaurant Operations Team',
	description:
		'Contact The Manager Life with questions about digital restaurant line checks, food-safety workflows, setup, or multi-location deployment.',
	alternates: {
		canonical: '/contact',
	},
};

export default function ContactPage() {
	return (
		<div className="min-h-screen bg-background">
			<section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/70 to-background">
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-destructive/5 blur-3xl" />
				<div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-20">
					<div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary shadow-sm">
						<MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
						Contact The Manager Life
					</div>
					<h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl sm:leading-[1.08]">
						Questions about going paperless? Let’s talk.
					</h1>
					<p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
						Ask about digital line checks, food-safety workflows, setup, or how
						The Manager Life can fit the way your restaurant operates.
					</p>
				</div>
			</section>

			<section className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
				<div className="space-y-5">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
							How we can help
						</p>
						<h2 className="mt-3 text-3xl font-bold tracking-tight">
							Start with the right conversation.
						</h2>
						<p className="mt-4 leading-7 text-muted-foreground">
							Tell us what you are trying to improve. We will respond with practical
							answers based on restaurant, retail, POS, and software experience.
						</p>
					</div>

					<ContactDetail
						icon={ShieldCheck}
						title="Product and setup questions"
						description="Ask about line-check workflows, offline mode, temperature records, dashboards, or getting your first location configured."
					/>
					<ContactDetail
						icon={Clock3}
						title="A timely response"
						description="We typically respond within one business day."
					/>

					<div className="rounded-2xl border bg-muted/40 p-5">
						<div className="flex items-start gap-3">
							<Building2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
							<div>
								<h3 className="font-bold">Planning several locations?</h3>
								<p className="mt-2 text-sm leading-6 text-muted-foreground">
									Tell us about your locations, standards, and rollout goals through our
									dedicated sales form.
								</p>
								<Link
									href="/contact-sales"
									className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
								>
									Contact Sales
									<ArrowRight className="h-4 w-4" aria-hidden="true" />
								</Link>
							</div>
						</div>
					</div>
				</div>

				<ContactForm />
			</section>
		</div>
	);
}

function ContactDetail({
	icon: Icon,
	title,
	description,
}: {
	icon: React.ElementType;
	title: string;
	description: string;
}) {
	return (
		<div className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm">
			<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
				<Icon className="h-5 w-5" aria-hidden="true" />
			</span>
			<div>
				<h3 className="font-bold">{title}</h3>
				<p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
			</div>
		</div>
	);
}

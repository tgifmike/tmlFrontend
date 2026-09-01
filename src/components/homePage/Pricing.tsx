'use client';

import { motion } from 'framer-motion';
import {
	ArrowRight,
	Building2,
	Check,
	MessageCircle,
	ShieldCheck,
	Sparkles,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

const plans = [
	{
		name: 'Starter Trial',
		price: 'Free',
		priceSuffix: 'for 30 days',
		billingNote: 'Full Pro access for one kitchen',
		description: 'Set up a real location and run line checks with your team.',
		features: [
			'1 restaurant location',
			'Guided line check workflows',
			'Temperature and preparation checks',
			'Offline mode with automatic sync',
			'Manager dashboard and records',
		],
		cta: 'Start Free Trial',
		href: '/free-trial?plan=starter-trial',
		highlight: false,
	},
	{
		name: 'Pro',
		price: '$19.99',
		priceSuffix: 'per location / month',
		billingNote: '$199 billed annually — save 17%',
		description: 'Everything a restaurant needs to replace daily paper line checks.',
		features: [
			'Unlimited stations and line-check items',
			'Employee activity and time stamps',
			'Offline mode with automatic sync',
			'Manager dashboards and issue trends',
			'Unsafe-temperature email alerts',
			'Exportable inspection records',
		],
		cta: 'Start Free Trial',
		href: '/free-trial?plan=pro',
		highlight: true,
	},
	{
		name: 'Enterprise',
		price: 'Custom',
		priceSuffix: 'for multi-location teams',
		billingNote: 'Pricing built around your rollout',
		description: 'Central visibility and support for restaurant groups.',
		features: [
			'Multiple restaurant locations',
			'Cross-location reporting',
			'Role-based permissions',
			'Guided rollout and onboarding',
			'Priority support',
		],
		cta: 'Contact Sales',
		href: '/contact-sales?plan=enterprise',
		highlight: false,
	},
] as const;

export default function Pricing() {
	return (
		<section className="border-y bg-muted/40 py-20 sm:py-24">
			<div className="mx-auto max-w-6xl px-6">
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
					className="mx-auto max-w-3xl text-center"
				>
					<div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary shadow-sm">
						<ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
						Simple, transparent pricing
					</div>
					<h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
						Start with one kitchen.
						<span className="mt-1 block text-destructive">Grow when you are ready.</span>
					</h2>
					<p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
						Try the complete workflow for 30 days, then keep your restaurant
						paperless for one clear monthly price.
					</p>
				</motion.div>

				<div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
					{plans.map((plan, index) => (
						<motion.article
							key={plan.name}
							initial={{ opacity: 0, y: 32 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1, duration: 0.5 }}
							viewport={{ once: true }}
							className={`relative flex min-w-0 flex-col overflow-hidden rounded-3xl border bg-card shadow-sm ${
								plan.highlight
									? 'border-primary shadow-xl ring-1 ring-primary/10'
									: ''
							}`}
						>
							{plan.highlight && (
								<div className="flex items-center justify-center gap-2 bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground">
									<Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
									Most popular
								</div>
							)}

							<div className="flex flex-1 flex-col p-6 sm:p-8">
								<div>
									<p className="text-sm font-semibold text-primary">{plan.name}</p>
									<div className="mt-3 min-h-24">
										<p className="text-4xl font-bold tracking-tight">{plan.price}</p>
										<p className="mt-1 text-sm font-medium text-foreground">
											{plan.priceSuffix}
										</p>
										<p className="mt-2 text-xs text-muted-foreground">{plan.billingNote}</p>
									</div>
									<p className="mt-4 min-h-14 leading-7 text-muted-foreground">
										{plan.description}
									</p>
								</div>

								<div className="my-6 border-t" />

								<ul className="flex-1 space-y-3.5">
									{plan.features.map((feature) => (
										<li key={feature} className="flex items-start gap-3 text-sm leading-6">
											<span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
												<Check className="h-3.5 w-3.5" aria-hidden="true" />
											</span>
											<span className="text-muted-foreground">{feature}</span>
										</li>
									))}
								</ul>

								<Button
									size="lg"
									asChild
									variant={plan.highlight ? 'default' : 'outline'}
									className="mt-8 w-full"
								>
									<Link href={plan.href}>
										{plan.cta}
										{plan.name === 'Enterprise' ? (
											<MessageCircle aria-hidden="true" />
										) : (
											<ArrowRight aria-hidden="true" />
										)}
									</Link>
								</Button>
							</div>
						</motion.article>
					))}
				</div>

				<div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border bg-background px-5 py-4 text-sm sm:flex-row">
					<div className="flex items-center gap-3">
						<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
							<Building2 className="h-4 w-4" aria-hidden="true" />
						</span>
						<p className="text-muted-foreground">
							Need pricing for several locations? We will help you plan a practical rollout.
						</p>
					</div>
					<Link href="/contact-sales" className="shrink-0 font-semibold text-primary hover:underline">
						Talk with our team
					</Link>
				</div>
			</div>
		</section>
	);
}

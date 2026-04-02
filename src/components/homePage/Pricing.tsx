'use client';

import { motion } from 'framer-motion';
import { CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Pricing() {
const plans = [
	{
		name: 'Starter Trial',
		price: 'Free for 30 days',
		description: 'Full access for one kitchen to try everything risk-free.',
		features: [
			'1 location',
			'Guided line check workflows',
			'Temperature logging',
			'Inspection-ready records',
			'Manager dashboard preview',
		],
		cta: 'Start Free Trial',
		highlight: false,
	},
	{
		name: 'Pro',
		price: '$19.99/month or $199/year',
		description: 'Best for restaurants running daily line checks.',
		features: [
			'Unlimited line check stations',
			'Manager dashboards',
			'Multi-device syncing',
			'Email alerts for unsafe temps',
			'Exportable inspection logs',
		],
		cta: 'Start Free Trial',
		highlight: true,
	},
	{
		name: 'Enterprise',
		price: 'Custom',
		description: 'For multi-location restaurant groups.',
		features: [
			'Unlimited locations',
			'Advanced reporting',
			'Role-based permissions',
			'Priority onboarding',
			'Dedicated support',
		],
		cta: 'Contact Sales',
		highlight: false,
	},
];

	return (
		<section className="py-28 bg-accent/30">
			<div className="max-w-6xl mx-auto px-6">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 25 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
					className="text-center mb-20"
				>
					<div className="inline-block px-4 py-1 mb-4 text-sm font-medium rounded-full bg-background text-muted-foreground">
						Simple Transparent Pricing
					</div>

					<h2 className="text-4xl md:text-5xl font-bold tracking-tight">
						Pricing Built for
						<span className="block text-destructive">Restaurant Teams</span>
					</h2>

					<p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
						Start free in minutes. Upgrade when your kitchen operations grow.
					</p>
				</motion.div>

				{/* Pricing Cards */}
				<div className="grid md:grid-cols-3 gap-10">
					{plans.map((plan, i) => (
						<motion.div
							key={plan.name}
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.12 }}
							viewport={{ once: true }}
							className={`rounded-3xl shadow-xl p-10 flex flex-col justify-between transition-all duration-300
							${
								plan.highlight
									? 'bg-background border-2 border-destructive scale-[1.04]'
									: 'bg-background/70'
							}`}
						>
							{/* Plan Header */}
							<div>
								<h3 className="text-2xl font-semibold">{plan.name}</h3>

								<p className="text-muted-foreground mt-2">{plan.description}</p>

								<div className="mt-6 mb-8">
									<span className="text-4xl font-bold">{plan.price}</span>

									{/* {plan.price !== 'Free' && plan.price !== 'Custom' && (
										<span className="text-muted-foreground">/month</span>
									)} */}
								</div>

								<ul className="space-y-3">
									{plan.features.map((feature) => (
										<li
											key={feature}
											className="flex items-start gap-2 text-muted-foreground"
										>
											<CircleCheck className="w-4 h-4 mt-1 text-destructive" />
											{feature}
										</li>
									))}
								</ul>
							</div>

							{/* CTA */}
							<Button
								size="lg"
								asChild
								className="mt-10 w-full"
								variant={plan.highlight ? 'default' : 'outline'}
							>
								<Link
									href={
										plan.name === 'Enterprise'
											? '/contact-sales?plan=enterprise'
											: '/auth/signup?plan=pro'
									}
								>
									{plan.cta}
								</Link>
							</Button>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

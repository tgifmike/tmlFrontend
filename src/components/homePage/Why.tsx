'use client';

import { motion } from 'framer-motion';
import { Check, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

const benefits = [
	'Reduce the risk of foodborne illness',
	'Catch food safety issues before inspectors do',
	'Improve health inspection readiness',
	'Maintain consistent food quality',
	'Reduce food waste and spoilage',
	'Protect your restaurant’s reputation',
];

export default function Why() {
	return (
		<section className="border-y py-20 sm:py-24">
			<div className="mx-auto max-w-6xl px-6">
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
					className="mx-auto max-w-3xl text-center"
				>
					<div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary shadow-sm">
						<ShieldCheck className="size-3.5" aria-hidden="true" />
						Safer shifts start here
					</div>
					<h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
						Why line checks matter
					</h2>
					<p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
						Consistent checks help restaurant teams find safety and quality
						problems early—before they reach a guest or an inspector.
					</p>
				</motion.div>

				<div className="mt-14 grid overflow-hidden rounded-3xl border bg-card shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
					<motion.div
						initial={{ opacity: 0, x: -24 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						className="relative min-h-80 overflow-hidden lg:min-h-[520px]"
					>
						<Image
							src="/blog/line-checks-restaurant-operations.png"
							alt="Restaurant team completing a food safety line check"
							fill
							className="object-cover"
							sizes="(max-width: 1024px) 100vw, 45vw"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
						<p className="absolute bottom-5 left-5 right-5 max-w-md text-sm font-medium leading-6 text-white">
							Verify temperatures, preparation, freshness, and availability at the
							point where the work happens.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 24 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						viewport={{ once: true }}
						className="p-6 sm:p-8 lg:p-10"
					>
						<h3 className="text-2xl font-semibold tracking-tight">
							A simple routine with a meaningful impact
						</h3>
						<p className="mt-3 leading-7 text-muted-foreground">
							A well-run line check gives every shift the same clear standard and
							gives managers the information they need to respond quickly.
						</p>

						<ul className="mt-8 grid gap-4 sm:grid-cols-2">
							{benefits.map((benefit, index) => (
								<motion.li
									key={benefit}
									initial={{ opacity: 0, y: 12 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.06 }}
									viewport={{ once: true }}
									className="flex items-start gap-3 rounded-2xl border bg-background p-4 text-sm leading-6"
								>
									<span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
										<Check className="size-4" aria-hidden="true" />
									</span>
									<span>{benefit}</span>
								</motion.li>
							))}
						</ul>

						<div className="mt-8 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
							When teams verify conditions throughout the day, problems can be
							corrected before they affect service.
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}

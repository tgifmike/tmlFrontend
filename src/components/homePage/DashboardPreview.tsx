'use client';

import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import {
	BarChart3,
	Check,
	ChevronLeft,
	ChevronRight,
	Maximize2,
	X,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';

const dashboardImages = [
	'/newDashboard1.png',
	'/newDashboard2.png',
	'/newDashboard3.png',
];

const features = [
	'Track completion trends across your team',
	'Identify recurring food safety issues',
	'Spot weak completion days automatically',
	'Monitor temperature violations before inspections',
	'Understand which items fail most often',
];

export default function DashboardPreview() {
	const carouselRef = useRef<HTMLDivElement>(null);
	const isCarouselVisible = useInView(carouselRef, { amount: 0.3 });
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const reduceMotion = useReducedMotion();

	const next = () => setIndex((previous) => (previous + 1) % dashboardImages.length);
	const previous = () =>
		setIndex((current) => (current === 0 ? dashboardImages.length - 1 : current - 1));

	useEffect(() => {
		if (!isCarouselVisible || paused || reduceMotion || lightboxOpen) return;

		const interval = window.setInterval(() => {
			setIndex((previousIndex) => (previousIndex + 1) % dashboardImages.length);
		}, 5000);

		return () => window.clearInterval(interval);
	}, [isCarouselVisible, lightboxOpen, paused, reduceMotion]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setLightboxOpen(false);
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

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
						<BarChart3 className="size-3.5" aria-hidden="true" />
						Manager visibility
					</div>
					<h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
						See what is happening.
						<span className="mt-1 block text-destructive">Know where to act.</span>
					</h2>
					<p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
						Turn every completed line check into clear trends managers can use to
						coach teams, correct issues, and prepare for inspections.
					</p>
				</motion.div>

				<div className="mt-14 grid items-center gap-10 rounded-3xl border bg-card p-5 shadow-sm sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12 lg:p-10">
					<div
						ref={carouselRef}
						className="min-w-0"
						onMouseEnter={() => setPaused(true)}
						onMouseLeave={() => setPaused(false)}
					>
						<button
							type="button"
							onClick={() => setLightboxOpen(true)}
							className="group relative block aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-muted/30 shadow-lg"
							aria-label="Open the current dashboard screenshot"
						>
							<AnimatePresence mode="wait">
								<motion.div
									key={index}
									initial={{ opacity: 0, x: 24 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -24 }}
									transition={{ duration: 0.4 }}
									className="absolute inset-0"
								>
									<Image
										src={dashboardImages[index]}
										alt={`Restaurant line check analytics dashboard ${index + 1}`}
										fill
										className="object-contain p-2 sm:p-3"
										sizes="(max-width: 1024px) 90vw, 640px"
									/>
								</motion.div>
							</AnimatePresence>
							<span className="absolute right-3 top-3 flex items-center gap-2 rounded-full border bg-background/90 px-3 py-2 text-xs font-semibold opacity-100 shadow-sm backdrop-blur transition sm:opacity-0 sm:group-hover:opacity-100">
								<Maximize2 className="size-3.5" aria-hidden="true" />
								Expand
							</span>
						</button>

						<div className="mt-5 flex items-center justify-between gap-4">
							<Button
								type="button"
								variant="outline"
								size="icon"
								onClick={() => {
									previous();
									setPaused(true);
								}}
								aria-label="Show previous dashboard screenshot"
							>
								<ChevronLeft aria-hidden="true" />
							</Button>

							<div className="flex items-center gap-2" aria-label="Dashboard screenshots">
								{dashboardImages.map((_, imageIndex) => (
									<button
										key={imageIndex}
										type="button"
										onClick={() => {
											setIndex(imageIndex);
											setPaused(true);
										}}
										aria-label={`Show dashboard screenshot ${imageIndex + 1}`}
										aria-current={imageIndex === index ? 'true' : undefined}
										className={`size-2.5 rounded-full transition-all ${
											imageIndex === index
												? 'scale-125 bg-primary'
												: 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
										}`}
									/>
								))}
							</div>

							<Button
								type="button"
								variant="outline"
								size="icon"
								onClick={() => {
									next();
									setPaused(true);
								}}
								aria-label="Show next dashboard screenshot"
							>
								<ChevronRight aria-hidden="true" />
							</Button>
						</div>
					</div>

					<motion.div
						initial={{ opacity: 0, x: 24 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
					>
						<p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
							From checks to decisions
						</p>
						<h3 className="mt-3 text-2xl font-semibold tracking-tight">
							Your dashboard helps managers
						</h3>
						<ul className="mt-7 space-y-4">
							{features.map((feature) => (
								<li key={feature} className="flex items-start gap-3 text-sm leading-6">
									<span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
										<Check className="size-4" aria-hidden="true" />
									</span>
									<span>{feature}</span>
								</li>
							))}
						</ul>
						<div className="mt-8 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
							Replace guesswork with a record of what happened, when it happened,
							and where the team needs support.
						</div>
					</motion.div>
				</div>
			</div>

			{typeof document !== 'undefined' && createPortal(
				<AnimatePresence>
					{lightboxOpen && (
						<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setLightboxOpen(false)}
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-6"
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.96 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.96 }}
							transition={{ duration: 0.25 }}
							onClick={(event) => event.stopPropagation()}
							role="dialog"
							aria-modal="true"
							aria-label="Dashboard screenshot preview"
							className="relative w-full max-w-6xl"
						>
							<Button
								type="button"
								variant="secondary"
								size="icon"
								onClick={() => setLightboxOpen(false)}
								className="absolute right-3 top-3 z-10 shadow"
								aria-label="Close dashboard screenshot preview"
							>
								<X aria-hidden="true" />
							</Button>
							<Image
								src={dashboardImages[index]}
								alt={`Expanded restaurant analytics dashboard ${index + 1}`}
								width={1600}
								height={900}
								className="h-auto w-full rounded-2xl border bg-background"
							/>
						</motion.div>
						</motion.div>
					)}
				</AnimatePresence>,
				document.body,
			)}
		</section>
	);
}

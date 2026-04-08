'use client';

import Image from 'next/image';
import { BarChart3, X } from 'lucide-react';
import { motion, AnimatePresence, easeInOut } from 'framer-motion';
import { useEffect, useState } from 'react';

const dashboardImages = [
	'/newDashboard1.png',
	'/newDashboard2.png',
	'/newDashboard3.png',
];

const features = [
	'Track completion trends across your team',
	'Identify recurring food safety issues instantly',
	'Spot weak completion days automatically',
	'Monitor temperature violations before inspections',
	'Understand exactly which items fail most often',
];

export default function DashboardPreview() {
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const [lightboxOpen, setLightboxOpen] = useState(false);

	const next = () => setIndex((prev) => (prev + 1) % dashboardImages.length);

	const prev = () =>
		setIndex((prev) => (prev === 0 ? dashboardImages.length - 1 : prev - 1));

	// Auto rotate
	useEffect(() => {
		if (paused) return;

		const interval = setInterval(() => {
			setIndex((prev) => (prev + 1) % dashboardImages.length);
		}, 5000);

		return () => clearInterval(interval);
	}, [paused]);

	// ESC closes lightbox
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setLightboxOpen(false);
		};

		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, []);

	return (
		<section className="py-24 bg-muted">
			<div className="max-w-7xl mx-auto px-6">
				{/* Header */}
				<motion.div
					className="text-center mb-16"
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.9, ease: easeInOut }}
					viewport={{ once: true }}
				>
					<div className="flex justify-center mb-4">
						<BarChart3 className="w-10 h-10 text-primary" />
					</div>

					<h3 className="text-4xl md:text-5xl font-bold text-primary">
						See Exactly What’s Happening in Your Kitchen
					</h3>

					<p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
						Your dashboard turns line check data into clear insights so managers
						can act quickly and keep standards consistent across every shift.
					</p>
				</motion.div>

				{/* Layout */}
				<div className="flex flex-col lg:flex-row items-center gap-14">
					{/* Carousel */}
					<div
						className="flex-1 relative"
						onMouseEnter={() => setPaused(true)}
						onMouseLeave={() => setPaused(false)}
					>
						<div
							className="relative rounded-3xl overflow-hidden shadow-2xl border bg-background cursor-zoom-in"
							onClick={() => setLightboxOpen(true)}
						>
							<div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent" />

							<AnimatePresence mode="wait">
								<motion.div
									key={index}
									initial={{ opacity: 0, x: 40 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -40 }}
									transition={{ duration: 0.45 }}
								>
									<Image
										src={dashboardImages[index]}
										alt="Restaurant analytics dashboard preview"
										width={900}
										height={520}
										className="object-cover w-full h-auto"
										priority
									/>
								</motion.div>
							</AnimatePresence>
						</div>

						{/* Controls */}
						<div className="flex justify-center gap-4 mt-4">
							<button
								onClick={() => {
									prev();
									setPaused(true);
								}}
								className="px-4 py-2 rounded-lg border bg-background shadow hover:bg-muted transition"
							>
								←
							</button>

							<button
								onClick={() => {
									next();
									setPaused(true);
								}}
								className="px-4 py-2 rounded-lg border bg-background shadow hover:bg-muted transition"
							>
								→
							</button>
						</div>

						{/* Indicator dots */}
						<div className="flex justify-center gap-2 mt-3">
							{dashboardImages.map((_, i) => (
								<div
									key={i}
									className={`h-2.5 w-2.5 rounded-full transition ${
										i === index ? 'bg-primary' : 'bg-muted-foreground/30'
									}`}
								/>
							))}
						</div>
					</div>

					{/* Feature List */}
					<motion.div
						className="flex-1"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
					>
						<h4 className="text-2xl font-semibold text-primary mb-6">
							Your dashboard helps managers:
						</h4>

						<ul className="space-y-5 text-lg text-primary">
							{features.map((feature, i) => (
								<li key={i} className="flex items-start gap-3">
									<div className="mt-1 w-2.5 h-2.5 rounded-full bg-primary" />
									{feature}
								</li>
							))}
						</ul>

						<p className="mt-8 text-lg italic text-muted-foreground">
							Instead of guessing where problems happen, your team sees trends
							immediately and fixes them before they impact guests.
						</p>
					</motion.div>
				</div>
			</div>

			{/* LIGHTBOX */}
			<AnimatePresence>
				{lightboxOpen && (
					<motion.div
						className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setLightboxOpen(false)}
					>
						<motion.div
							initial={{ scale: 0.9 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.9 }}
							transition={{ duration: 0.3 }}
							onClick={(e) => e.stopPropagation()}
							className="relative max-w-6xl w-full"
						>
							<button
								className="absolute top-4 right-4 bg-background rounded-full p-2 shadow"
								onClick={() => setLightboxOpen(false)}
							>
								<X />
							</button>

							<Image
								src={dashboardImages[index]}
								alt="Expanded dashboard preview"
								width={1600}
								height={900}
								className="rounded-xl w-full h-auto"
							/>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</section>
	);
}

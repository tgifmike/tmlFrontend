'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { CircleCheck, LayoutList, WifiOff, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';

const screenshots = [
	'/iPadLineCheckScreenShot.png',
	'/backendLineCheckScreenShot.png',
	'/iPhoneLineCheckScreenShot.png',
	'/backendLineCheckScreenShot2.png',
	'/iPhoneLineCheckTempCheckScreenShot.png',
	'/newDashboard1.png',
	'/newDashboard2.png',
	'/newDashboard3.png',
];

const features = [
	'Guided line check checklists',
	'Temperature logging for every station',
	'Expiration and freshness verification',
	'Real-time alerts for unsafe temperatures',
	'Digital records ready for inspections',
	'Manager dashboards and reports',
];

export default function Does() {
	const carouselRef = useRef<HTMLDivElement>(null);
	const isCarouselVisible = useInView(carouselRef, { margin: '-120px' });
	const reduceMotion = useReducedMotion();
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);
	const [carouselIndex, setCarouselIndex] = useState(0);

	useEffect(() => {
		if (!isCarouselVisible || reduceMotion) return;

		const interval = window.setInterval(() => {
			setCarouselIndex((previous) => (previous + 1) % screenshots.length);
		}, 4500);

		return () => window.clearInterval(interval);
	}, [isCarouselVisible, reduceMotion]);

	const openPreview = (index: number) => {
		setLightboxIndex(index);
		setLightboxOpen(true);
	};

	return (
		<section className="py-20 sm:py-24">
			<div className="mx-auto max-w-6xl px-6">
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
					className="mx-auto max-w-3xl text-center"
				>
					<div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary shadow-sm">
						<LayoutList className="size-3.5" aria-hidden="true" />
						Built for every shift
					</div>
					<h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
						Everything your team needs.
						<span className="mt-1 block text-destructive">Nothing paper can lose.</span>
					</h2>
					<p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
						Run fast, repeatable line checks from a phone or tablet and keep every
						result available to managers.
					</p>
				</motion.div>

				<div className="mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
					<motion.div
						initial={{ opacity: 0, x: -24 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						className="relative min-h-[440px] overflow-hidden rounded-3xl border bg-muted/40 p-6 shadow-sm sm:min-h-[540px] sm:p-10"
					>
						<div className="absolute inset-x-16 top-16 h-44 rounded-full bg-primary/10 blur-3xl" />
						<button
							type="button"
							onClick={() => openPreview(0)}
							className="group relative mx-auto block h-[390px] w-[292px] overflow-hidden rounded-2xl border bg-background shadow-xl sm:h-[470px] sm:w-[352px]"
							aria-label="Open tablet line check preview"
						>
							<Image
								src="/iPadLineCheckScreenShot.png"
								alt="Digital restaurant line check displayed on a tablet"
								fill
								className="object-cover object-top transition duration-300 group-hover:scale-[1.02]"
								sizes="(max-width: 640px) 292px, 352px"
							/>
							<span className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full border bg-background/90 text-foreground shadow-sm backdrop-blur">
								<ZoomIn className="size-4" aria-hidden="true" />
							</span>
						</button>

						<button
							type="button"
							onClick={() => openPreview(2)}
							className="group absolute bottom-5 right-3 h-56 w-28 overflow-hidden rounded-2xl border bg-background shadow-xl sm:bottom-7 sm:right-7 sm:h-72 sm:w-36"
							aria-label="Open mobile line check preview"
						>
							<Image
								src="/iPhoneLineCheckScreenShot.png"
								alt="Digital restaurant line check displayed on a phone"
								fill
								className="object-cover object-top transition duration-300 group-hover:scale-[1.03]"
								sizes="(max-width: 640px) 112px, 144px"
							/>
						</button>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 24 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						viewport={{ once: true }}
					>
						<h3 className="text-2xl font-semibold tracking-tight">One clear workflow</h3>
						<p className="mt-3 leading-7 text-muted-foreground">
							Give team members a guided checklist and give managers reliable,
							time-stamped records without chasing paper forms.
						</p>

						<div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
							<span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<WifiOff className="size-4" aria-hidden="true" />
							</span>
							<div>
								<p className="font-semibold">Works through unreliable kitchen Wi-Fi</p>
								<p className="mt-1 text-sm leading-6 text-muted-foreground">
									Complete checks offline and sync the work when the connection returns.
								</p>
							</div>
						</div>

						<ul className="mt-7 grid gap-3 sm:grid-cols-2">
							{features.map((feature, index) => (
								<motion.li
									key={feature}
									initial={{ opacity: 0, y: 10 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.06 }}
									viewport={{ once: true }}
									className="flex items-start gap-3 rounded-2xl border p-4 text-sm leading-6"
								>
									<CircleCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
									<span>{feature}</span>
								</motion.li>
							))}
						</ul>
					</motion.div>
				</div>

				<div ref={carouselRef} className="mt-20 rounded-3xl border bg-muted/40 p-5 sm:p-8 lg:p-10">
					<div className="mx-auto max-w-3xl text-center">
						<p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
							Real workflow preview
						</p>
						<h3 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
							See line checks in action
						</h3>
						<p className="mt-4 leading-7 text-muted-foreground">
							Explore the screens teams use to verify temperatures, freshness,
							preparation, and shift completion.
						</p>
					</div>

					<motion.button
						key={carouselIndex}
						type="button"
						initial={{ opacity: 0, scale: 0.98 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.4 }}
						onClick={() => openPreview(carouselIndex)}
						className="group relative mx-auto mt-10 block h-[420px] w-full max-w-4xl overflow-hidden rounded-2xl border bg-background shadow-sm sm:h-[560px]"
						aria-label="Open the current line check screenshot"
					>
						<Image
							src={screenshots[carouselIndex]}
							fill
							alt={`Line check workflow screen ${carouselIndex + 1}`}
							className="object-contain p-3 sm:p-5"
							sizes="(max-width: 1024px) 90vw, 896px"
						/>
						<span className="absolute right-4 top-4 flex items-center gap-2 rounded-full border bg-background/90 px-3 py-2 text-xs font-semibold opacity-100 shadow-sm backdrop-blur transition sm:opacity-0 sm:group-hover:opacity-100">
							<ZoomIn className="size-4" aria-hidden="true" />
							Expand
						</span>
					</motion.button>

					<div className="mt-6 flex flex-wrap justify-center gap-2" aria-label="Workflow screenshots">
						{screenshots.map((_, index) => (
							<button
								key={index}
								type="button"
								aria-label={`Show workflow screenshot ${index + 1}`}
								aria-current={carouselIndex === index ? 'true' : undefined}
								onClick={() => setCarouselIndex(index)}
								className={`size-2.5 rounded-full transition-all ${
									carouselIndex === index
										? 'scale-125 bg-primary'
										: 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
								}`}
							/>
						))}
					</div>
				</div>
			</div>

			<Lightbox
				open={lightboxOpen}
				index={lightboxIndex}
				close={() => setLightboxOpen(false)}
				slides={screenshots.map((src) => ({ src }))}
			/>
		</section>
	);
}

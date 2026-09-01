'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { CircleCheck, WifiOff } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
// import 'yet-another-react-lightbox/styles.css';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';

export default function Does() {
	// List of screenshots for the carousel and lightbox
	// const carouselScreenshots = [
	// 	'/iPadLineCheckScreenShot.png',
	// 	'/iPhoneLineCheckScreenShot.png',
	// 	'/iPhoneLineCheckTempCheckScreenShot.png',
	// 	'/backendLineCheckScreenShot.png',
	// 	'/backendLineCheckScreenShot2.png',
	// 	'/Dashboard.png',
	// ];
	const carouselScreenshots = [
		'/iPadLineCheckScreenShot.png',
		'/backendLineCheckScreenShot.png',
		'/iPhoneLineCheckScreenShot.png',
		'/backendLineCheckScreenShot2.png',
		'/iPhoneLineCheckTempCheckScreenShot.png',
		'/newDashboard1.png',
		'/newDashboard2.png',
		'/newDashboard3.png',
	];

	const carouselRef = useRef(null);
	const isCarouselVisible = useInView(carouselRef, { margin: '-120px' });
	const reduceMotion = useReducedMotion();

	//set state
	const [open, setOpen] = useState(false);
	const [index, setIndex] = useState(0);
	const [carouselIndex, setCarouselIndex] = useState(0);
	const [isLandscape, setIsLandscape] = useState(false);

	// Framer Motion variants for staggered fade-in
	const containerVariants = {
		hidden: {},
		visible: {
			transition: { staggerChildren: 0.2 },
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 50 },
		visible: { opacity: 1, y: 0 },
	};

	//list of features to display in the UI, mapped to CircleCheck icons
	const features = [
		'Guided line check checklists',
		'Temperature logging for every station',
		'Expiration and freshness verification',
		'Real-time alerts for unsafe temperatures',
		'Digital records ready for inspections',
		'Manager dashboards and reports',
	];

	//useeffect to auto-cycle through carousel screenshots every 3.5 seconds
	useEffect(() => {
	if (!isCarouselVisible || reduceMotion) return;

	const interval = setInterval(() => {
		setCarouselIndex((prev) => (prev + 1) % carouselScreenshots.length);
	}, 3500);

	return () => clearInterval(interval);
	}, [isCarouselVisible, reduceMotion]);

	return (
		<section className="py-24">
			<div className="max-w-6xl mx-auto px-6">
				{/* Header */}
				<div className="text-center mb-16">
					<h2 className="text-4xl md:text-5xl font-bold text-destructive">
						What Our App Does
					</h2>
					<p className="mt-4 text-lg md:text-xl text-ring max-w-2xl mx-auto">
						Our app makes line checks simple, fast, and consistent across every
						shift.
					</p>
				</div>

				{/* Main Content */}
				<div className="grid md:grid-cols-2 gap-20 items-center py-20">
					{/* Device Mockup Section */}
					<motion.div
						initial={{ opacity: 0, x: -40 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.7 }}
						viewport={{ once: true }}
						className="relative flex justify-center bg-accent/40 backdrop-blur-lg rounded-3xl shadow-xl p-10"
					>
						{/* Tablet */}
						<motion.button
							type="button"
							aria-label="Open the tablet line-check preview"
							animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
							transition={{
								duration: 5,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
							onClick={() => {
								setIndex(0);
								setOpen(true);
							}}
						>
							<Image
								src="/iPadLineCheckScreenShot.png"
								alt="Tablet dashboard showing kitchen line check reporting interface"
								width={440}
								height={320}
								className="rounded-2xl shadow-2xl cursor-zoom-in hover:scale-[1.02]"
							/>
						</motion.button>

						{/* Right Phone */}
						<motion.button
							type="button"
							aria-label="Open the mobile line-check preview"
							animate={reduceMotion ? undefined : { y: [0, 10, 0] }}
							transition={{
								duration: 4,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
							className="absolute -right-12 bottom-[-25px]"
							onClick={() => {
								setIndex(2);
								setOpen(true);
							}}
						>
							<Image
								src="/iPhoneLineCheckScreenShot.png"
								alt="Mobile kitchen line check checklist interface"
								width={190}
								height={380}
								className="rounded-2xl shadow-2xl border border-gray-200 cursor-zoom-in hover:scale-[1.02]"
							/>
						</motion.button>

						{/* Left Phone */}
						<motion.button
							type="button"
							aria-label="Open the mobile temperature-check preview"
							animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
							transition={{
								duration: 4.5,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
							className="absolute -left-12 top-[-25px]"
							onClick={() => {
								setIndex(4);
								setOpen(true);
							}}
						>
							<Image
								src="/iPhoneLineCheckTempCheckScreenShot.png"
								alt="Mobile temperature logging screen"
								width={190}
								height={380}
								className="rounded-2xl shadow-2xl border border-gray-200 cursor-zoom-in hover:scale-[1.02]"
							/>
						</motion.button>
					</motion.div>

					{/* Features Section */}
					<motion.div
						initial={{ opacity: 0, x: 40 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.7 }}
						viewport={{ once: true }}
					>
						<h3 className="text-3xl font-semibold mb-8 tracking-tight">
							Key Features
						</h3>

						<div className="mb-7 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
							<span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<WifiOff className="size-4" aria-hidden="true" />
							</span>
							<div>
								<p className="font-semibold text-foreground">Built for unreliable kitchen Wi-Fi</p>
								<p className="mt-1 text-sm leading-6 text-muted-foreground">
									Teams can complete line checks offline and sync their work when the connection returns.
								</p>
							</div>
						</div>

						<ul className="space-y-5 text-lg text-muted-foreground">
							{features.map((feature, i) => (
								<motion.li
									key={i}
									initial={{ opacity: 0, y: 12 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ delay: i * 0.07 }}
									viewport={{ once: true }}
									className="flex gap-3 items-start"
								>
									<CircleCheck className="text-destructive w-5 h-5 mt-1 shrink-0" />
									<span>{feature}</span>
								</motion.li>
							))}
						</ul>

						<motion.p
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							transition={{ delay: 0.35 }}
							viewport={{ once: true }}
							className="mt-10 text-3xl font-medium text-chart-2 italic leading-relaxed"
						>
							Complete a full kitchen line check in minutes — directly from a
							phone or tablet.
						</motion.p>
					</motion.div>
				</div>

				{/* Line Check Screens - Framer Motion Carousel with Staggered Fade-In */}
				<div className="mt-24">
					{/* <h3 className="text-2xl font-semibold text-center mb-8">
						Line Check in Action
					</h3> */}

					<motion.div
						initial={{ opacity: 0, y: 25 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7 }}
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<div className="inline-block px-4 py-1 mb-4 text-sm font-medium rounded-full bg-accent text-muted-foreground">
							Real Workflow Preview
						</div>

						<h3 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
							See How Kitchen Teams Complete
							<span className="block text-destructive">
								Line Checks in Minutes
							</span>
						</h3>

						<p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
							Tap through actual screens used by restaurants to verify
							temperatures, log freshness checks, and stay inspection-ready
							every shift.
						</p>
					</motion.div>

					<motion.div
						ref={carouselRef}
						className="relative flex justify-center items-center"
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
					>
						{/* Carousel Image */}
						<motion.div
							key={carouselIndex}
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5 }}
							className="cursor-zoom-in"
							onClick={() => {
								setIndex(carouselIndex);
								setOpen(true);
							}}
						>
							<motion.div
								layout
								className={`relative flex items-center justify-center
								bg-accent/40 backdrop-blur-lg rounded-3xl shadow-xl p-6
								transition-all duration-500
								${isLandscape
								? 'w-[640px] h-[420px] md:w-[720px] md:h-[480px]'
								: 'w-[420px] h-[620px] md:w-[480px] md:h-[680px]'
								}`}
							>
								<Image
									src={carouselScreenshots[carouselIndex]}
									fill
									onLoadingComplete={(img) => {
										setIsLandscape(img.naturalWidth > img.naturalHeight);
									}}
									alt="Line check preview"
									className="object-contain rounded-xl"
									sizes="(max-width: 768px) 90vw, (max-width: 1200px) 80vw, 480px"
									priority
								/>
							</motion.div>
						</motion.div>
					</motion.div>

					{/* Dots navigation */}
					<div className="flex justify-center gap-3 mt-6">
						{carouselScreenshots.map((_, i) => (
							<button
								key={i}
								type="button"
								aria-label={`Show workflow screenshot ${i + 1}`}
								aria-current={carouselIndex === i ? 'true' : undefined}
								onClick={() => setCarouselIndex(i)}
								className={`h-2.5 w-2.5 rounded-full transition-all ${
									carouselIndex === i ? 'bg-destructive scale-125' : 'bg-muted'
								}`}
							/>
						))}
					</div>

					<Lightbox
						open={open}
						index={index}
						close={() => setOpen(false)}
						slides={carouselScreenshots.map((src) => ({ src }))}
					/>
				</div>
			</div>
		</section>
	);
}

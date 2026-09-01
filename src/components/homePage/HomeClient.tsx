'use client';

import {
	MotionConfig,
	motion,
	useReducedMotion,
	useScroll,
	useSpring,
	useTransform,
} from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';

import DashboardPreview from '@/components/homePage/DashboardPreview';
import Does from '@/components/homePage/Does';
import Headlines from '@/components/homePage/Headlines';
import Hero from '@/components/homePage/Hero';
import Pricing from '@/components/homePage/Pricing';
import Why from '@/components/homePage/Why';

const springOptions = {
	stiffness: 135,
	damping: 34,
	mass: 0.45,
};

function HeroFrame({ children }: { children: ReactNode }) {
	const frameRef = useRef<HTMLDivElement>(null);
	const reduceMotion = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: frameRef,
		offset: ['start start', 'end start'],
	});
	const smoothProgress = useSpring(scrollYProgress, springOptions);
	const y = useTransform(smoothProgress, [0, 1], [0, 72]);
	const scale = useTransform(smoothProgress, [0, 1], [1, 0.975]);
	const opacity = useTransform(smoothProgress, [0, 0.85, 1], [1, 0.92, 0.78]);

	return (
		<div ref={frameRef} id="hero" className="relative scroll-mt-24">
			<motion.div
				style={reduceMotion ? undefined : { y, scale, opacity }}
				className="transform-gpu will-change-transform"
			>
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 24 }}
					animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
					transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
				>
					{children}
				</motion.div>
			</motion.div>
		</div>
	);
}

function ScrollFrame({
	id,
	children,
	surfaceClassName = 'bg-background',
}: {
	id: string;
	children: ReactNode;
	surfaceClassName?: string;
}) {
	const frameRef = useRef<HTMLDivElement>(null);
	const reduceMotion = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: frameRef,
		offset: ['start 92%', 'end 8%'],
	});
	const smoothProgress = useSpring(scrollYProgress, springOptions);
	const y = useTransform(smoothProgress, [0, 0.18, 0.82, 1], [52, 0, 0, -24]);
	const scale = useTransform(smoothProgress, [0, 0.18, 0.82, 1], [0.985, 1, 1, 0.992]);
	const opacity = useTransform(smoothProgress, [0, 0.16, 0.88, 1], [0.35, 1, 1, 0.82]);

	return (
		<div
			ref={frameRef}
			id={id}
			className={`relative -mt-px overflow-clip scroll-mt-24 ${surfaceClassName}`}
		>
			<motion.div
				style={reduceMotion ? undefined : { y, scale, opacity }}
				className="transform-gpu will-change-transform"
			>
				{children}
			</motion.div>
		</div>
	);
}

export default function Home() {
	const pathname = usePathname();

	useEffect(() => {
		const hash = window.location.hash;

		if (hash) {
			const element = document.querySelector(hash);
			if (element) element.scrollIntoView({ behavior: 'smooth' });
		}
	}, [pathname]);

	return (
		<MotionConfig reducedMotion="user">
			<div className="w-full overflow-x-clip">
				<HeroFrame>
					<Hero />
				</HeroFrame>

				<ScrollFrame id="why" surfaceClassName="bg-muted/40">
					<Why />
				</ScrollFrame>

				<ScrollFrame id="features">
					<Does />
				</ScrollFrame>

				<ScrollFrame id="dashboard" surfaceClassName="bg-muted/40">
					<DashboardPreview />
				</ScrollFrame>

				<ScrollFrame id="pricing">
					<Pricing />
				</ScrollFrame>

				<ScrollFrame id="headlines">
					<Headlines />
				</ScrollFrame>
			</div>
		</MotionConfig>
	);
}

'use client';

import Hero from '@/components/homePage/Hero';
import Why from '@/components/homePage/Why';
import Does from '@/components/homePage/Does';
import Headlines from '@/components/homePage/Headlines';
import { motion } from 'framer-motion';
import Pricing from './Pricing';
import DashboardPreview from './DashboardPreview';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Home() {
	// Variants for section animation
	const sectionVariant = {
		hidden: { opacity: 0, y: 50 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
	};

	const pathname = usePathname();

	useEffect(() => {
		const hash = window.location.hash;

		if (hash) {
			const el = document.querySelector(hash);
			if (el) {
				el.scrollIntoView({ behavior: 'smooth' });
			}
		}
	}, [pathname]);

	return (
		<div className="w-full mx-auto max-w-7xl">
			{/* Hero */}
			<motion.div
				id="hero"
				variants={sectionVariant}
				initial="hidden"
				animate="visible"
				className="scroll-mt-24"
			>
				<Hero />
			</motion.div>

			{/* Why Section */}
			<motion.div
				id="why"
				variants={sectionVariant}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
				className="scroll-mt-24"
			>
				<Why />
			</motion.div>

			{/* Does Section */}
			<motion.div
				id="features"
				variants={sectionVariant}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
				className="scroll-mt-24"
			>
				<Does />
			</motion.div>

			<motion.div
				id="dashboard"
				variants={sectionVariant}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
				className="scroll-mt-24"
			>
				<DashboardPreview />
			</motion.div>

			<motion.div
				id="pricing"
				variants={sectionVariant}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
				className="scroll-mt-24"
			>
				<Pricing />
			</motion.div>

			{/* Headlines */}
			<motion.div
				id="headlines"
				variants={sectionVariant}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
				className="scroll-mt-24"
			>
				<Headlines />
			</motion.div>
		</div>
	);
}

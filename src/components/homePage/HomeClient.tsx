'use client';

import Hero from '@/components/homePage/Hero';
import Why from '@/components/homePage/Why';
import Does from '@/components/homePage/Does';
import Headlines from '@/components/homePage/Headlines';
import { motion } from 'framer-motion';
import Pricing from './Pricing';
import DashboardPreview from './DashboardPreview';

export default function Home() {
	// Variants for section animation
	const sectionVariant = {
		hidden: { opacity: 0, y: 50 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
	};

	return (
		<div className="w-full mx-auto max-w-7xl">
			{/* Hero */}
			<motion.div variants={sectionVariant} initial="hidden" animate="visible">
				<Hero />
			</motion.div>

			{/* Why Section */}
			<motion.div
				variants={sectionVariant}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
			>
				<Why />
			</motion.div>

			{/* Does Section */}
			<motion.div
				variants={sectionVariant}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
			>
				<Does />
			</motion.div>

			<motion.div
				variants={sectionVariant}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
			>
				<DashboardPreview />
			</motion.div>

			<motion.div
				variants={sectionVariant}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
			>
				<Pricing />
			</motion.div>

			{/* Headlines */}
			<motion.div
				variants={sectionVariant}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
			>
				<Headlines />
			</motion.div>
		</div>
	);
}

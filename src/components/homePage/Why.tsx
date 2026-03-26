'use client';
import React from 'react';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';
import { motion, Variants, easeInOut } from 'framer-motion';

const Why = () => {
	// Variants for header animation
	const headerVariants: Variants = {
		hidden: { opacity: 0, y: 50 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 1, // slower
				ease: easeInOut,
			},
		},
	};

	// Variants for the list container
	const listVariants: Variants = {
		hidden: {},
		visible: {
			transition: {
				staggerChildren: 0.35, // slower stagger
			},
		},
	};

	// Variants for each list item
	const itemVariants: Variants = {
		hidden: { opacity: 0, x: 80 }, // fly in from farther right
		visible: {
			opacity: 1,
			x: 0,
			transition: {
				type: 'spring',
				stiffness: 100,
				damping: 15,
			},
		},
	};

	const benefits = [
		'Reduce the risk of foodborne illness',
		'Catch food safety issues before inspectors do',
		'Improve health inspection scores',
		'Maintain consistent food quality',
		'Reduce food waste and spoilage',
		'Protect the restaurant’s reputation',
	];

	return (
		<section className="py-20 bg-ring">
			<div className="max-w-6xl mx-auto px-6">
				{/* Header */}
				<motion.div
					className="text-center mb-14"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={headerVariants}
				>
					<h3 className="text-4xl md:text-5xl font-bold text-primary">
						Why Line Checks Matter
					</h3>
					<p className="text-lg md:text-xl text-forground mt-4 max-w-3xl mx-auto">
						Consistent line checks are one of the simplest ways to improve food
						safety, maintain quality, and protect your restaurant's reputation.
					</p>
				</motion.div>

				{/* Content */}
				<div className="flex flex-col md:flex-row items-center gap-12">
					{/* Image */}
					<motion.div
						className="flex-1"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
					>
						<Image
							src="https://thumbs.wbm.im/pw/medium/88fe134a7a14d5da2316059e89cb2991.jpg"
							alt="Restaurant line check process"
							width={500}
							height={500}
							className="rounded-2xl shadow-xl object-cover"
						/>
					</motion.div>

					{/* Text + List */}
					<motion.div
						className="flex-1"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.3 }}
						viewport={{ once: true }}
					>
						<h4 className="text-2xl font-semibold text-primary mb-6">
							Restaurants that perform routine line checks can:
						</h4>

						<motion.ul
							className="space-y-4 text-lg text-primary"
							variants={listVariants}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true }}
						>
							{benefits.map((benefit, i) => (
								<motion.li
									key={i}
									className="flex items-start gap-3"
									variants={itemVariants}
								>
									<CheckCircle className="text-destructive mt-1 w-5 h-5" />
									{benefit}
								</motion.li>
							))}
						</motion.ul>

						<p className="mt-8 text-lg text-primary italic">
							When teams verify temperatures and product quality throughout the
							day, problems are caught early — before they impact guests.
						</p>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default Why;

'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { CircleCheck } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

export default function Does() {
	const screenshots = ['/lineCheck1.png', '/lineCheck2.png', '/linecheck3.png'];
	const [open, setOpen] = useState(false);
	const [index, setIndex] = useState(0);

	return (
		<section className="py-24 ">
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
				<div className="grid md:grid-cols-2 gap-16 items-center">
					{/* Device Mockup */}
					<div className="relative flex justify-center bg-accent rounded-2xl shadow-xl p-6">
						<Image
							src="/iPad1.png"
							alt="iPad dashboard"
							width={420}
							height={300}
							className="rounded-xl shadow-xl"
						/>

						<Image
							src="/iPhone2.png"
							alt="iPhone line check"
							width={190}
							height={380}
							className="absolute -right-6 bottom-[-20px] rounded-xl shadow-2xl border border-gray-200"
						/>
					</div>

					{/* Features */}
					<div>
						<h3 className="text-2xl font-semibold mb-6">Key Features</h3>

						<ul className="space-y-4 text-lg text-primary">
							{[
								'Guided line check checklists',
								'Temperature logging for every station',
								'Expiration and freshness verification',
								'Real-time alerts for unsafe temperatures',
								'Digital records ready for inspections',
								'Manager dashboards and reports',
							].map((feature, i) => (
								<li key={i} className="flex gap-3 items-start">
									<CircleCheck className="text-red-600 w-5 h-5 mt-1" />
									{feature}
								</li>
							))}
						</ul>

						<p className="mt-8 text-lg text-primary italic">
							Complete a full kitchen line check in minutes — directly from a
							phone or tablet.
						</p>
					</div>
				</div>

				{/* Line Check Screens */}
				<div className="mt-24">
					<h3 className="text-2xl font-semibold text-center mb-0">
						Line Check in Action
					</h3>

					<div className="relative flex justify-center items-center h-[520px] cursor-pointer">
						{screenshots.map((src, i) => {
							const rotations = ['-10deg', '0deg', '10deg'];
							const sizes = [320, 400, 320];
							const positions = ['left-0', 'relative z-10', 'right-0'];

							return (
								<div
									key={i}
									className={`absolute ${positions[i]} transform transition-transform duration-300 hover:scale-105 ${
										i === 0 ? '-rotate-6' : i === 1 ? 'rotate-0' : 'rotate-6'
									}`}
									onClick={() => {
										setIndex(i);
										setOpen(true);
									}}
								>
									<Image
										src={src}
										width={sizes[i]}
										height={i === 1 ? 520 : 500}
										className="rounded-xl shadow-2xl"
										alt={`Line check ${i + 1}`}
									/>
								</div>
							);
						})}
					</div>

					{/* Lightbox */}
					<Lightbox
						open={open}
						index={index}
						close={() => setOpen(false)}
						slides={screenshots.map((src) => ({ src }))}
					/>
				</div>
			</div>
		</section>
	);
}

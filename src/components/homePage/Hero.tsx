import React from 'react';
import Image from 'next/image';

const Hero = () => {
	return (
		<section className="py-20">
			<div className="max-w-6xl mx-auto px-6">
				<div className="flex flex-col md:flex-row items-center gap-12">
					{/* Left Content */}
					<div className="flex-1">
						<h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
							Keep Your Kitchen
							<span className="block text-red-600">
								Consistent, Safe, and Inspection-Ready
							</span>
						</h1>

						<p className="mt-6 text-lg md:text-xl text-gray-600">
							Running a busy kitchen means juggling food safety, quality, and
							speed. One missed temperature check or expired product can lead to
							health violations, wasted food, or even customers getting sick.
						</p>

						<p className="mt-4 text-lg md:text-xl font-semibold text-gray-800">
							Our digital line check system keeps your team organized,
							compliant, and profitable—every single shift.
						</p>

						<p className="mt-6 text-lg text-gray-600 italic">
							Verify temperatures, product freshness, and prep quality in
							minutes.
						</p>
					</div>

					{/* Right Image */}
					<div className="flex-1">
						<Image
							src="https://thumbs.wbm.im/pw/small/eee0f380458d0590a84af9a26c392b78.jpg"
							alt="Restaurant line check process"
							width={550}
							height={550}
							className="rounded-2xl shadow-xl object-cover"
						/>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;
import React from 'react';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';

const Why = () => {
	return (
		<section className="py-20 bg-ring">
			<div className="max-w-6xl mx-auto px-6">
				{/* Header */}
				<div className="text-center mb-14">
					<h3 className="text-4xl md:text-5xl font-bold text-">
						Why Line Checks Matter
					</h3>

					<p className="text-lg md:text-xl text-forground mt-4 max-w-3xl mx-auto">
						Consistent line checks are one of the simplest ways to improve food
						safety, maintain quality, and protect your restaurant's reputation.
					</p>
				</div>

				{/* Content */}
				<div className="flex flex-col md:flex-row items-center gap-12">
					{/* Image */}
					<div className="flex-1">
						<Image
							src="https://thumbs.wbm.im/pw/medium/88fe134a7a14d5da2316059e89cb2991.jpg"
							alt="Restaurant line check process"
							width={500}
							height={500}
							className="rounded-2xl shadow-xl object-cover"
						/>
					</div>

					{/* Text */}
					<div className="flex-1">
						<h4 className="text-2xl font-semibold text-gray-900 mb-6">
							Restaurants that perform routine line checks can:
						</h4>

						<ul className="space-y-4 text-lg text-primary">
							<li className="flex items-start gap-3">
								<CheckCircle className="text-destructive mt-1 w-5 h-5" />
								Reduce the risk of foodborne illness
							</li>

							<li className="flex items-start gap-3">
								<CheckCircle className="text-destructive mt-1 w-5 h-5" />
								Catch food safety issues before inspectors do
							</li>

							<li className="flex items-start gap-3">
								<CheckCircle className="text-destructive mt-1 w-5 h-5" />
								Improve health inspection scores
							</li>

							<li className="flex items-start gap-3">
								<CheckCircle className="text-destructive mt-1 w-5 h-5" />
								Maintain consistent food quality
							</li>

							<li className="flex items-start gap-3">
								<CheckCircle className="text-destructive mt-1 w-5 h-5" />
								Reduce food waste and spoilage
							</li>

							<li className="flex items-start gap-3">
								<CheckCircle className="text-destructive mt-1 w-5 h-5" />
								Protect the restaurant’s reputation
							</li>
						</ul>

						<p className="mt-8 text-lg text-primary italic">
							When teams verify temperatures and product quality throughout the
							day, problems are caught early — before they impact guests.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Why;
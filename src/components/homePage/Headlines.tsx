import React from 'react';
import Image from 'next/image';
import { CircleCheck } from 'lucide-react';

const Headlines = () => {
	return (
		<section className="py-2 bg-ring">
			<div className="max-w-6xl mx-auto px-6 space-y-24">
				{/* Built for Busy Kitchens */}
				<div className="grid md:grid-cols-2 gap-12 items-center">
					<div>
						<h2 className="text-4xl font-bold text-background mb-6">
							Built for Busy Kitchens
						</h2>

						<ul className="space-y-4 text-lg text-primary">
							<li className="flex gap-3 items-center">
								<CircleCheck className="text-destructive w-5 h-5" />
								No paperwork
							</li>

							<li className="flex gap-3 items-center">
								<CircleCheck className="text-destructive w-5 h-5" />
								No guessing if food is safe
							</li>

							<li className="flex gap-3 items-center">
								<CircleCheck className="text-destructive w-5 h-5" />
								No forgotten checks
							</li>
						</ul>
					</div>

					<Image
						src="https://thumbs.wbm.im/pw/small/35d19f0bdab413dc788c8271e549d42f.jpg"
						alt="Restaurant line check process"
						width={500}
						height={400}
						className="rounded-2xl shadow-xl object-cover"
					/>
				</div>

				{/* Why Line Checks Matter */}
				<div className="text-center max-w-3xl mx-auto">
					<h2 className="text-4xl font-bold text-background mb-6">
						Why Line Checks Matter
					</h2>

					<p className="text-lg text-primary mb-4">
						Consistent line checks are one of the simplest ways to improve food
						safety, maintain quality, and protect your restaurant’s reputation.
					</p>
				</div>

				{/* Benefits */}
				<div className="grid md:grid-cols-2 gap-12 items-center">
					<Image
						src="https://thumbs.wbm.im/pw/small/df152f31a88abd3dc6f39c24c8533d53.jpg"
						alt="manager checking bar glasses"
						width={500}
						height={400}
						className="rounded-2xl shadow-xl object-cover"
					/>

					<div>
						<h2 className="text-4xl font-bold text-background mb-8">
							Benefits for Restaurant Owners
						</h2>

						<div className="space-y-6 text-destructive">
							<div>
								<h4 className="font-semibold text-lg">Safer food</h4>
								<p className="text-primary">
									Reduce risks of foodborne contamination.
								</p>
							</div>

							<div>
								<h4 className="font-semibold text-lg">Better inspections</h4>
								<p className="text-primary">
									Stay prepared with documented food safety logs.
								</p>
							</div>

							<div>
								<h4 className="font-semibold text-lg">Higher food quality</h4>
								<p className="text-primary">
									Serve consistent, fresh food every shift.
								</p>
							</div>

							<div>
								<h4 className="font-semibold text-lg">Less waste</h4>
								<p className="text-primary">
									Catch problems before ingredients spoil.
								</p>
							</div>

							<div>
								<h4 className="font-semibold text-lg">More profit</h4>
								<p className="text-primary">
									Better systems mean fewer losses and smoother operations.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Final CTA Section */}
				<div className="text-center max-w-3xl mx-auto">
					<h2 className="text-4xl font-bold text-background mb-6">
						Simple. Fast. Reliable.
					</h2>

					<p className="text-lg text-primary mb-4">
						Your kitchen already performs line checks. Our app simply makes them
						easier, faster, and impossible to forget.
					</p>

					<p className="text-lg text-primary">
						Start improving food safety, quality, and consistency today.
					</p>
				</div>
			</div>
		</section>
	);
};

export default Headlines;

import React from 'react';
import Image from 'next/image';
import { CircleCheck } from 'lucide-react';

export default function Does() {
	return (
		<section className="py-24 bg-white">
			<div className="max-w-6xl mx-auto px-6">
				{/* Header */}
				<div className="text-center mb-16">
					<h2 className="text-4xl md:text-5xl font-bold text-gray-900">
						What Our App Does
					</h2>

					<p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
						Our app makes line checks simple, fast, and consistent across every
						shift.
					</p>
				</div>

				{/* Main Content */}
				<div className="grid md:grid-cols-2 gap-16 items-center">
					{/* Device Mockup */}
					<div className="relative flex justify-center">
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

						<ul className="space-y-4 text-lg text-gray-700">
							<li className="flex gap-3 items-start">
								<CircleCheck className="text-red-600 w-5 h-5 mt-1" />
								Guided line check checklists
							</li>

							<li className="flex gap-3 items-start">
								<CircleCheck className="text-red-600 w-5 h-5 mt-1" />
								Temperature logging for every station
							</li>

							<li className="flex gap-3 items-start">
								<CircleCheck className="text-red-600 w-5 h-5 mt-1" />
								Expiration and freshness verification
							</li>

							<li className="flex gap-3 items-start">
								<CircleCheck className="text-red-600 w-5 h-5 mt-1" />
								Real-time alerts for unsafe temperatures
							</li>

							<li className="flex gap-3 items-start">
								<CircleCheck className="text-red-600 w-5 h-5 mt-1" />
								Digital records ready for inspections
							</li>

							<li className="flex gap-3 items-start">
								<CircleCheck className="text-red-600 w-5 h-5 mt-1" />
								Manager dashboards and reports
							</li>
						</ul>

						<p className="mt-8 text-lg text-gray-600">
							Complete a full kitchen line check in minutes — directly from a
							phone or tablet.
						</p>
					</div>
				</div>

				{/* Line Check Screens */}
				<div className="mt-24">
					<h3 className="text-2xl font-semibold text-center ">
						Line Check in Action
					</h3>

					<div className="relative flex justify-center items-center h-[520px]">
						<Image
							src="/lineCheck1.png"
							alt="Line check screen"
							width={260}
							height={500}
							className="absolute left-0 rotate-[-6deg] rounded-xl shadow-xl"
						/>

						<Image
							src="/lineCheck2.png"
							alt="Line check screen"
							width={300}
							height={520}
							className="relative z-10 rounded-xl shadow-2xl"
						/>

						<Image
							src="/lineCheck3.png"
							alt="Line check screen"
							width={260}
							height={500}
							className="absolute right-0 rotate-[6deg] rounded-xl shadow-xl"
						/>
					</div>
				</div>
			</div>
		</section>
	);
}

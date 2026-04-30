// import React from 'react';
// import Link from 'next/link';
// import { Button } from '@/components/ui/button';

// const Hero = () => {
// 	return (
// 		<section className="py-24 overflow-hidden">
// 			<div className="max-w-6xl mx-auto px-6">
// 				<div className="grid md:grid-cols-2 gap-14 items-center">
// 					{/* LEFT */}
// 					<div>
// 						<h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-primary">
// 							Keep Your Kitchen
// 							<span className="block text-destructive mt-2">
// 								Inspection-Ready Every Shift
// 							</span>
// 						</h1>

// 						<p className="mt-6 text-lg text-muted-foreground leading-relaxed">
// 							Busy kitchens don’t fail from lack of effort—they fail from missed
// 							checks. Temperature logs, expired product, and inconsistent prep
// 							put your business at risk.
// 						</p>

// 						<div className="mt-6 space-y-3 text-primary text-base">
// 							<div className="flex gap-2">
// 								<span className="text-green-500">✓</span>
// 								<span>Real-time line checks in seconds</span>
// 							</div>

// 							<div className="flex gap-2">
// 								<span className="text-green-500">✓</span>
// 								<span>Automated compliance tracking</span>
// 							</div>

// 							<div className="flex gap-2">
// 								<span className="text-green-500">✓</span>
// 								<span>Reduce waste and prevent violations</span>
// 							</div>
// 						</div>

// 						<div className="mt-8 flex flex-col sm:flex-row gap-3">
// 							<Button
// 								size="lg"
// 								variant="outline"
// 								asChild
// 								className="shadow-lg hover:scale-[1.03] transition-all"
// 							>
// 								<Link href="/free-trial?plan=starter-trial">
// 									Start Free Trial
// 								</Link>
// 							</Button>

// 							<Button size="lg" asChild>
// 								<Link href="#pricing">View Pricing</Link>
// 							</Button>
// 						</div>

// 						<p className="mt-6 text-lg font-semibold text-primary">
// 							Bring consistency, safety, and accountability to every shift.
// 						</p>
// 					</div>

// 					{/* RIGHT */}
// 					<div className="relative flex justify-center">
// 						<div className="absolute -inset-8 bg-primary/10 blur-3xl rounded-3xl" />

// 						{/* bubbles */}
// 						<div className="hidden xl:block absolute -top-6 -left-20 bg-background border shadow-xl rounded-2xl px-4 py-3 w-52 z-20">
// 							<p className="text-sm font-medium">
// 								Still using paper checklists?
// 							</p>
// 						</div>

// 						<div className="hidden xl:block absolute bottom-10 -left-24 bg-background border shadow-xl rounded-2xl px-4 py-3 w-52 z-20">
// 							<p className="text-sm font-medium">
// 								Managers chasing missing logs?
// 							</p>
// 						</div>

// 						<div className="hidden xl:block absolute top-1/2 -right-24 -translate-y-1/2 bg-background border shadow-xl rounded-2xl px-4 py-3 w-52 z-20">
// 							<p className="text-sm font-medium text-green-600">
// 								✔ Real-time accountability
// 							</p>
// 						</div>

// 						{/* video */}
// 						<div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border bg-black max-w-[380px]">
// 							<video
// 								autoPlay
// 								muted
// 								loop
// 								playsInline
// 								controls
// 								className="w-full h-auto"
// 							>
// 								<source src="/videos/iPadDemo.mp4" type="video/mp4" />
// 							</video>
// 						</div>
// 					</div>
// 				</div>
// 			</div>
// 		</section>
// 	);
// };

// export default Hero;
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Hero = () => {
	return (
		<section className="relative overflow-hidden py-24">
			{/* background glow */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-destructive/5 blur-3xl" />

			<div className="max-w-6xl mx-auto px-6 relative z-10">
				<div className="grid md:grid-cols-2 gap-16 items-center">
					{/* LEFT */}
					<div>
						{/* badge */}
						<div className="inline-flex items-center px-3 py-1 rounded-full border bg-background text-xs font-medium text-muted-foreground mb-6">
							Built for Multi-Unit Kitchens & Operators
						</div>

						{/* headline */}
						<h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-primary">
							Run Every Kitchen Shift
							<span className="block text-destructive mt-2">
								Inspection-Ready by Default
							</span>
						</h1>

						{/* subheadline */}
						<p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
							Digital line checks, temperature logs, prep accountability, and
							real-time compliance tracking—without paper binders or missed
							steps.
						</p>

						{/* CTA */}
						<div className="mt-8 flex flex-col sm:flex-row gap-3">
							<Button
								size="lg"
								asChild
								className="shadow-lg hover:scale-[1.03] transition bg-primary"
							>
								<Link href="/free-trial?plan=starter-trial">
									Start Free Trial
								</Link>
							</Button>

							{/* <Button
								size="lg"
								variant="outline"
								asChild
								className="hover:bg-muted transition"
							>
								<Link href="#demo">Watch 30s Demo</Link>
							</Button> */}
						</div>

						{/* trust line */}
						<p className="mt-6 text-sm text-muted-foreground">
							Trusted by operators managing{' '}
							<span className="text-primary font-semibold">multi locations</span>
						</p>
					</div>

					{/* RIGHT */}
					<div className="relative flex justify-center">
						{/* glow ring */}
						<div className="absolute -inset-10 bg-primary/10 blur-3xl rounded-3xl" />

						{/* KPI floating cards */}
						<div className="hidden xl:block absolute -top-6 -left-10 bg-background border shadow-xl rounded-xl px-4 py-3 z-20 w-44">
							<p className="text-xs text-muted-foreground">Compliance</p>
							<p className="text-lg font-semibold text-destructive">Improved</p>
						</div>

						<div className="hidden xl:block absolute bottom-10 -left-14 bg-background border shadow-xl rounded-xl px-4 py-3 z-20 w-44">
							<p className="text-xs text-muted-foreground">Issues Caught Early</p>
							<p className="text-lg font-semibold text-primary">Resolved Fast</p>
						</div>

						<div className="hidden xl:block absolute top-1/2 -right-14 -translate-y-1/2 bg-background border shadow-xl rounded-xl px-4 py-3 z-20 w-44">
							<p className="text-xs text-muted-foreground">Inspections</p>
							<p className="text-lg font-semibold text-green-600">Passed</p>
						</div>

						{/* VIDEO FRAME */}
						<div className="relative z-10 max-w-[380px] rounded-3xl overflow-hidden border shadow-2xl bg-black">
							{/* subtle top bar (iOS feel) */}
							<div className="h-6 bg-muted flex items-center px-3 gap-1">
								<span className="w-2 h-2 rounded-full bg-red-400" />
								<span className="w-2 h-2 rounded-full bg-yellow-400" />
								<span className="w-2 h-2 rounded-full bg-green-400" />
							</div>

							<video
								autoPlay
								muted
								loop
								playsInline
								controls
								className="w-full h-auto"
							>
								<source src="/videos/iPadDemo.mp4" type="video/mp4" />
							</video>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;
import React from 'react';
import Link from 'next/link';
import { ArrowRight, CirclePlay, Sparkles, WifiOff } from 'lucide-react';
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
						<div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
							<WifiOff className="size-3.5" aria-hidden="true" />
							New: Keep working with offline mode
						</div>

						{/* headline */}
						<h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-primary">
							Ditch the Paper.
							<span className="block text-destructive mt-2">
								Run Inspection-Ready Shifts.
							</span>
						</h1>

						{/* subheadline */}
						<p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
							Digital line checks, temperature logs, prep accountability, and
							real-time compliance tracking—without paper binders or missed
							steps.
						</p>

						<div className="mt-6 flex max-w-xl items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
							<span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<Sparkles className="size-4" aria-hidden="true" />
							</span>
							<div>
								<p className="font-semibold text-foreground">
									Get operational quickly with AI-assisted onboarding
								</p>
								<p className="mt-1 text-sm leading-6 text-muted-foreground">
									Create your location, describe the operation, and review a
									starting blueprint for stations, options, and items.
								</p>
							</div>
						</div>

						{/* CTA */}
						<div className="mt-8 flex flex-col sm:flex-row gap-3">
							<Button
								size="lg"
								asChild
								className="shadow-lg hover:scale-[1.03] transition bg-primary"
							>
								<Link href="/free-trial?plan=starter-trial">
									Start Free Trial
									<ArrowRight aria-hidden="true" />
								</Link>
							</Button>

							<Button
								size="lg"
								variant="outline"
								asChild
								className="hover:bg-muted transition"
							>
								<Link href="#features">
									See How It Works
									<CirclePlay aria-hidden="true" />
								</Link>
							</Button>
						</div>

						{/* trust line */}
						<p className="mt-6 text-sm text-muted-foreground">
							Built for independent restaurants and{' '}
							<span className="text-primary font-semibold">
								multi-location teams
							</span>
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
								preload="metadata"
								poster="/iPadLineCheckScreenShot.png"
								aria-label="The Manager Life line-check workflow demonstration"
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

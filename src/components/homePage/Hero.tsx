import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Hero = () => {
	return (
		<section className="py-24">
			<div className="max-w-6xl mx-auto px-6">
				<div className="grid md:grid-cols-2 gap-14 items-center">
					{/* LEFT */}
					<div>
						<h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-primary">
							Keep Your Kitchen
							<span className="block text-destructive mt-2">
								Inspection-Ready Every Shift
							</span>
						</h1>

						<p className="mt-6 text-lg text-muted-foreground leading-relaxed">
							Busy kitchens don’t fail from lack of effort—they fail from missed
							checks. Temperature logs, expired product, and inconsistent prep
							put your business at risk.
						</p>

						{/* FEATURE POINTS */}
						<div className="mt-6 space-y-3 text-primary text-base">
							<div className="flex gap-2">
								<span className="text-green-500">✓</span>
								<span>Real-time line checks in seconds</span>
							</div>

							<div className="flex gap-2">
								<span className="text-green-500">✓</span>
								<span>Automated compliance tracking</span>
							</div>

							<div className="flex gap-2">
								<span className="text-green-500">✓</span>
								<span>Reduce waste and prevent violations</span>
							</div>
						</div>

						{/* CTA */}
						<div className="mt-8 flex flex-col sm:flex-row gap-3">
							<Button
								size="lg"
								variant={'outline'}
								asChild
								className="shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 shadow-[0_0_30px_rgba(239,68,68,0.25)]"
							>
								<Link href="/free-trial?plan=starter-trial">
									Start Free Trial
								</Link>
							</Button>

							<Button
								size="lg"
								variant="default"
								asChild
								className="hover:bg-muted transition"
							>
								<Link href="#pricing">View Pricing</Link>
							</Button>
						</div>

						<p className="mt-6 text-lg font-semibold text-primary">
							Bring consistency, safety, and accountability to every shift.
						</p>
					</div>

					{/* RIGHT */}
					<div className="relative">
						{/* glow background */}
						<div className="absolute -inset-6 bg-primary/10 blur-3xl rounded-3xl" />

						{/* main image */}
						<Image
							src="https://thumbs.wbm.im/pw/small/eee0f380458d0590a84af9a26c392b78.jpg"
							alt="Line check dashboard"
							width={550}
							height={550}
							className="relative rounded-2xl shadow-2xl"
						/>

						{/* floating chat bubble 1 */}
						<div className="absolute -bottom-6 -left-20 bg-muted/80 backdrop-blur-md border shadow-xl rounded-2xl p-3 w-64">
							<div className="flex items-start gap-2">
								{/* <div className="w-2 h-2 mt-2 rounded-full bg-destructive" /> */}
								<p className="text-lg text-foreground font-medium">
									Still using paper line check books?
								</p>
							</div>
						</div>

						{/* floating chat bubble 2 */}
						<div className="absolute top-2 -left-24 bg-muted/80 backdrop-blur-md border shadow-xl rounded-2xl p-3 w-64">
							<div className="flex items-start gap-2">
								{/* <div className="w-2 h-2 mt-2 rounded-full bg-destructive" /> */}
								<p className="text-lg text-foreground font-medium">
									Books getting lost or thrown away mid-shift?
								</p>
							</div>
						</div>

						{/* floating chat bubble 3 */}
						<div className="absolute bottom-24 -right-20 bg-muted/80 backdrop-blur-md border shadow-xl rounded-2xl p-3 w-64">
							<div className="flex items-start gap-2">
								{/* <div className="w-2 h-2 mt-2 rounded-full bg-destructive" /> */}
								<p className="text-lg text-foreground font-medium">
									Sheets ruined by grease, water, or heat?
								</p>
							</div>
						</div>

						{/* floating badge */}
						<div className="absolute top-4 right-4 bg-destructive text-white text-xs px-3 py-1 rounded-full shadow">
							Live Tracking
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;

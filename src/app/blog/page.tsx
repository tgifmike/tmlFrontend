import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock3, ShieldCheck } from 'lucide-react';

const articleHref = '/blog/how-digital-line-checks-save-money';

export const metadata: Metadata = {
	title: 'Restaurant Operations Blog',
	description:
		'Practical guidance for safer restaurant shifts, stronger retail execution, and inspection-ready operations.',
	alternates: {
		canonical: '/blog',
	},
	openGraph: {
		title: 'Restaurant Operations Blog | The Manager Life',
		description:
			'Practical guidance for safer restaurant shifts and more consistent multi-location operations.',
		url: '/blog',
		type: 'website',
		images: ['/blog/digital-line-checks-save-money.png'],
	},
};

export default function BlogPage() {
	return (
		<div className="min-h-screen bg-background">
			<section className="border-b bg-gradient-to-b from-muted/70 to-background">
				<div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
					<div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary shadow-sm">
						<ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
						The Manager Life Blog
					</div>
					<h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
						Better shifts start with better operating habits.
					</h1>
					<p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
						Practical, evidence-informed guidance for restaurant food safety,
						retail execution, and multi-location accountability.
					</p>
				</div>
			</section>

			<section className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
				<p className="mb-6 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
					Latest article
				</p>

				<article className="group overflow-hidden rounded-3xl border bg-card shadow-sm transition-shadow hover:shadow-xl">
					<div className="grid lg:grid-cols-[1.15fr_0.85fr]">
						<Link href={articleHref} className="relative block min-h-72 overflow-hidden lg:min-h-[440px]">
							<Image
								src="/blog/digital-line-checks-save-money.png"
								alt="Restaurant manager using a tablet beside a paper checklist damaged by spilled soup"
								fill
								priority
								className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
								sizes="(min-width: 1024px) 58vw, 100vw"
							/>
						</Link>

						<div className="flex flex-col justify-center p-7 sm:p-10">
							<p className="text-sm font-semibold text-primary">Restaurant Costs &amp; Accountability</p>
							<h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
								<Link href={articleHref} className="hover:text-primary">
									How digital line checks save restaurants money
								</Link>
							</h2>
							<p className="mt-4 leading-7 text-muted-foreground">
								Paper savings are only the beginning. Digital checks protect shift
								history, reduce administrative work, reveal recurring problems, and show
								who completed each check, when it happened, and how long it took.
							</p>

							<div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
								<time dateTime="2026-09-01">September 1, 2026</time>
								<span className="inline-flex items-center gap-1.5">
									<Clock3 className="h-4 w-4" aria-hidden="true" />
									7 min read
								</span>
							</div>

							<Link
								href={articleHref}
								className="mt-8 inline-flex w-fit items-center gap-2 font-semibold text-primary hover:underline"
							>
								Read the article
								<ArrowRight className="h-4 w-4" aria-hidden="true" />
							</Link>
						</div>
					</div>
				</article>

				<div className="mt-14">
					<p className="mb-6 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
						More articles
					</p>
					<article className="group grid overflow-hidden rounded-3xl border bg-card shadow-sm transition-shadow hover:shadow-lg sm:grid-cols-[280px_1fr]">
						<Link
							href="/blog/why-line-checks-matter"
							className="relative block min-h-56 overflow-hidden sm:min-h-full"
						>
							<Image
								src="/blog/line-checks-restaurant-operations.png"
								alt="Restaurant manager completing a digital line check while a cook checks food temperature"
								fill
								className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
								sizes="(min-width: 640px) 280px, 100vw"
							/>
						</Link>
						<div className="p-7 sm:p-8">
							<p className="text-sm font-semibold text-primary">Food Safety &amp; Operations</p>
							<h2 className="mt-2 text-2xl font-bold tracking-tight">
								<Link href="/blog/why-line-checks-matter" className="hover:text-primary">
									Why line checks matter: safer food, completed tasks, and cleaner locations
								</Link>
							</h2>
							<p className="mt-3 leading-7 text-muted-foreground">
								See how visible verification helps teams catch routine food-safety and
								facility issues before they become incidents.
							</p>
							<div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
								<time dateTime="2026-08-24">August 24, 2026</time>
								<span className="inline-flex items-center gap-1.5">
									<Clock3 className="h-4 w-4" aria-hidden="true" />
									8 min read
								</span>
							</div>
						</div>
					</article>

					<article className="group mt-6 grid overflow-hidden rounded-3xl border bg-card shadow-sm transition-shadow hover:shadow-lg sm:grid-cols-[280px_1fr]">
						<Link
							href="/blog/restaurant-line-check-food-safety-case-study"
							className="relative block min-h-56 overflow-hidden sm:min-h-full"
						>
							<Image
								src="/blog/restaurant-line-check-food-safety-case-study.png"
								alt="Kitchen employee checking food temperature while a manager records the line check on a tablet"
								fill
								className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
								sizes="(min-width: 640px) 280px, 100vw"
							/>
						</Link>
						<div className="p-7 sm:p-8">
							<p className="text-sm font-semibold text-primary">Restaurant Food Safety Case Study</p>
							<h2 className="mt-2 text-2xl font-bold tracking-tight">
								<Link
									href="/blog/restaurant-line-check-food-safety-case-study"
									className="hover:text-primary"
								>
									A line check before dinner: from food-safety exception to corrective action
								</Link>
							</h2>
							<p className="mt-3 leading-7 text-muted-foreground">
								A transparent composite case study showing how a pre-service check can
								identify an exception, document the response, and support next-day coaching.
							</p>
							<div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
								<time dateTime="2026-07-09">July 9, 2026</time>
								<span className="inline-flex items-center gap-1.5">
									<Clock3 className="h-4 w-4" aria-hidden="true" />
									7 min read
								</span>
							</div>
						</div>
					</article>
				</div>
			</section>
		</div>
	);
}

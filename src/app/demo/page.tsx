import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
	ArrowRight,
	BarChart3,
	CheckCircle2,
	ClipboardCheck,
	Clock3,
	Eye,
	History,
	PlayCircle,
	ShieldCheck,
	Users,
} from 'lucide-react';

import DemoPlayer from '@/components/demo/DemoPlayer';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
	title: 'See The Manager Life in Action',
	description:
		'Watch a real restaurant line check from start to finish, then see how managers review results, exceptions, and team performance.',
	alternates: {
		canonical: '/demo',
	},
	openGraph: {
		title: 'See The Manager Life in Action',
		description:
		'Watch the employee line-check workflow and explore the manager dashboard behind it.',
		url: 'https://www.themanagerlife.com/demo',
		type: 'website',
		images: [
			{
				url: '/images/dashboard/operational-overview.png',
				width: 1219,
				height: 418,
				alt: 'The Manager Life line-check dashboard',
			},
		],
	},
};

const managerViews = [
	{
		src: '/images/dashboard/operational-overview.png',
		alt: 'Operational overview with daily, weekly, and monthly line-check progress',
		label: 'Spot the pace of operations',
		title: 'One glance tells you if the team is on track',
		body: 'Daily, weekly, and monthly views make missed checks visible before they become the norm.',
		className: 'lg:col-span-2',
		imageAspect: 'aspect-[2.8/1]',
	},
	{
		src: '/images/dashboard/todays-attention.png',
		alt: 'Today’s attention cards for missing, temperature, and preparation issues',
		label: 'Focus on today',
		title: 'Know what needs attention now',
		body: 'See missing items, temperature exceptions, and preparation issues recorded during today’s checks.',
		className: '',
		imageAspect: 'aspect-[2.8/1]',
	},
	{
		src: '/images/dashboard/weekday-trends.png',
		alt: 'Thirty-day weekday trends for line-check issues and completion',
		label: 'See the pattern',
		title: 'Find the days that need operational change',
		body: 'Rank recurring weekday issues and identify when completion or preparation performance tends to slip.',
		className: '',
		imageAspect: 'aspect-[2.8/1]',
	},
	{
		src: '/images/dashboard/recurring-item-issues.png',
		alt: 'Recurring item issues organized by missing, temperature, and preparation problems',
		label: 'Find recurring weak points',
		title: 'Turn individual entries into useful patterns',
		body: 'See which items and result types repeatedly need a closer look or a coaching conversation.',
		className: '',
		imageAspect: 'aspect-[2.8/1]',
	},
	{
		src: '/images/dashboard/team-performance.png',
		alt: 'Team performance and today’s completed line checks',
		label: 'Coach with context',
		title: 'See performance without hovering over the shift',
		body: 'Review check volume, timing, exceptions, and the employee activity behind every record.',
		className: '',
		imageAspect: 'aspect-[2.4/1]',
	},
];

const outcomes = [
	{
		icon: ClipboardCheck,
		title: 'Clear for the employee',
		body: 'Every station presents the same guided sequence, from prep details to temperatures and observations.',
	},
	{
		icon: Eye,
		title: 'Visible to the manager',
		body: 'Completed work, missed items, and out-of-range readings become a record—not a verbal handoff.',
	},
	{
		icon: History,
		title: 'Useful after the shift',
		body: 'Searchable history gives leaders evidence for follow-up, coaching, and inspection readiness.',
	},
];

export default function DemoPage() {
	return (
		<main className="min-h-screen bg-background">
			<section className="relative overflow-hidden border-b bg-zinc-950 text-white">
				<div className="absolute inset-0 opacity-60 [background:radial-gradient(circle_at_70%_10%,rgba(239,68,68,0.22),transparent_34%),radial-gradient(circle_at_12%_70%,rgba(59,130,246,0.18),transparent_30%)]" />
				<div className="relative mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pb-24 sm:pt-24">
					<div className="mx-auto max-w-3xl text-center">
						<div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
							<PlayCircle className="size-3.5" aria-hidden="true" />
							Real product. Real workflow.
						</div>
						<h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl sm:leading-[1.05]">
							See the shift from both sides.
						</h1>
						<p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
							Watch an employee run a complete digital line check, then see how every entry becomes clear, actionable manager visibility.
						</p>
						<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
							<Button size="lg" asChild className="bg-white text-zinc-950 hover:bg-zinc-200">
								<a href="#watch-demo">
									Watch the walkthrough
									<PlayCircle aria-hidden="true" />
								</a>
							</Button>
							<Button size="lg" variant="outline" asChild className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
								<Link href="/free-trial?plan=starter-trial">
									Try it with your team
									<ArrowRight aria-hidden="true" />
								</Link>
							</Button>
						</div>
					</div>

					<div id="watch-demo" className="mt-14 scroll-mt-28 sm:mt-16">
						<DemoPlayer />
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
				<div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.16em] text-destructive">The employee experience</p>
						<h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Less guessing in the moment.</h2>
						<p className="mt-5 text-lg leading-8 text-muted-foreground">
							The line-check app keeps the work moving in a simple order. Team members see the item, the standard, and the input required—without digging through binders or wondering what comes next.
						</p>
					</div>

					<div className="grid gap-4 sm:grid-cols-3">
						{outcomes.map((outcome) => {
							const Icon = outcome.icon;
							return (
								<div key={outcome.title} className="rounded-2xl border bg-card p-5 shadow-sm">
									<span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
										<Icon className="size-5" aria-hidden="true" />
									</span>
									<h3 className="mt-5 font-semibold">{outcome.title}</h3>
									<p className="mt-2 text-sm leading-6 text-muted-foreground">{outcome.body}</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			<section className="border-y bg-zinc-950 text-white">
				<div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
					<div className="mx-auto max-w-3xl text-center">
						<p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-400">Full walkthroughs</p>
						<h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Want the details? Watch a complete check.</h2>
						<p className="mt-5 text-lg leading-8 text-zinc-400">
							These uncut workflows show exactly what a team member sees—from choosing a station to saving the record and following through on an exception.
						</p>
					</div>

					<div className="mt-10 grid gap-6 md:grid-cols-2">
						<article className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
							<div className="flex justify-center bg-black/40 p-4 sm:p-6">
								<video controls playsInline preload="metadata" poster="/videos/bathroom-line-check-poster.jpg" className="aspect-[3/4] max-h-[620px] w-full rounded-2xl bg-black object-contain" aria-label="Complete restroom line check, history review, and correction walkthrough">
									<source src="/videos/bathroom-line-check-walkthrough.mp4" type="video/mp4" />
								</video>
							</div>
							<div className="p-6 sm:p-7">
								<div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-400">Restroom check</p><span className="text-xs text-zinc-500">0:58</span></div>
								<h3 className="mt-2 text-xl font-semibold">From failed item to documented correction</h3>
								<p className="mt-2 leading-7 text-zinc-400">See pass/fail validation, observations, line-check history, the correction queue, and the final resolved record.</p>
							</div>
						</article>

						<article className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
							<div className="flex justify-center bg-black/40 p-4 sm:p-6">
								<video controls playsInline preload="metadata" poster="/videos/fry-line-check-poster.jpg" className="aspect-[3/4] max-h-[620px] w-full rounded-2xl bg-black object-contain" aria-label="Complete fry station temperature and condition line-check walkthrough">
									<source src="/videos/fry-line-check-walkthrough.mp4" type="video/mp4" />
								</video>
							</div>
							<div className="p-6 sm:p-7">
								<div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-400">Fry station</p><span className="text-xs text-zinc-500">0:49</span></div>
								<h3 className="mt-2 text-xl font-semibold">Temperature checks with real operating context</h3>
								<p className="mt-2 leading-7 text-zinc-400">See temperature entry, pass/fail ranges, item notes, and observations captured across a live station check.</p>
							</div>
						</article>
					</div>
				</div>
			</section>

			<section className="border-y bg-muted/45">
				<div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
					<div className="max-w-3xl">
						<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">The manager experience</p>
						<h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">The backend tells the rest of the story.</h2>
						<p className="mt-5 text-lg leading-8 text-muted-foreground">
							A completed checklist is only the start. The dashboard organizes the signals managers need to find drift, recognize consistency, and follow up with the right person.
						</p>
					</div>

					<div className="mt-10 grid gap-6 lg:grid-cols-2">
						{managerViews.map((view) => (
							<article key={view.title} className={`group overflow-hidden rounded-3xl border bg-background shadow-sm ${view.className}`}>
								<div className={`relative overflow-hidden border-b bg-white ${view.imageAspect}`}>
									<Image
										src={view.src}
										alt={view.alt}
										fill
										className="object-contain p-4 transition duration-500 group-hover:scale-[1.02]"
										sizes={view.className ? '(min-width: 1024px) 1152px, 100vw' : '(min-width: 1024px) 560px, 100vw'}
									/>
								</div>
								<div className="p-6 sm:p-7">
									<p className="text-xs font-semibold uppercase tracking-[0.16em] text-destructive">{view.label}</p>
									<h3 className="mt-2 text-xl font-semibold tracking-tight">{view.title}</h3>
									<p className="mt-2 max-w-2xl leading-7 text-muted-foreground">{view.body}</p>
								</div>
							</article>
						))}
					</div>

					<div className="mt-6 overflow-hidden rounded-3xl border bg-background shadow-sm">
						<div className="grid lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
							<div className="p-7 sm:p-10">
								<div className="flex items-center gap-2 text-sm font-semibold text-primary">
									<ShieldCheck className="size-4" aria-hidden="true" />
									The audit trail
								</div>
								<h3 className="mt-3 text-2xl font-bold tracking-tight">From dashboard signal to the exact line check.</h3>
								<p className="mt-4 leading-7 text-muted-foreground">
									Open a completed record to see who performed it, when it started and finished, and the result recorded for every item—including missing items and out-of-range temperatures.
								</p>
							</div>
							<div className="relative min-h-[300px] border-t bg-white lg:min-h-[380px] lg:border-l lg:border-t-0">
								<Image src="/backendLineCheckScreenShot.png" alt="Detailed completed line-check record with item results and temperatures" fill className="object-contain p-5" sizes="(min-width: 1024px) 650px, 100vw" />
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
				<div className="grid gap-5 sm:grid-cols-3">
					{[
						{ icon: Clock3, title: '2 minutes', body: 'to see the core employee workflow' },
						{ icon: BarChart3, title: 'One dashboard', body: 'for daily pace, patterns, and follow-up' },
						{ icon: Users, title: 'Both sides', body: 'built for the people doing and leading the work' },
					].map((item) => {
						const Icon = item.icon;
						return (
							<div key={item.title} className="flex items-center gap-4 rounded-2xl border p-5">
								<Icon className="size-6 shrink-0 text-destructive" aria-hidden="true" />
								<div><p className="font-semibold">{item.title}</p><p className="text-sm text-muted-foreground">{item.body}</p></div>
							</div>
						);
					})}
				</div>

				<div className="mt-12 overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12 sm:py-16">
					<CheckCircle2 className="mx-auto size-8 opacity-80" aria-hidden="true" />
					<h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Ready to see it with your operation?</h2>
					<p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-primary-foreground/70">
						Start a 30-day trial and build your first location, or talk with us about the workflow your team needs.
					</p>
					<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
						<Button size="lg" variant="secondary" asChild>
							<Link href="/free-trial?plan=starter-trial">Start Free Trial <ArrowRight aria-hidden="true" /></Link>
						</Button>
						<Button size="lg" variant="outline" asChild className="border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
							<Link href="/contact-sales">Talk to Sales</Link>
						</Button>
					</div>
				</div>
			</section>
		</main>
	);
}

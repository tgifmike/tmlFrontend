import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
	ArrowRight,
	BarChart3,
	CheckCircle2,
	ClipboardCheck,
	Clock3,
	History,
	ShieldCheck,
	Smartphone,
	Thermometer,
	WifiOff,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

const canonical =
	'https://www.themanagerlife.com/restaurant-digital-line-check-software';

const capabilities = [
	{
		icon: ClipboardCheck,
		title: 'Guided station checks',
		description:
			'Give every shift a consistent sequence of prep, quality, cleanliness, and readiness checks.',
	},
	{
		icon: Thermometer,
		title: 'Temperature logging',
		description:
			'Record actual readings against the temperature categories configured for each food item.',
	},
	{
		icon: WifiOff,
		title: 'Offline continuity',
		description:
			'Keep the line-check workflow available when a kitchen connection becomes unreliable.',
	},
	{
		icon: History,
		title: 'Searchable history',
		description:
			'Review who completed a check, when it happened, and what the team recorded during the shift.',
	},
	{
		icon: BarChart3,
		title: 'Manager visibility',
		description:
			'Compare today, week-to-date, and month-to-date activity using each location’s operating schedule.',
	},
	{
		icon: Smartphone,
		title: 'Shared-device access',
		description:
			'Let PIN users complete assigned work while managers retain role-appropriate web access.',
	},
];

const workflow = [
	['Build the standard', 'Create locations, stations, options, items, temperature categories, and a daily completion goal.'],
	['Start the shift', 'A team member signs in and opens the station checks assigned to the location.'],
	['Record the condition', 'The employee selects the configured result, enters readings, and adds observations when context matters.'],
	['Review the pattern', 'Managers use the dashboard and history to see completion, exceptions, timing, and recurring weak points.'],
];

const faq = [
	{
		question: 'What is digital restaurant line check software?',
		answer:
			'Digital restaurant line check software replaces paper station checklists with a guided workflow for food temperatures, shelf life, prep readiness, cleanliness, observations, completion records, and manager reporting.',
	},
	{
		question: 'Can restaurant employees use a shared device?',
		answer:
			'Yes. The Manager Life supports PIN-based users for shared operational devices as well as invited users who need web access.',
	},
	{
		question: 'Does the software work when internet service drops?',
		answer:
			'The line-check experience includes offline support so teams can continue working through temporary connection problems and synchronize when service returns.',
	},
	{
		question: 'Does a digital checklist guarantee food-safety compliance?',
		answer:
			'No. Software supports a restaurant’s operating controls but does not replace training, active managerial control, an applicable HACCP plan, or the requirements of the local health authority.',
	},
];

export const metadata: Metadata = {
	title: 'Digital Restaurant Line Check Software',
	description:
		'Run restaurant line checks digitally with guided station workflows, food-temperature logs, offline support, completion history, and manager dashboards.',
	keywords: [
		'digital restaurant line check software',
		'restaurant line check app',
		'restaurant checklist software',
		'digital food safety checklist',
		'restaurant temperature log app',
	],
	alternates: {
		canonical: '/restaurant-digital-line-check-software',
	},
	openGraph: {
		title: 'Digital Restaurant Line Check Software | The Manager Life',
		description:
			'Replace paper restaurant line checks with guided digital workflows, temperature logs, offline support, and manager reporting.',
		url: canonical,
		type: 'website',
		images: [
			{
				url: '/blog/daily-line-check-real-world-consequences.png',
				width: 1672,
				height: 941,
				alt: 'Restaurant manager recording a food temperature during a digital line check',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Digital Restaurant Line Check Software',
		description:
			'Guided restaurant checks, temperature logs, offline continuity, and manager visibility in one workflow.',
		images: ['/blog/daily-line-check-real-world-consequences.png'],
	},
};

export default function RestaurantDigitalLineCheckSoftwarePage() {
	const structuredData = [
		{
			'@context': 'https://schema.org',
			'@type': 'SoftwareApplication',
			name: 'The Manager Life',
			url: canonical,
			applicationCategory: 'BusinessApplication',
			operatingSystem: 'Web, iOS',
			description: metadata.description,
		},
		{
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: faq.map((item) => ({
				'@type': 'Question',
				name: item.question,
				acceptedAnswer: {
					'@type': 'Answer',
					text: item.answer,
				},
			})),
		},
	];

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
			/>

			<main className="min-h-screen bg-background">
				<section className="overflow-hidden border-b bg-gradient-to-b from-muted/70 to-background">
					<div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr]">
						<div>
							<div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary shadow-sm">
								<ShieldCheck className="size-3.5" aria-hidden="true" />
								Built for restaurant operations
							</div>
							<h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-6xl sm:leading-[1.08]">
								Digital restaurant line check software
							</h1>
							<p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
								Replace paper forms with guided station checks, food-temperature logs,
								offline continuity, and a clear history managers can review across every shift.
							</p>
							<div className="mt-8 flex flex-col gap-3 sm:flex-row">
								<Button size="lg" asChild>
									<Link href="/free-trial?plan=starter-trial">
										Start Free Trial
										<ArrowRight aria-hidden="true" />
									</Link>
								</Button>
								<Button size="lg" variant="outline" asChild>
									<Link href="/contact-sales">Talk to Sales</Link>
								</Button>
							</div>
							<p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
								<Clock3 className="size-4 text-primary" aria-hidden="true" />
								30-day starter trial · No paper setup required
							</p>
						</div>

						<div className="relative aspect-[16/10] overflow-hidden rounded-3xl border bg-muted shadow-xl">
							<Image
								src="/blog/daily-line-check-real-world-consequences.png"
								alt="Restaurant manager entering a food-temperature reading during a digital line check"
								fill
								priority
								className="object-cover"
								sizes="(min-width: 1024px) 540px, 100vw"
							/>
						</div>
					</div>
				</section>

				<section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
					<div className="mx-auto max-w-3xl text-center">
						<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
							One operating record
						</p>
						<h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
							Know what was checked—not only what should have happened
						</h2>
						<p className="mt-5 text-lg leading-8 text-muted-foreground">
							The Manager Life turns each restaurant’s standards into a repeatable shift
							workflow. Employees see the checks they need to complete, while managers get
							an organized record for follow-up and coaching.
						</p>
					</div>

					<div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{capabilities.map(({ icon: Icon, title, description }) => (
							<article key={title} className="rounded-2xl border bg-card p-6 shadow-sm">
								<span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
									<Icon className="size-5" aria-hidden="true" />
								</span>
								<h3 className="mt-4 text-lg font-semibold">{title}</h3>
								<p className="mt-2 leading-7 text-muted-foreground">{description}</p>
							</article>
						))}
					</div>
				</section>

				<section className="border-y bg-muted/40">
					<div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
								The daily workflow
							</p>
							<h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
								From restaurant standard to completed line check
							</h2>
							<p className="mt-5 text-lg leading-8 text-muted-foreground">
								Use the setup assistant to build the location, then give every shift the
								same clear process on a phone or tablet.
							</p>
						</div>
						<ol className="space-y-4">
							{workflow.map(([title, description], index) => (
								<li key={title} className="flex gap-4 rounded-2xl border bg-background p-5 shadow-sm">
									<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
										{index + 1}
									</span>
									<div>
										<h3 className="font-semibold">{title}</h3>
										<p className="mt-1 leading-7 text-muted-foreground">{description}</p>
									</div>
								</li>
							))}
						</ol>
					</div>
				</section>

				<section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
					<div className="grid gap-10 lg:grid-cols-2 lg:items-center">
						<div className="relative aspect-[4/3] overflow-hidden rounded-3xl border bg-muted shadow-lg">
							<Image
								src="/newDashboard1.png"
								alt="Restaurant line-check dashboard showing completion activity and operating trends"
								fill
								className="object-cover object-top"
								sizes="(min-width: 1024px) 560px, 100vw"
							/>
						</div>
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
								Paper versus digital
							</p>
							<h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
								Make the completed work usable after the shift
							</h2>
							<ul className="mt-7 space-y-4">
								{[
									'Find completed checks without searching binders.',
									'Connect each submission to a user, location, and time.',
									'See recurring exceptions across days instead of isolated pages.',
									'Configure the reporting week, daily goal, and operational end of day.',
									'Review activity and history with manager-level access controls.',
								].map((benefit) => (
									<li key={benefit} className="flex items-start gap-3">
										<CheckCircle2 className="mt-1 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
										<span className="leading-7 text-muted-foreground">{benefit}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</section>

				<section className="border-y bg-muted/40">
					<div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
						<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
							Common questions
						</p>
						<h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
							Choosing a digital restaurant line-check system
						</h2>
						<div className="mt-8 space-y-4">
							{faq.map((item) => (
								<article key={item.question} className="rounded-2xl border bg-background p-6">
									<h3 className="text-lg font-semibold">{item.question}</h3>
									<p className="mt-2 leading-7 text-muted-foreground">{item.answer}</p>
								</article>
							))}
						</div>
					</div>
				</section>

				<section className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
					<div className="rounded-3xl bg-primary px-7 py-10 text-primary-foreground shadow-xl sm:px-12 sm:py-12">
						<h2 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
							Build your first digital restaurant line check
						</h2>
						<p className="mt-4 max-w-2xl text-lg leading-8 text-primary-foreground/80">
							Create a location, define its stations and standards, invite the team, and
							start building an inspection-ready operating history.
						</p>
						<div className="mt-8 flex flex-col gap-3 sm:flex-row">
							<Button size="lg" variant="secondary" asChild>
								<Link href="/free-trial?plan=starter-trial">
									Start Free Trial
									<ArrowRight aria-hidden="true" />
								</Link>
							</Button>
							<Button size="lg" variant="outline" asChild className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
								<Link href="/how-to">Explore the How To library</Link>
							</Button>
						</div>
					</div>
				</section>
			</main>
		</>
	);
}

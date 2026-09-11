import type { Metadata } from 'next';
import Link from 'next/link';
import {
	ArrowRight,
	CheckCircle2,
	ChevronDown,
	CircleHelp,
	ClipboardCheck,
	CreditCard,
	MessageCircle,
	Rocket,
	TabletSmartphone,
} from 'lucide-react';

export const metadata: Metadata = {
	title: 'Frequently Asked Questions',
	description:
		'Answers to common questions about The Manager Life: supported devices, getting started, cancellation, offline line checks, and health inspection readiness.',
	alternates: { canonical: '/faq' },
	openGraph: {
		title: 'Frequently Asked Questions | The Manager Life',
		description:
			'Get to know our digital line check app, from bringing your own iPad or iPhone to getting your team started.',
		url: '/faq',
		type: 'website',
	},
};

type Faq = {
	question: string;
	answer: string;
	links?: { label: string; href: string }[];
};

type FaqGroup = {
	id: string;
	title: string;
	description: string;
	icon: typeof Rocket;
	questions: Faq[];
};

const groups: FaqGroup[] = [
	{
		id: 'getting-started',
		title: 'Getting started',
		description: 'From your first question to your first digital line check.',
		icon: Rocket,
		questions: [
			{
				question: 'How can I sign up?',
				answer:
					'Start by filling out our free trial form with your contact information and a few details about your restaurant or group. Our team will follow up to help you get set up. If you want to talk through your needs first, contact sales.',
				links: [
					{ label: 'Start your free trial', href: '/free-trial?plan=starter-trial' },
					{ label: 'Contact sales', href: '/contact-sales' },
				],
			},
			{
				question: 'Can I try it before choosing a plan?',
				answer:
					'Yes. Start with a free trial to set up a location and run line checks with your team. You can also review the available plans to find the right fit for your operation.',
				links: [{ label: 'Explore plans', href: '/#pricing' }],
			},
			{
				question: 'Can I use it for more than one location?',
				answer:
					'Yes. The Manager Life supports independent restaurants and multi-location teams. Contact sales to discuss your locations, reporting needs, and rollout.',
				links: [{ label: 'Plan your rollout', href: '/contact-sales' }],
			},
		],
	},
	{
		id: 'devices',
		title: 'Devices & connectivity',
		description: 'What your team needs to run checks during a shift.',
		icon: TabletSmartphone,
		questions: [
			{
				question: 'Can I use any device?',
				answer:
					'No. The line check app supports iPads and iPhones only. Plan to use an iPad or iPhone for your team’s line checks. If you have a question about a particular device, contact us before getting started.',
				links: [{ label: 'Ask about your device', href: '/contact' }],
			},
			{
				question: 'Do you supply devices?',
				answer:
					'No. The Manager Life is bring your own device. You supply the iPads or iPhones your team will use; we provide the line check software.',
			},
			{
				question: 'What happens if the kitchen Wi-Fi drops?',
				answer:
					'You can complete line checks offline and sync the work when your connection returns. This helps your team keep checks moving through unreliable kitchen Wi-Fi.',
			},
		],
	},
	{
		id: 'daily-operations',
		title: 'Line checks & inspections',
		description: 'Build consistent habits that carry through every shift.',
		icon: ClipboardCheck,
		questions: [
			{
				question: 'Will this help me prepare for health inspections?',
				answer:
					'Yes. Regular line checks help your team spot temperature, freshness, and cleanliness issues early so you can address them before a future inspection. Completing checks consistently and following up on problems helps build safer daily habits and keeps useful records of the work your team has done.',
				links: [{ label: 'Why line checks matter', href: '/blog/why-line-checks-matter' }],
			},
			{
				question: 'Can I customize checks for my restaurant?',
				answer:
					'Yes. Set up your locations, stations, and line check items to reflect how your restaurant operates. Your team can follow checks built around the work they actually do, including temperatures, freshness, and preparation.',
				links: [{ label: 'Explore the features', href: '/#features' }],
			},
			{
				question: 'Can managers review completed checks?',
				answer:
					'Yes. Digital records, dashboards, and reports help managers review completed checks, see who performed them and when, and identify recurring issues that need follow-up.',
				links: [{ label: 'See the dashboard', href: '/#dashboard' }],
			},
		],
	},
	{
		id: 'plans',
		title: 'Plans & cancellation',
		description: 'Keep the flexibility your business needs.',
		icon: CreditCard,
		questions: [
			{
				question: 'Can I cancel at any time? Are there contracts?',
				answer:
					'Yes, you can cancel at any time. There are no contracts. If you need help with your subscription or cancellation, contact our team.',
				links: [{ label: 'Contact our team', href: '/contact' }],
			},
		],
	},
];

export default function FaqPage() {
	const faqJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: groups.flatMap((group) =>
			group.questions.map(({ question, answer }) => ({
				'@type': 'Question',
				name: question,
				acceptedAnswer: { '@type': 'Answer', text: answer },
			})),
		),
	};

	return (
		<div className="min-h-screen bg-background">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
			/>

			<section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/70 to-background">
				<div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-destructive/5 blur-3xl" />
				<div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
					<div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary shadow-sm">
						<CircleHelp className="size-3.5" aria-hidden="true" />
						Frequently asked questions
					</div>
					<h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl sm:leading-[1.08]">
						A few answers.
						<span className="mt-1 block text-destructive">A smoother start.</span>
					</h1>
					<p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
						Everything you need to know about getting your team started with
						The Manager Life, from devices to daily line checks.
					</p>
					<div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
						{['Bring your own device', 'No contracts', 'Cancel anytime'].map((item) => (
							<span key={item} className="inline-flex items-center gap-2">
								<CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
								{item}
							</span>
						))}
					</div>
				</div>
			</section>

			<div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:py-20 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-14">
				<aside>
					<div className="lg:sticky lg:top-28">
						<p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Browse by topic</p>
						<nav aria-label="FAQ topics" className="mt-4 flex flex-wrap gap-2 lg:flex-col">
							{groups.map(({ id, title, icon: Icon }) => (
								<a key={id} href={`#${id}`} className="inline-flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
									<Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
									{title}
								</a>
							))}
						</nav>
						<div className="mt-6 hidden rounded-2xl bg-muted/60 p-5 lg:block">
							<MessageCircle className="size-5 text-primary" aria-hidden="true" />
							<p className="mt-3 font-semibold">Have a different question?</p>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">Tell us about your operation. We’re here to help.</p>
							<Link href="/contact" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Get in touch <ArrowRight className="size-4" aria-hidden="true" /></Link>
						</div>
					</div>
				</aside>

				<div className="min-w-0 space-y-12">
					{groups.map(({ id, title, description, icon: Icon, questions }) => (
						<section key={id} id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28">
							<div className="mb-5 flex items-start gap-4">
								<span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-5" aria-hidden="true" /></span>
								<div>
									<h2 id={`${id}-title`} className="text-2xl font-bold tracking-tight">{title}</h2>
									<p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
								</div>
							</div>
							<div className="divide-y overflow-hidden rounded-3xl border bg-card shadow-sm">
								{questions.map(({ question, answer, links }, index) => (
									<details key={question} className="group" open={id === 'getting-started' && index === 0}>
										<summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-6 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-7 [&::-webkit-details-marker]:hidden">
											<h3 className="text-base font-semibold leading-6 sm:text-lg">{question}</h3>
											<ChevronDown className="size-5 shrink-0 text-muted-foreground group-open:rotate-180 motion-safe:transition-transform" aria-hidden="true" />
										</summary>
										<div className="px-6 pb-6 sm:px-7">
											<p className="leading-7 text-muted-foreground">{answer}</p>
											{links && (
												<div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
													{links.map(({ href, label }) => (
														<Link key={href} href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline underline-offset-4 hover:text-destructive">{label}<ArrowRight className="size-4" aria-hidden="true" /></Link>
													))}
												</div>
											)}
										</div>
									</details>
								))}
							</div>
						</section>
					))}
				</div>
			</div>

			<section className="mx-auto max-w-6xl px-6 pb-16 sm:pb-24">
				<div className="rounded-3xl bg-primary px-7 py-10 text-primary-foreground sm:px-12 sm:py-12">
					<p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/70">Let’s get your team started</p>
					<h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Make your next line check a digital one.</h2>
					<p className="mt-4 max-w-2xl leading-7 text-primary-foreground/80">Bring your iPad or iPhone. We’ll help you take the next step.</p>
					<div className="mt-8 flex flex-col gap-3 sm:flex-row">
						<Link href="/free-trial?plan=starter-trial" className="inline-flex items-center justify-center gap-2 rounded-md bg-background px-5 py-3 font-semibold text-foreground shadow-sm hover:bg-background/90">Start Free Trial<ArrowRight className="size-4" aria-hidden="true" /></Link>
						<Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-md border border-primary-foreground/30 px-5 py-3 font-semibold hover:bg-primary-foreground/10">Ask a Question<MessageCircle className="size-4" aria-hidden="true" /></Link>
					</div>
				</div>
			</section>
		</div>
	);
}

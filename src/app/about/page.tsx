import type { Metadata } from 'next';
import Link from 'next/link';
import {
	ArrowRight,
	BadgeCheck,
	BriefcaseBusiness,
	Building2,
	CheckCircle2,
	Code2,
	Store,
} from 'lucide-react';

export const metadata: Metadata = {
	title: 'About Our Restaurant and Retail Technology Team',
	description:
		'Meet The Manager Life team and learn how our restaurant, retail, POS installation, software development, and testing experience shapes our digital line check platform.',
	alternates: {
		canonical: '/about',
	},
	openGraph: {
		title: 'About The Manager Life',
		description:
			'Built by a team with experience across restaurant and retail operations, POS sales and installation, and POS software development and testing.',
		url: '/about',
		type: 'website',
	},
};

const experience = [
	{
		icon: Store,
		title: 'Restaurant and retail operations',
		description:
			'Our team understands the pace, competing priorities, and daily accountability of customer-facing operations because our experience comes from working in those environments.',
	},
	{
		icon: Building2,
		title: 'POS sales and installation',
		description:
			'We have worked with restaurants and retailers to sell and install point-of-sale systems, connecting business needs with technology used during real shifts.',
	},
	{
		icon: Code2,
		title: 'Software development and testing',
		description:
			'Our experience also includes developing and testing software in the POS industry, where reliability, clear workflows, and accurate records matter every day.',
	},
];

const principles = [
	'Build workflows that make sense during a busy shift.',
	'Make expectations clear for every team member and location.',
	'Create accountability through useful records, not extra paperwork.',
	'Help managers find patterns and act before small misses become expensive problems.',
];

export default function AboutPage() {
	const aboutJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'AboutPage',
		name: 'About The Manager Life',
		url: 'https://www.themanagerlife.com/about',
		mainEntity: {
			'@type': 'Organization',
			name: 'The Manager Life',
			url: 'https://www.themanagerlife.com',
			logo: 'https://www.themanagerlife.com/newLogo.png',
			description:
				'A restaurant operations technology team with experience in restaurant and retail operations, POS sales and installation, and POS software development and testing.',
		},
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
			/>

			<div className="min-h-screen bg-background">
				<section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/70 to-background">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-destructive/5 blur-3xl" />
					<div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
						<div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary shadow-sm">
							<BriefcaseBusiness className="h-3.5 w-3.5" aria-hidden="true" />
							About The Manager Life
						</div>
						<h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl sm:leading-[1.08]">
							Built from experience on both sides of the counter.
						</h1>
						<p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
							The Manager Life brings together hands-on restaurant and retail
							experience with a background in helping businesses adopt, use, develop,
							and test point-of-sale technology.
						</p>
					</div>
				</section>

				<section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
					<div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
								Our perspective
							</p>
							<h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
								Operations and technology should work together.
							</h2>
							<p className="mt-5 text-lg leading-8 text-muted-foreground">
								We have seen operational technology from several angles: as people
								working in restaurant and retail environments, as professionals selling
								and installing POS systems, and as software developers and testers in
								the point-of-sale world.
							</p>
							<p className="mt-5 text-lg leading-8 text-muted-foreground">
								That combination shapes how we build The Manager Life. A feature is only
								valuable when it solves a real shift problem, is clear to the person
								using it, and gives managers information they can act on.
							</p>
						</div>

						<div className="grid gap-4">
							{experience.map(({ icon: Icon, title, description }) => (
								<div key={title} className="rounded-3xl border bg-card p-6 shadow-sm sm:p-7">
									<div className="flex items-start gap-4">
										<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
											<Icon className="h-5 w-5" aria-hidden="true" />
										</span>
										<div>
											<h3 className="text-xl font-bold tracking-tight">{title}</h3>
											<p className="mt-2 leading-7 text-muted-foreground">{description}</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="border-y bg-muted/50">
					<div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
						<div>
							<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
								<BadgeCheck className="h-6 w-6" aria-hidden="true" />
							</div>
							<h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
								Why we built The Manager Life
							</h2>
							<p className="mt-5 text-lg leading-8 text-muted-foreground">
								Important shift work is often managed through paper forms, verbal
								reminders, and memory. Those methods make it difficult to know what was
								completed, when it happened, who handled it, and which problems keep
								coming back.
							</p>
							<p className="mt-5 text-lg leading-8 text-muted-foreground">
								We built The Manager Life to turn line checks into a practical digital
								workflow: straightforward for the team completing the work and useful
								for the managers responsible for consistency, food safety, and follow-up.
							</p>
						</div>

						<div className="rounded-3xl border bg-card p-7 shadow-sm sm:p-9">
							<h3 className="text-xl font-bold">What guides our work</h3>
							<ul className="mt-6 space-y-5">
								{principles.map((principle) => (
									<li key={principle} className="flex items-start gap-3">
										<CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
										<span className="leading-7 text-muted-foreground">{principle}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</section>

				<section className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
					<div className="rounded-3xl bg-primary px-7 py-10 text-primary-foreground sm:px-12 sm:py-12">
						<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-foreground/70">
							Built for real operations
						</p>
						<h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
							Ditch the paper and give every shift a workflow your team can trust.
						</h2>
						<div className="mt-8 flex flex-col gap-3 sm:flex-row">
							<Link
								href="/free-trial?plan=starter-trial"
								className="inline-flex items-center justify-center gap-2 rounded-md bg-background px-5 py-3 font-semibold text-foreground shadow-sm hover:bg-background/90"
							>
								Start Free Trial
								<ArrowRight className="h-4 w-4" aria-hidden="true" />
							</Link>
							<Link
								href="/contact-sales"
								className="inline-flex items-center justify-center rounded-md border border-primary-foreground/30 px-5 py-3 font-semibold hover:bg-primary-foreground/10"
							>
								Contact Sales
							</Link>
						</div>
					</div>
				</section>
			</div>
		</>
	);
}

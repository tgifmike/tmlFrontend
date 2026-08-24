import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
	ArrowLeft,
	ArrowRight,
	ClipboardCheck,
	Clock3,
	ExternalLink,
} from 'lucide-react';

const articleUrl =
	'https://www.themanagerlife.com/blog/why-line-checks-matter';

const sources = [
	{
		title:
			'Contributing Factors of Foodborne Illness Outbreaks — United States, 2014–2022',
		publisher: 'CDC Morbidity and Mortality Weekly Report',
		date: 'March 13, 2025',
		href: 'https://www.cdc.gov/mmwr/volumes/74/ss/ss7401a1.htm',
	},
	{
		title: 'Food Worker Handwashing in Restaurants',
		publisher: 'Centers for Disease Control and Prevention',
		date: 'March 18, 2024',
		href:
			'https://www.cdc.gov/restaurant-food-safety/php/practices/handwashing.html',
	},
	{
		title: 'Food Code 2022',
		publisher: 'U.S. Food and Drug Administration',
		date: 'Current edition, with December 2024 supplement corrections',
		href: 'https://www.fda.gov/food/fda-food-code/food-code-2022',
	},
	{
		title: 'Preventing Shigella Infection Among Food Service Workers and Managers',
		publisher: 'Centers for Disease Control and Prevention',
		date: 'March 5, 2024',
		href:
			'https://www.cdc.gov/shigella/prevention/preventing-shigella-infection-among-food-service-workers-and-managers.html',
	},
];

export const metadata: Metadata = {
	title: 'Why Restaurant Line Checks Matter',
	description:
		'Learn how well-designed line checks protect food safety, improve task completion across retail locations, and make restroom cleanliness easier to verify.',
	alternates: {
		canonical: '/blog/why-line-checks-matter',
	},
	openGraph: {
		title: 'Why Line Checks Matter for Food Safety and Retail Operations',
		description:
			'A practical, evidence-informed guide to safer food, completed tasks, and cleaner locations.',
		url: articleUrl,
		type: 'article',
		publishedTime: '2026-08-24T00:00:00-04:00',
		images: [
			{
				url: '/blog/line-checks-restaurant-operations.png',
				width: 1672,
				height: 941,
				alt: 'Restaurant manager completing a digital line check during service preparation',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Why Restaurant Line Checks Matter',
		description:
			'Safer food, completed tasks, and cleaner locations start with visible verification.',
		images: ['/blog/line-checks-restaurant-operations.png'],
	},
};

export default function LineChecksArticlePage() {
	const articleJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline:
			'Why Line Checks Matter: Safer Food, Completed Tasks, and Cleaner Locations',
		description:
			'How well-designed line checks protect food safety, improve retail task completion, and make facility cleanliness easier to verify.',
		image:
			'https://www.themanagerlife.com/blog/line-checks-restaurant-operations.png',
		datePublished: '2026-08-24',
		dateModified: '2026-08-24',
		author: {
			'@type': 'Organization',
			name: 'The Manager Life',
		},
		publisher: {
			'@type': 'Organization',
			name: 'The Manager Life',
			logo: {
				'@type': 'ImageObject',
				url: 'https://www.themanagerlife.com/newLogo.png',
			},
		},
		mainEntityOfPage: articleUrl,
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
			/>

			<article className="min-h-screen bg-background">
				<header className="border-b bg-gradient-to-b from-muted/70 to-background">
					<div className="mx-auto max-w-5xl px-6 pb-10 pt-10 sm:pb-14 sm:pt-14">
						<Link
							href="/blog"
							className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
						>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							All articles
						</Link>

						<p className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
							Food Safety &amp; Operations
						</p>
						<h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl sm:leading-[1.08]">
							Why line checks matter: safer food, completed tasks, and cleaner locations
						</h1>
						<p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
							The most damaging misses are often small, routine, and invisible from
							the office. A good line check gives every shift a practical way to catch
							them while there is still time to act.
						</p>

						<div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
							<span className="font-semibold text-foreground">The Manager Life Team</span>
							<time dateTime="2026-08-24">August 24, 2026</time>
							<span className="inline-flex items-center gap-1.5">
								<Clock3 className="h-4 w-4" aria-hidden="true" />
								8 min read
							</span>
						</div>
					</div>
				</header>

				<div className="mx-auto max-w-6xl px-6 pt-8 sm:pt-12">
					<div className="relative aspect-[16/9] overflow-hidden rounded-3xl border bg-muted shadow-xl">
						<Image
							src="/blog/line-checks-restaurant-operations.png"
							alt="Restaurant manager recording a digital line check while a cook verifies food temperature"
							fill
							priority
							className="object-cover"
							sizes="(min-width: 1280px) 1152px, 100vw"
						/>
					</div>
					<p className="mt-3 text-center text-xs text-muted-foreground">
						Routine verification connects food safety, shift execution, and facility care.
					</p>
				</div>

				<div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
					<p className="text-xl leading-9 text-foreground sm:text-2xl sm:leading-10">
						A line check is a short, repeatable verification of the conditions that
						must be right during a shift: temperatures, labels, sanitation, stocked
						hand sinks, clean restrooms, safe sales floors, and completed opening or
						closing work. Its real value is not the checkmark. It is the chance to
						find a problem, assign an owner, and confirm the correction.
					</p>

					<div className="my-12 grid gap-4 sm:grid-cols-3">
						<StatCard
							value="1 in 3"
							label="times restaurant workers washed their hands when they should have in CDC observations"
						/>
						<StatCard
							value="20.9%"
							label="of bacterial outbreaks in 2020–2022 included inadequate initial cooking time/temperature as a contributing factor"
						/>
						<StatCard
							value="17.3%"
							label="of bacterial outbreaks in 2020–2022 included improper cooling as a contributing factor"
						/>
					</div>

					<div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm leading-6 text-muted-foreground">
						<strong className="text-foreground">Important:</strong> A line check supports
						food-safety controls; it does not replace manager observation, employee
						training, a required HACCP plan, or the food code adopted by your local
						jurisdiction. Checklist limits and corrective actions should match your
						applicable rules.
					</div>

					<ArticleSection title="Food safety fails in the gap between knowing and doing">
						<p>
							Most teams know that food must be cooked, cooled, held, and stored safely.
							The operational problem is whether those controls are actually verified
							during a busy Tuesday lunch, a short-staffed close, or a manager handoff.
						</p>
						<p>
							The CDC&apos;s 2025 analysis of reported outbreaks found that inadequate
							cooking temperatures and improper cooling remained important contributing
							factors in bacterial outbreaks. The report specifically notes that cooling
							practices can be validated by reviewing logs, confirming that a working
							thermometer is available, talking with employees, and observing the process.
							That is line-check thinking: do not assume the process happened—verify it.
							<SourceLink href={sources[0].href}>CDC MMWR, 2025</SourceLink>
						</p>
						<p>
							Hand hygiene has the same execution gap. CDC restaurant observations found
							that workers washed their hands when they should about one-third of the time.
							Time pressure, sink accessibility, training, and management emphasis all
							influenced the behavior. A line check cannot prove every handwash occurred,
							but it can confirm that sinks are accessible and stocked, prompt direct
							observation, and make coaching part of the shift.
							<SourceLink href={sources[1].href}>CDC restaurant handwashing findings, 2024</SourceLink>
						</p>
					</ArticleSection>

					<ArticleSection title="For retail teams, visibility creates accountability">
						<p>
							In a single location, an experienced manager may notice an unfinished task.
							Across five, twenty, or one hundred locations, memory and walk-throughs do
							not scale. Leaders need a consistent record of what was expected, who checked
							it, when it was checked, what failed, and whether the failure was corrected.
						</p>
						<p>
							That applies beyond kitchens: opening cash controls, promotional displays,
							exit access, cooler temperatures, spill hazards, fitting rooms, and closing
							security checks can all disappear into the space between a written procedure
							and a completed shift. A shared digital line check turns those expectations
							into the same observable workflow at every store.
						</p>
						<p>
							This consistency mirrors a benefit the FDA identifies for Food Code adoption:
							uniform standards reduce complexity and support more standardized inspections
							and audits. The same operating principle works inside a brand—standardize the
							expectation, then make exceptions easy to see.
							<SourceLink href={sources[2].href}>FDA Food Code 2022</SourceLink>
						</p>
					</ArticleSection>

					<figure className="my-12 overflow-hidden rounded-3xl border bg-muted/40 shadow-sm">
						<div className="relative aspect-[4/3] sm:aspect-[16/10]">
							<Image
								src="/iPadLineCheckScreenShot.png"
								alt="Digital line check showing progress, item details, temperature entry, and observations"
								fill
								className="object-cover object-top"
								sizes="(min-width: 768px) 768px, 100vw"
							/>
						</div>
						<figcaption className="border-t bg-card px-5 py-4 text-sm leading-6 text-muted-foreground">
							A useful digital check captures the reading and the context—progress,
							missing items, observations, and follow-up—not only a completed checkbox.
						</figcaption>
					</figure>

					<ArticleSection title="Restrooms are operational blind spots, not side work">
						<p>
							Restrooms are easy to neglect because they sit outside the normal line of
							sight. Guests experience them directly, employees use them throughout the
							shift, and managers may not enter them often enough to catch a problem early.
							A vague instruction to “check the bathroom” makes the result depend on each
							person&apos;s definition of clean.
						</p>
						<p>
							The FDA Food Code is more direct: toilet facilities should be kept clean and
							in good repair to help prevent contamination and encourage sanitary practices.
							CDC guidance for food-service workers also emphasizes proper handwashing after
							using the restroom. Treating the restroom as part of the operating system—not
							an afterthought—connects guest experience with employee hygiene.
							<SourceLink href="https://www.fda.gov/media/184685/download">FDA Food Code § 6-501.18</SourceLink>
							<SourceLink href={sources[3].href}>CDC Shigella prevention guidance, 2024</SourceLink>
						</p>
						<p>
							A stronger restroom check names observable conditions: soap and paper stocked,
							fixtures and touchpoints clean, floors dry, waste below capacity, odors addressed,
							and repairs reported. If something fails, the check should identify an owner and
							a recheck time.
						</p>
					</ArticleSection>

					<ArticleSection title="What a useful line check looks like">
						<p>
							The best checklist is not the longest one. It is short enough to complete,
							specific enough to produce the same answer from different people, and
							connected to action when something is wrong.
						</p>

						<ol className="space-y-5">
							<ChecklistItem number="1" title="Ask for an observable condition">
								Replace “cooler okay” with the product or equipment to check, the approved
								limit for that operation, and the reading to record.
							</ChecklistItem>
							<ChecklistItem number="2" title="Match frequency to risk">
								High-risk temperature and sanitation controls may need checks during the
								shift; slower-changing facility conditions may need a different cadence.
							</ChecklistItem>
							<ChecklistItem number="3" title="Capture evidence where it helps">
								Use measured values, notes, or photos for exceptions. Evidence should make
								the result clearer, not create busywork.
							</ChecklistItem>
							<ChecklistItem number="4" title="Make failures start a workflow">
								A failed item should trigger the corrective action, owner, escalation path,
								and verification that the problem is actually closed.
							</ChecklistItem>
							<ChecklistItem number="5" title="Review patterns, not only completion">
								A 100% completion rate can hide repeated failures. Look for recurring items,
								locations, shifts, and times so training or maintenance addresses the cause.
							</ChecklistItem>
						</ol>
					</ArticleSection>

					<div className="my-12 overflow-x-auto rounded-2xl border">
						<table className="w-full min-w-[680px] border-collapse text-left text-sm">
							<caption className="sr-only">Examples of observable line-check items</caption>
							<thead className="bg-muted/70 text-foreground">
								<tr>
									<th className="px-5 py-4 font-semibold">Area</th>
									<th className="px-5 py-4 font-semibold">Verify</th>
									<th className="px-5 py-4 font-semibold">Capture</th>
									<th className="px-5 py-4 font-semibold">If it fails</th>
								</tr>
							</thead>
							<tbody className="divide-y">
								<ExampleRow area="Cold holding" verify="Selected food is within the locally required limit" capture="Actual temperature" action="Protect product and follow the approved corrective action" />
								<ExampleRow area="Hand sink" verify="Accessible, supplied, and operating" capture="Pass/fail plus exception note" action="Restock or repair; coach as needed" />
								<ExampleRow area="Restroom" verify="Fixtures and touchpoints clean; floor dry; supplies stocked" capture="Exception note or photo" action="Assign cleaning or maintenance, then recheck" />
								<ExampleRow area="Retail floor" verify="Required display, clear exits, and no visible trip hazards" capture="Pass/fail by zone" action="Correct or escalate before opening" />
							</tbody>
						</table>
					</div>

					<div className="my-12 rounded-3xl bg-primary px-7 py-8 text-primary-foreground sm:px-10 sm:py-10">
						<div className="flex items-start gap-4">
							<ClipboardCheck className="mt-1 h-8 w-8 shrink-0" aria-hidden="true" />
							<div>
								<p className="text-2xl font-bold tracking-tight">
									A completed checklist is not the outcome. A corrected risk is.
								</p>
								<p className="mt-3 leading-7 text-primary-foreground/80">
									Measure line-check quality by what the team catches, how quickly it responds,
									and whether the same issue becomes less common over time.
								</p>
							</div>
						</div>
					</div>

					<section aria-labelledby="sources-heading" className="mt-16 border-t pt-10">
						<h2 id="sources-heading" className="text-2xl font-bold tracking-tight">
							Sources and further reading
						</h2>
						<p className="mt-3 text-sm leading-6 text-muted-foreground">
							Claims in this article were checked against current federal public-health
							guidance and surveillance available when it was published.
						</p>
						<ul className="mt-6 space-y-4">
							{sources.map((source) => (
								<li key={source.href} className="rounded-xl border bg-card p-4">
									<a
										href={source.href}
										target="_blank"
										rel="noreferrer"
										className="group inline-flex items-start gap-2 font-semibold text-foreground hover:text-primary"
									>
										<span>{source.title}</span>
										<ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
									</a>
									<p className="mt-1 text-sm text-muted-foreground">
										{source.publisher} · {source.date}
									</p>
								</li>
							))}
						</ul>
					</section>
				</div>

				<section className="border-t bg-muted/50">
					<div className="mx-auto grid max-w-5xl gap-8 px-6 py-14 sm:grid-cols-[1fr_auto] sm:items-center sm:py-16">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
								Make every shift verifiable
							</p>
							<h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
								Build checks your team can complete and your managers can trust.
							</h2>
						</div>
						<div className="flex flex-col gap-3 sm:min-w-48">
							<Link
								href="/free-trial?plan=starter-trial"
								className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
							>
								Start Free Trial
								<ArrowRight className="h-4 w-4" aria-hidden="true" />
							</Link>
							<Link
								href="/"
								className="inline-flex items-center justify-center rounded-md border bg-background px-5 py-3 font-semibold hover:bg-muted"
							>
								Back to Home
							</Link>
						</div>
					</div>
				</section>
			</article>
		</>
	);
}

function ArticleSection({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="mt-14 space-y-5">
			<h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
			<div className="space-y-5 text-base leading-8 text-muted-foreground sm:text-lg">
				{children}
			</div>
		</section>
	);
}

function StatCard({ value, label }: { value: string; label: string }) {
	return (
		<div className="rounded-2xl border bg-card p-5 shadow-sm">
			<p className="text-3xl font-bold tracking-tight text-primary">{value}</p>
			<p className="mt-2 text-xs leading-5 text-muted-foreground">{label}</p>
		</div>
	);
}

function SourceLink({
	href,
	children,
}: {
	href: string;
	children: React.ReactNode;
}) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			className="ml-1 inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-primary hover:underline"
		>
			{children}
			<ExternalLink className="h-3 w-3" aria-hidden="true" />
		</a>
	);
}

function ChecklistItem({
	number,
	title,
	children,
}: {
	number: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<li className="flex gap-4">
			<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
				{number}
			</span>
			<div>
				<h3 className="font-bold text-foreground">{title}</h3>
				<p className="mt-1">{children}</p>
			</div>
		</li>
	);
}

function ExampleRow({
	area,
	verify,
	capture,
	action,
}: {
	area: string;
	verify: string;
	capture: string;
	action: string;
}) {
	return (
		<tr className="align-top hover:bg-muted/30">
			<td className="px-5 py-4 font-semibold text-foreground">{area}</td>
			<td className="px-5 py-4 text-muted-foreground">{verify}</td>
			<td className="px-5 py-4 text-muted-foreground">{capture}</td>
			<td className="px-5 py-4 text-muted-foreground">{action}</td>
		</tr>
	);
}

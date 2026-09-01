import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
	ArrowLeft,
	ArrowRight,
	CheckCircle2,
	Clock3,
	ExternalLink,
	Thermometer,
} from 'lucide-react';

const articleUrl =
	'https://www.themanagerlife.com/blog/restaurant-line-check-food-safety-case-study';

const sources = [
	{
		title: 'Contributing Factors in Restaurant Foodborne Illness Outbreaks',
		publisher: 'Centers for Disease Control and Prevention',
		date: 'May 7, 2024',
		href: 'https://www.cdc.gov/restaurant-food-safety/php/investigations/factors.html',
	},
	{
		title: 'Food Code 2022 — Management of Food Safety Practices',
		publisher: 'U.S. Food and Drug Administration',
		date: 'Current edition with supplement corrections',
		href: 'https://www.fda.gov/media/184685/download',
	},
];

export const metadata: Metadata = {
	title: 'Restaurant Line Check Food Safety Case Study',
	description:
		'Follow a realistic restaurant food safety case study showing how a pre-service digital line check can identify an exception, document corrective action, and support manager follow-up.',
	alternates: {
		canonical: '/blog/restaurant-line-check-food-safety-case-study',
	},
	openGraph: {
		title: 'A Line Check Before Dinner: A Restaurant Food Safety Case Study',
		description:
			'A transparent composite case study showing how line checks connect food-safety monitoring, corrective action, and shift accountability.',
		url: articleUrl,
		type: 'article',
		publishedTime: '2026-07-09T00:00:00-04:00',
		images: [
			{
				url: '/blog/restaurant-line-check-food-safety-case-study.png',
				width: 1672,
				height: 941,
				alt: 'Kitchen employee checking food temperature while a manager records the line check on a tablet',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Restaurant Line Check Food Safety Case Study',
		description:
			'How a pre-service line check can turn a food-safety exception into a documented corrective action.',
		images: ['/blog/restaurant-line-check-food-safety-case-study.png'],
	},
};

export default function RestaurantLineCheckCaseStudyPage() {
	const articleJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline:
			'A Line Check Before Dinner: A Restaurant Food Safety Case Study',
		description:
			'A transparent composite case study showing how a digital line check can support monitoring, corrective action, and manager follow-up before service.',
		image:
			'https://www.themanagerlife.com/blog/restaurant-line-check-food-safety-case-study.png',
		datePublished: '2026-07-09',
		dateModified: '2026-07-09',
		author: {
			'@type': 'Organization',
			name: 'The Manager Life',
			url: 'https://www.themanagerlife.com/about',
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
							Restaurant Food Safety Case Study
						</p>
						<h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl sm:leading-[1.08]">
							A line check before dinner: from food-safety exception to corrective action
						</h1>
						<p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
							A pre-service check finds a problem while there is still time to respond.
							Here is what the team records, how the manager follows up, and why the
							digital history matters after the shift ends.
						</p>

						<div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
							<Link href="/about" className="font-semibold text-foreground hover:text-primary">
								The Manager Life Team
							</Link>
							<time dateTime="2026-07-09">July 9, 2026</time>
							<span className="inline-flex items-center gap-1.5">
								<Clock3 className="h-4 w-4" aria-hidden="true" />
								7 min read
							</span>
						</div>
					</div>
				</header>

				<div className="mx-auto max-w-6xl px-6 pt-8 sm:pt-12">
					<div className="relative aspect-[16/9] overflow-hidden rounded-3xl border bg-muted shadow-xl">
						<Image
							src="/blog/restaurant-line-check-food-safety-case-study.png"
							alt="Kitchen employee checking food temperature while a manager records the line check on a tablet"
							fill
							priority
							className="object-cover"
							sizes="(min-width: 1280px) 1152px, 100vw"
						/>
					</div>
					<p className="mt-3 text-center text-xs text-muted-foreground">
						A useful check connects a measured condition with a timely response.
					</p>
				</div>

				<div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
					<p className="text-xl leading-9 text-foreground sm:text-2xl sm:leading-10">
						The value of a line check is easiest to see when something is wrong.
						A checkmark does not protect the shift. A team member noticing an
						exception, recording what they found, following the approved response,
						and verifying the result creates the real protection.
					</p>

					<ArticleSection title="The setting: a busy handoff before dinner">
						<p>
							The restaurant is moving from afternoon prep into dinner service. The
							cold line has been stocked, team members are changing positions, and the
							manager is balancing deliveries, callouts, and opening the dining room.
							It is exactly the kind of transition where a small miss can become
							invisible once tickets start printing.
						</p>
						<p>
							The pre-service line check asks for observable conditions rather than a
							general “station ready” answer. The employee records actual temperatures,
							confirms labels and product condition, notes anything missing, and flags
							an exception for manager review.
						</p>
						<p>
							That approach reflects the FDA&apos;s active-managerial-control framework:
							establish the control, monitor it, take corrective action when needed,
							and verify that the process is working.
							<SourceLink href={sources[1].href}>FDA Food Code 2022</SourceLink>
						</p>
					</ArticleSection>

					<section className="mt-14">
						<h2 className="text-3xl font-bold tracking-tight text-foreground">
							What happened during the check
						</h2>
						<p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
							The timeline below is illustrative, but each step represents a practical
							part of a strong line-check workflow.
						</p>

						<ol className="mt-8 space-y-4">
							<TimelineItem time="3:52 PM" title="The station check begins">
								The assigned employee opens the cold-line check and works through each
								item in sequence instead of relying on memory.
							</TimelineItem>
							<TimelineItem time="3:58 PM" title="A reading falls outside the approved limit">
								A measured food temperature does not meet the limit established for that
								item and operation. The employee records the actual reading rather than
								marking the station complete.
							</TimelineItem>
							<TimelineItem time="4:00 PM" title="The manager reviews the exception">
								The manager protects the product and follows the restaurant&apos;s approved
								corrective-action procedure. Nearby products and the equipment condition
								are also checked so the team does not treat one reading as an isolated box.
							</TimelineItem>
							<TimelineItem time="4:07 PM" title="A second, lower-risk miss is corrected">
								The same check identifies an incomplete label. The employee corrects it
								before service and records the follow-up.
							</TimelineItem>
							<TimelineItem time="4:11 PM" title="The check closes with a usable record">
								The digital history shows who completed the check, when it happened, how
								long it took, what failed, and what the team did next.
							</TimelineItem>
						</ol>
					</section>

					<div className="my-12 rounded-3xl bg-primary px-7 py-8 text-primary-foreground sm:px-10 sm:py-10">
						<div className="flex items-start gap-4">
							<Thermometer className="mt-1 h-8 w-8 shrink-0" aria-hidden="true" />
							<div>
								<p className="text-2xl font-bold tracking-tight">
									The success was not finding a perfect station.
								</p>
								<p className="mt-3 leading-7 text-primary-foreground/80">
									It was finding an exception before service, responding through the
									restaurant&apos;s approved procedure, and preserving enough context for the
									manager to learn from it later.
								</p>
							</div>
						</div>
					</div>

					<ArticleSection title="Why the temperature check matters">
						<p>
							CDC identifies time and temperature control as an important part of
							understanding restaurant outbreak contributing factors. Food held at the
							wrong temperature for long enough can allow harmful bacteria to grow,
							while inadequate cooking time or temperature can allow pathogens to survive.
							<SourceLink href={sources[0].href}>CDC contributing factors</SourceLink>
						</p>
						<p>
							The digital checklist does not decide whether food is safe. The restaurant
							must establish limits and corrective actions that match its process and
							the rules adopted by its jurisdiction. The checklist makes that operating
							expectation visible at the moment someone must measure and respond.
						</p>
					</ArticleSection>

					<ArticleSection title="The next-day review creates the longer-term value">
						<p>
							After the immediate correction, the manager reviews the completed check.
							The record answers questions that a final checkmark cannot: Was the
							exception found before service? Was the reading recorded? Who responded?
							How long did the full station check take? Was another item affected?
						</p>
						<p>
							One exception may be a one-time miss. Repeated exceptions at the same
							station, time, or item point toward a cause worth investigating: how the
							line is stocked, whether equipment is recovering properly, whether the
							check timing is appropriate, or whether the team needs clearer training.
						</p>
						<p>
							That is where{' '}
							<Link href="/" className="font-semibold text-primary hover:underline">
								digital restaurant line check software
							</Link>{' '}
							adds value beyond replacing paper. It turns separate shift observations
							into a history managers can review for coaching and operational patterns.
						</p>
					</ArticleSection>

					<ArticleSection title="Five lessons from the case">
						<div className="grid gap-4 sm:grid-cols-2">
							<LessonCard title="Measure the condition">
								Ask for the actual reading or observable result—not “everything okay.”
							</LessonCard>
							<LessonCard title="Make exceptions visible">
								A failed item should be easy for the employee to record and for the manager to review.
							</LessonCard>
							<LessonCard title="Connect failure to action">
								Define the approved response before the shift becomes busy.
							</LessonCard>
							<LessonCard title="Preserve who and when">
								Time stamps and ownership make follow-up specific and fair.
							</LessonCard>
							<LessonCard title="Review patterns">
								Use repeated exceptions to improve equipment, prep, training, or check timing.
							</LessonCard>
						</div>
					</ArticleSection>

					<ArticleSection title="What this case study does not claim">
						<p>
							A line check cannot guarantee that no foodborne illness will occur. It
							does not replace manager observation, employee illness policies, training,
							calibrated thermometers, required HACCP procedures, or the food-safety code
							adopted by the local jurisdiction.
						</p>
						<p>
							It can give those controls a repeatable place in the shift. When the check
							is specific, timely, and connected to corrective action, it helps the team
							catch an ordinary miss before it becomes harder to manage.
						</p>
					</ArticleSection>

					<section aria-labelledby="sources-heading" className="mt-16 border-t pt-10">
						<h2 id="sources-heading" className="text-2xl font-bold tracking-tight">
							Sources and further reading
						</h2>
						<p className="mt-3 text-sm leading-6 text-muted-foreground">
							The operational scenario is a transparent composite. Food-safety context
							was checked against current federal guidance available when published.
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

					<p className="mt-10 border-t pt-6 text-xs leading-5 text-muted-foreground">
						<strong className="font-semibold text-foreground">About this case study:</strong>{' '}
						This is a representative composite based on recurring situations encountered
						in restaurant operations. It is not presented as a named customer, a single
						documented incident, or a measured product outcome. Times and identifying
						details are illustrative.
					</p>
				</div>

				<section className="border-t bg-muted/50">
					<div className="mx-auto grid max-w-5xl gap-8 px-6 py-14 sm:grid-cols-[1fr_auto] sm:items-center sm:py-16">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
								Make every check actionable
							</p>
							<h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
								Give your team a clear way to measure, respond, and improve.
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
								href="/blog"
								className="inline-flex items-center justify-center rounded-md border bg-background px-5 py-3 font-semibold hover:bg-muted"
							>
								More Articles
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

function TimelineItem({
	time,
	title,
	children,
}: {
	time: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<li className="grid gap-3 rounded-2xl border bg-card p-5 shadow-sm sm:grid-cols-[90px_1fr] sm:gap-5">
			<time className="text-sm font-bold text-primary">{time}</time>
			<div>
				<h3 className="font-bold text-foreground">{title}</h3>
				<p className="mt-2 leading-7 text-muted-foreground">{children}</p>
			</div>
		</li>
	);
}

function LessonCard({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-2xl border bg-card p-5 shadow-sm">
			<div className="flex items-start gap-3">
				<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
				<div>
					<h3 className="font-bold text-foreground">{title}</h3>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">{children}</p>
				</div>
			</div>
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

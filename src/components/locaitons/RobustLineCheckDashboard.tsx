'use client';

import {
	AlertTriangle,
	CalendarDays,
	CalendarRange,
	ChevronDown,
	ClipboardCheck,
	Clock3,
	Goal,
	PackageX,
	RefreshCw,
	Target,
	Thermometer,
	TrendingDown,
	TrendingUp,
	UtensilsCrossed,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type ElementType } from 'react';
import { toast } from 'sonner';

import { getDashboardMetrics } from '@/app/api/linecheckApi';
import type {
	DashboardMetrics,
	LineCheckItemIssuesDto,
	TrendResult,
} from '@/app/types';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';

import EmployeePerformanceCard from './EmployeePerformanceCard';
import IssueCard from './IssueCard';
import TopIssueItemsCard from './TopIssueItemsCard';
import TopWeekdayTrendCard from './TopWeekdayTrendCard';

interface Props {
	locationId: string;
	dailyGoal: number;
}

type Period = 'daily' | 'weekly' | 'monthly';
type Severity = 'good' | 'minor' | 'high' | 'critical';

const EMPTY_METRICS: DashboardMetrics = {
	totalChecksToday: 0,
	totalChecksYesterday: 0,
	totalChecksWeekToDate: 0,
	totalChecksMonthToDate: 0,
	durationSeconds: null,
	lineChecks: [],
	missingItemsToday: 0,
	missingItemNamesToday: [],
	outOfTempItemsToday: 0,
	outOfTempItemNamesToday: [],
	incorrectPrepItemsToday: 0,
	incorrectPrepItemNamesToday: [],
	employeePerformanceToday: [],
	mostMissingItemsDay: '',
	mostOutOfTempDay: '',
	mostIncorrectPrepDay: '',
	weakestLineCheckDay: '',
	topMissingDays: [],
	topOutOfTempDays: [],
	topIncorrectPrepDays: [],
	topWeakestCompletionDays: [],
	topMissingItems: [],
	topOutOfTempItems: [],
	topIncorrectPrepItems: [],
};

const severityMeta: Record<Severity, {
	label: string;
	dotClassName: string;
	badgeClassName: string;
}> = {
	good: {
		label: 'Good',
		dotClassName: 'bg-green-500',
		badgeClassName: 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300',
	},
	minor: {
		label: 'Minor',
		dotClassName: 'bg-yellow-500',
		badgeClassName: 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-300',
	},
	high: {
		label: 'High',
		dotClassName: 'bg-orange-500',
		badgeClassName: 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300',
	},
	critical: {
		label: 'Critical',
		dotClassName: 'bg-red-500',
		badgeClassName: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
	},
};

const RobustLineCheckDashboard = ({ locationId, dailyGoal }: Props) => {
	const [metrics, setMetrics] = useState<DashboardMetrics>(EMPTY_METRICS);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [legendOpen, setLegendOpen] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

	const fetchMetrics = useCallback(async (initialLoad = false) => {
		if (!locationId) return;
		initialLoad ? setLoading(true) : setRefreshing(true);

		try {
			const response = await getDashboardMetrics(locationId);
			if (response.error) throw new Error(response.error);
			setMetrics(normalizeMetrics(response.data));
			setLoadError(null);
			setLastUpdated(new Date());
		} catch (error) {
			const message = error instanceof Error
				? error.message
				: 'Failed to load dashboard metrics.';
			setLoadError(message);
			toast.error(message);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [locationId]);

	useEffect(() => {
		fetchMetrics(true);
	}, [fetchMetrics]);

	const today = new Date();
	const weekday = today.getDay();
	const daysElapsedWeek = weekday === 0 ? 7 : weekday;
	const weekGoal = dailyGoal * daysElapsedWeek;
	const monthGoal = dailyGoal * today.getDate();

	const dailyTrend = trendIndicator(metrics.totalChecksToday, dailyGoal);
	const weeklyTrend = trendIndicator(metrics.totalChecksWeekToDate, weekGoal);
	const monthlyTrend = trendIndicator(metrics.totalChecksMonthToDate, monthGoal);
	const orderedLineChecks = useMemo(
		() => [...metrics.lineChecks].sort(
			(first, second) => dateValue(second.checkTime) - dateValue(first.checkTime),
		),
		[metrics.lineChecks],
	);

	if (loading) return <DashboardSkeleton />;

	return (
		<div className="space-y-8">
			<section className="space-y-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Operational overview</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Goals are measured against the days elapsed in the current week and month.
						</p>
					</div>
					<div className="flex items-center gap-3">
						{lastUpdated && (
							<span className="text-xs text-muted-foreground">
								Updated {lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
							</span>
						)}
						<Button
							variant="outline"
							size="sm"
							onClick={() => fetchMetrics(false)}
							disabled={refreshing}
						>
							<RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
							{refreshing ? 'Refreshing…' : 'Refresh'}
						</Button>
					</div>
				</div>

				{loadError && (
					<div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
						<AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
						<span>
							{loadError}{' '}
							{lastUpdated
								? 'The last available dashboard values are shown.'
								: 'Dashboard values are unavailable right now.'}
						</span>
					</div>
				)}

				<div className="grid gap-4 md:grid-cols-3">
					<GoalCard
						title="Today"
						subtitle={today.toLocaleDateString(undefined, {
							weekday: 'long',
							month: 'short',
							day: 'numeric',
						})}
						icon={CalendarDays}
						actual={metrics.totalChecksToday}
						expected={dailyGoal}
						trend={dailyTrend}
						period="daily"
						previousActual={metrics.totalChecksYesterday}
					/>
					<GoalCard
						title="Week to date"
						subtitle={`${daysElapsedWeek} day${daysElapsedWeek === 1 ? '' : 's'} elapsed`}
						icon={CalendarRange}
						actual={metrics.totalChecksWeekToDate}
						expected={weekGoal}
						trend={weeklyTrend}
						period="weekly"
					/>
					<GoalCard
						title="Month to date"
						subtitle={today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
						icon={ClipboardCheck}
						actual={metrics.totalChecksMonthToDate}
						expected={monthGoal}
						trend={monthlyTrend}
						period="monthly"
					/>
				</div>
			</section>

			<section className="space-y-4">
				<SectionHeading
					title="Today’s attention"
					description="Issues recorded during today’s completed line checks."
				/>
				<div className="grid gap-4 md:grid-cols-3">
					<AttentionCard
						title="Missing items"
						count={metrics.missingItemsToday}
						items={metrics.missingItemNamesToday}
						icon={PackageX}
						tone="amber"
					/>
					<AttentionCard
						title="Out of temperature"
						count={metrics.outOfTempItemsToday}
						items={metrics.outOfTempItemNamesToday}
						icon={Thermometer}
						tone="red"
					/>
					<AttentionCard
						title="Incorrect preparation"
						count={metrics.incorrectPrepItemsToday}
						items={metrics.incorrectPrepItemNamesToday}
						icon={UtensilsCrossed}
						tone="orange"
					/>
				</div>
			</section>

			<section className="space-y-4">
				<SectionHeading
					title="30-day patterns"
					description="Recurring days and items that deserve coaching or operational changes."
				/>
				<div className="space-y-4">
					<TopWeekdayTrendCard
						topMissingDays={metrics.topMissingDays}
						topOutOfTempDays={metrics.topOutOfTempDays}
						topIncorrectPrepDays={metrics.topIncorrectPrepDays}
						topWeakestCompletionDays={metrics.topWeakestCompletionDays}
					/>
					<TopIssueItemsCard
						topMissingItems={metrics.topMissingItems}
						topOutOfTempItems={metrics.topOutOfTempItems}
						topIncorrectPrepItems={metrics.topIncorrectPrepItems}
					/>
				</div>
			</section>

			<section className="grid items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(420px,3fr)]">
				<EmployeePerformanceCard data={metrics.employeePerformanceToday} />
				<Card className="gap-0 overflow-hidden py-0 shadow-sm">
					<CardHeader className="border-b px-5 py-5 sm:px-6">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<CardTitle className="text-lg">Today’s line checks</CardTitle>
								<p className="mt-1 text-sm text-muted-foreground">
									Open a check to review its recorded issues.
								</p>
							</div>
							<Badge variant="outline">{orderedLineChecks.length} completed</Badge>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<SeverityLegend open={legendOpen} onOpenChange={setLegendOpen} />
						{orderedLineChecks.length > 0 ? (
							<Accordion type="single" collapsible className="divide-y">
								{orderedLineChecks.map((lineCheck) => (
									<LineCheckSummary key={lineCheck.lineCheckId} lineCheck={lineCheck} />
								))}
							</Accordion>
						) : (
							<div className="px-6 py-12 text-center">
								<p className="font-medium">No completed line checks today</p>
								<p className="mt-1 text-sm text-muted-foreground">
									Completed checks and issue scores will appear here.
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</section>
		</div>
	);
};

function GoalCard({
	title,
	subtitle,
	icon: Icon,
	actual,
	expected,
	trend,
	period,
	previousActual,
}: {
	title: string;
	subtitle: string;
	icon: ElementType;
	actual: number;
	expected: number;
	trend: TrendResult;
	period: Period;
	previousActual?: number;
}) {
	const TrendIcon = trend.icon;

	return (
		<Card className="gap-0 overflow-hidden py-0 shadow-sm">
			<CardHeader className="border-b bg-muted/20 px-5 py-4">
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-center gap-3">
						<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3">
							<Icon className="size-5" aria-hidden="true" />
						</span>
						<div>
							<CardTitle className="text-base">{title}</CardTitle>
							<p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
						</div>
					</div>
					<Badge variant={trend.variant} className="gap-1">
						<TrendIcon className="size-3" aria-hidden="true" />
						{trend.label}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-5 p-5">
				<div>
					<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Completed checks</p>
					<p className="mt-1 text-4xl font-semibold tracking-tight">{actual}</p>
				</div>
				<GoalProgress
					actual={actual}
					expected={expected}
					period={period}
					previousActual={previousActual}
				/>
			</CardContent>
		</Card>
	);
}

function GoalProgress({
	actual,
	expected,
	period,
	previousActual,
}: {
	actual: number;
	expected: number;
	period: Period;
	previousActual?: number;
}) {
	const percent = expected > 0 ? Math.round((actual / expected) * 100) : 0;
	const remaining = Math.max(expected - actual, 0);
	const insight = getGoalInsight({ actual, expected, period, previousActual });

	return (
		<div className="space-y-2.5">
			<div className="flex items-center justify-between gap-3 text-sm">
				<span className="text-muted-foreground">Goal progress</span>
				<span className="font-semibold">{actual}/{expected}</span>
			</div>
			<div className="flex items-center gap-3">
				<Progress
					value={Math.min(percent, 100)}
					className={`h-2 ${progressColorClass(percent)}`}
				/>
				<span className="w-10 text-right text-xs font-semibold">{percent}%</span>
			</div>
			<p className="text-xs leading-5 text-muted-foreground">
				{remaining === 0 ? 'Goal reached. Keep the routine consistent.' : insight}
			</p>
		</div>
	);
}

function AttentionCard({
	title,
	count,
	items,
	icon: Icon,
	tone,
}: {
	title: string;
	count: number;
	items: string[];
	icon: ElementType;
	tone: 'amber' | 'red' | 'orange';
}) {
	const tones = {
		amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
		red: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
		orange: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
	};
	const visibleItems = items.slice(0, 3);

	return (
		<Card className="gap-0 py-0 shadow-sm">
			<CardContent className="p-5">
				<div className="flex items-start justify-between gap-4">
					<div className="flex min-w-0 items-center gap-3">
						<span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
							<Icon className="size-5" aria-hidden="true" />
						</span>
						<div className="min-w-0">
							<p className="font-semibold">{title}</p>
							<p className="text-xs text-muted-foreground">Recorded today</p>
						</div>
					</div>
					<span className="text-3xl font-semibold tracking-tight">{count}</span>
				</div>
				<div className="mt-4 border-t pt-3 text-sm text-muted-foreground">
					{visibleItems.length > 0 ? (
						<p className="line-clamp-2">
							{visibleItems.join(', ')}
							{items.length > visibleItems.length && ` +${items.length - visibleItems.length} more`}
						</p>
					) : (
						<p>No issues recorded.</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function SeverityLegend({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Collapsible open={open} onOpenChange={onOpenChange} className="border-b bg-muted/15">
			<div className="flex items-center justify-between gap-3 px-5 py-3">
				<p className="text-xs font-medium text-muted-foreground">Issue severity scoring</p>
				<CollapsibleTrigger asChild>
					<Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
						{open ? 'Hide' : 'How scoring works'}
						<ChevronDown className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
					</Button>
				</CollapsibleTrigger>
			</div>
			<CollapsibleContent className="px-5 pb-4">
				<div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
					<span>Out of temperature: <strong className="text-foreground">5 points</strong></span>
					<span>Incorrect prep: <strong className="text-foreground">3 points</strong></span>
					<span>Missing item: <strong className="text-foreground">1 point</strong></span>
				</div>
				<div className="mt-3 flex flex-wrap gap-2">
					{(['good', 'minor', 'high', 'critical'] as Severity[]).map((severity) => (
						<span key={severity} className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs">
							<span className={`size-2 rounded-full ${severityMeta[severity].dotClassName}`} />
							{severityMeta[severity].label}
						</span>
					))}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

function LineCheckSummary({ lineCheck }: { lineCheck: LineCheckItemIssuesDto }) {
	const severity = getSeverity(lineCheck);
	const outOfTempItems = lineCheck.outOfTempItems ?? [];
	const incorrectPrepItems = lineCheck.incorrectPrepItems ?? [];
	const missingItems = lineCheck.missingItems ?? [];

	return (
		<AccordionItem value={lineCheck.lineCheckId} className="border-0 px-0">
			<AccordionTrigger className="px-5 py-4 hover:no-underline sm:px-6">
				<div className="grid min-w-0 flex-1 gap-2 text-left sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:pr-4">
					<div className="min-w-0">
						<p className="truncate font-semibold">{lineCheck.employeeName || 'Unknown team member'}</p>
						<p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
							<Clock3 className="size-3.5" aria-hidden="true" />
							{formatCheckTime(lineCheck.checkTime)}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="outline" className={severity.badgeClassName}>
							<span className={`size-2 rounded-full ${severity.dotClassName}`} />
							{severity.label}
						</Badge>
						<span className="text-xs font-medium text-muted-foreground">Score {severity.score}</span>
					</div>
				</div>
			</AccordionTrigger>
			<AccordionContent className="border-t bg-muted/10 px-4 pb-4 pt-4 sm:px-5">
				<div className="grid gap-3 md:grid-cols-3">
					<IssueCard title="Out of temperature" items={outOfTempItems} severity="warning" />
					<IssueCard title="Incorrect preparation" items={incorrectPrepItems} severity="minor" />
					<IssueCard title="Missing items" items={missingItems} severity="critical" />
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}

function SectionHeading({ title, description }: { title: string; description: string }) {
	return (
		<div>
			<h2 className="text-xl font-semibold tracking-tight">{title}</h2>
			<p className="mt-1 text-sm text-muted-foreground">{description}</p>
		</div>
	);
}

function DashboardSkeleton() {
	return (
		<div className="space-y-6" aria-label="Loading dashboard metrics">
			<div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
			<div className="grid gap-4 md:grid-cols-3">
				{[0, 1, 2].map((index) => (
					<div key={index} className="h-64 animate-pulse rounded-2xl border bg-muted/50" />
				))}
			</div>
			<div className="grid gap-4 md:grid-cols-3">
				{[0, 1, 2].map((index) => (
					<div key={index} className="h-36 animate-pulse rounded-2xl border bg-muted/40" />
				))}
			</div>
		</div>
	);
}

const normalizeMetrics = (data?: Partial<DashboardMetrics>): DashboardMetrics => {
	const definedValues = Object.fromEntries(
		Object.entries(data ?? {}).filter(([, value]) => value !== undefined),
	) as Partial<DashboardMetrics>;
	return {
		...EMPTY_METRICS,
		...definedValues,
		lineChecks: data?.lineChecks ?? [],
		employeePerformanceToday: data?.employeePerformanceToday ?? [],
		missingItemNamesToday: data?.missingItemNamesToday ?? [],
		outOfTempItemNamesToday: data?.outOfTempItemNamesToday ?? [],
		incorrectPrepItemNamesToday: data?.incorrectPrepItemNamesToday ?? [],
		topMissingDays: data?.topMissingDays ?? [],
		topOutOfTempDays: data?.topOutOfTempDays ?? [],
		topIncorrectPrepDays: data?.topIncorrectPrepDays ?? [],
		topWeakestCompletionDays: data?.topWeakestCompletionDays ?? [],
		topMissingItems: data?.topMissingItems ?? [],
		topOutOfTempItems: data?.topOutOfTempItems ?? [],
		topIncorrectPrepItems: data?.topIncorrectPrepItems ?? [],
	};
};

const trendIndicator = (actual: number, expected: number): TrendResult => {
	if (actual >= expected) {
		return {
			icon: actual === expected ? Goal : TrendingUp,
			label: actual === expected ? 'Goal reached' : 'Above goal',
			variant: 'default',
		};
	}
	if (actual >= expected * 0.75) {
		return { icon: Target, label: 'Near target', variant: 'secondary' };
	}
	return { icon: TrendingDown, label: 'Behind pace', variant: 'destructive' };
};

const getSeverity = (lineCheck: LineCheckItemIssuesDto) => {
	const score =
		(lineCheck.outOfTempItems?.length ?? 0) * 5 +
		(lineCheck.incorrectPrepItems?.length ?? 0) * 3 +
		(lineCheck.missingItems?.length ?? 0);
	let severity: Severity = 'good';
	if (score >= 10) severity = 'critical';
	else if (score >= 5) severity = 'high';
	else if (score >= 1) severity = 'minor';
	return { ...severityMeta[severity], score };
};

const getGoalInsight = ({
	actual,
	expected,
	period,
	previousActual,
}: {
	actual: number;
	expected: number;
	period: Period;
	previousActual?: number;
}) => {
	const remaining = Math.max(expected - actual, 0);
	if (period === 'daily') {
		if (previousActual == null) return `${remaining} remaining to reach today’s goal.`;
		const difference = actual - previousActual;
		if (difference > 0) return `${difference} ahead of yesterday; ${remaining} remaining today.`;
		if (difference < 0) return `${Math.abs(difference)} behind yesterday; ${remaining} remaining today.`;
		return `Even with yesterday; ${remaining} remaining today.`;
	}

	const now = new Date();
	const daysRemaining = period === 'weekly'
		? Math.max(0, 7 - (now.getDay() === 0 ? 7 : now.getDay()))
		: Math.max(
			0,
			new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate(),
		);
	const neededPerDay = daysRemaining > 0 ? Math.ceil(remaining / daysRemaining) : remaining;
	if (daysRemaining === 0) return `${remaining} remaining before this period closes.`;
	return `${neededPerDay} per day needed across the next ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}.`;
};

const progressColorClass = (percent: number) => {
	if (percent >= 100) return '[&>div]:bg-green-600';
	if (percent >= 75) return '[&>div]:bg-yellow-500';
	if (percent >= 40) return '[&>div]:bg-orange-500';
	return '[&>div]:bg-red-600';
};

const dateValue = (value?: string | null) => {
	const timestamp = value ? new Date(value).getTime() : 0;
	return Number.isNaN(timestamp) ? 0 : timestamp;
};

const formatCheckTime = (value?: string | null) => {
	if (!value) return 'Time not recorded';
	const date = new Date(value);
	return Number.isNaN(date.getTime())
		? 'Time not recorded'
		: date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

export default RobustLineCheckDashboard;

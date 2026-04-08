'use client';

import React, { useEffect, useState } from 'react';
import { getDashboardMetrics } from '@/app/api/linecheckApi';
import {
	DashboardMetrics,
	LineCheckItemIssuesDto,
	TrendResult,
} from '@/app/types';

import { Card, CardHeader, CardContent, CardTitle, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';

import IssueCard from './IssueCard';
import { toast } from 'sonner';
import EmployeePerformanceCard from './EmployeePerformanceCard';
import { TrendingUp, TrendingDown, Target, Goal, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Button } from '../ui/button';
import TopWeekdayTrendCard from './TopWeekdayTrendCard';
import TopIssueItemsCard from './TopIssueItemsCard';

interface Props {
	locationId: string;
	dailyGoal: number;
}

type Severity = 'good' | 'minor' | 'high' | 'critical';

const severityMeta = {
	good: {
		icon: '🟢',
		label: 'Good',
		badge: 'default',
		color: 'text-green-600',
	},
	minor: {
		icon: '🟡',
		label: 'Minor',
		badge: 'outline',
		color: 'text-yellow-600',
	},
	high: {
		icon: '🟠',
		label: 'High',
		badge: 'secondary',
		color: 'text-orange-600',
	},
	critical: {
		icon: '🔴',
		label: 'Critical',
		badge: 'destructive',
		color: 'text-red-600',
	},
};

const RobustLineCheckDashboard: React.FC<Props> = ({
	locationId,
	dailyGoal,
}) => {
	const [metrics, setMetrics] = useState<DashboardMetrics>({
		totalChecksToday: 0,
		totalChecksYesterday: 0,
		totalChecksWeekToDate: 0,
		totalChecksMonthToDate: 0,
		durationSeconds: 0,
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

	});

	//states
	const [lineChecks, setLineChecks] = useState<LineCheckItemIssuesDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [legendOpen, setLegendOpen] = useState(true);

	//yesterday
	const vsYesterday = metrics.totalChecksToday - metrics.totalChecksYesterday;

	const vsYesterdayLabel =
		vsYesterday === 0
			? 'No change vs yesterday'
			: vsYesterday > 0
				? `+${vsYesterday} vs yesterday`
				: `${vsYesterday} vs yesterday`;

	// Date math
	const today = new Date();
	const daysElapsedWeek = today.getDay() + 1;
	const daysElapsedMonth = today.getDate();
	const weekGoal = dailyGoal * daysElapsedWeek;
	const monthGoal = dailyGoal * daysElapsedMonth;

	// Trend indicators
const trendIndicator = (actual: number, expected: number): TrendResult => {
	if (actual === expected) {
		return {
			icon: Goal,
			label: 'Goal Reached',
			variant: 'default',
			// color: 'text-green-600',
		};
	}

	if (actual > expected) {
		return {
			icon: TrendingUp,
			label: 'Trending Up',
			variant: 'default',
			// color: 'text-green-600',
		};
	}

	if (actual >= expected * 0.75) {
		return {
			icon: Target,
			label: 'On Target',
			variant: 'secondary',
			// color: 'text-yellow-600',
		};
	}

	return {
		icon: TrendingDown,
		label: 'Trending Down',
		variant: 'destructive',
		// color: 'text-red-600',
	};
};



	// Severity scoring
	const getSeverity = (lc: LineCheckItemIssuesDto) => {
		const score =
			lc.outOfTempItems.length * 5 +
			lc.incorrectPrepItems.length * 3 +
			lc.missingItems.length;
		let severity: Severity = 'good';
		if (score >= 10) severity = 'critical';
		else if (score >= 5) severity = 'high';
		else if (score >= 1) severity = 'minor';
		return { ...severityMeta[severity], score };
	};

	// Fetch metrics
	useEffect(() => {
		if (!locationId) return;

		const fetchMetrics = async () => {
			setLoading(true);

			try {
				const res = await getDashboardMetrics(locationId);
				const data = (res.data as Partial<DashboardMetrics>) ?? {};

				setLineChecks(data.lineChecks ?? []);

				setMetrics((prev) => ({
					...prev,
					totalChecksToday: data.totalChecksToday ?? prev.totalChecksToday,
					totalChecksYesterday:
						data.totalChecksYesterday ?? prev.totalChecksYesterday,
					totalChecksWeekToDate:
						data.totalChecksWeekToDate ?? prev.totalChecksWeekToDate,
					totalChecksMonthToDate:
						data.totalChecksMonthToDate ?? prev.totalChecksMonthToDate,
					durationSeconds: data.durationSeconds ?? prev.durationSeconds,
					employeePerformanceToday:
						data.employeePerformanceToday ?? prev.employeePerformanceToday,
					mostMissingItemsDay:
						data.mostMissingItemsDay ?? prev.mostMissingItemsDay,
					mostOutOfTempDay: data.mostOutOfTempDay ?? prev.mostOutOfTempDay,
					mostIncorrectPrepDay:
						data.mostIncorrectPrepDay ?? prev.mostIncorrectPrepDay,
					weakestLineCheckDay:
						data.weakestLineCheckDay ?? prev.weakestLineCheckDay,
					topMissingDays: data.topMissingDays ?? prev.topMissingDays,
					topOutOfTempDays: data.topOutOfTempDays ?? prev.topOutOfTempDays,
					topIncorrectPrepDays:
						data.topIncorrectPrepDays ?? prev.topIncorrectPrepDays,
					topWeakestCompletionDays:
						data.topWeakestCompletionDays ??
						prev.topWeakestCompletionDays,
					topMissingItems:
						data.topMissingItems ?? prev.topMissingItems,
					topOutOfTempItems:
						data.topOutOfTempItems ?? prev.topOutOfTempItems,
					topIncorrectPrepItems:
						data.topIncorrectPrepItems ?? prev.topIncorrectPrepItems,
					missingItemsToday: data.missingItemsToday ?? prev.missingItemsToday,
					missingItemNamesToday:
						data.missingItemNamesToday ?? prev.missingItemNamesToday,
					outOfTempItemsToday:
						data.outOfTempItemsToday ?? prev.outOfTempItemsToday,
					outOfTempItemNamesToday:
						data.outOfTempItemNamesToday ?? prev.outOfTempItemNamesToday,
					incorrectPrepItemsToday:
						data.incorrectPrepItemsToday ??
						prev.incorrectPrepItemsToday,
					incorrectPrepItemNamesToday:
						data.incorrectPrepItemNamesToday ??
						prev.incorrectPrepItemNamesToday,
					
				}));
			} catch {
				toast.error('Failed to load dashboard metrics');
			} finally {
				setLoading(false);
			}
		};

		fetchMetrics();
	}, [locationId]);


	const dailyTrend = trendIndicator(metrics.totalChecksToday, dailyGoal);
	const DailyIcon = dailyTrend.icon;
	const weeklyTrend = trendIndicator(metrics.totalChecksWeekToDate, weekGoal);
	const WeeklyIcon = weeklyTrend.icon;
	const monthlyTrend = trendIndicator(metrics.totalChecksMonthToDate, monthGoal);
	const MonthlyIcon = monthlyTrend.icon;

	if (loading)
		return (
			<div className="p-6 text-center text-muted-foreground">
				Loading dashboard metrics…
			</div>
		);

	return (
		<div className="space-y-2">
			{/* Header */}
			<div className="text-center space-y-2">
				<h1 className="text-chart-3 text-5xl font-bold">LineCheck Dashboard</h1>
				<p className="text-muted-foreground">
					Operational performance overview
				</p>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
				{/* DAILY */}
				<Card className="h-full">
					<CardHeader className="text-left">
						<CardTitle className="text-xl sm:text-2xl lg:text-3xl">
							Daily
						</CardTitle>
						<div className="text-muted-foreground text-sm">
							{today.toLocaleDateString('en-US', {
								weekday: 'long',
								month: 'short',
								day: 'numeric',
							})}
						</div>
						<CardAction>
							<Badge
								variant={dailyTrend.variant}
								className="mt-2 flex items-center gap-1"
							>
								<DailyIcon size={14} />
								{dailyTrend.label}
							</Badge>
						</CardAction>
					</CardHeader>
					<CardContent className="space-y-4">
						<MetricRow
							label="Total Line Checks"
							value={metrics.totalChecksToday}
						/>
						<GoalRow
							actual={metrics.totalChecksToday}
							expected={dailyGoal}
							trend={dailyTrend}
							period="daily"
							vsYesterday={metrics.totalChecksYesterday}
						/>
					</CardContent>
				</Card>

				{/* WEEKLY */}
				<Card className="h-full">
					<CardHeader className="text-left">
						<CardTitle className="text-xl sm:text-2xl lg:text-3xl">
							Weekly
						</CardTitle>
						<div className="text-muted-foreground text-sm">Week-to-date</div>
						<CardAction>
							<Badge
								variant={weeklyTrend.variant}
								className="mt-2 flex items-center gap-1"
							>
								<WeeklyIcon size={14} />
								{weeklyTrend.label}
							</Badge>
						</CardAction>
					</CardHeader>
					<CardContent className="space-y-4">
						<MetricRow
							label="Total Line Checks"
							value={metrics.totalChecksWeekToDate}
						/>
						<GoalRow
							actual={metrics.totalChecksWeekToDate}
							expected={weekGoal}
							trend={trendIndicator(metrics.totalChecksWeekToDate, weekGoal)}
							period="weekly"
						/>
					</CardContent>
				</Card>

				{/* MONTHLY */}
				<Card className="h-full">
					<CardHeader className="text-left">
						<CardTitle className="text-xl sm:text-2xl lg:text-3xl">
							Monthly
						</CardTitle>
						<div className="text-muted-foreground text-sm">
							{today.toLocaleDateString('en-US', {
								month: 'long',
								year: 'numeric',
							})}
						</div>
						<CardAction>
							<Badge
								variant={monthlyTrend.variant}
								className="mt-2 flex items-center gap-1"
							>
								<MonthlyIcon size={14} />
								{monthlyTrend.label}
							</Badge>
						</CardAction>
					</CardHeader>
					<CardContent className="space-y-4">
						<MetricRow
							label="Total Line Checks"
							value={metrics.totalChecksMonthToDate}
						/>
						<GoalRow
							actual={metrics.totalChecksMonthToDate}
							expected={monthGoal}
							trend={trendIndicator(metrics.totalChecksMonthToDate, monthGoal)}
							period="monthly"
						/>
					</CardContent>
				</Card>
			</div>

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

			{/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> */}
			<div className="flex flex-col gap-4 md:flex-row justify-between">
				<div className="w-full md:w-1/2">
					<EmployeePerformanceCard data={metrics.employeePerformanceToday} />
				</div>

				{/* ---------------- LINE CHECKS + LEGEND (2/3) ---------------- */}
				<div className="w-full md:w-1/2 flex flex-col gap-4">
					{/* Legend */}
					<Collapsible open={legendOpen} onOpenChange={setLegendOpen}>
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Legend</span>

							<CollapsibleTrigger asChild>
								<Button variant="ghost" size="sm" className="gap-1">
									{legendOpen ? 'Hide Legend' : 'Show Legend'}
									<ChevronDown
										className={`h-4 w-4 transition-transform ${
											legendOpen ? 'rotate-180' : ''
										}`}
									/>
								</Button>
							</CollapsibleTrigger>
						</div>

						<CollapsibleContent>
							<Card className="w-full mt-2">
								<CardContent className="flex flex-col gap-4 text-sm">
									<div className="flex flex-wrap gap-2 items-center">
										<span className="font-medium">Severity Key:</span>
										<Badge variant="outline">🔴 Critical 10+</Badge>
										<Badge variant="outline">🟠 High 5–9</Badge>
										<Badge variant="outline">🟡 Minor 1–4</Badge>
										<Badge variant="outline">🟢 Good 0</Badge>
									</div>

									<div className="flex flex-wrap gap-2 items-center">
										<span className="font-medium">Scoring:</span>
										<Badge variant="destructive">Out of Temp = 5 pts</Badge>
										<Badge variant="outline">Incorrect Prep = 3 pts</Badge>
										<Badge variant="outline">Missing Item = 1 pt</Badge>
									</div>
								</CardContent>
							</Card>
						</CollapsibleContent>
					</Collapsible>

					{/* Accordion */}
					{lineChecks.length > 0 ? (
						<div className="w-full">
							<Accordion type="single" collapsible>
								{lineChecks.map((lc) => {
									const severity = getSeverity(lc);

									return (
										<AccordionItem key={lc.lineCheckId} value={lc.lineCheckId}>
											<AccordionTrigger>
												<div className="flex justify-between w-full items-center">
													<div>
														{severity.icon} Line Check at{' '}
														{new Date(lc.checkTime).toLocaleTimeString()}
													</div>
													<div className="hidden md:block">
														Line Check by {lc.employeeName}
													</div>
													<div className={`flex gap-3 items-center text-xs`}>
														score:{' '}
														<span className={`${severity.color}`}>
															{severity.score}
														</span>
													</div>
												</div>
											</AccordionTrigger>

											<AccordionContent>
												<div className="grid gap-4 md:grid-cols-3">
													<IssueCard
														title="Out of Temp"
														items={lc.outOfTempItems}
														severity="warning"
													/>
													<IssueCard
														title="Incorrect Prep"
														items={lc.incorrectPrepItems}
														severity="minor"
													/>
													<IssueCard
														title="Missing Items"
														items={lc.missingItems}
														severity="critical"
													/>
												</div>
											</AccordionContent>
										</AccordionItem>
									);
								})}
							</Accordion>
						</div>
					) : (
						<div className="text-center text-sm text-muted-foreground mt-2">
							No line check data yet.
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default RobustLineCheckDashboard;

/* Reusable UI rows */
const MetricRow = ({ label, value }: any) => (
	<div className="flex justify-between text-sm">
		<span className="text-muted-foreground">{label}</span>
		<Badge>{value}</Badge>
	</div>
);

type Period = "daily" | "weekly" | "monthly";



const GoalRow = ({ actual, expected, trend, period, vsYesterday }: { actual: number; expected: number; trend: TrendResult; period: Period; vsYesterday?: number }) => {
	const percent = Math.round((actual / expected) * 100);
	const remaining = Math.max(expected - actual, 0);

	const now = new Date();

	let daysRemaining = 0;

	if (period === 'weekly') {
		const today = now.getDay() || 7;
		daysRemaining = Math.max(0, 7 - today);
	}

	if (period === 'monthly') {
		const daysInMonth = new Date(
			now.getFullYear(),
			now.getMonth() + 1,
			0,
		).getDate();

		daysRemaining = Math.max(0, daysInMonth - now.getDate());
	}

	const neededPerDay =
		daysRemaining > 0 ? Math.ceil(remaining / daysRemaining) : remaining;
	
	const getInsight = () => {
		if (actual >= expected)
			return '✅ Great job — goal achieved. Maintain consistency.';

		if (period === 'daily') {
			if (vsYesterday !== undefined) {
				const diff = actual - vsYesterday;

				if (diff > 0)
					return `📈 ${diff} more checks than yesterday. ${remaining} remaining to hit goal.`;

				if (diff < 0)
					return `📉 ${Math.abs(diff)} fewer checks than yesterday. ${remaining} remaining to recover pace.`;

				return `➖ Same as yesterday. ${remaining} remaining to hit goal.`;
			}

			return `⚠️ ${remaining} checks remaining today to reach your target.`;
		}

		if (period === 'weekly') {
			if (actual >= expected * 0.75)
				return `⚠️ Slightly behind pace. Complete ${neededPerDay} checks/day over the next ${daysRemaining} days.`;

			return `🚨 Behind weekly pace. Average ${neededPerDay} checks/day for the next ${daysRemaining} days to recover.`;
		}

		if (period === 'monthly') {
			if (actual >= expected * 0.75)
				return `⚠️ Slightly behind monthly pace. Average ${neededPerDay} checks/day for the next ${daysRemaining} days.`;

			return `🚨 Behind monthly pace. Increase activity to ${neededPerDay} checks/day to reach goal.`;
		}

		return '';
	};

	const progressColorClass = (percent: number) => {
		if (percent >= 100) return '[&>div]:bg-green-600';
		if (percent >= 60) return '[&>div]:bg-yellow-500';
		if (percent >= 30) return '[&>div]:bg-orange-500';
		return '[&>div]:bg-red-600';
	};

	

	return (
		<div className="flex flex-col gap-2">
			<div className="flex justify-between gap-1 text-sm">
				<span className="text-muted-foreground">Goal Progress</span>
				<Badge
					className={
						actual >= expected
							? 'bg-green-600 text-white'
							: 'bg-red-600 text-white'
					}
				>
					{actual}/{expected}
				</Badge>
			</div>

			<div className="flex items-center gap-2">
				<Progress
					value={Math.min(percent, 100)}
					className={`[&>div]:transition-all [&>div]:duration-500 ${progressColorClass(
						percent,
					)}`}
				/>
				<span
					className={`text-xs font-medium ${
						percent >= 100
							? 'text-green-600'
							: percent >= 60
								? 'text-yellow-600'
								: percent >= 30
									? 'text-orange-600'
									: 'text-red-600'
					}`}
				>
					{percent}%
				</span>
			</div>

			<div className="mt-2 text-xs text-muted-foreground text-center">
				{getInsight()}
			</div>
		</div>
	);
};
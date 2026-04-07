// 'use client';

// import React, { useEffect, useState } from 'react';
// import { getDashboardMetrics } from '@/app/api/linecheckApi';
// import { DashboardMetrics, LineCheckItemIssuesDto } from '@/app/types';
// import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
// import { toast } from 'sonner';
// import ItemListPreview from './ItemListPreview';
// import IssueCard from './IssueCard';
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
// import { time } from 'node_modules/zod/v4/classic/iso.cjs';
// import { color } from 'framer-motion';

// interface Props {
// 	locationId: string;
// 	dailyGoal: number;
// }

// const RobustLineCheckDashboard: React.FC<Props> = ({
// 	locationId,
// 	dailyGoal,
// }) => {
// 	const [metrics, setMetrics] = useState<DashboardMetrics>({
// 		totalChecksToday: 0,
// 		totalChecksWeekToDate: 0,
// 		missingItemsToday: 0,
// 		missingItemNamesToday: [],
// 		outOfTempItemsToday: 0,
// 		outOfTempItemNamesToday: [],
// 		incorrectPrepItemsToday: 0,
// 		incorrectPrepItemNamesToday: [],
// 		durationSeconds: 0,
// 		lineChecks: [],
// 	});

// 	//set state
// 	const [lineChecks, setLineChecks] = useState<LineCheckItemIssuesDto[]>([]);
// 	const [loading, setLoading] = useState(true);

// 	// Helper to determine severity of line check issues
// 	type Severity = 'good' | 'minor' | 'high' | 'critical';

// 	const severityMeta = {
// 		good: {
// 			icon: '🟢',
// 			label: 'Good',
// 			badge: 'default',
// 			color: 'text-green-600'
// 		},
// 		minor: {
// 			icon: '🟡',
// 			label: 'Minor',
// 			badge: 'outline',
// 			color: 'text-yellow-600'
// 		},
// 		high: {
// 			icon: '🟠',
// 			label: 'High',
// 			badge: 'secondary',
// 			color: 'text-orange-600'
// 		},
// 		critical: {
// 			icon: '🔴',
// 			label: 'Critical',
// 			badge: 'destructive',
// 			color: 'text-red-600'
// 		},
// 	};

// 	const getSeverity = (lc: any) => {
// 		const score =
// 			lc.outOfTempItems.length * 5 +
// 			lc.incorrectPrepItems.length * 3 +
// 			lc.missingItems.length * 1;

// 		let severity: Severity = 'good';

// 		if (score >= 10) severity = 'critical';
// 		else if (score >= 5) severity = 'high';
// 		else if (score >= 1) severity = 'minor';

// 		return {
// 			...severityMeta[severity],
// 			score,
// 		};
// 	};

// 	useEffect(() => {
// 		if (!locationId) return;

// 		const fetchMetrics = async () => {
// 			setLoading(true);
// 			try {
// 				const res = await getDashboardMetrics(locationId);
// 				const data = (res.data as Partial<DashboardMetrics>) ?? {};

// 				setLineChecks(data.lineChecks ?? []);

// 				setMetrics((prev) => ({
// 					...prev,
// 					totalChecksToday: data.totalChecksToday ?? prev.totalChecksToday,
// 					totalChecksWeekToDate:
// 						data.totalChecksWeekToDate ?? prev.totalChecksWeekToDate,
// 					durationSeconds: data.durationSeconds ?? prev.durationSeconds,
// 				}));
// 			} catch (err) {
// 				toast.error('Failed to load dashboard metrics');
// 			} finally {
// 				setLoading(false);
// 			}
// 		};

// 		fetchMetrics();
// 	}, [locationId]);

// 	if (loading)
// 		return <div className="p-4 text-center">Loading Dashboard Metrics…</div>;

// 	return (
// 		<div className="space-y-8">
// 			<div className="text-center space-y-2">
// 				<h1 className="text-chart-3 text-5xl font-bold">LineCheck Dashboard</h1>
// 				<p className="text-muted-foreground">
// 					Overview of line check performance and common issues
// 				</p>
// 			</div>
// 			{/* Summary cards */}
// 			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// 				{/* Daily card */}
// 				<Card className="bg-chart-1/20">
// 					<CardHeader className="text-center">
// 						<CardTitle className="text-4xl">Daily</CardTitle>

// 						<div className="text-muted-foreground text-sm">
// 							{new Intl.DateTimeFormat('en-US', {
// 								weekday: 'long',
// 								month: 'short',
// 								day: 'numeric',
// 							}).format(new Date())}
// 						</div>
// 					</CardHeader>
// 					<CardContent className="space-y-4">
// 						<div className="flex justify-between items-center text-sm">
// 							<span className="text-muted-foreground">Total Checks Today</span>

// 							<Badge>{metrics.totalChecksToday}</Badge>
// 						</div>

// 						<div className="flex justify-between items-center text-sm">
// 							<span className="text-muted-foreground">Goal Progress</span>

// 							<Badge
// 								className={
// 									metrics.totalChecksToday >= dailyGoal
// 										? 'bg-green-600 text-white'
// 										: 'bg-red-600 text-white'
// 								}
// 							>
// 								{metrics.totalChecksToday}/{dailyGoal}
// 							</Badge>
// 						</div>

// 						<div className="flex items-center gap-2 pt-2">
// 							<Progress
// 								value={Math.min(
// 									(metrics.totalChecksToday / dailyGoal) * 100,
// 									100,
// 								)}
// 							/>
// 							<div className="text-xs text-muted-foreground text-right">
// 								{Math.round((metrics.totalChecksToday / dailyGoal) * 100)}%
// 							</div>
// 						</div>
// 						<div className="text-xs text-muted-foreground text-center">
// 							{metrics.totalChecksToday >= dailyGoal
// 								? '✅ Daily goal completed'
// 								: '⏳ Goal in progress'}
// 						</div>
// 					</CardContent>
// 				</Card>

// 				{/* weekly card */}
// 				<Card className="bg-chart-2/20">
// 					<CardHeader className="text-center">
// 						<CardTitle className="text-4xl">Weekly</CardTitle>

// 						<div className="text-muted-foreground text-sm">
// 							Week of{' '}
// 							{new Intl.DateTimeFormat('en-US', {
// 								month: 'short',
// 								day: 'numeric',
// 							}).format(
// 								new Date(
// 									new Date().setDate(
// 										new Date().getDate() - new Date().getDay(),
// 									),
// 								),
// 							)}
// 						</div>
// 					</CardHeader>

// 					<CardContent className="space-y-4">
// 						<div className="flex justify-between items-center text-sm">
// 							<span className="text-muted-foreground">
// 								Total Checks Week-to-Date
// 							</span>

// 							<Badge>{metrics.totalChecksWeekToDate}</Badge>
// 						</div>

// 						<div className="flex justify-between items-center text-sm">
// 							<span className="text-muted-foreground">Goal Progress</span>

// 							<Badge
// 								className={
// 									metrics.totalChecksWeekToDate >= dailyGoal * 7
// 										? 'bg-green-600 text-white'
// 										: 'bg-red-600 text-white'
// 								}
// 							>
// 								{metrics.totalChecksWeekToDate}/{dailyGoal * 7}
// 							</Badge>
// 						</div>

// 						<div className="flex items-center gap-2 pt-2">
// 							<Progress
// 								value={Math.min(
// 									(metrics.totalChecksWeekToDate / (dailyGoal * 7)) * 100,
// 									100,
// 								)}
// 							/>

// 							<div className="text-xs text-muted-foreground text-right">
// 								{Math.round(
// 									(metrics.totalChecksWeekToDate / (dailyGoal * 7)) * 100,
// 								)}
// 								%
// 							</div>
// 						</div>

// 						<div className="text-xs text-muted-foreground text-center">
// 							{metrics.totalChecksWeekToDate >= dailyGoal * 7
// 								? '✅ Weekly goal completed'
// 								: '⏳ Goal in progress'}
// 						</div>
// 					</CardContent>
// 				</Card>

// 				<Card className="bg-chart-3/20">
// 					<CardHeader className="text-center">
// 						<CardTitle className="text-4xl">Monthly</CardTitle>

// 						<div className="text-muted-foreground text-sm">
// 							{new Intl.DateTimeFormat('en-US', {
// 								month: 'long',
// 								year: 'numeric',
// 							}).format(new Date())}
// 						</div>
// 					</CardHeader>

// 					<CardContent className="space-y-4">
// 						<div className="flex justify-between items-center text-sm">
// 							<span className="text-muted-foreground">
// 								Total Checks Month-to-Date
// 							</span>

// 							<Badge>{metrics.totalChecksMonthToDate}</Badge>
// 						</div>

// 						<div className="flex justify-between items-center text-sm">
// 							<span className="text-muted-foreground">Goal Progress</span>

// 							<Badge
// 								className={
// 									metrics.totalChecksMonthToDate >=
// 									dailyGoal *
// 										new Date(
// 											new Date().getFullYear(),
// 											new Date().getMonth() + 1,
// 											0,
// 										).getDate()
// 										? 'bg-green-600 text-white'
// 										: 'bg-red-600 text-white'
// 								}
// 							>
// 								{metrics.totalChecksMonthToDate}/
// 								{dailyGoal *
// 									new Date(
// 										new Date().getFullYear(),
// 										new Date().getMonth() + 1,
// 										0,
// 									).getDate()}
// 							</Badge>
// 						</div>

// 						<div className="flex items-center gap-2 pt-2">
// 							<Progress
// 								value={Math.min(
// 									(metrics.totalChecksMonthToDate /
// 										(dailyGoal *
// 											new Date(
// 												new Date().getFullYear(),
// 												new Date().getMonth() + 1,
// 												0,
// 											).getDate())) *
// 										100,
// 									100,
// 								)}
// 							/>

// 							<div className="text-xs text-muted-foreground text-right">
// 								{Math.round(
// 									(metrics.totalChecksMonthToDate /
// 										(dailyGoal *
// 											new Date(
// 												new Date().getFullYear(),
// 												new Date().getMonth() + 1,
// 												0,
// 											).getDate())) *
// 										100,
// 								)}
// 								%
// 							</div>
// 						</div>

// 						<div className="text-xs text-muted-foreground text-center">
// 							{metrics.totalChecksMonthToDate >=
// 							dailyGoal *
// 								new Date(
// 									new Date().getFullYear(),
// 									new Date().getMonth() + 1,
// 									0,
// 								).getDate()
// 								? '✅ Monthly goal completed'
// 								: '⏳ Goal in progress'}
// 						</div>
// 					</CardContent>
// 				</Card>

// 				<Card className="bg-chart-3/20 text-2xl">
// 					<CardHeader>
// 						<CardTitle className="text-center text-4xl">
// 							LineCheck Details
// 						</CardTitle>
// 					</CardHeader>
// 					<CardContent>
// 						<div className="flex justify-between items-center">
// 							<p>Avg Time per Line Check</p>
// 							<Badge>
// 								{(metrics.durationSeconds ?? 0) > 0
// 									? `${Math.round((metrics.durationSeconds ?? 0) / 60)} min`
// 									: 'N/A'}
// 							</Badge>
// 						</div>
// 					</CardContent>
// 				</Card>
// 			</div>
// 			{/* Line check details */}

// 			<div className="space-y-4">
// 				<h2 className="text-xl font-semibold">Line Check Details</h2>
// 				{lineChecks.length === 0 && <div>No line checks available</div>}

// 				{/* Severity Key */}
// 				<Card className="mb-4">
// 					<CardContent className="flex justify-between items-center  text-sm">
// 						<div className="flex flex-wrap gap-2 items-center">
// 							<span className="font-medium mr-2">Severity Key:</span>

// 							<Badge variant="outline">🔴 Critical 10+</Badge>

// 							<Badge variant="outline">🟠 High 5–9</Badge>

// 							<Badge variant="outline">🟡 Minor 1–4</Badge>

// 							<Badge variant="outline">🟢 Good 0</Badge>
// 						</div>

// 						<div className="flex flex-wrap gap-2 items-center">
// 							<span className="font-medium mr-2">Scoring:</span>

// 							<Badge variant="destructive">Out of Temp = 5 pts</Badge>

// 							<Badge variant="outline">Incorrect Prep = 3 pts</Badge>

// 							<Badge variant="outline">Missing Item = 1 pt</Badge>
// 						</div>
// 					</CardContent>
// 				</Card>
// 				<Accordion type="single" collapsible>
// 					{lineChecks.map((lc) => {
// 						const severity = getSeverity(lc);

// 						return (
// 							<AccordionItem key={lc.lineCheckId} value={lc.lineCheckId}>
// 								<AccordionTrigger>
// 									<div className="flex justify-between w-full pr-4">
// 										<span>
// 											{severity.icon} Line Check at{' '}
// 											{new Date(lc.checkTime).toLocaleTimeString()}
// 											{/* {lc.stationName} - {lc.employeeName} */}
// 										</span>
// 									</div>
// 									{/* const severity = getSeverity(lc); */}
// 									{/* <span>
// 										{severity.icon} Line Check at {time}
// 									</span> */}
// 									<div className="flex gap-2 text-xs text-muted-foreground">
// 										Score:
// 										<span className={` ${severity.color}`}>
// 											{severity.score}
// 										</span>
// 									</div>
// 								</AccordionTrigger>

// 								<AccordionContent>
// 									<div className="grid gap-4 md:grid-cols-3">
// 										<IssueCard
// 											title="Out of Temp"
// 											items={lc.outOfTempItems}
// 											severity="warning"
// 										/>

// 										<IssueCard
// 											title="Incorrectly Prepped"
// 											items={lc.incorrectPrepItems}
// 											severity="minor"
// 										/>
// 										<IssueCard
// 											title="Item Missing"
// 											items={lc.missingItems}
// 											severity="critical"
// 										/>
// 									</div>
// 								</AccordionContent>
// 							</AccordionItem>
// 						);
// 					})}
// 				</Accordion>
// 			</div>
// 		</div>
// 		// </div>
// 	);
// };

// export default RobustLineCheckDashboard;

// 'use client';

// import React, { useEffect, useState } from 'react';
// import { getDashboardMetrics } from '@/app/api/linecheckApi';
// import { DashboardMetrics, LineCheckItemIssuesDto } from '@/app/types';

// import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
// import {
// 	Accordion,
// 	AccordionContent,
// 	AccordionItem,
// 	AccordionTrigger,
// } from '@/components/ui/accordion';

// import IssueCard from './IssueCard';
// import { toast } from 'sonner';

// interface Props {
// 	locationId: string;
// 	dailyGoal: number;
// }

// type Severity = 'good' | 'minor' | 'high' | 'critical';

// const severityMeta = {
// 	good: {
// 		icon: '🟢',
// 		label: 'Good',
// 		badge: 'default',
// 		color: 'text-green-600',
// 	},
// 	minor: {
// 		icon: '🟡',
// 		label: 'Minor',
// 		badge: 'outline',
// 		color: 'text-yellow-600',
// 	},
// 	high: {
// 		icon: '🟠',
// 		label: 'High',
// 		badge: 'secondary',
// 		color: 'text-orange-600',
// 	},
// 	critical: {
// 		icon: '🔴',
// 		label: 'Critical',
// 		badge: 'destructive',
// 		color: 'text-red-600',
// 	},
// };

// const RobustLineCheckDashboard: React.FC<Props> = ({
// 	locationId,
// 	dailyGoal,
// }) => {
// 	const [metrics, setMetrics] = useState<DashboardMetrics>({
// 		totalChecksToday: 0,
// 		totalChecksWeekToDate: 0,
// 		totalChecksMonthToDate: 0,
// 		durationSeconds: 0,
// 		lineChecks: [],
// 		missingItemsToday: 0,
// 		missingItemNamesToday: [],
// 		outOfTempItemsToday: 0,
// 		outOfTempItemNamesToday: [],
// 		incorrectPrepItemsToday: 0,
// 		incorrectPrepItemNamesToday: [],
// 	});

// 	const [lineChecks, setLineChecks] = useState<LineCheckItemIssuesDto[]>([]);

// 	const [loading, setLoading] = useState(true);

// 	/*
// 	|--------------------------------------------------------------------------
// 	| Date math (working-day aware targets)
// 	|--------------------------------------------------------------------------
// 	*/

// 	const today = new Date();

// 	const daysElapsedWeek = today.getDay() + 1;
// 	const daysElapsedMonth = today.getDate();

// 	const weekGoal = dailyGoal * daysElapsedWeek;
// 	const monthGoal = dailyGoal * daysElapsedMonth;

// 	/*
// 	|--------------------------------------------------------------------------
// 	| Trend indicators
// 	|--------------------------------------------------------------------------
// 	*/

// 	const trendIndicator = (actual: number, expected: number) => {
// 		if (actual >= expected) return '📈 Ahead';
// 		if (actual >= expected * 0.75) return '➡️ On pace';
// 		return '📉 Behind';
// 	};

// 	/*
// 	|--------------------------------------------------------------------------
// 	| Severity scoring
// 	|--------------------------------------------------------------------------
// 	*/

// 	const getSeverity = (lc: LineCheckItemIssuesDto) => {
// 		const score =
// 			lc.outOfTempItems.length * 5 +
// 			lc.incorrectPrepItems.length * 3 +
// 			lc.missingItems.length;

// 		let severity: Severity = 'good';

// 		if (score >= 10) severity = 'critical';
// 		else if (score >= 5) severity = 'high';
// 		else if (score >= 1) severity = 'minor';

// 		return {
// 			...severityMeta[severity],
// 			score,
// 		};
// 	};

// 	/*
// 	|--------------------------------------------------------------------------
// 	| Fetch metrics
// 	|--------------------------------------------------------------------------
// 	*/

// 	useEffect(() => {
// 		if (!locationId) return;

// 		const fetchMetrics = async () => {
// 			setLoading(true);

// 			try {
// 				const res = await getDashboardMetrics(locationId);

// 				const data = (res.data as Partial<DashboardMetrics>) ?? {};

// 				setLineChecks(data.lineChecks ?? []);

// 				setMetrics((prev) => ({
// 					...prev,
// 					totalChecksToday: data.totalChecksToday ?? prev.totalChecksToday,

// 					totalChecksWeekToDate:
// 						data.totalChecksWeekToDate ?? prev.totalChecksWeekToDate,

// 					totalChecksMonthToDate:
// 						data.totalChecksMonthToDate ?? prev.totalChecksMonthToDate,

// 					durationSeconds: data.durationSeconds ?? prev.durationSeconds,
// 				}));
// 			} catch {
// 				toast.error('Failed to load dashboard metrics');
// 			} finally {
// 				setLoading(false);
// 			}
// 		};

// 		fetchMetrics();
// 	}, [locationId]);

// 	if (loading)
// 		return (
// 			<div className="p-6 text-center text-muted-foreground">
// 				Loading dashboard metrics…
// 			</div>
// 		);

// 	return (
// 		<div className="space-y-8">
// 			{/* Header */}

// 			<div className="text-center space-y-2">
// 				<h1 className="text-chart-3 text-5xl font-bold">LineCheck Dashboard</h1>

// 				<p className="text-muted-foreground">
// 					Operational performance overview
// 				</p>
// 			</div>

// 			{/* Summary Cards */}

// 			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// 				{/* DAILY */}

// 				<Card className="bg-chart-1/20">
// 					<CardHeader className="text-center">
// 						<CardTitle className="text-4xl">Daily</CardTitle>

// 						<div className="text-muted-foreground text-sm">
// 							{today.toLocaleDateString('en-US', {
// 								weekday: 'long',
// 								month: 'short',
// 								day: 'numeric',
// 							})}
// 						</div>
// 					</CardHeader>

// 					<CardContent className="space-y-4">
// 						<MetricRow label="Total Checks" value={metrics.totalChecksToday} />

// 						<GoalRow actual={metrics.totalChecksToday} expected={dailyGoal} />
// 					</CardContent>
// 				</Card>

// 				{/* WEEKLY */}

// 				<Card className="bg-chart-2/20">
// 					<CardHeader className="text-center">
// 						<CardTitle className="text-4xl">Weekly</CardTitle>

// 						<div className="text-muted-foreground text-sm">Week-to-date</div>
// 					</CardHeader>

// 					<CardContent className="space-y-4">
// 						<MetricRow
// 							label="Total Checks"
// 							value={metrics.totalChecksWeekToDate}
// 						/>

// 						<GoalRow
// 							actual={metrics.totalChecksWeekToDate}
// 							expected={weekGoal}
// 							trend={trendIndicator(metrics.totalChecksWeekToDate, weekGoal)}
// 						/>
// 					</CardContent>
// 				</Card>

// 				{/* MONTHLY */}

// 				<Card className="bg-chart-3/20">
// 					<CardHeader className="text-center">
// 						<CardTitle className="text-4xl">Monthly</CardTitle>

// 						<div className="text-muted-foreground text-sm">
// 							{today.toLocaleDateString('en-US', {
// 								month: 'long',
// 								year: 'numeric',
// 							})}
// 						</div>
// 					</CardHeader>

// 					<CardContent className="space-y-4">
// 						<MetricRow
// 							label="Total Checks"
// 							value={metrics.totalChecksMonthToDate}
// 						/>

// 						<GoalRow
// 							actual={metrics.totalChecksMonthToDate}
// 							expected={monthGoal}
// 							trend={trendIndicator(metrics.totalChecksMonthToDate, monthGoal)}
// 						/>
// 					</CardContent>
// 				</Card>

// 				{/* SPEED CARD */}

// 				<Card className="bg-chart-4/20">
// 					<CardHeader>
// 						<CardTitle className="text-center text-4xl">Efficiency</CardTitle>
// 					</CardHeader>

// 					<CardContent>
// 						<MetricRow
// 							label="Avg Time per Check"
// 							value={
// 								metrics.durationSeconds
// 									? `${Math.round(metrics.durationSeconds / 60)} min`
// 									: 'N/A'
// 							}
// 						/>
// 					</CardContent>
// 				</Card>
// 			</div>

// 			{/* Line Check Details */}

// 			<Accordion type="single" collapsible>
// 				{lineChecks.map((lc) => {
// 					const severity = getSeverity(lc);

// 					return (
// 						<AccordionItem key={lc.lineCheckId} value={lc.lineCheckId}>
// 							<AccordionTrigger>
// 								<div className="flex justify-between w-full">
// 									<span>
// 										{severity.icon} Line Check at{' '}
// 										{new Date(lc.checkTime).toLocaleTimeString()}
// 									</span>

// 									<span className={`text-xs ${severity.color}`}>
// 										Score {severity.score}
// 									</span>
// 								</div>
// 							</AccordionTrigger>

// 							<AccordionContent>
// 								<div className="grid gap-4 md:grid-cols-3">
// 									<IssueCard
// 										title="Out of Temp"
// 										items={lc.outOfTempItems}
// 										severity="warning"
// 									/>

// 									<IssueCard
// 										title="Incorrect Prep"
// 										items={lc.incorrectPrepItems}
// 										severity="minor"
// 									/>

// 									<IssueCard
// 										title="Missing Items"
// 										items={lc.missingItems}
// 										severity="critical"
// 									/>
// 								</div>
// 							</AccordionContent>
// 						</AccordionItem>
// 					);
// 				})}
// 			</Accordion>
// 		</div>
// 	);
// };

// export default RobustLineCheckDashboard;

// /*
// |--------------------------------------------------------------------------
// Reusable UI rows
// |--------------------------------------------------------------------------
// */

// const MetricRow = ({ label, value }: any) => (
// 	<div className="flex justify-between text-sm">
// 		<span className="text-muted-foreground">{label}</span>
// 		<Badge>{value}</Badge>
// 	</div>
// );

// const GoalRow = ({ actual, expected, trend }: any) => {
// 	const percent = Math.round((actual / expected) * 100);

// 	return (
// 		<>
// 			<div className="flex justify-between text-sm">
// 				<span className="text-muted-foreground">Goal Progress</span>

// 				<Badge
// 					className={
// 						actual >= expected
// 							? 'bg-green-600 text-white'
// 							: 'bg-red-600 text-white'
// 					}
// 				>
// 					{actual}/{expected}
// 				</Badge>
// 			</div>

// 			<div className="flex items-center gap-2">
// 				<Progress value={Math.min(percent, 100)} />

// 				<span className="text-xs text-muted-foreground">{percent}%</span>
// 			</div>

// 			{trend && (
// 				<div className="text-xs text-muted-foreground text-center">{trend}</div>
// 			)}
// 		</>
// 	);
// };

'use client';

import React, { useEffect, useState } from 'react';
import { getDashboardMetrics } from '@/app/api/linecheckApi';
import {
	DashboardMetrics,
	LineCheckItemIssuesDto,
	EmployeePerformanceDto,
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
import { TrendingUp, TrendingDown, Target, Goal } from 'lucide-react';

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
	});

	const [lineChecks, setLineChecks] = useState<LineCheckItemIssuesDto[]>([]);
	const [loading, setLoading] = useState(true);

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
			color: 'text-green-600',
		};
	}

	if (actual > expected) {
		return {
			icon: TrendingUp,
			label: 'Trending Up',
			variant: 'default',
			color: 'text-green-600',
		};
	}

	if (actual >= expected * 0.75) {
		return {
			icon: Target,
			label: 'On Target',
			variant: 'secondary',
			color: 'text-yellow-600',
		};
	}

	return {
		icon: TrendingDown,
		label: 'Trending Down',
		variant: 'destructive',
		color: 'text-red-600',
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
					totalChecksWeekToDate:
						data.totalChecksWeekToDate ?? prev.totalChecksWeekToDate,
					totalChecksMonthToDate:
						data.totalChecksMonthToDate ?? prev.totalChecksMonthToDate,
					durationSeconds: data.durationSeconds ?? prev.durationSeconds,
					employeePerformanceToday:
						data.employeePerformanceToday ?? prev.employeePerformanceToday,
				}));
			} catch {
				toast.error('Failed to load dashboard metrics');
			} finally {
				setLoading(false);
			}
		};

		fetchMetrics();
	}, [locationId]);


	const weeklyTrend = trendIndicator(metrics.totalChecksWeekToDate, weekGoal);
	const monthlyTrend = trendIndicator(metrics.totalChecksMonthToDate, monthGoal);

	if (loading)
		return (
			<div className="p-6 text-center text-muted-foreground">
				Loading dashboard metrics…
			</div>
		);

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="text-center space-y-2">
				<h1 className="text-chart-3 text-5xl font-bold">LineCheck Dashboard</h1>
				<p className="text-muted-foreground">
					Operational performance overview
				</p>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{/* DAILY */}
				<Card className="bg-chart-1/20">
					<CardHeader className="text-center">
						<CardTitle className="text-4xl">Daily</CardTitle>
						<div className="text-muted-foreground text-sm">
							{today.toLocaleDateString('en-US', {
								weekday: 'long',
								month: 'short',
								day: 'numeric',
							})}
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<MetricRow label="Total Checks" value={metrics.totalChecksToday} />
						<GoalRow actual={metrics.totalChecksToday} expected={dailyGoal} />
					</CardContent>
				</Card>

				{/* WEEKLY */}
				<Card className="bg-chart-2/20">
					<CardHeader className="text-center">
						<CardTitle className="text-4xl">Weekly</CardTitle>
						<div className="text-muted-foreground text-sm">Week-to-date</div>
						<CardAction>
							<Badge
								variant={weeklyTrend.variant}
								className="mt-2 flex items-center gap-1"
							>
								<weeklyTrend.icon size={14} className={weeklyTrend.color} />
								{weeklyTrend.label}
							</Badge>
						</CardAction>
					</CardHeader>
					<CardContent className="space-y-4">
						<MetricRow
							label="Total Checks"
							value={metrics.totalChecksWeekToDate}
						/>
						<GoalRow
							actual={metrics.totalChecksWeekToDate}
							expected={weekGoal}
							trend={trendIndicator(metrics.totalChecksWeekToDate, weekGoal)}
						/>
					</CardContent>
				</Card>

				{/* MONTHLY */}
				<Card className="bg-chart-3/20">
					<CardHeader className="text-center">
						<CardTitle className="text-4xl">Monthly</CardTitle>
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
								<monthlyTrend.icon size={14} className={monthlyTrend.color} />
								{monthlyTrend.label}
							</Badge>
						</CardAction>
					</CardHeader>
					<CardContent className="space-y-4">
						<MetricRow
							label="Total Checks"
							value={metrics.totalChecksMonthToDate}
						/>
						<GoalRow
							actual={metrics.totalChecksMonthToDate}
							expected={monthGoal}
							trend={trendIndicator(metrics.totalChecksMonthToDate, monthGoal)}
						/>
					</CardContent>
				</Card>
			</div>

			{/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> */}
			<div className="flex flex-col gap-4 md:flex-row justify-between">
				<div>
					<EmployeePerformanceCard data={metrics.employeePerformanceToday} />
				</div>

				{/* ---------------- LINE CHECKS + LEGEND (2/3) ---------------- */}
				<div className="flex flex-col gap-4 col-span-2">
					{/* Legend */}
					<Card className="p-4">
						<CardContent className="flex flex-col justify-between gap-4 text-sm">
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

					{/* Accordion */}
					{lineChecks.length > 0 ? (
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
													score;{' '}
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

const GoalRow = ({ actual, expected, trend }: any) => {
	const percent = Math.round((actual / expected) * 100);
	const remaining = expected - actual;
	const daysRemaining = Math.max(0, 7 - new Date().getDay());
	const neededPerDay =
		daysRemaining > 0 ? Math.ceil(remaining / daysRemaining) : remaining;
	
	const getInsight = () => {
		if (actual >= expected)
			return '✅ Great job — you are ahead of target. Maintain current pace.';

		if (actual >= expected * 0.75)
			return `⚠️ Slightly behind pace. Complete ${neededPerDay} checks per day for the next ${daysRemaining} days to recover.`;

		return `🚨 You are trending behind. Complete ${neededPerDay} checks per day over the next ${daysRemaining} days to reach your goal.`;
	};

	return (
		<div>
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
				<Progress value={Math.min(percent, 100)} />
				<span className="text-xs text-muted-foreground">{percent}%</span>
			</div>

			{/* {trend && (
				<div className="text-xs text-muted-foreground text-center">{trend}</div>
			)} */}

			<div className="mt-2 text-xs text-muted-foreground text-center">
				{getInsight()}
			</div>
		</div>
	);
};
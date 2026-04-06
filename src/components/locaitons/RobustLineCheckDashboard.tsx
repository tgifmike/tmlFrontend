'use client';

import React, { useEffect, useState } from 'react';
import { getDashboardMetrics } from '@/app/api/linecheckApi';
import { DashboardMetrics, LineCheckItemIssuesDto } from '@/app/types';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import ItemListPreview from './ItemListPreview';
import IssueCard from './IssueCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { time } from 'node_modules/zod/v4/classic/iso.cjs';

interface Props {
	locationId: string;
	dailyGoal: number;
}

const RobustLineCheckDashboard: React.FC<Props> = ({
	locationId,
	dailyGoal,
}) => {
	const [metrics, setMetrics] = useState<DashboardMetrics>({
		totalChecksToday: 0,
		totalChecksWeekToDate: 0,
		missingItemsToday: 0,
		missingItemNamesToday: [],
		outOfTempItemsToday: 0,
		outOfTempItemNamesToday: [],
		incorrectPrepItemsToday: 0,
		incorrectPrepItemNamesToday: [],
		durationSeconds: 0,
		lineChecks: [],
	});

	//set state
	const [lineChecks, setLineChecks] = useState<LineCheckItemIssuesDto[]>([]);
	const [loading, setLoading] = useState(true);

	// Helper to determine severity of line check issues
	type Severity = 'good' | 'minor' | 'high' | 'critical';

	const severityMeta = {
		good: {
			icon: '🟢',
			label: 'Good',
			badge: 'default',
		},
		minor: {
			icon: '🟡',
			label: 'Minor',
			badge: 'outline',
		},
		high: {
			icon: '🟠',
			label: 'High',
			badge: 'secondary',
		},
		critical: {
			icon: '🔴',
			label: 'Critical',
			badge: 'destructive',
		},
	};

	const getSeverity = (lc: any) => {
		const score =
			lc.outOfTempItems.length * 5 +
			lc.incorrectPrepItems.length * 3 +
			lc.missingItems.length * 1;

		let severity: Severity = 'good';

		if (score >= 10) severity = 'critical';
		else if (score >= 5) severity = 'high';
		else if (score >= 1) severity = 'minor';

		return {
			...severityMeta[severity],
			score,
		};
	};

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
					durationSeconds: data.durationSeconds ?? prev.durationSeconds,
				}));
			} catch (err) {
				toast.error('Failed to load dashboard metrics');
			} finally {
				setLoading(false);
			}
		};

		fetchMetrics();
	}, [locationId]);

	if (loading)
		return <div className="p-4 text-center">Loading Dashboard Metrics…</div>;

	return (
		<div className="space-y-8">
			<div className="text-center space-y-2">
				<h1 className="text-chart-3 text-5xl font-bold">LineCheck Dashboard</h1>
				<p className="text-muted-foreground">
					Overview of line check performance and common issues
				</p>
			</div>
			{/* Summary cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				{/* Daily card */}
				<Card className="bg-chart-1/20 text-2xl">
					<CardHeader>
						<CardTitle className="text-center text-4xl">Daily</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex justify-between items-center">
							Total Checks Today <Badge>{metrics.totalChecksToday}</Badge>
						</div>
						<div className="flex justify-between items-center">
							Goal Progress
							<Badge
								className={
									metrics.totalChecksToday >= dailyGoal
										? 'bg-green-600 text-white'
										: 'bg-red-600 text-white'
								}
							>
								{metrics.totalChecksToday}/{dailyGoal}
							</Badge>
						</div>
						<div className="pt-4">
							<Progress
								value={Math.min(
									(metrics.totalChecksToday / dailyGoal) * 100,
									100,
								)}
							/>
						</div>
					</CardContent>
				</Card>

				{/* weekly card */}
				<Card className="bg-chart-2/20 text-2xl">
					<CardHeader>
						<CardTitle className="text-center text-4xl">Weekly</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex justify-between items-center">
							Total Checks Week-to-Date{' '}
							<Badge>{metrics.totalChecksWeekToDate}</Badge>
						</div>
						<div className="flex justify-between items-center">
							Goal Progress
							<Badge
								className={
									metrics.totalChecksWeekToDate >= dailyGoal * 7
										? 'bg-green-600 text-white'
										: 'bg-red-600 text-white'
								}
							>
								{metrics.totalChecksWeekToDate}/{dailyGoal * 7}
							</Badge>
						</div>
						<div className="pt-4">
							<Progress
								value={Math.min(
									(metrics.totalChecksWeekToDate / (dailyGoal * 7)) * 100,
									100,
								)}
							/>
						</div>
					</CardContent>
				</Card>

				{/* <Card>
					<CardHeader>
						<CardTitle>
							Daily Goal Progress
							<Badge
								className={
									metrics.totalChecksToday >= dailyGoal
										? 'bg-green-600 text-white'
										: 'bg-red-600 text-white'
								}
							>
								{metrics.totalChecksToday}/{dailyGoal}
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Progress
							value={Math.min(
								(metrics.totalChecksToday / dailyGoal) * 100,
								100,
							)}
						/>
					</CardContent>
				</Card> */}

				<Card className="bg-chart-3/20 text-2xl">
					<CardHeader>
						<CardTitle className="text-center text-4xl">
							LineCheck Details
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex justify-between items-center">
							<p>Avg Time per Line Check</p>
							<Badge>
								{(metrics.durationSeconds ?? 0) > 0
									? `${Math.round((metrics.durationSeconds ?? 0) / 60)} min`
									: 'N/A'}
							</Badge>
						</div>
					</CardContent>
				</Card>
			</div>
			{/* Line check details */}

			<div className="space-y-4">
				<h2 className="text-xl font-semibold">Line Check Details</h2>
				{lineChecks.length === 0 && <div>No line checks available</div>}

				{/* Severity Key */}
				<Card className="mb-4">
					<CardContent className="flex flex-col gap-3 text-sm">
						<div className="flex flex-wrap gap-2 items-center">
							<span className="font-medium mr-2">Severity Key:</span>

							<Badge variant="destructive">🔴 Critical 10+</Badge>

							<Badge variant="secondary">🟠 High 5–9</Badge>

							<Badge variant="outline">🟡 Minor 1–4</Badge>

							<Badge variant="default">🟢 Good 0</Badge>
						</div>

						<div className="flex flex-wrap gap-2 items-center">
							<span className="font-medium mr-2">Scoring:</span>

							<Badge variant="destructive">Out of Temp = 5 pts</Badge>

							<Badge variant="secondary">Incorrect Prep = 3 pts</Badge>

							<Badge variant="outline">Missing Item = 1 pt</Badge>
						</div>
					</CardContent>
				</Card>
				<Accordion type="single" collapsible>
					{lineChecks.map((lc) => {
						const severity = getSeverity(lc);

						return (
							<AccordionItem key={lc.lineCheckId} value={lc.lineCheckId}>
								<AccordionTrigger>
									<div className="flex justify-between w-full pr-4">
										<span>
											{severity.icon} Line Check at{' '}
											{new Date(lc.checkTime).toLocaleTimeString()}
											{/* {lc.stationName} - {lc.employeeName} */}
										</span>
									</div>
									{/* const severity = getSeverity(lc); */}
									{/* <span>
										{severity.icon} Line Check at {time}
									</span> */}
									<span className="text-xs text-muted-foreground">
										Score: {severity.score}
									</span>
								</AccordionTrigger>

								<AccordionContent>
									<div className="grid gap-4 md:grid-cols-3">
										<IssueCard
											title="Missing Items"
											items={lc.missingItems}
											severity="critical"
										/>

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
									</div>
								</AccordionContent>
							</AccordionItem>
						);
					})}
				</Accordion>
			</div>
		</div>
		// </div>
	);
};

export default RobustLineCheckDashboard;

'use client';

import React, { useEffect, useState } from 'react';
import { getDashboardMetrics } from '@/app/api/linecheckApi';
import { DashboardMetrics } from '@/app/types';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface Props {
	locationId: string;
	dailyGoal: number;
}

const RobustLineCheckDashboard: React.FC<Props> = ({
	locationId,
	dailyGoal,
}) => {
	const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!locationId) return;

		const fetchMetrics = async () => {
			try {
				const res = await getDashboardMetrics(locationId);
				const data = res.data ?? {} as DashboardMetrics;

				// Ensure all array fields exist to prevent runtime errors
				setMetrics({
					totalChecksToday: data.totalChecksToday ?? 0,
					totalChecksWeekToDate: data.totalChecksWeekToDate ?? 0,
					missingItemsToday: data.missingItemsToday ?? 0,
					outOfTempItemsToday: data.outOfTempItemsToday ?? 0,
					incorrectPrepItemsToday: data.incorrectPrepItemsToday ?? 0,

					missingItemNamesToday: Array.isArray(data.missingItemNamesToday)
						? data.missingItemNamesToday
						: [],

					incorrectPrepItemNamesToday: Array.isArray(
						data.incorrectPrepItemNamesToday,
					)
						? data.incorrectPrepItemNamesToday
						: [],

					outOfTempItemNamesToday: Array.isArray(data.outOfTempItemNamesToday)
						? data.outOfTempItemNamesToday
						: [],

					durationSeconds: data.durationSeconds ?? 0,
				});
			} catch (err) {
				toast.error('Failed to load dashboard metrics');
				setMetrics(null);
			} finally {
				setLoading(false);
			}
		};

		fetchMetrics();
	}, [locationId]);

	if (loading)
		return <div className="p-4 text-center">Loading Dashboard Metrics…</div>;

	if (!metrics)
		return (
			<div className="p-4 text-center text-red-500">No metrics available</div>
		);

	return (
		<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
			<Card>
				<CardHeader>
					<CardTitle>
						Total Checks Today <Badge>{metrics.totalChecksToday}</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>All line checks completed today</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>
						Week-to-Date <Badge>{metrics.totalChecksWeekToDate}</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>Line checks completed since start of week</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>
						Missing Items Today <Badge>{metrics.missingItemsToday}</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{metrics.missingItemsToday > 0
						? metrics.missingItemNamesToday.join(', ')
						: 'None'}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>
						Out of Temp Items <Badge>{metrics.outOfTempItemsToday}</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{metrics.outOfTempItemsToday > 0
						? metrics.outOfTempItemNamesToday.join(', ')
						: 'None'}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>
						Incorrect Prep Items{' '}
						<Badge>{metrics.incorrectPrepItemsToday}</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{metrics.incorrectPrepItemsToday > 0
						? metrics.incorrectPrepItemNamesToday.join(', ')
						: 'None'}
				</CardContent>
			</Card>

			<Card>
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
						value={Math.min((metrics.totalChecksToday / dailyGoal) * 100, 100)}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Avg Time per Line Check</CardTitle>
				</CardHeader>
				<CardContent>
					{metrics.durationSeconds
						? `${Math.round(metrics.durationSeconds / 60)} min`
						: 'N/A'}
				</CardContent>
			</Card>
		</div>
	);
};

export default RobustLineCheckDashboard;

'use client';

import React, { useEffect, useState } from 'react';
import { getDashboardMetrics } from '@/app/api/linecheckApi';
import { DashboardMetrics, LineCheckItemIssuesDto } from '@/app/types';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import ItemListPreview from './ItemListPreview';

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
	const [lineChecks, setLineChecks] = useState<LineCheckItemIssuesDto[]>([]);
	const [loading, setLoading] = useState(true);

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
			{/* Summary cards */}
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
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Avg Time per Line Check</CardTitle>
					</CardHeader>
					<CardContent>
						{(metrics.durationSeconds ?? 0) > 0
							? `${Math.round((metrics.durationSeconds ?? 0) / 60)} min`
							: 'N/A'}
					</CardContent>
				</Card>
			</div>

			{/* Line check details */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">Line Check Details</h2>
				{lineChecks.length === 0 && <div>No line checks available</div>}

				{lineChecks.map((lc) => (
					<Card key={lc.lineCheckId}>
						<CardHeader>
							<CardTitle>
								Line Check at {new Date(lc.checkTime).toLocaleTimeString()}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<div>
								Missing Items ({lc.missingItems.length}):
								<ItemListPreview items={lc.missingItems} />
							</div>

							<div>
								Out of Temp Items ({lc.outOfTempItems.length}):
								<ItemListPreview items={lc.outOfTempItems} />
							</div>

							<div>
								Incorrect Prep Items ({lc.incorrectPrepItems.length}):
								<ItemListPreview items={lc.incorrectPrepItems} />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
		// </div>
	);
};

export default RobustLineCheckDashboard;

'use client';

import React, { useEffect, useState } from 'react';
import { getDashboardMetrics } from '@/app/api/linecheckApi';
import { DashboardMetrics, LineCheckItemIssuesDto } from '@/app/types';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface Props {
	locationId: string;
	dailyGoal: number;
}

// Component to show item list with preview and expand/collapse
const ItemListPreview: React.FC<{ items: string[]; previewCount?: number }> = ({
	items,
	previewCount = 5,
}) => {
	const [expanded, setExpanded] = useState(false);

	if (!items || items.length === 0) return <span>None</span>;

	const previewItems = expanded ? items : items.slice(0, previewCount);

	return (
		<div>
			<ul className="list-disc ml-4 max-h-40 overflow-y-auto">
				{previewItems.map((item, idx) => (
					<li key={idx}>{item}</li>
				))}
			</ul>
			{items.length > previewCount && (
				<button
					className="text-blue-600 underline mt-1"
					onClick={() => setExpanded(!expanded)}
				>
					{expanded ? 'Show Less' : `Show ${items.length - previewCount} More`}
				</button>
			)}
		</div>
	);
};

const RobustLineCheckDashboard: React.FC<Props> = ({
	locationId,
	dailyGoal,
}) => {
	const [metrics, setMetrics] = useState<DashboardMetrics>({
		totalChecksToday: 0,
		totalChecksWeekToDate: 0,
		missingItemsToday: 0,
		outOfTempItemsToday: 0,
		incorrectPrepItemsToday: 0,
		missingItemNamesToday: [],
		incorrectPrepItemNamesToday: [],
		outOfTempItemNamesToday: [],
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
					missingItemsToday: data.missingItemsToday ?? prev.missingItemsToday,
					outOfTempItemsToday:
						data.outOfTempItemsToday ?? prev.outOfTempItemsToday,
					incorrectPrepItemsToday:
						data.incorrectPrepItemsToday ?? prev.incorrectPrepItemsToday,
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
							Missing Items Today <Badge>{metrics.missingItemsToday}</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{metrics.missingItemNamesToday.length > 0
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
						{metrics.outOfTempItemNamesToday.length > 0
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
						{metrics.incorrectPrepItemNamesToday.length > 0
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
								Missing Items ({lc.missingCount}):{' '}
								<ItemListPreview items={lc.missingItems} />
							</div>
							<div>
								Out of Temp Items ({lc.outOfTempCount}):{' '}
								<ItemListPreview items={lc.outOfTempItems} />
							</div>
							<div>
								Incorrect Prep Items ({lc.incorrectPrepCount}):{' '}
								<ItemListPreview items={lc.incorrectPrepItems} />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
};

export default RobustLineCheckDashboard;

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineCheck, LineCheckSettings } from '@/app/types';
import { getLineCheckSettings } from '@/app/api/locationApi';
import { getCompletedLineChecksByLocationApi } from '@/app/api/linecheckApi';


interface FreshDashboardProps {
	locationId: string;
}

const FreshLineCheckDashboard: React.FC<FreshDashboardProps> = ({
	locationId,
}) => {
	const [lineChecks, setLineChecks] = useState<LineCheck[]>([]);
	const [settings, setSettings] = useState<LineCheckSettings>({
		startOfWeek: 'MONDAY',
		dailyGoal: 5,
	});

	// fetch settings
	useEffect(() => {
		if (!locationId) return;
		const fetchSettings = async () => {
			try {
				const res = await getLineCheckSettings(locationId);
				if (res.data) {
					setSettings({
						startOfWeek: res.data.dayOfWeek as LineCheckSettings['startOfWeek'],
						dailyGoal: res.data.dailyGoal ?? 5,
					});
				}
			} catch (err) {
				console.error(err);
			}
		};
		fetchSettings();
	}, [locationId]);

	// fetch completed line checks with prep correctness
	useEffect(() => {
		if (!locationId) return;
		const fetchLineChecks = async () => {
			try {
				const res = await getCompletedLineChecksByLocationApi(locationId);
				setLineChecks(res.data ?? []);
			} catch (err) {
				console.error(err);
			}
		};
		fetchLineChecks();
	}, [locationId]);

	const today = new Date();
	const startOfWeekDate = useMemo(() => {
		const dayMap: Record<string, number> = {
			SUNDAY: 0,
			MONDAY: 1,
			TUESDAY: 2,
			WEDNESDAY: 3,
			THURSDAY: 4,
			FRIDAY: 5,
			SATURDAY: 6,
		};
		const startDayIndex = dayMap[settings.startOfWeek] ?? 1;
		const diff = today.getDay() - startDayIndex;
		const start = new Date(today);
		start.setDate(today.getDate() - diff);
		start.setHours(0, 0, 0, 0);
		return start;
	}, [settings.startOfWeek, today]);

	// calculate counts
	const todayCount = useMemo(() => {
		return lineChecks.filter((lc) => {
			const checkDate = new Date(lc.checkTime);
			return (
				checkDate.toDateString() === today.toDateString() &&
				lc.items.some((item) => !item.isItemChecked && item.isChecked)
			);
		}).length;
	}, [lineChecks, today]);

	const wtdCount = useMemo(() => {
		return lineChecks.filter(
			(lc) =>
				new Date(lc.checkTime) >= startOfWeekDate &&
				lc.items.some((item) => !item.isItemChecked && item.isChecked),
		).length;
	}, [lineChecks, startOfWeekDate]);

	const avgPerDay = useMemo(() => {
		const trackedDays =
			(today.getTime() - startOfWeekDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
		return wtdCount / Math.max(1, trackedDays);
	}, [wtdCount, startOfWeekDate, today]);

	const goalPerDay = settings.dailyGoal;

	return (
		<div className="w-full space-y-4">
			<h2 className="text-2xl font-bold text-gray-800">
				Fresh Line Check Dashboard
			</h2>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card className="shadow-lg rounded-xl p-3 bg-chart-5/30">
					<CardHeader>
						<CardTitle className="flex justify-between items-center">
							Today
							<Badge variant="secondary" className="text-xl">
								{todayCount}
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>Line Checks Not Prepared Correctly Today</CardContent>
				</Card>

				<Card className="shadow-lg rounded-xl p-3 bg-chart-4/30">
					<CardHeader>
						<CardTitle className="flex justify-between items-center">
							Week-to-Date
							<Badge variant="secondary" className="text-xl">
								{wtdCount}
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						Line Checks Not Prepared Correctly Since {settings.startOfWeek}
					</CardContent>
				</Card>

				<Card className="shadow-lg rounded-xl p-3 bg-chart-2/30">
					<CardHeader>
						<CardTitle className="flex justify-between items-center">
							Avg / Day
							<Badge variant="secondary" className="text-xl">
								{avgPerDay.toFixed(1)}
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						Average Line Checks Not Prepared Correctly Per Day
					</CardContent>
				</Card>

				<Card className="shadow-lg rounded-xl p-3 bg-chart-3/30">
					<CardHeader>
						<CardTitle className="flex justify-between items-center">
							Goal Status
							<Badge
								variant="secondary"
								className={
									todayCount >= goalPerDay
										? 'bg-green-600 text-white text-xl'
										: 'bg-red-600 text-white text-xl'
								}
							>
								{todayCount}/{goalPerDay}
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Progress
							value={Math.min((todayCount / goalPerDay) * 100, 100)}
							className="h-3 rounded-full"
						/>
						<p>Progress towards daily goal of {goalPerDay}</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default FreshLineCheckDashboard;

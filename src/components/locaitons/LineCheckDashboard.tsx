'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineCheck, LineCheckSettings } from '@/app/types';
import { getLineCheckSettings } from '@/app/api/locationApi';

interface DashboardProps {
	lineChecks: LineCheck[];
	locationId: string;
}

const LineCheckDashboard: React.FC<DashboardProps> = ({
	lineChecks,
	locationId,
}) => {
	const [settings, setSettings] = useState<LineCheckSettings>({
		startOfWeek: 'MONDAY',
		dailyGoal: 5,
	});

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
				console.error('Failed to fetch line check settings', err);
			}
		};
		fetchSettings();
	}, [locationId]);

    const today = new Date();
    const formattedToday = today.toLocaleDateString('en-US', {
			weekday: 'short', // Thu
			month: '2-digit', // 12
			day: '2-digit', // 04
		});

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

	const todayCount = useMemo(
		() =>
			lineChecks.filter(
				(lc) => new Date(lc.checkTime).toDateString() === today.toDateString()
			).length,
		[lineChecks, today]
	);

	const wtdCount = useMemo(
		() =>
			lineChecks.filter((lc) => new Date(lc.checkTime) >= startOfWeekDate)
				.length,
		[lineChecks, startOfWeekDate]
	);

	const avgPerDay = useMemo(() => {
		const trackedDays =
			(today.getTime() - startOfWeekDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
		return wtdCount / Math.max(1, trackedDays);
	}, [wtdCount, startOfWeekDate, today]);

	const goalPerDay = settings.dailyGoal;

	return (
		<div className="space-y-4 p-2">
			{/* <h2 className="text-3xl font-bold text-gray-800">Line Check Dashboard</h2> */}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card className="bg-blue-50 shadow-md hover:shadow-lg transition-all rounded-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold flex justify-between items-center">
							Line Checks Completed Today
							{/* {formattedToday}
							<Badge variant="default">{todayCount}</Badge> */}
						</CardTitle>
					</CardHeader>
					<CardContent className="flex justify-between items-center text-lg">
						{formattedToday}
						<Badge className="text-lg" variant="secondary">
							{todayCount}
						</Badge>
						{/* <p className="text-gray-600">Line Checks Completed Today</p> */}
					</CardContent>
				</Card>

				<Card className="bg-green-50 shadow-md hover:shadow-lg transition-all rounded-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold flex justify-between items-center">
							Week-to-Date
							<Badge className="text-lg" variant="secondary">
								{wtdCount}
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-600">
							Line Checks Completed Since {settings.startOfWeek}
						</p>
					</CardContent>
				</Card>

				<Card className="bg-yellow-50 shadow-md hover:shadow-lg transition-all rounded-xl">
					<CardHeader>
						<CardTitle className="text-lg font-semibold flex justify-between items-center">
							Avg / Day
							<Badge variant="secondary">{avgPerDay.toFixed(1)}</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-600">
							Average Line Checks Completed per day
						</p>
					</CardContent>
				</Card>

				<Card className="bg-gray-50 shadow-md hover:shadow-lg transition-all rounded-xl">
					<CardHeader>
						<CardTitle className='flex justify-between items-center'>
							Goal Status
							<Badge
								variant="secondary"
								className={
									todayCount >= goalPerDay
										? 'bg-green-600 text-white'
										: 'bg-red-600 text-white'
								}
							>
								{todayCount}/{goalPerDay}
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						

						{/* Progress bar */}
						<Progress
							value={Math.min((todayCount / goalPerDay) * 100, 100)}
							className="h-3 rounded-full"
						/>

						<span className="text-sm text-gray-500">
							Progress towards daily goal of {goalPerDay} line checks
						</span>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default LineCheckDashboard;

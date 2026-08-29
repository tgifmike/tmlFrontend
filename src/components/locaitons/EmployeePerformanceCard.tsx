'use client';

import {
	ComposedChart,
	Bar,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmployeePerformanceDto } from '@/app/types';
import { useState, useEffect } from 'react';
import { UsersRound } from 'lucide-react';

interface EmployeePerformanceCardProps {
	data: EmployeePerformanceDto[];
}

export default function EmployeePerformanceCard({
	data,
}: EmployeePerformanceCardProps) {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	// Format employee names for responsive X-axis
	const formattedData = data.map((d) => ({
		...d,
		userNameShort: isMobile
			? d.userName.length > 6
				? d.userName.slice(0, 6) + '…'
				: d.userName
			: d.userName,
		avgMinutes: Number(((d.avgCompletionSeconds ?? 0) / 60).toFixed(1)),
	}));

	return (
		<Card className="w-full gap-0 overflow-hidden py-0 shadow-sm">
			<CardHeader className="border-b px-5 py-5 sm:px-6">
				<div className="flex items-center gap-3">
					<span className="flex size-10 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3">
						<UsersRound className="size-5" aria-hidden="true" />
					</span>
					<div>
						<CardTitle className="text-lg">Team performance</CardTitle>
						<p className="mt-1 text-sm text-muted-foreground">Today’s check volume and average completion time.</p>
					</div>
				</div>
			</CardHeader>

			<CardContent className="flex flex-col gap-4 p-5 sm:p-6">
				{data.length > 0 ? (
					<div className="h-[260px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<ComposedChart
								data={formattedData}
								margin={{ top: 10, right: 12, left: -12, bottom: 48 }}
							>
								<XAxis
									dataKey="userNameShort"
									angle={isMobile ? -35 : -20}
									textAnchor={isMobile ? 'end' : 'middle'}
									height={isMobile ? 50 : 60}
								/>
								<YAxis yAxisId="left" orientation="left" />
								<YAxis
									yAxisId="right"
									orientation="right"
									tickFormatter={(val) => `${val} min`}
								/>
								<Tooltip
									formatter={(
										value: any,
										name: string | number | undefined,
									): [React.ReactNode, string] => {
										const key = String(name); // normalize name to string
										if (key === 'checkCount')
											return [`${value} checks`, 'Check Count'];
										if (key === 'avgMinutes')
											return [`${value} min avg`, 'Average Duration (min)'];
										return [value, key];
									}}
								/>
								<Legend
									verticalAlign={isMobile ? 'bottom' : 'top'}
									align="center"
									iconType="circle"
									wrapperStyle={{ bottom: isMobile ? 0 : undefined }}
								/>
								<Bar
									yAxisId="left"
									dataKey="checkCount"
									fill="#3b82f6"
									barSize={isMobile ? 20 : 30}
									name="Check Count"
								/>
								<Line
									yAxisId="right"
									type="monotone"
									dataKey="avgMinutes"
									stroke="#f59e0b"
									strokeWidth={2}
									dot={{ r: isMobile ? 2 : 4 }}
									name="Average Duration (min)"
								/>
							</ComposedChart>
						</ResponsiveContainer>
					</div>
				) : (
					<div className="rounded-xl border border-dashed px-5 py-12 text-center text-sm text-muted-foreground">
						No team performance data yet.
					</div>
				)}

				<div className="divide-y rounded-xl border bg-muted/10">
					{data.map((emp) => (
						<div
							key={emp.userId}
							className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm"
						>
							<span className="min-w-0 truncate font-medium">{emp.userName}</span>
							<span className="text-right text-muted-foreground">
								{emp.checkCount} check{emp.checkCount === 1 ? '' : 's'} ·{' '}
								{((emp.avgCompletionSeconds ?? 0) / 60).toFixed(1)} min avg
							</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

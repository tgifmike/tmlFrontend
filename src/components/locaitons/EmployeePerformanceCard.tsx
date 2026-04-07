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
		avgMinutes: ((d.avgCompletionSeconds ?? 0) / 60).toFixed(1),
	}));

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="text-center text-2xl md:text-3xl break-word">
					Employee Performance
				</CardTitle>
			</CardHeader>

			<CardContent className="flex flex-col gap-4">
				{data.length > 0 ? (
					<div className="h-[250px] md:h-[350px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<ComposedChart
								data={formattedData}
								margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
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
					<div className="text-center text-sm text-muted-foreground mt-8">
						No employee performance data yet.
					</div>
				)}

				{/* Numeric list collapsible on mobile */}
				<div
					className={`${isMobile ? 'text-xs' : 'md:flex'} flex flex-col gap-2 mt-4`}
				>
					{data.map((emp) => (
						<div
							key={emp.userId}
							className="flex justify-between text-sm md:text-base"
						>
							<span className="font-medium">{emp.userName}</span>
							<span className="text-right text-muted-foreground">
								{emp.checkCount} checks •{' '}
								{((emp.avgCompletionSeconds ?? 0) / 60).toFixed(1)} min avg
							</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmployeePerformanceDto } from '@/app/types';

interface EmployeePerformanceCardProps {
	data: EmployeePerformanceDto[];
}

export default function EmployeePerformanceCard({
	data,
}: EmployeePerformanceCardProps) {
	return (
		<Card className="bg-chart-5/20 min-h-[300px] w-full">
			<CardHeader>
				<CardTitle className="text-center text-2xl md:text-3xl break-word">
					Employee Performance
				</CardTitle>
			</CardHeader>

			<CardContent className="flex flex-col md:flex-row gap-4">
				{/* Left: Bar chart (1/3) */}
				<div className="md:w-1/3 h-48">
					{data.length > 0 ? (
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								layout="vertical"
								data={data}
								margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
							>
								<XAxis type="number" />
								<YAxis type="category" dataKey="userName" width={80} />
								<Tooltip
									formatter={(value) => `${value} checks`}
									cursor={{ fill: 'rgba(0,0,0,0.1)' }}
								/>
								<Bar dataKey="checkCount" fill="#3b82f6" />
							</BarChart>
						</ResponsiveContainer>
					) : (
						<div className="text-center text-sm text-muted-foreground mt-8">
							No employee performance data yet.
						</div>
					)}
				</div>

				{/* Right: Numeric list (2/3) */}
				<div className="flex flex-col justify-center gap-2">
					{data.map((emp) => (
						<div key={emp.userId} className="flex justify-between text-sm">
							<span className="font-medium">{emp.userName}</span>
							<span className="text-right text-muted-foreground">
								{emp.checkCount} checks •{' '}
								{((emp.avgCompletionSeconds ?? 0) / 60).toFixed(1)} min avg
							</span>
						</div>
					))}

					{/* Optional legend */}
					<div className="mt-4 flex flex-wrap gap-2 items-center text-xs">
						<span className="font-medium mr-2">Legend:</span>
						<span className="text-blue-500">📊 Check Count</span>
						<span className="text-muted-foreground">• Average Duration</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
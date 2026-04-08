'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface RankedDayDto {
	day: string;
	avg: number;
}

interface Props {
	topMissingDays?: RankedDayDto[];
	topOutOfTempDays?: RankedDayDto[];
	topIncorrectPrepDays?: RankedDayDto[];
	topWeakestCompletionDays?: RankedDayDto[];
}

const medals = ['🥇', '🥈', '🥉'];

function renderRankings(data?: RankedDayDto[]) {
	if (!data?.length) return 'N/A';

	return data.slice(0, 3).map((d, i) => (
		<div key={d.day}>
			{medals[i]} {d.day} ({d.avg.toFixed(1)})
		</div>
	));
}

export default function TopWeekdayTrendCard({
	topMissingDays,
	topOutOfTempDays,
	topIncorrectPrepDays,
	topWeakestCompletionDays,
}: Props) {
	const rows = [
		{
			label: 'Days with Most Missing Items',
			value: renderRankings(topMissingDays),
		},
		{
			label: 'Days with Most Out-of-Temp Items',
			value: renderRankings(topOutOfTempDays),
		},
		{
			label: 'Days with Most Incorrect Prep Items',
			value: renderRankings(topIncorrectPrepDays),
		},
		{
			label: 'Days with Least Line Check Completions',
			value: renderRankings(topWeakestCompletionDays),
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25 }}
		>
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-base md:text-lg">
						📅 Weakest Days (Last 30 Days)
					</CardTitle>
				</CardHeader>

				<CardContent className="grid grid-cols-1 md:grid-cols-4 gap-1">
					{rows.map((row) => (
						<div
							key={row.label}
							className="flex flex-col gap-1 rounded-xl border p-3 shadow-sm"
						>
							<span className="text-xs text-muted-foreground">{row.label}</span>

							<div className="flex flex-col text-sm md:text-base space-y-1">
								{row.value}
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</motion.div>
	);
}

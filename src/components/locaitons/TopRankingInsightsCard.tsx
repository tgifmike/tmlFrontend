'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface RankedDayDto {
	day: string;
	avg: number;
}

interface RankedItemDto {
	itemName: string;
	count: number;
}

interface Props {
	topMissingDays?: RankedDayDto[];
	topOutOfTempDays?: RankedDayDto[];
	topIncorrectPrepDays?: RankedDayDto[];
	topWeakestCompletionDays?: RankedDayDto[];

	topMissingItems?: RankedItemDto[];
	topOutOfTempItems?: RankedItemDto[];
	topIncorrectPrepItems?: RankedItemDto[];
}

const medals = ['🥇', '🥈', '🥉'];

function renderDayRankings(data?: RankedDayDto[]) {
	if (!data?.length) return 'N/A';

	return data.slice(0, 3).map((d, i) => (
		<div key={d.day}>
			{medals[i]} {d.day} ({d.avg.toFixed(1)})
		</div>
	));
}

function renderItemRankings(data?: RankedItemDto[]) {
	if (!data?.length) return 'N/A';

	return data.slice(0, 5).map((item, i) => (
		<div key={item.itemName}>
			{i < 3 ? medals[i] : '•'} {item.itemName} ({item.count})
		</div>
	));
}

export default function TopRankingInsightsCard({
	topMissingDays,
	topOutOfTempDays,
	topIncorrectPrepDays,
	topWeakestCompletionDays,
	topMissingItems,
	topOutOfTempItems,
	topIncorrectPrepItems,
}: Props) {
	const rows = [
		{
			label: 'Missing Items Trend',
			value: renderDayRankings(topMissingDays),
			variant: 'destructive',
		},
		{
			label: 'Out-of-Temp Trend',
			value: renderDayRankings(topOutOfTempDays),
			variant: 'secondary',
		},
		{
			label: 'Incorrect Prep Trend',
			value: renderDayRankings(topIncorrectPrepDays),
			variant: 'outline',
		},
		{
			label: 'Weakest Completion Days',
			value: renderDayRankings(topWeakestCompletionDays),
			variant: 'default',
		},
		{
			label: 'Top Missing Items',
			value: renderItemRankings(topMissingItems),
			variant: 'destructive',
		},
		{
			label: 'Top Out-of-Temp Items',
			value: renderItemRankings(topOutOfTempItems),
			variant: 'secondary',
		},
		{
			label: 'Top Incorrect Prep Items',
			value: renderItemRankings(topIncorrectPrepItems),
			variant: 'outline',
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
						📊 Advanced Trend Rankings (Last 30 Days)
					</CardTitle>
				</CardHeader>

				<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{rows.map((row) => (
						<div
							key={row.label}
							className="flex flex-col gap-1 rounded-xl border p-3 shadow-sm"
						>
							<span className="text-xs text-muted-foreground">{row.label}</span>

							<Badge
								variant={
									row.variant as
										| 'default'
										| 'secondary'
										| 'outline'
										| 'destructive'
								}
								className="text-sm md:text-base px-2 py-1 space-y-1"
							>
								{row.value}
							</Badge>
						</div>
					))}
				</CardContent>
			</Card>
		</motion.div>
	);
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface WeekdayInsightsProps {
	mostMissingItemsDay?: string;
	mostOutOfTempDay?: string;
	mostIncorrectPrepDay?: string;
	weakestLineCheckDay?: string;
}

export default function WeekdayInsightsCard({
	mostMissingItemsDay,
	mostOutOfTempDay,
	mostIncorrectPrepDay,
	weakestLineCheckDay,
}: WeekdayInsightsProps) {
	const insightRows = [
		{
			label: 'Most Missing Items',
			value: mostMissingItemsDay,
			emoji: '🔴',
			variant: 'destructive',
		},
		{
			label: 'Most Out-of-Temp',
			value: mostOutOfTempDay,
			emoji: '🟠',
			variant: 'secondary',
		},
		{
			label: 'Most Incorrect Prep',
			value: mostIncorrectPrepDay,
			emoji: '🟡',
			variant: 'outline',
		},
		{
			label: 'Weakest Completion Day',
			value: weakestLineCheckDay,
			emoji: '📉',
			variant: 'default',
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25 }}
		>
			<Card className="w-full">
				<CardHeader className="pb-2">
					<CardTitle className="text-base md:text-lg">
						📊 Weekly Trend Insights (Last 30 Days)
					</CardTitle>
				</CardHeader>

				<CardContent className="grid grid-cols-2 gap-3">
					{insightRows.map((row) => (
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
								className="w-fit text-sm md:text-base px-2 py-1"
							>
								{row.emoji} {row.value ?? 'N/A'}
							</Badge>
						</div>
					))}
				</CardContent>
			</Card>
		</motion.div>
	);
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface RankedItemDto {
	itemName: string;
	count: number;
}

interface Props {
	topMissingItems?: RankedItemDto[];
	topOutOfTempItems?: RankedItemDto[];
	topIncorrectPrepItems?: RankedItemDto[];
}

function renderItems(data?: RankedItemDto[]) {
	if (!data?.length) return 'N/A';

	return data.slice(0, 5).map((item, i) => (
		<div key={item.itemName}>
			{i + 1}. {item.itemName} ({item.count})
		</div>
	));
}

export default function TopIssueItemsCard({
	topMissingItems,
	topOutOfTempItems,
	topIncorrectPrepItems,
}: Props) {
	const rows = [
		{
			label: 'Top 5 Missing Items',
			value: renderItems(topMissingItems),
		},
		{
			label: 'Top 5 Out-of-Temp Items',
			value: renderItems(topOutOfTempItems),
		},
		{
			label: 'Top 5 Incorrect Prep Items',
			value: renderItems(topIncorrectPrepItems),
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
						📦 Most Problematic Items (Last 30 Days)
					</CardTitle>
				</CardHeader>

				<CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

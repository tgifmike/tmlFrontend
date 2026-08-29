'use client';

import { ListChecks } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RankedItemDto {
	itemName: string;
	count: number;
}

interface Props {
	topMissingItems?: RankedItemDto[];
	topOutOfTempItems?: RankedItemDto[];
	topIncorrectPrepItems?: RankedItemDto[];
}

export default function TopIssueItemsCard({
	topMissingItems,
	topOutOfTempItems,
	topIncorrectPrepItems,
}: Props) {
	const rows = [
		{ label: 'Frequently missing', data: topMissingItems },
		{ label: 'Temperature problems', data: topOutOfTempItems },
		{ label: 'Preparation problems', data: topIncorrectPrepItems },
	];

	return (
		<Card className="gap-0 overflow-hidden py-0 shadow-sm">
			<CardHeader className="border-b px-5 py-4 sm:px-6">
				<div className="flex items-center gap-3">
					<span className="flex size-9 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3">
						<ListChecks className="size-4.5" aria-hidden="true" />
					</span>
					<div>
						<CardTitle className="text-base">Recurring item issues</CardTitle>
						<p className="mt-1 text-xs text-muted-foreground">The five most frequently affected items in the last 30 days.</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className="grid gap-3 p-4 sm:p-5 lg:grid-cols-3">
				{rows.map((row) => (
					<ItemRankingPanel key={row.label} label={row.label} data={row.data} />
				))}
			</CardContent>
		</Card>
	);
}

function ItemRankingPanel({ label, data }: { label: string; data?: RankedItemDto[] }) {
	return (
		<div className="rounded-xl border bg-muted/15 p-4">
			<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
			{data?.length ? (
				<ol className="mt-3 space-y-2">
					{data.slice(0, 5).map((item, index) => (
						<li key={item.itemName} className="flex items-center justify-between gap-3 text-sm">
							<span className="min-w-0 truncate"><span className="mr-2 text-muted-foreground">{index + 1}.</span>{item.itemName}</span>
							<span className="rounded-full bg-background px-2 py-0.5 text-xs font-semibold tabular-nums">{item.count}</span>
						</li>
					))}
				</ol>
			) : (
				<p className="mt-3 text-sm text-muted-foreground">Not enough data yet.</p>
			)}
		</div>
	);
}

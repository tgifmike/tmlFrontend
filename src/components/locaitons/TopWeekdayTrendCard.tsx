'use client';

import { CalendarSearch } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

export default function TopWeekdayTrendCard({
	topMissingDays,
	topOutOfTempDays,
	topIncorrectPrepDays,
	topWeakestCompletionDays,
}: Props) {
	const rows = [
		{ label: 'Most missing items', data: topMissingDays },
		{ label: 'Most temperature issues', data: topOutOfTempDays },
		{ label: 'Most preparation issues', data: topIncorrectPrepDays },
		{ label: 'Fewest completions', data: topWeakestCompletionDays },
	];

	return (
		<Card className="gap-0 overflow-hidden py-0 shadow-sm">
			<CardHeader className="border-b px-5 py-4 sm:px-6">
				<div className="flex items-center gap-3">
					<span className="flex size-9 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3">
						<CalendarSearch className="size-4.5" aria-hidden="true" />
					</span>
					<div>
						<CardTitle className="text-base">Weekday trends</CardTitle>
						<p className="mt-1 text-xs text-muted-foreground">Ranked averages from the last 30 days.</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4">
				{rows.map((row) => (
					<RankingPanel key={row.label} label={row.label} data={row.data} />
				))}
			</CardContent>
		</Card>
	);
}

function RankingPanel({ label, data }: { label: string; data?: RankedDayDto[] }) {
	return (
		<div className="rounded-xl border bg-muted/15 p-4">
			<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
			{data?.length ? (
				<ol className="mt-3 space-y-2">
					{data.slice(0, 3).map((entry, index) => (
						<li key={entry.day} className="flex items-center justify-between gap-3 text-sm">
							<span className="min-w-0 truncate"><span className="mr-2 text-muted-foreground">{index + 1}.</span>{entry.day}</span>
							<span className="font-semibold tabular-nums">{entry.avg.toFixed(1)}</span>
						</li>
					))}
				</ol>
			) : (
				<p className="mt-3 text-sm text-muted-foreground">Not enough data yet.</p>
			)}
		</div>
	);
}

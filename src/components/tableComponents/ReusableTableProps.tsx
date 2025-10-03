'use client';

import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from '@/components/ui/table';

export type Column<T> = {
	header: string;
	render: (row: T) => React.ReactNode;
	className?: string; // optional styling
};

type ReusableTableProps<T> = {
	data: T[];
	columns: Column<T>[];
	rowKey: (row: T) => string; // unique key for each row
};

export function ReusableTable<T>({
	data,
	columns,
	rowKey,
}: ReusableTableProps<T>) {
	return (
		<Table className="min-w-full">
			<TableHeader>
				<TableRow className="text-lg font-semibold uppercase">
					{columns.map((col, idx) => (
						<TableHead key={idx} className={col.className}>
							{col.header}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.map((row) => (
					<TableRow key={rowKey(row)} className="text-lg">
						{columns.map((col, idx) => (
							<TableCell key={idx} className={col.className}>
								{col.render(row)}
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

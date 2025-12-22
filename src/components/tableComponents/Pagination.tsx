'use client';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from '@/components/ui/select';

type PaginationProps = {
	currentPage: number;
	setCurrentPage: (page: number) => void;
	pageSize: number;
	setPageSize: (size: number) => void;
	totalItems: number;
	pageSizeOptions?: number[];
};

export function Pagination({
	currentPage,
	setCurrentPage,
	pageSize,
	setPageSize,
	totalItems,
	pageSizeOptions = [5, 10, 20, 50],
}: PaginationProps) {
	const totalPages = Math.ceil(totalItems / pageSize);

	return (
		<div className="flex flex-col md:flex-row justify-between items-center w-full bg-ring/40 rounded-2xl p-4 mb-8 mt-8 mx-auto gap-4 md:gap-0">
			{/* Page size selector */}
			<div className="flex items-center gap-2">
				<span className="text-sm">Rows per page:</span>
				<Select
					value={String(pageSize)}
					onValueChange={(value) => setPageSize(Number(value))}
				>
					<SelectTrigger className="w-20">
						<SelectValue placeholder="Select..." />
					</SelectTrigger>
					<SelectContent>
						{pageSizeOptions.map((size) => (
							<SelectItem key={size} value={String(size)}>
								{size}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Pagination buttons */}
			<div className="flex gap-4 md:gap-8 items-center">
				<Button
					size="sm"
					disabled={currentPage === 1}
					onClick={() => setCurrentPage(currentPage - 1)}
				>
					Previous
				</Button>
				<span className="text-sm md:text-base">
					Page {currentPage} of {totalPages || 1}
				</span>
				<Button
					size="sm"
					disabled={currentPage === totalPages || totalPages === 0}
					onClick={() => setCurrentPage(currentPage + 1)}
				>
					Next
				</Button>
			</div>
		</div>
	);
}

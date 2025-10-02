
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Optional utility

export default function Spinner({ className }: { className?: string }) {
	return (
		<Loader2 className={cn('h-10 w-10 animate-spin text-chart-3', className)} />
	);
}

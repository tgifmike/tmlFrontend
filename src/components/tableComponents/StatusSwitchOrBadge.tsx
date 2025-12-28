'use client';

import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

/**
 * Generic props for any entity that has an active flag.
 */
type StatusSwitchOrBadgeProps<T extends { id: string; active: boolean }> = {
	entity: T;
	getLabel?: (entity: T) => string; // Optional label for display (not for toast anymore)
	onToggle: (id: string, checked: boolean) => Promise<void> | void;
	canToggle?: boolean; // e.g., based on role
};

export function StatusSwitchOrBadge<T extends { id: string; active: boolean }>({
	entity,
	getLabel,
	onToggle,
	canToggle = false,
}: StatusSwitchOrBadgeProps<T>) {
	const handleToggle = async (checked: boolean) => {
		try {
			await onToggle(entity.id, checked);
			toast.success(
				`${getLabel ? getLabel(entity) : 'Item'} is now ${
					checked ? 'active' : 'inactive'
				}`
			);
		} catch (err: any) {
			// catch errors thrown by onToggle (e.g., not authenticated or API failure)
			toast.error('Failed to update status: ' + (err?.message ?? err));
		}
	};

	if (canToggle) {
		return <Switch className='flex' checked={entity.active} onCheckedChange={handleToggle} />;
	}

	return (
		<Badge
			className={`px-2 py-1 text-sm font-bold rounded-full ${
				entity.active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
			}`}
		>
			{entity.active ? 'Active' : 'Inactive'}
		</Badge>
	);
}

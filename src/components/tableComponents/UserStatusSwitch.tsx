'use client';

import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { toggleUserActive } from '@/app/api/userApI';
import { User, AppRole } from '@/app/types';

type Props = {
	user: User;
	onStatusChange: (id: string, checked: boolean) => void;
};

export const UserStatusSwitchOrBadge = ({ user, onStatusChange }: Props) => {
	// ensure type-safe comparison
	const isManager = user.appRole === AppRole.MANAGER;

	const handleToggle = async (checked: boolean) => {
		if (!user.id) return;

		try {
			await toggleUserActive(user.id, checked);
			onStatusChange(user.id, checked);
			toast.success(
				`User: ${user.userName ?? 'unknown'} is now ${
					checked ? 'active' : 'inactive'
				}`
			);
		} catch (error: any) {
			toast.error('Failed to update user status: ' + (error?.message ?? error));
		}
	};

	if (isManager) {
		return (
			<Switch
				checked={user.userActive ?? false}
				onCheckedChange={handleToggle}
			/>
		);
	}

	return (
		<Badge
			className={`px-2 py-1 text-sm font-bold rounded-full ${
				user.userActive
					? 'bg-green-500 text-white' // green background
					: 'bg-red-500 text-white' // red background
			}`}
		>
			{user.userActive ? 'Active' : 'Inactive'}
		</Badge>
	);
};

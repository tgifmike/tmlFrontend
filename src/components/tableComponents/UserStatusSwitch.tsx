'use client';

import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { toggleUserActive } from '@/app/api/userApI';
import { User } from '@/app/types';

type Props = {
	user: User;
	onStatusChange: (id: string, checked: boolean) => void;
};

export const UserStatusSwitch = ({ user, onStatusChange }: Props) => {
	return (
		<Switch
			checked={user.userActive ?? false}
			onCheckedChange={async (checked) => {
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
					toast.error('Failed to update user status: ' + error.message);
				}
			}}
		/>
	);
};

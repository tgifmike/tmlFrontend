'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from '@/components/ui/select';
import { AppRole, User } from '@/app/types';
import { updateUserAppRole } from '@/app/api/userApI';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';

type Props = {
	user: User;
	onRoleChange: (id: string, role: AppRole) => void;
};

export const AppRoleSelect = ({ user, onRoleChange }: Props) => {

	const isManager = user.appRole === 'MANAGER';

	if (isManager) {
		// Non-managers see a badge instead
		return (
			<Select
			defaultValue={user.appRole ?? undefined}
			onValueChange={async (value) => {
				if (!user.id) return;

				try {
					await updateUserAppRole(user.id, value as AppRole);
					onRoleChange(user.id, value as AppRole);
					toast.success(
						`User: ${
							user.userName ?? 'unknown'
						} app role updated to ${value}`
					);
				} catch (error: any) {
					toast.error('Failed to update app role: ' + error.message);
				}
			}}
		>
			<SelectTrigger className="w-[150px]">{user.appRole}</SelectTrigger>
			<SelectContent>
				{Object.values(AppRole).map((role) => (
					<SelectItem key={role} value={role}>
						{role}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
	}
	
	// non-managers see a badge instead
	return (
		<Badge
			variant={'outline'}
			className={`px-2 py-1 text-sm font rounded-full text-chart-3 p-2 `}>
			
			{user.appRole ?? 'N/A'}
		</Badge>
	);
};

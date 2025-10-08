'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AccessRole, User } from '@/app/types';
import { updateUserAccessRole } from '@/app/api/userApI';
import { toast } from 'sonner';

type Props = {
	user: User;
	onRoleChange: (id: string, role: AccessRole) => void;
};

export const AccessRoleSelectOrBadge = ({ user, onRoleChange }: Props) => {
	const isManager = user.appRole === 'MANAGER';

	if (isManager) {
		// Manager can change role
		return (
			<Select
				defaultValue={user.accessRole ?? undefined}
				onValueChange={async (value) => {
					if (!user.id) return;

					try {
						await updateUserAccessRole(user.id, value as AccessRole);
						onRoleChange(user.id, value as AccessRole);
						toast.success(
							`User: ${
								user.userName ?? 'unknown'
							} access role updated to ${value}`
						);
					} catch (error: any) {
						toast.error('Failed to update access role: ' + error.message);
					}
				}}
			>
				<SelectTrigger className="w-[150px]">{user.accessRole}</SelectTrigger>
				<SelectContent>
					{Object.values(AccessRole).map((role) => (
						<SelectItem key={role} value={role}>
							{role}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	}

	// Non-managers see a badge instead
	return (
		<Badge
			variant={'outline'}
			className={`px-2 py-1 text-sm font rounded-full text-chart-3 p-2 `}>
			
			{user.accessRole ?? 'N/A'}
		</Badge>
	);
};

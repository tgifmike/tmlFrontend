'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from '@/components/ui/select';
import { AccessRole, User } from '@/app/types';
import { updateUserAccessRole } from '@/app/api/userApI';
import { toast } from 'sonner';

type Props = {
	user: User;
	onRoleChange: (id: string, role: AccessRole) => void;
};

export const AccessRoleSelect = ({ user, onRoleChange }: Props) => {
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
};

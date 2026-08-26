'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Icons } from '@/lib/icon';
import { AppRole, type User } from '@/app/types';
import { useSession } from '@/lib/auth/session-context';
import { inviteUserToAccount } from '@/app/api/userApI';

interface InviteUserDialogProps {
	accountId: string;
	onUserCreated: (user: User) => void;
}

const INVITABLE_APP_ROLES = [AppRole.MANAGER, AppRole.MEMBER] as const;

export const InviteUserDialog = ({
	accountId,
	onUserCreated,
}: InviteUserDialogProps) => {
	const { loading } = useSession();

	const Add_User = Icons.addUser;

	const [email, setEmail] = useState('');
	const [appRole, setAppRole] = useState<AppRole>(AppRole.MEMBER);

	const inviteUser = async () => {
		if (!email.trim()) {
			toast.error('Email required');
			return;
		}

		try {
			const res = await inviteUserToAccount(accountId, email.trim(), appRole);

			if (res.error) {
				throw new Error(res.error);
			}

			if (res.data) {
				onUserCreated({
					id: res.data.userId,
					userEmail: res.data.email,
					userName: null,
					userActive: true,
					accessRole: 'USER',
					appRole,
					firstLogin: res.data.firstLogin ?? true,
					invited: res.data.invited ?? true,
				});
			}

			toast.success('Invitation sent successfully');
			setEmail('');
			setAppRole(AppRole.MEMBER);
		} catch (err: any) {
			toast.error(err.message || 'Failed to invite user');
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					disabled={loading}
					className="text-chart-3 font-bold text-sm md:text-lg px-3 py-1 md:px-4 md:py-2 flex items-center gap-2"
				>
					<Add_User className="!w-[25px] !h-[25px]" />
					<span className="hidden md:inline">Invite User</span>
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Invite New User</DialogTitle>
				</DialogHeader>

				<Input
					placeholder="Enter email address"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>

				<div className="space-y-2">
					<label className="text-sm font-medium" htmlFor="invite-app-role">
						App role
					</label>
					<Select
						value={appRole}
						onValueChange={(value) => setAppRole(value as AppRole)}
					>
						<SelectTrigger id="invite-app-role" className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{INVITABLE_APP_ROLES.map((role) => (
								<SelectItem key={role} value={role}>
									{role.charAt(0) + role.slice(1).toLowerCase()}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="text-xs text-muted-foreground">
						Choose Manager if this person should create locations, stations,
						and items during onboarding.
					</p>
				</div>

				<Button onClick={inviteUser} disabled={loading}>
					Send Invite
				</Button>
			</DialogContent>
		</Dialog>
	);
};

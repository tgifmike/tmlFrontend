'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Icons } from '@/lib/icon';
import { User } from 'next-auth';
import { useSession } from '@/lib/auth/session-context';
import { inviteUserToAccount } from '@/app/api/userApI';

interface InviteUserDialogProps {
	accountId: string;
	onUserCreated: (user: User) => void;
}

export const InviteUserDialog = ({
	accountId,
	onUserCreated,
}: InviteUserDialogProps) => {
	const { loading } = useSession();

	const Add_User = Icons.addUser;

	const [email, setEmail] = useState('');

	const inviteUser = async () => {
		if (!email.trim()) {
			toast.error('Email required');
			return;
		}

		try {
			const res = await inviteUserToAccount(accountId, email.trim());

			if (res.error) {
				throw new Error(res.error);
			}

			if (res.data) {
				onUserCreated(res.data as User);
			}

			toast.success('Invitation sent successfully');
			setEmail('');
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

				<Button onClick={inviteUser} disabled={loading}>
					Send Invite
				</Button>
			</DialogContent>
		</Dialog>
	);
};

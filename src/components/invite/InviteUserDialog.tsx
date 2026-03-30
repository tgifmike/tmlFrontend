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

export const InviteUserDialog = ({ accountId, onUserCreated }: any) => {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);

	const inviteUser = async () => {
		if (!email) {
			toast.error('Email required');
			return;
		}

		try {
			setLoading(true);

			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/invite`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email,
						accountId,
						appRole: 'MEMBER',
						accessRole: 'USER',
					}),
				},
			);

			if (!res.ok) {
				throw new Error(await res.text());
			}

			const data = await res.json();

			onUserCreated(data.user);

			toast.success('Invitation sent successfully');
			setEmail('');
		} catch (err: any) {
			toast.error(err.message || 'Failed to invite user');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Invite User</Button>
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

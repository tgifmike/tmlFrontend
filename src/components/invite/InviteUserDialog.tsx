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
import { useSession } from '@/lib/auth/useSession';
import { apiFetch } from '@/app/api/userApI';


export const InviteUserDialog = ({ accountId, onUserCreated }: any) => {

const { user, status } = useSession();
	
	//icons
	const Add_User = Icons.addUser;
	
	//set state
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);

	const inviteUser = async () => {
		if (!email) {
			toast.error('Email required');
			return;
		}

		try {
			setLoading(true);

			// const res = await fetch(
			// 	`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/invite`,
			// 	{
			// 		method: 'POST',
			// 		headers: {
			// 			'Content-Type': 'application/json',
			// 			Authorization: `Bearer ${user.jwt ?? ''}`,
			// 		},
			// 		body: JSON.stringify({
			// 			email,
			// 			accountId,
			// 			appRole: 'MEMBER',
			// 			accessRole: 'USER',
			// 		}),
			// 	},
			// );

			const res = await apiFetch('/users/invite', {
				method: 'POST',
				body: JSON.stringify({
					email,
					accountId,
					appRole: 'MEMBER',
					accessRole: 'USER',
				}),
			});

			if (!res.ok) {
				throw new Error(await res.text());
			}

			const data = await res.json();

			onUserCreated((data.user ?? data) as User);

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

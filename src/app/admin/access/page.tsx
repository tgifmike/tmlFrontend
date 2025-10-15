'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { getAccountsForUser, getAllAccounts, grantAccess, revokeAccess } from '@/app/api/accountApi';
import { getAllUsers } from '@/app/api/userApI';
import { Account, User } from '@/app/types';


export default function UserAccessPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [userAccess, setUserAccess] = useState<Record<string, string[]>>({}); // userId -> accountIds

	useEffect(() => {
		const loadData = async () => {
			try {
				const [userRes, accountRes] = await Promise.all([
					getAllUsers(),
					getAllAccounts(),
				]);

				const users = userRes?.data ?? [];
				const accounts = accountRes?.data ?? [];
				setUsers(users);
				setAccounts(accounts);

				// Fetch access for each user
				const accessResults = await Promise.all(
					users.map(async (user) => {
						const res = await getAccountsForUser(user.id ?? '');
						const userAccounts = res?.data ?? [];
						return { userId: user.id, accountIds: userAccounts.map((a) => a.id) };
					})
				);

				// Map userId -> accountIds[]
				type AccessResult = {
					userId: string;
					accountIds: (string | undefined)[];
				};

				const accessMap: Record<string, string[]> = {};

				(accessResults as AccessResult[]).forEach(({ userId, accountIds }) => {
					if (userId) {
						// Filter out any undefined values before assigning
						accessMap[userId] = (accountIds || []).filter(
							(id): id is string => typeof id === 'string'
						);
					}
				});


				setUserAccess(accessMap);
			} catch (err) {
				console.error('Failed to load user access:', err);
				toast.error('Failed to load data');
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	const handleOpen = (user: User) => {
		setSelectedUser(user);
		setSelectedAccounts(userAccess[user.id ?? ''] || []); // ✅ Pre-select existing access
		setOpen(true);
	};

	const handleToggleAccount = (accountId: string) => {
		setSelectedAccounts((prev) =>
			prev.includes(accountId)
				? prev.filter((id) => id !== accountId)
				: [...prev, accountId]
		);
	};

	const handleSave = async () => {
		if (!selectedUser) return;
		try {
			const userId = selectedUser.id ?? '';
			const previousAccounts = userAccess[userId] ?? [];
			const newAccounts = selectedAccounts;

			// Determine which accounts to grant or revoke
			const toGrant = newAccounts.filter(
				(id) => !previousAccounts.includes(id)
			);
			const toRevoke = previousAccounts.filter(
				(id) => !newAccounts.includes(id)
			);

			// Perform all API calls in parallel
			await Promise.all([
				...toGrant.map((id) => grantAccess(userId, id)),
				...toRevoke.map((id) => revokeAccess(userId, id)),
			]);

			setUserAccess((prev) => ({
				...prev,
				[selectedUser.id ?? '']: selectedAccounts,
			}));

			toast.success(`Access updated for ${selectedUser.userName}`);
			setOpen(false);
		} catch (err) {
			toast.error('Failed to update access');
			console.error(err);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64 text-muted-foreground">
				Loading users and accounts...
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<h1 className="text-2xl font-bold">User Access Management</h1>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{users.map((user) => (
					<Card key={user.id}>
						<CardHeader>
							<CardTitle>{user.userName}</CardTitle>
							<p className="text-sm text-muted-foreground">{user.userEmail}</p>
						</CardHeader>
						<CardContent>
							<Dialog
								open={open && selectedUser?.id === user.id}
								onOpenChange={setOpen}
							>
								<DialogTrigger asChild>
									<Button variant="outline" onClick={() => handleOpen(user)}>
										Edit Accounts
									</Button>
								</DialogTrigger>

								<DialogContent className="sm:max-w-[425px]">
									<DialogHeader>
										<DialogTitle>Edit Accounts for {user.userName}</DialogTitle>
									</DialogHeader>

									<div className="max-h-[300px] overflow-y-auto space-y-3 py-2">
										{accounts.map((acc) => (
											<div key={acc.id} className="flex items-center space-x-2">
												<Checkbox
													id={`acc-${acc.id}`}
													checked={selectedAccounts.includes(acc.id ?? '')}
													onCheckedChange={() => handleToggleAccount(acc.id ?? '')}
												/>
												<label
													htmlFor={`acc-${acc.id}`}
													className="text-sm font-medium"
												>
													{acc.accountName}
												</label>
											</div>
										))}
									</div>

									<DialogFooter>
										<Button onClick={handleSave}>Save</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

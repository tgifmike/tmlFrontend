'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

import TimeOfDayGreeting from '@/components/login/TimeOfDayGreeting';
import { getAccountsForUser } from '../../api/accountApi';
import { Account } from '../../types';
import { useSession } from '@/lib/auth/useSession';

const Dashboard = () => {
	const { user } = useSession();

	const [accounts, setAccounts] = useState<Account[]>([]);
	const [loading, setLoading] = useState(true);

	const isSRAdmin = user?.accessRole === 'SRADMIN';
	const displayName = user?.name?.split(' ')[0] ?? 'You';

	useEffect(() => {
		if (!user?.id) return;

		const load = async () => {
			try {
				const res = await getAccountsForUser(user.id);
				setAccounts(res.data ?? []);
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [user?.id]);

	if (loading) {
		return <div className="p-6">Loading accounts...</div>;
	}

	return (
		<main className="space-y-8">
			<TimeOfDayGreeting name={user?.name} />

			{/* ADMIN */}
			{isSRAdmin && (
				<Card>
					<CardHeader>
						<CardTitle>Admin</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-2">
						<Link href="/admin/access" className="hover:underline">
							Grant Access
						</Link>
						<Link href="/admin/users" className="hover:underline">
							Manage Users
						</Link>
					</CardContent>
				</Card>
			)}

			{/* ACCOUNTS */}
			<Card>
				<CardHeader>
					<CardTitle className="text-3xl">Accounts</CardTitle>
					<CardDescription>
						{displayName} you have access to {accounts.length} accounts
					</CardDescription>
				</CardHeader>

				<CardContent>
					{accounts.length > 0 ? (
						<ul className="space-y-2">
							{accounts.map((a) => (
								<li key={a.id}>
									<Link
										href={`/accounts/${a.id}`}
										className="text-chart-3 hover:underline"
									>
										{a.accountName}
									</Link>
								</li>
							))}
						</ul>
					) : (
						<p className="text-destructive">No accounts assigned.</p>
					)}
				</CardContent>
			</Card>
		</main>
	);
};

export default Dashboard;

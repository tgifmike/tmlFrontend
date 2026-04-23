'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import TimeOfDayGreeting from '@/components/login/TimeOfDayGreeting';

import { getAccountsForUser } from '../api/accountApi';
import { Account } from '../types';
import { useSession } from '@/lib/auth/useSession';

const Dashboard = () => {
	const router = useRouter();
	const { user, status } = useSession();

	// const session = data.user;

	const [accounts, setAccounts] = useState<Account[]>([]);
	const [loading, setLoading] = useState(true);

	const isSRAdmin = user?.accessRole === 'SRADMIN';
	const displayName = user?.name?.split(' ')[0] ?? 'You';

	//////////////////////////////////////////////////////////////
	// AUTH GUARD
	//////////////////////////////////////////////////////////////
	useEffect(() => {
		if (status === 'unauthenticated') {
			router.push('/login');
		}
	}, [status, router]);

	//////////////////////////////////////////////////////////////
	// LOAD ACCOUNTS
	//////////////////////////////////////////////////////////////
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

	if (status === 'loading' || loading) {
		return <div className="p-6">Loading...</div>;
	}

	return (
		<main>
			<div className="flex">
				<TimeOfDayGreeting name={user?.name} />
			</div>

			{isSRAdmin && (
				<div className="w-3/4 mx-auto mb-8">
					<Card>
						<CardHeader>
							<CardTitle>Admin</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col gap-4">
								<Link
									href="/admin/access"
									className="text-chart-3 hover:underline"
								>
									Grant Access
								</Link>
								<Link
									href="/admin/users"
									className="text-chart-3 hover:underline"
								>
									Manage Users
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			<div className="w-3/4 mx-auto">
				<Card>
					<CardHeader>
						<CardTitle className="text-4xl">Accounts</CardTitle>
						<CardDescription>
							{displayName} you have access to {accounts.length} accounts
						</CardDescription>
					</CardHeader>

					<CardContent>
						{accounts.length > 0 ? (
							<ul>
								{accounts.map((a) => (
									<li key={a.id}>
										<Link href={`/accounts/${a.id}`}>{a.accountName}</Link>
									</li>
								))}
							</ul>
						) : (
							<p className="text-destructive">No accounts assigned.</p>
						)}
					</CardContent>
				</Card>
			</div>
		</main>
	);
};

export default Dashboard;

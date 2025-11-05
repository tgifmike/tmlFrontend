'use client';

import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'
import { Account } from '../types';
import router from 'next/router';
import { getAccountsForUser } from '../api/accountApi';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import TimeOfDayGreeting from '@/components/login/TimeOfDayGreeting';

const Dashboard = () => {
  //session
  const { data: session, status } = useSession();
  const isSRAdmin = session?.user?.accessRole === 'SRADMIN';

  //set state
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accountName, setAccountName] = useState<string | null>(null);

  const displayName = session?.user.name?.split(' ')[0] ?? 'You';

  useEffect(() => {
		if (status !== 'authenticated' || !session?.user?.id) return;
		if (hasAccess) return; // prevent rerun

		const verifyAccess = async () => {
			try {
				const response = await getAccountsForUser(session.user.id);

				setHasAccess(true);

				setAccounts(response.data ?? null);
			} catch (err) {
				console.error('Error verifying account access:', err);
			} finally {
				setLoadingAccess(false);
			}
		};

		verifyAccess();
	}, [status, session?.user?.id, router, hasAccess]);
  
 
  return (
		<main>
			<div className="flex ">
				<TimeOfDayGreeting name={session?.user?.name} />
			</div>

			{isSRAdmin && (
				<div className="w-3/4 mx-auto mb-8">
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl">Admin</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col gap-4">
								<Link
									className="text-2xl text-chart-3 hover:underline"
									href={'/admin/access'}
								>
									Grant Access to Accounts and Locations
								</Link>
								<Link
									className="text-2xl text-chart-3 hover:underline"
									href={'/admin/users'}
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
						<CardDescription className="text-2xl">
							{displayName} you have access to {accounts?.length}{' '}
							accounts:
						</CardDescription>
						{/* <CardAction>action</CardAction> */}
					</CardHeader>
					<CardContent>
						{accounts && accounts?.length > 0 ? (
							<div>
								<ul className="list-none pl-6">
									{accounts?.map((account) => (
										<li
											key={account.id}
											className="text-xl mb-2 text-chart-3 hover:underline"
										>
											<Link href={`/accounts/${account.id}`}>
												{account.accountName}
											</Link>
										</li>
									))}
								</ul>
							</div>
						) : (
							<div className="text-destructive text-4xl">
								<p>
									You do not have any accounts assigned to you. Please contact
									your administrator.
								</p>
							</div>
						)}
					</CardContent>
					<CardFooter className="flex justify-center">
						Click on the link to navigate to your account
					</CardFooter>
				</Card>
			</div>
		</main>
	);
}

export default Dashboard
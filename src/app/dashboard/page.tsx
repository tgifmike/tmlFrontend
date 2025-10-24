'use client';

import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'
import { Account } from '../types';
import { toast } from 'sonner';
import router from 'next/router';
import { getAccountsForUser } from '../api/accountApi';
import { set } from 'zod';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Divide } from 'lucide-react';

const Dashboard = () => {
  //session
  const { data: session, status } = useSession();
  const isSRAdmin = session?.user?.accessRole === 'SRADMIN';

  //set state
const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accountName, setAccountName] = useState<string | null>(null);

  useEffect(() => {
		if (status !== 'authenticated' || !session?.user?.id )
			return;
		if (hasAccess) return; // prevent rerun

		const verifyAccess = async () => {
			try {
				const response = await getAccountsForUser(session.user.id);
				

				// if (!account) {
				// 	toast.error('You do not have access to this account.');
				// 	router.push('/accounts');
				// 	return;
				// }
        console.log('Accounts for user:', response.data);
				setHasAccess(true);
				//setAccountName(account.accountName);
				setAccounts(response.data ?? null);
			 } catch (err) {
			// 	toast.error('Failed to verify account access.');
      //   router.push('/accounts');
        console.error('Error verifying account access:', err);
			} finally {
				setLoadingAccess(false);
			}
		};

		verifyAccess();
	}, [status, session?.user?.id, router, hasAccess]);
  
  // Determine time of day greeting
	const hour = new Date().getHours();
	const timeOfDay =
		hour < 5
			? 'Its the middle of the night'
			: hour < 8
			? 'Good morning'
			: hour < 12
			? 'Good morning'
			: hour < 13
			? 'Good afternoon'
			: hour < 17
			? 'Good afternoon'
			: hour < 20
			? 'Good evening'
			: 'Its getting late';

	const name = session?.user?.name?.split(' ')[0] ?? 'You'; // fallback if name missing
  return (
		<main>
			<div className="p-4">
				<p className="text-4xl">
					{timeOfDay} <span className="text-chart-3 italic">{name},</span>
				</p>
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
							{name} you have access to {accounts?.length} accounts:
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
							<div className="text-red-600 text-4xl">
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
'use client';

import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Icons } from '@/lib/icon';
import { toast } from 'sonner';
import { getAccountsForUser } from '@/app/api/accountApi';

const AccountPage = () => {
	const router = useRouter();
	const { data: session, status } = useSession();
	const params = useParams<{ accountName: string }>();
	const decodedAccountName = decodeURIComponent(params.accountName);

	const [loading, setLoading] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);

	//temp
	const accountImage = null;
	//const accountImage = '/newLogo.png';

	//icon
	const AddImageIcon = Icons.addPicture;

	// ✅ Access check
	useEffect(() => {
		if (status !== 'authenticated') return;

		const verifyAccess = async () => {
			try {
				// Fetch all accounts the user has access to
				const response = await getAccountsForUser(session.user.id);
				const accounts = response.data;

				// Check if the account name in URL is one of their accessible accounts
				const match = accounts?.some(
					(account: any) =>
						account.accountName.toLowerCase() ===
						decodedAccountName.toLowerCase()
				);

				if (!match) {
					toast.error('You do not have access to this account.');
					router.push('/accounts'); // Redirect back
				} else {
					setHasAccess(true);
				}
			} catch (err) {
				toast.error('Failed to verify account access.');
				router.push('/accounts');
			} finally {
				setLoading(false);
			}
		};

		verifyAccess();
	}, [status, session, decodedAccountName, router]);

	// //get account name from url
	// const params = useParams<{ accountName: string }>();
	// const decodedAccountName = decodeURIComponent(params.accountName);

	return (
		<main className="flex">
			{/* leftnav */}
			<div className="w-1/6 boarder-r-2 bg-ring h-screen">
				<div>
					{accountImage ? (
						<Image
							src={accountImage}
							alt="logo"
							className="mx-auto mt-4 rounded-full"
							width={200}
							height={200}
							style={{ maxWidth: '100%', height: 'auto' }}
						/>
					) : (
						<div
							className="mx-auto mt-4 rounded-full bg-ring flex items-center justify-center 
                    w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52"
						>
							<AddImageIcon className="text-background h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24" />
						</div>
					)}
				</div>
			</div>

			{/* main content */}
			<div className="p-4">
				<h1 className="text-4xl">{decodedAccountName}</h1>
			</div>
		</main>
	);
};

export default AccountPage;

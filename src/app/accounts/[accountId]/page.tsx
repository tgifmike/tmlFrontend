
'use client';

import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Icons } from '@/lib/icon';
import { toast } from 'sonner';
import { getAccountsForUser } from '@/app/api/accountApi';
import { getLocationsByAccountId } from '@/app/api/locationApi';
import { Locations } from '@/app/types/index';
import LeftNav from '@/components/navBar/LeftNav';

const AccountPage = () => {
	const router = useRouter();
	const { data: session, status } = useSession();
	const params = useParams<{ accountId: string }>();
	const accountIdParam = params.accountId;

	// state
	const [loadingAccess, setLoadingAccess] = useState(true);
	const [loadingLocations, setLoadingLocations] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const [locations, setLocations] = useState<Locations[]>([]);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);

	
	// temp image
	//const accountImage = '/newLogo.png';
	const AddImageIcon = Icons.addPicture;

	// ✅ Access check
	useEffect(() => {
		if (status !== 'authenticated' || !accountIdParam) return;

		const verifyAccess = async () => {
			try {
				const response = await getAccountsForUser(session.user.id);
				const accounts = response.data;

				console.log('Account from API:', accounts);
				// Find account by ID (convert both sides to string just in case)
				const account = accounts?.find(
					(acc: any) => acc.id.toString() === accountIdParam.toString()
				);

				if (!account) {
					toast.error('You do not have access to this account.');
					router.push('/accounts');
					return;
				}

				setHasAccess(true);
				setAccountName(account.accountName);
				setAccountImage(account.imageBase64|| null);
			} catch (err) {
				toast.error('Failed to verify account access.');
				router.push('/accounts');
			} finally {
				setLoadingAccess(false);
			}
		};

		verifyAccess();
	}, [status, session, accountIdParam, router]);

	// fetch locations for this account
	useEffect(() => {
		if (!hasAccess || !accountIdParam) return;

		const fetchLocations = async () => {
			try {
				const response = await getLocationsByAccountId(accountIdParam);
				setLocations(response.data || []);
			} catch (error: any) {
				toast.error('Failed to load locations: ' + (error?.message || error));
			} finally {
				setLoadingLocations(false);
			}
		};

		fetchLocations();
	}, [hasAccess, accountIdParam]);

	if (loadingAccess || loadingLocations) {
		return <div>Loading...</div>;
	}

	return (
		<main className="flex">
			{/* left nav */}
			<div className="w-1/6 border-r-2 bg-ring h-screen">
				
				<LeftNav accountName={accountName}  accountImage={accountImage} accountId={accountIdParam}/>
			</div>

			{/* main content */}
			<div className="p-4">
				{/* <h1 className="text-4xl">Account: {accountName}</h1> */}
				<div className="mt-4">
					{locations.length === 0 ? (
						<p className="text-destructive text-2xl">
							No locations for Account: {accountName} found.
						</p>
					) : (
						locations.map((location) => (
							<div key={location.id} className="p-2 border-b">
								<p className='text-2xl p-4'>Locations:</p>
								<h2 className="text-xl font-semibold">
									{location.locationName}
								</h2>
							</div>
						))
					)}
				</div>
			</div>
		</main>
	);
};

export default AccountPage;

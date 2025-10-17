// 'use client';

// import { useSession } from 'next-auth/react';
// import { useParams, useRouter } from 'next/navigation';
// import React, { useEffect, useState } from 'react';
// import Image from 'next/image';
// import { Icons } from '@/lib/icon';
// import { toast } from 'sonner';
// import { getAccountsForUser } from '@/app/api/accountApi';
// import { getLocationsByAccountId } from '@/app/api/locationApi';
// import { Locations } from '@/app/types/index';


// const AccountPage = () => {
// 	const router = useRouter();
// 	const { data: session, status } = useSession();
// 	const params = useParams<{ accountId: string }>();
// 	const accountIdParam = params.accountId;

// 	//set state
// 	const [loadingAccess, setLoadingAccess] = useState(true);
// 	const [loadingLocations, setLoadingLocations] = useState(true);
// 	const [hasAccess, setHasAccess] = useState(false);
// 	const [locations, setLocations] = useState<Locations[]>([]);
// 	const [accountId, setAccountId] = useState<string | null>(null);
// 	const [accountName, setAccountName] = useState<string | null>(null);

// 	//temp
// 	//const accountImage = null;
// 	const accountImage = '/newLogo.png';

// 	//icon
// 	const AddImageIcon = Icons.addPicture;

// 	// ✅Verify access to account
// 	useEffect(() => {
// 		if (status !== 'authenticated') return;

// 		const verifyAccess = async () => {
// 			try {
// 				const response = await getAccountsForUser(session.user.id);
// 				const accounts = response.data;

// 				// Find account by ID
// 				const account = accounts.find((acc: any) => acc.id === accountIdParam);

// 				if (!account) {
// 					toast.error('You do not have access to this account.');
// 					router.push('/accounts');
// 				} else {
// 					setHasAccess(true);
// 					setAccountName(account.accountName);
// 				}
// 			} catch (err) {
// 				toast.error('Failed to verify account access.');
// 				router.push('/accounts');
// 			} finally {
// 				setLoadingAccess(false);
// 			}
// 		};

// 		verifyAccess();
// 	}, [status, session, accountIdParam, router]);

// 	//get all locations
// 	useEffect(() => {
// 		if (!accountId) return;

// 		const fetchLocations = async () => {
// 			try {
// 				const response = await getLocationsByAccountId(accountId);
// 				setLocations(response.data || []);
// 			} catch (error: any) {
// 				toast.error('Failed to load locations: ' + (error?.message || error));
// 			} finally {
// 				setLoadingLocations(false);
// 			}
// 		};

// 		fetchLocations();
// 	}, [accountId]);

// 	if (loadingAccess || loadingLocations) {
// 		return <div>Loading...</div>;
// 	}

// 	return (
// 		<main className="flex">
// 			{/* leftnav */}
// 			<div className="w-1/6 boarder-r-2 bg-ring h-screen">
// 				<div>
// 					{accountImage ? (
// 						<Image
// 							src={accountImage}
// 							alt="logo"
// 							className="mx-auto mt-4 rounded-full"
// 							width={180}
// 							height={180}
// 							style={{ maxWidth: '100%', height: 'auto' }}
// 						/>
// 					) : (
// 						<div
// 							className="mx-auto mt-4 rounded-full bg-ring flex items-center justify-center 
//                     w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48"
// 						>
// 							<AddImageIcon className="text-background h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24" />
// 						</div>
// 					)}
// 				</div>
// 			</div>

// 			{/* main content */}
// 			<div className="p-4">
// 				<div>
// 					<h1 className="text-4xl">Account: {accountName}</h1>
// 				</div>
// 				<div>
// 					<p>Locations:</p>
// 					{locations.map((location) => (
// 						<div key={location.id} className="p-2 border-b">
// 							<h2 className="text-xl font-semibold">{location.locationName}</h2>
// 						</div>
// 					))}
// 				</div>
// 			</div>
// 		</main>
// 	);
// };

// export default AccountPage;
// 'use client';

// import { useSession } from 'next-auth/react';
// import { useParams, useRouter } from 'next/navigation';
// import React, { useEffect, useState } from 'react';
// import Image from 'next/image';
// import { Icons } from '@/lib/icon';
// import { toast } from 'sonner';
// import { getAccountsForUser } from '@/app/api/accountApi';
// import { getLocationsByAccountId } from '@/app/api/locationApi';
// import { Locations } from '@/app/types/index';

// const AccountPage = () => {
// 	const router = useRouter();
// 	const { data: session, status } = useSession();
// 	const params = useParams<{ accountId: string }>();
// 	const accountIdParam = params.accountId;

// 	const [loading, setLoading] = useState(true);
// 	const [hasAccess, setHasAccess] = useState(false);
// 	const [locations, setLocations] = useState<Locations[]>([]);
// 	const [accountName, setAccountName] = useState<string | null>(null);

// 	// temp account image
// 	const accountImage = '/newLogo.png';
// 	const AddImageIcon = Icons.addPicture;

// 	useEffect(() => {
// 		const verifyAccessAndFetchLocations = async () => {
// 			if (status !== 'authenticated' || !accountIdParam) return;

// 			try {
// 				// 1️⃣ Fetch all accounts user has access to
// 				const response = await getAccountsForUser(session!.user.id);
// 				const accounts = response.data;

// 				// 2️⃣ Find account by ID from URL
// 				const account = accounts.find((acc: any) => acc.id === accountIdParam);

// 				if (!account) {
// 					toast.error('You do not have access to this account.');
// 					router.push('/accounts');
// 					return;
// 				}

// 				// 3️⃣ Access granted, set state
// 				setHasAccess(true);
// 				setAccountName(account.accountName);

// 				// 4️⃣ Fetch locations for this account
// 				try {
// 					const locResponse = await getLocationsByAccountId(account.id);
// 					setLocations(locResponse.data || []);
// 				} catch (locErr: any) {
// 					toast.error(
// 						'Failed to load locations: ' + (locErr?.message || locErr)
// 					);
// 				}
// 			} catch (err) {
// 				toast.error('Failed to verify account access.');
// 				router.push('/accounts');
// 			} finally {
// 				setLoading(false);
// 			}
// 		};

// 		verifyAccessAndFetchLocations();
// 	}, [status, session, accountIdParam, router]);

// 	if (loading) {
// 		return <div>Loading...</div>;
// 	}

// 	return (
// 		<main className="flex">
// 			{/* left nav */}
// 			<div className="w-1/6 border-r-2 bg-ring h-screen">
// 				<div>
// 					{accountImage ? (
// 						<Image
// 							src={accountImage}
// 							alt="logo"
// 							className="mx-auto mt-4 rounded-full"
// 							width={180}
// 							height={180}
// 							style={{ maxWidth: '100%', height: 'auto' }}
// 						/>
// 					) : (
// 						<div className="mx-auto mt-4 rounded-full bg-ring flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48">
// 							<AddImageIcon className="text-background h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24" />
// 						</div>
// 					)}
// 				</div>
// 			</div>

// 			{/* main content */}
// 			<div className="p-4">
// 				<h1 className="text-4xl">Account: {accountName}</h1>

// 				<div>
// 					<p>Locations:</p>
// 					{locations.length > 0 ? (
// 						locations.map((location) => (
// 							<div key={location.id} className="p-2 border-b">
// 								<h2 className="text-xl font-semibold">
// 									{location.locationName}
// 								</h2>
// 							</div>
// 						))
// 					) : (
// 						<p>No locations found for this account.</p>
// 					)}
// 				</div>
// 			</div>
// 		</main>
// 	);
// };

// export default AccountPage;
'use client';

import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Icons } from '@/lib/icon';
import { toast } from 'sonner';
import { getAccountsForUser } from '@/app/api/accountApi';
import { getLocationsByAccountId } from '@/app/api/locationApi';
import { Locations } from '@/app/types/index';
import Link from 'next/link';
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

	// temp image
	const accountImage = '/newLogo.png';
	const AddImageIcon = Icons.addPicture;

	// ✅ Access check
	useEffect(() => {
		if (status !== 'authenticated' || !accountIdParam) return;

		const verifyAccess = async () => {
			try {
				const response = await getAccountsForUser(session.user.id);
				const accounts = response.data;

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
				{/* <div className='flex justify-center'>
					<p className='text-xl text-center'>{accountName }</p>
				</div>
				<div>
					{accountImage ? (
						<Image
							src={accountImage}
							alt="logo"
							className="mx-auto mt-4 rounded-full"
							width={180}
							height={180}
							style={{ maxWidth: '100%', height: 'auto' }}
						/>
					) : (
						<div className="mx-auto mt-4 rounded-full bg-ring flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48">
							<AddImageIcon className="text-background h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24" />
						</div>
					)}
				</div>

				<div className='flex justify-center mt-4 bg-foreground text-background'>
					<Link href={'/accounts'}>Back to Accounts</Link>
				</div> */}
				<LeftNav accountName={accountName}  accountImage={accountImage}/>
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

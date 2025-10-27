'use client';

import { getAccountsForUser } from '@/app/api/accountApi';
import { getUserLocationAccess } from '@/app/api/locationApi';
import { AppRole, Locations, User } from '@/app/types';
import LeftNav from '@/components/navBar/LeftNav';
import LocationNav from '@/components/navBar/LocationNav';
import Spinner from '@/components/spinner/Spinner';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import router from 'next/router';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

const LocationPage = () => {

    //icons
    
    //session
    const { data: session, status } = useSession();
    const currentUser = session?.user as User | undefined;
    const sessionUserRole = session?.user?.appRole;
    const canToggle = currentUser?.appRole === AppRole.MANAGER;
    const params = useParams<{ accountId: string, locationId: string }>();
    const accountIdParam = params.accountId;
    const locationIdParam = params.locationId;

    // state
    const [loadingAccess, setLoadingAccess] = useState(true);
		//const [loadingLocations, setLoadingLocations] = useState(true);
		const [hasAccess, setHasAccess] = useState(false);
		const [locationName, setLocationName] = useState<String | null>(null);
    const [accountName, setAccountName] = useState<string | null>(null);
    const [accountImage, setAccountImage] = useState<string | null>(null);
    
    useEffect(() => {
			if (
				status !== 'authenticated' ||
				!session?.user?.id ||
				!accountIdParam ||
				!locationIdParam
			)
				return;
			if (hasAccess) return; // prevent rerun

			const verifyAccess = async () => {
				try {
					const response = await getAccountsForUser(session.user.id);
					const account = response.data?.find(
						(acc) => acc.id?.toString() === accountIdParam
					);

					if (!account) {
						toast.error('You do not have access to this account.');
						router.push('/accounts');
						return;
					}

					// Check location access
					const locationResponse = await getUserLocationAccess(session.user.id);
					const location = locationResponse.data?.find(
						(loc) => loc.id?.toString() === locationIdParam
					);

					if (!location) {
						toast.error('You do not have access to this location.');
						router.push(`/accounts/${accountIdParam}/locations`);
						return;
					}

					setHasAccess(true);
					setAccountName(account.accountName);
					setAccountImage(account.imageBase64 || null);
					setLocationName(location.locationName);
				} catch (err) {
					toast.error('You do not have access to this location.');
					router.push('/accounts');
				} finally {
					setLoadingAccess(false);
				}
			};

			verifyAccess();
		}, [
			status,
			session?.user?.id,
			accountIdParam,
			locationIdParam,
			router,
			hasAccess,
		]);

    

   //show loadding state
    if (loadingAccess)
			return (
				<div className="flex justify-center items-center py-40  text-chart-3 text-xl">
					<Spinner />
					<span className="ml-4">Loading Locations…</span>
				</div>
			);

  return (
		<main className="flex">
			{/* left nav */}
			<div className="w-1/6 border-r-2 bg-ring h-screen">
				<LocationNav
					accountName={accountName}
					accountImage={accountImage}
					accountId={accountIdParam}
					locationId={locationIdParam}
					sessionUserRole={sessionUserRole}
				/>
			</div>
			{/* main content */}
			<div className="p-4 flex-1">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold mb-4">{locationName} Home</h1>
				</div>
			</div>
		</main>
	);
}

export default LocationPage
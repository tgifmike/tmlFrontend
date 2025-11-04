'use client';

import { getAccountsForUser } from '@/app/api/accountApi';
import { getUserLocationAccess } from '@/app/api/locationApi';
import { AppRole, Locations, User } from '@/app/types';
import LocationNav from '@/components/navBar/LocationNav';
import Spinner from '@/components/spinner/Spinner';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const LocationLineChecksPage = () => {
	const { data: session, status } = useSession();
	const router = useRouter();
	const params = useParams<{ accountId: string; locationId: string }>();

	const accountIdParam = params.accountId;
	const locationIdParam = params.locationId;

	const [loadingAccess, setLoadingAccess] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [locations, setLocations] = useState<Locations[]>([]);
	const [currentLocation, setCurrentLocation] = useState<Locations | null>(
		null
	);

	    const currentUser = session?.user as User | undefined;
        const sessionUserRole = session?.user?.appRole;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;

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
				// Fetch accounts for user
				const accountsRes = await getAccountsForUser(session.user.id);
				const account = accountsRes.data?.find(
					(acc) => acc.id?.toString() === accountIdParam
				);

				if (!account) {
					toast.error('You do not have access to this account.');
					router.push('/accounts');
					return;
				}

				// Fetch location access
				const locationRes = await getUserLocationAccess(session.user.id);
				const fetchedLocations = locationRes.data ?? [];
				setLocations(fetchedLocations);

				const location = fetchedLocations.find(
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
				setCurrentLocation(location);
			} catch (err) {
				toast.error('You do not have access to this location.');
				router.push('/accounts');
			} finally {
				setLoadingAccess(false);
			}
		};

		verifyAccess();
    }, [status, session, accountIdParam, locationIdParam, hasAccess, router]);
    

	if (status === 'loading' || loadingAccess) {
		return (
			<div className="flex justify-center items-center py-40 text-chart-3 text-xl">
				<Spinner />
				<span className="ml-4">Loading Locations…</span>
			</div>
		);
	}

	return (
		<main className="flex">
			<div className="w-1/6 border-r-2 bg-ring h-screen">
				<LocationNav
					accountName={accountName}
					accountImage={accountImage}
					accountId={accountIdParam}
					locationId={locationIdParam}
					sessionUserRole={sessionUserRole}
				/>
			</div>

			<div className="p-4 flex flex-col">
				<div className="flex">
					<h1 className="text-3xl font-bold mb-4">
						{currentLocation?.locationName}
					</h1>
				</div>

                <div>
                    <Link
                        className='text-xl text-chart-3 hover:underline'
                        href={`/accounts/${accountIdParam}/locations/${locationIdParam}/stations`}>Manage Stations</Link>
                </div>
			</div>
		</main>
	);
};

export default LocationLineChecksPage;

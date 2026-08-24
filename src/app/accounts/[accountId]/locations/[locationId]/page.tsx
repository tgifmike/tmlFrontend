'use client';

import { getAccountsForUser } from '@/app/api/accountApi';
import { getLineCheckSettings, getUserLocationAccess } from '@/app/api/locationApi';
import RobustLineCheckDashboard from '@/components/locaitons/RobustLineCheckDashboard';
import TimeOfDayGreeting from '@/components/login/TimeOfDayGreeting';
import LocationNav from '@/components/navBar/LocationNav';
import LocationPageHeader from '@/components/navBar/LocationPageHeader';
import Spinner from '@/components/spinner/Spinner';
import { useSession } from '@/lib/auth/session-context';

import { useParams, useRouter } from 'next/navigation';

import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';



const LocationPage = () => {
	//icons

	//session
	const { user } = useSession();
	const sessionUserRole = user?.appRole;
	const params = useParams<{ accountId: string; locationId: string }>();
	const accountIdParam = params.accountId;
	const locationIdParam = params.locationId;
	const router = useRouter();

	// state
	const [loadingAccess, setLoadingAccess] = useState(true);
	const [locationName, setLocationName] = useState<string | null>(null);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [lineCheckSettings, setLineCheckSettings] = useState<{ dailyGoal: number }>({ dailyGoal: 5 });



	useEffect(() => {
		if (!user?.id) return;
		if (!accountIdParam || !locationIdParam) return;

		const verifyAccess = async () => {
			try {
				const response = await getAccountsForUser(user.id);
				const account = response.data?.find(
					// const account = accountList.find(
					(acc: any) => acc.id?.toString() === accountIdParam
				);

				if (!account) {
					// console.warn('No matching account found', { accountList, accountIdParam });
					toast.error('You do not have access to this account.');
					router.push('/accounts');
					return;
				}

				// Check location access
				const locationResponse = await getUserLocationAccess(user.id);
				const location = locationResponse.data?.find(
					(loc) => loc.id?.toString() === locationIdParam
				);

				if (!location) {
					toast.error('You do not have access to this location.');
					router.push(`/accounts/${accountIdParam}`);
					return;
				}

				setAccountName(account.accountName);
				setAccountImage(account.imageBase64 || account.accountImage || null);
				setLocationName(location.locationName);

				const settingsRes = await getLineCheckSettings(locationIdParam);
				setLineCheckSettings({ dailyGoal: settingsRes.data?.dailyGoal ?? 5 });
				
			} catch (err) {
				toast.error('You do not have access to this location.');
				router.push('/accounts');
			} finally {
				setLoadingAccess(false);
			}
		};

		verifyAccess();
	}, [user?.id, accountIdParam, locationIdParam, router]);

	//show loadding state
	if (loadingAccess)
		return (
			<div className="flex items-center justify-center py-40 text-xl text-chart-3">
				<Spinner />
				<span className="ml-4">Loading location…</span>
			</div>
		);

	return (
		<main className="flex min-h-screen overflow-hidden">
			{/* Desktop Sidebar */}
			{/* left nav */}
			<aside className="hidden w-1/6 shrink-0 self-stretch border-r bg-ring md:block">
				<LocationNav
					accountName={accountName}
					accountImage={accountImage}
					accountId={accountIdParam}
					locationId={locationIdParam}
					sessionUserRole={sessionUserRole}
				/>
			</aside>

			{/* main content */}
			<section className="flex-1 flex flex-col">
				<LocationPageHeader
					accountId={accountIdParam}
					locationId={locationIdParam}
					accountName={accountName}
					accountImage={accountImage}
					locationName={locationName}
					sessionUserRole={sessionUserRole}
					drawerOpen={drawerOpen}
					setDrawerOpen={setDrawerOpen}
				>
					<TimeOfDayGreeting name={user?.name} />
				</LocationPageHeader>
				<div className="flex flex-col justify-between p-2 gap-3">
					<div>
						<RobustLineCheckDashboard
							locationId={locationIdParam!}
							dailyGoal={lineCheckSettings.dailyGoal}
						/>
					</div>
				</div>
			</section>
		</main>
	);
};

export default LocationPage;

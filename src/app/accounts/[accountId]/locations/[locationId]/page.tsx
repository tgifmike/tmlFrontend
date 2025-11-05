'use client';

import { getAccountsForUser } from '@/app/api/accountApi';
import { getUserLocationAccess, getWeather } from '@/app/api/locationApi';
import { AppRole, Locations, User } from '@/app/types';
import WeatherWidget from '@/components/locaitons/WeatherWidget';
import TimeOfDayGreeting from '@/components/login/TimeOfDayGreeting';
import LocationNav from '@/components/navBar/LocationNav';
import MobileDrawerNav from '@/components/navBar/MoibileDrawerNav';
import Spinner from '@/components/spinner/Spinner';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';

import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';


interface WeatherResponse {
	forecast: any;
	hourly: any;
	alerts: any;
}

const LocationPage = () => {
	//icons

	//session
	const { data: session, status } = useSession();
	const currentUser = session?.user as User | undefined;
	const sessionUserRole = session?.user?.appRole;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;
	const params = useParams<{ accountId: string; locationId: string }>();
	const accountIdParam = params.accountId;
	const locationIdParam = params.locationId;
	const router = useRouter();

	// state
	const [loadingAccess, setLoadingAccess] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const [locationName, setLocationName] = useState<String | null>(null);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [currentLocation, setCurrentLocation] = useState<any>();
	const [weather, setWeather] = useState<WeatherResponse | null>(null);

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
				const locationResponse = await getUserLocationAccess(session.user.id);
				const location = locationResponse.data?.find(
					(loc) => loc.id?.toString() === locationIdParam
				);

				if (!location) {
					toast.error('You do not have access to this location.');
					router.push(`/accounts/${accountIdParam}`);
					return;
				}

				setHasAccess(true);
				setAccountName(account.accountName);
				setAccountImage(account.imageBase64 || null);
				setLocationName(location.locationName);
				setCurrentLocation(location)

				const weatherData = await getWeather(
					location.locationLatitude,
					location.locationLongitude
				);
				setWeather(weatherData.data as WeatherResponse);
				console.log(weatherData.data);
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
		<main className="flex min-h-screen overflow-hidden">
			{/* Desktop Sidebar */}
			{/* left nav */}
			<aside className="hidden md:block w-1/6 border-r h-screen bg-ring">
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
				{/* Header */}
				<header className="flex justify-between items-center px-4 py-3 border-b bg-background/70 backdrop-blur-md sticky top-0 z-20">
					{/* Left */}
					<div className="flex gap-8">
						{/* Mobile Drawer */}
						<MobileDrawerNav
							open={drawerOpen}
							setOpen={setDrawerOpen}
							title="Menu"
						>
							<LocationNav
								accountName={accountName}
								accountImage={accountImage}
								accountId={accountIdParam}
								locationId={locationIdParam}
								sessionUserRole={sessionUserRole}
							/>
						</MobileDrawerNav>
						<h1 className="text-3xl font-bold mb-4">{locationName} Home</h1>
					</div>
				</header>
				<div className='flex justify-between'>
					<div className='p-4'>
						<TimeOfDayGreeting name={session?.user?.name} />
					</div>
					<div className='p-5'>
						{currentLocation && (
							<WeatherWidget
								lat={currentLocation.locationLatitude}
								lon={currentLocation.locationLongitude}
								fetchWeather={getWeather}
							/>
						)}
					</div>
				</div>
			</section>
		</main>
	);
};

export default LocationPage
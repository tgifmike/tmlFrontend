'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactAnimatedWeather from 'react-animated-weather';
import { motion } from 'framer-motion';
import { getUserLocationAccess, getWeather } from '@/app/api/locationApi';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { User } from '@/app/types';
import Spinner from '@/components/spinner/Spinner';
import { getAccountsForUser } from '@/app/api/accountApi';
import { toast } from 'sonner';
import LocationNav from '@/components/navBar/LocationNav';
import MobileDrawerNav from '@/components/navBar/MoibileDrawerNav';
import Image from 'next/image';
import { PlayCircle } from 'lucide-react';

interface WeatherResponse {
	forecast: any;
	hourly: any;
	alerts: any;
}

const iconMapping: Record<string, string> = {
	clear: 'CLEAR_DAY',
	sunny: 'CLEAR_DAY',
	'partly cloudy': 'PARTLY_CLOUDY_DAY',
	'mostly cloudy': 'CLOUDY',
	cloudy: 'CLOUDY',
	rain: 'RAIN',
	showers: 'RAIN',
	snow: 'SNOW',
	sleet: 'SLEET',
	storm: 'WIND',
	thunder: 'WIND',
	fog: 'FOG',
};

const ExtendedForecastPage = () => {
    const { data: session, status } = useSession();
    const sessionUserRole = session?.user?.appRole;
	const params = useParams<{ accountId: string; locationId: string }>();
	const accountIdParam = params.accountId;
	const locationIdParam = params.locationId;
	const router = useRouter();

	const [loadingAccess, setLoadingAccess] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const [currentLocation, setCurrentLocation] = useState<any>();
    const [weather, setWeather] = useState<WeatherResponse | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [accountName, setAccountName] = useState<string | null>(null);
    const [accountImage, setAccountImage] = useState<string | null>(null);
    const [locationName, setLocationName] = useState<String | null>(null);

	useEffect(() => {
		if (
			status !== 'authenticated' ||
			!session?.user?.id ||
			!accountIdParam ||
			!locationIdParam
		)
			return;
		if (hasAccess) return;

		const verifyAccess = async () => {
			try {
				const response = await getAccountsForUser(session.user.id);
				const account = response.data?.find(
					(acc: any) => acc.id?.toString() === accountIdParam
				);

				if (!account) {
					toast.error('You do not have access to this account.');
					router.push('/accounts');
					return;
				}

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
                setCurrentLocation(location);

				const weatherData = await getWeather(
					location.locationLatitude,
					location.locationLongitude
				);
				setWeather(weatherData.data as WeatherResponse);
				console.log('Weather Data:', weatherData.data);
			} catch (err) {
				toast.error('Unable to fetch weather data.');
				router.push('/accounts');
			} finally {
				setLoadingAccess(false);
			}
		};

		verifyAccess();
	}, [status, session?.user?.id, accountIdParam, locationIdParam, hasAccess]);

    const dailyForecast = weather?.forecast?.properties?.periods || [];

	const getAnimatedIcon = (forecastStr: string) => {
		const key = Object.keys(iconMapping).find((k) =>
			forecastStr.toLowerCase().includes(k)
		);
		return key ? iconMapping[key] : 'CLEAR_DAY';
	};

	const formatDay = (startTime: string) => {
		const date = new Date(startTime);
		return date.toLocaleDateString(undefined, {
			// weekday: 'short',
			month: 'short',
            day: 'numeric',
            year: 'numeric',
		});
	};

	const getGradient = (forecastStr: string) => {
        const condition = forecastStr.toLowerCase();
        const temp = dailyForecast.temperature;

		if (condition.includes('rain') || condition.includes('showers'))
			return 'bg-gradient-to-br from-blue-500 to-blue-300';
		if (condition.includes('cloud'))
			return 'bg-gradient-to-br from-gray-400 to-gray-200';
		if (condition.includes('snow'))
			return 'bg-gradient-to-br from-white to-blue-100';
		if (condition.includes('storm') || condition.includes('thunder'))
			return 'bg-gradient-to-br from-gray-700 to-gray-500';
		if (temp >= 85) return 'bg-gradient-to-br from-yellow-400 to-orange-500';
		if (temp >= 70) return 'bg-gradient-to-br from-yellow-200 to-green-300';
		if (temp >= 50) return 'bg-gradient-to-br from-green-200 to-blue-200';
		return 'bg-gradient-to-br from-gray-300 to-gray-100';
	};

	if (loadingAccess)
		return (
			<div className="flex justify-center items-center py-40 text-chart-3 text-xl">
				{' '}
				<Spinner /> <span className="ml-4">Loading Weather…</span>{' '}
			</div>
		);

	

    return (
			<main className="flex min-h-screen overflow-hidden">
				{/* Desktop Sidebar */}
				{/* left nav */}
				<aside className="hidden md:block w-1/6 border-r bg-ring overflow-y-auto">
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
						<p className="text-xl font-semibold">Extended Forecast</p>
					</header>

					<div>
						{dailyForecast.map((day: any) => (
							<Card
								className={`${getGradient(
									day.shortForecast
								)} p-2 w-5/6 mx-auto mt-2`}
								key={day.number}
							>
								<CardHeader>
									<CardTitle className="text-xl">
										{day.name} - {formatDay(day.startTime)}
									</CardTitle>
									<CardDescription>
										<p className="text-xl text-foreground pl-6 font-bold">
											Forecast:
										</p>
									</CardDescription>
								</CardHeader>
								<CardContent className="flex">
									<div className="w-1/4 rounded-2xl">
										<Image
											src={day.icon}
											alt="Weather condition"
											width={80}
											height={80}
											className="md:object-contain w-75 h-75 rounded-2xl md:shadow-2xl"
										/>
									</div>
									{/* <div className="w-1/4 flex justify-center items-center">
										<Image
											src={day.icon}
											alt="Weather condition"
											width={120}
											height={120}
											className="object-contain rounded-2xl md:shadow-2xl w-[120px] h-[120px] sm:w-[100px] sm:h-[100px] md:w-[80px] md:h-[80px]"
										/>
									</div> */}

									<div className="w-3/4">
										<div className="p-4">
											<p className="text-2xl">{day.detailedForecast}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</section>
			</main>
		);
};

export default ExtendedForecastPage;

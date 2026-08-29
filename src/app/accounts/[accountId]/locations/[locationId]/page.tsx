'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getAccountsForUser } from '@/app/api/accountApi';
import {
	getLineCheckSettings,
	getUserLocationAccess,
} from '@/app/api/locationApi';
import RobustLineCheckDashboard from '@/components/locaitons/RobustLineCheckDashboard';
import TimeOfDayGreeting from '@/components/login/TimeOfDayGreeting';
import LocationNav from '@/components/navBar/LocationNav';
import LocationPageHeader from '@/components/navBar/LocationPageHeader';
import Spinner from '@/components/spinner/Spinner';
import { useSession } from '@/lib/auth/session-context';

const DEFAULT_DAILY_GOAL = 5;

const LocationPage = () => {
	const { user, loading } = useSession();
	const params = useParams<{ accountId: string; locationId: string }>();
	const accountId = params.accountId;
	const locationId = params.locationId;
	const router = useRouter();

	const [loadingAccess, setLoadingAccess] = useState(true);
	const [locationName, setLocationName] = useState<string | null>(null);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [dailyGoal, setDailyGoal] = useState(DEFAULT_DAILY_GOAL);

	useEffect(() => {
		if (loading || !accountId || !locationId) return;
		if (!user?.id) {
			router.push('/login');
			return;
		}

		let cancelled = false;
		const loadLocation = async () => {
			setLoadingAccess(true);
			try {
				const [accountsResponse, locationsResponse] = await Promise.all([
					getAccountsForUser(user.id),
					getUserLocationAccess(user.id),
				]);
				if (cancelled) return;

				if (accountsResponse.error) throw new Error(accountsResponse.error);
				if (locationsResponse.error) throw new Error(locationsResponse.error);

				const account = (accountsResponse.data ?? []).find(
					(candidate) => candidate.id?.toString() === accountId,
				);
				if (!account) {
					toast.error('You do not have access to this account.');
					router.push('/accounts');
					return;
				}

				const location = (locationsResponse.data ?? []).find(
					(candidate) => candidate.id?.toString() === locationId,
				);
				if (!location) {
					toast.error('You do not have access to this location.');
					router.push(`/accounts/${accountId}`);
					return;
				}

				setAccountName(account.accountName ?? null);
				setAccountImage(account.imageBase64 || account.accountImage || null);
				setLocationName(location.locationName);

				const settingsResponse = await getLineCheckSettings(locationId);
				if (!cancelled) {
					setDailyGoal(
						Math.max(1, settingsResponse.data?.dailyGoal ?? DEFAULT_DAILY_GOAL),
					);
				}
			} catch (error) {
				if (!cancelled) {
					toast.error(
						error instanceof Error
							? error.message
							: 'Failed to load this location.',
					);
					router.push('/accounts');
				}
			} finally {
				if (!cancelled) setLoadingAccess(false);
			}
		};

		loadLocation();
		return () => {
			cancelled = true;
		};
	}, [loading, user?.id, accountId, locationId, router]);

	if (loading || loadingAccess) {
		return (
			<div className="flex items-center justify-center py-40 text-xl text-chart-3">
				<Spinner />
				<span className="ml-4">Loading location…</span>
			</div>
		);
	}

	return (
		<main className="flex min-h-screen overflow-hidden">
			<aside className="hidden w-1/6 shrink-0 self-stretch border-r bg-ring md:block">
				<LocationNav
					accountName={accountName}
					accountImage={accountImage}
					accountId={accountId}
					locationId={locationId}
					sessionUserRole={user?.appRole}
				/>
			</aside>

			<section className="flex min-w-0 flex-1 flex-col">
				<LocationPageHeader
					accountId={accountId}
					locationId={locationId}
					accountName={accountName}
					accountImage={accountImage}
					locationName={locationName}
					pageName="Dashboard"
					sessionUserRole={user?.appRole}
					drawerOpen={drawerOpen}
					setDrawerOpen={setDrawerOpen}
				/>

				<div className="flex-1 overflow-y-auto p-4 sm:p-6">
					<div className="mx-auto w-full max-w-7xl space-y-6">
						<div className="rounded-2xl border bg-gradient-to-br from-card via-card to-chart-3/5 px-5 py-6 shadow-sm sm:px-7">
							<TimeOfDayGreeting name={user?.name} />
							<p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
								Here is today&apos;s operational picture for {locationName || 'this location'}.
							</p>
						</div>

						<RobustLineCheckDashboard
							locationId={locationId}
							dailyGoal={dailyGoal}
						/>
					</div>
				</div>
			</section>
		</main>
	);
};

export default LocationPage;

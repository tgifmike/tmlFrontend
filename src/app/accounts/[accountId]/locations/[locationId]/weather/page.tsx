'use client';

import {
	AlertTriangle,
	CloudRain,
	Droplets,
	MapPin,
	RefreshCw,
	Wind,
} from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getAccountsForUser } from '@/app/api/accountApi';
import { getUserLocationAccess, getWeather } from '@/app/api/locationApi';
import { AppRole, type Locations } from '@/app/types';
import LocationNav from '@/components/navBar/LocationNav';
import LocationPageHeader from '@/components/navBar/LocationPageHeader';
import Spinner from '@/components/spinner/Spinner';
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { useSession } from '@/lib/auth/session-context';

interface ForecastPeriod {
	number: number;
	name: string;
	startTime: string;
	endTime?: string;
	isDaytime: boolean;
	temperature: number;
	temperatureUnit: string;
	probabilityOfPrecipitation?: {
		unitCode?: string;
		value?: number | null;
	};
	windSpeed?: string;
	windDirection?: string;
	icon: string;
	shortForecast: string;
	detailedForecast: string;
}

interface WeatherAlertFeature {
	id?: string;
	properties?: {
		event?: string;
		headline?: string;
		description?: string;
		severity?: string;
	};
}

interface WeatherResponse {
	forecast?: {
		properties?: {
			updated?: string;
			generatedAt?: string;
			periods?: ForecastPeriod[];
		};
	};
	hourly?: unknown;
	alerts?: {
		features?: WeatherAlertFeature[];
	} | WeatherAlertFeature[];
}

interface WeatherCacheEntry {
	data: WeatherResponse;
	cachedAt: number;
}

const FRESH_CACHE_MS = 15 * 60 * 1_000;
const STALE_CACHE_MS = 6 * 60 * 60 * 1_000;

const ExtendedForecastPage = () => {
	const { user, loading } = useSession();
	const sessionUserRole = user?.appRole;
	const params = useParams<{ accountId: string; locationId: string }>();
	const accountId = params.accountId;
	const locationId = params.locationId;
	const router = useRouter();

	const [loadingAccess, setLoadingAccess] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [weatherError, setWeatherError] = useState<string | null>(null);
	const [weather, setWeather] = useState<WeatherResponse | null>(null);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const [currentLocation, setCurrentLocation] = useState<Locations | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);

	const fetchForecast = useCallback(
		async (
			location: Locations,
			options: { showSuccess?: boolean; showError?: boolean } = {},
		) => {
			const latitude = Number(location.locationLatitude);
			const longitude = Number(location.locationLongitude);
			if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
				const message = 'This location does not have valid coordinates yet.';
				setWeatherError(message);
				if (options.showError) toast.error(message);
				return;
			}

			setRefreshing(true);
			setWeatherError(null);
			try {
				const response = await getWeather(latitude, longitude);
				if (response.error) throw new Error(response.error);
				const data = response.data as WeatherResponse;
				if (!data?.forecast?.properties?.periods?.length) {
					throw new Error('The forecast provider returned no forecast periods.');
				}

				const updatedAt = new Date();
				setWeather(data);
				setLastUpdated(updatedAt);
				writeWeatherCache(locationId, { data, cachedAt: updatedAt.getTime() });
				if (options.showSuccess) toast.success('Forecast refreshed.');
			} catch (error) {
				const message =
					error instanceof Error ? error.message : 'Unable to fetch weather data.';
				setWeatherError(message);
				if (options.showError) toast.error(message);
			} finally {
				setRefreshing(false);
			}
		},
		[locationId],
	);

	useEffect(() => {
		if (loading || !user?.id || !accountId || !locationId) return;

		let cancelled = false;
		const loadPage = async () => {
			setLoadingAccess(true);
			const cachedForecast = readWeatherCache(locationId);
			if (cachedForecast) {
				setWeather(cachedForecast.data);
				setLastUpdated(new Date(cachedForecast.cachedAt));
			}

			try {
				const [accountsResponse, locationsResponse] = await Promise.all([
					getAccountsForUser(user.id),
					getUserLocationAccess(user.id),
				]);
				if (cancelled) return;

				const account = accountsResponse.data?.find(
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
				setCurrentLocation(location);
				setLoadingAccess(false);

				const cacheIsFresh =
					cachedForecast &&
					Date.now() - cachedForecast.cachedAt < FRESH_CACHE_MS;
				if (!cacheIsFresh) {
					await fetchForecast(location, { showError: !cachedForecast });
				}
			} catch (error) {
				if (!cancelled) {
					toast.error(
						error instanceof Error ? error.message : 'Unable to load the weather page.',
					);
					router.push('/accounts');
				}
			} finally {
				if (!cancelled) setLoadingAccess(false);
			}
		};

		loadPage();
		return () => {
			cancelled = true;
		};
	}, [loading, user?.id, accountId, locationId, router, fetchForecast]);

	const forecastPeriods = weather?.forecast?.properties?.periods ?? [];
	const currentPeriod = forecastPeriods[0];
	const extendedPeriods = forecastPeriods.slice(1);
	const alerts = useMemo(() => getWeatherAlerts(weather), [weather]);

	if (loadingAccess) {
		return (
			<div className="flex items-center justify-center py-40 text-xl text-chart-3">
				<Spinner />
				<span className="ml-4">Loading weather…</span>
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
					sessionUserRole={sessionUserRole}
				/>
			</aside>

			<section className="flex min-w-0 flex-1 flex-col">
				<LocationPageHeader
					accountId={accountId}
					locationId={locationId}
					accountName={accountName}
					accountImage={accountImage}
					locationName={currentLocation?.locationName}
					pageName="Weather"
					sessionUserRole={sessionUserRole ?? AppRole.MEMBER}
					drawerOpen={drawerOpen}
					setDrawerOpen={setDrawerOpen}
				>
					<Button
						variant="outline"
						size="sm"
						disabled={!currentLocation || refreshing}
						onClick={() =>
							currentLocation &&
							fetchForecast(currentLocation, {
								showSuccess: true,
								showError: true,
							})
						}
					>
						<RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
						{refreshing ? 'Refreshing…' : 'Refresh'}
					</Button>
				</LocationPageHeader>

				<div className="flex-1 overflow-y-auto p-4 sm:p-6">
					<div className="mx-auto w-full max-w-7xl space-y-6">
						<div className="flex flex-col gap-1 px-1 sm:flex-row sm:items-end sm:justify-between">
							<div>
								<h2 className="text-xl font-semibold tracking-tight">Extended forecast</h2>
								<p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
									<MapPin className="size-3.5" aria-hidden="true" />
									<span>{formatLocation(currentLocation)}</span>
								</p>
							</div>
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								{refreshing && <Badge variant="secondary">Updating</Badge>}
								<span>{lastUpdated ? `Updated ${formatRelativeUpdate(lastUpdated)}` : 'Waiting for forecast'}</span>
							</div>
						</div>

						{alerts.map((alert, index) => (
							<WeatherAlert key={alert.id ?? `${alert.properties?.event}-${index}`} alert={alert} />
						))}
						{weatherError && currentPeriod && (
							<Alert>
								<AlertTriangle aria-hidden="true" />
								<AlertTitle>Showing the last saved forecast</AlertTitle>
								<AlertDescription>
									<p>{weatherError}</p>
								</AlertDescription>
							</Alert>
						)}

						{currentPeriod ? (
							<CurrentForecast period={currentPeriod} />
						) : weatherError ? (
							<WeatherError
								message={weatherError}
								onRetry={() =>
									currentLocation && fetchForecast(currentLocation, { showError: true })
								}
							/>
						) : (
							<WeatherLoadingCards />
						)}

						{extendedPeriods.length > 0 && (
							<section className="space-y-4">
								<div className="flex items-center justify-between px-1">
									<h3 className="text-lg font-semibold">What’s ahead</h3>
									<span className="text-sm text-muted-foreground">{extendedPeriods.length} periods</span>
								</div>
								<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
									{extendedPeriods.map((period) => (
										<ForecastCard key={period.number} period={period} />
									))}
								</div>
							</section>
						)}
					</div>
				</div>
			</section>
		</main>
	);
};

function CurrentForecast({ period }: { period: ForecastPeriod }) {
	return (
		<Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/10 via-card to-chart-3/10 shadow-sm">
			<CardContent className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
				<div className="space-y-4">
					<div className="flex flex-wrap items-center gap-2">
						<Badge>{period.name}</Badge>
						<Badge variant="outline">{formatPeriodDate(period.startTime)}</Badge>
					</div>
					<div className="flex flex-wrap items-end gap-x-4 gap-y-2">
						<span className="text-6xl font-bold tracking-tight sm:text-7xl">
							{period.temperature}°
						</span>
						<div className="pb-2">
							<p className="text-xl font-semibold">{period.shortForecast}</p>
							<p className="text-sm text-muted-foreground">Temperature in °{period.temperatureUnit}</p>
						</div>
					</div>
					<p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
						{period.detailedForecast}
					</p>
					<WeatherFacts period={period} />
				</div>
				<Image
					src={period.icon}
					alt={`${period.shortForecast} weather icon`}
					width={180}
					height={180}
					priority
					className="mx-auto size-32 rounded-2xl border bg-background object-cover shadow-sm sm:size-40"
				/>
			</CardContent>
		</Card>
	);
}

function ForecastCard({ period }: { period: ForecastPeriod }) {
	return (
		<Card className="h-full gap-0 overflow-hidden py-0 shadow-sm transition-shadow hover:shadow-md">
			<CardHeader className="border-b bg-muted/25 p-5">
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0">
						<CardTitle className="truncate text-lg">{period.name}</CardTitle>
						<CardDescription>{formatPeriodDate(period.startTime)}</CardDescription>
					</div>
					<Badge variant={period.isDaytime ? 'secondary' : 'outline'}>
						{period.isDaytime ? 'Day' : 'Night'}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-4 p-5">
				<div className="flex items-center gap-4">
					<Image
						src={period.icon}
						alt={`${period.shortForecast} weather icon`}
						width={72}
						height={72}
						className="size-16 rounded-xl border object-cover"
					/>
					<div>
						<p className="text-3xl font-bold">{period.temperature}°</p>
						<p className="font-medium">{period.shortForecast}</p>
					</div>
				</div>
				<WeatherFacts period={period} compact />
				<p className="text-sm leading-6 text-muted-foreground">{period.detailedForecast}</p>
			</CardContent>
		</Card>
	);
}

function WeatherFacts({ period, compact = false }: { period: ForecastPeriod; compact?: boolean }) {
	const precipitation = period.probabilityOfPrecipitation?.value;
	return (
		<div className={`flex flex-wrap gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
			<span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 font-medium shadow-xs ring-1 ring-border">
				<Wind className="size-3.5 text-muted-foreground" aria-hidden="true" />
				{period.windDirection || 'Wind'} {period.windSpeed || 'not reported'}
			</span>
			<span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 font-medium shadow-xs ring-1 ring-border">
				<Droplets className="size-3.5 text-muted-foreground" aria-hidden="true" />
				{precipitation == null ? 'Precipitation unavailable' : `${precipitation}% precipitation`}
			</span>
		</div>
	);
}

function WeatherAlert({ alert }: { alert: WeatherAlertFeature }) {
	const properties = alert.properties;
	return (
		<Alert variant="destructive" className="border-destructive/30">
			<AlertTriangle aria-hidden="true" />
			<AlertTitle>{properties?.headline || properties?.event || 'Weather alert'}</AlertTitle>
			{properties?.description && (
				<AlertDescription>
					<p className="line-clamp-3 whitespace-pre-line">{properties.description}</p>
				</AlertDescription>
			)}
		</Alert>
	);
}

function WeatherError({ message, onRetry }: { message: string; onRetry: () => void }) {
	return (
		<Card className="border-dashed py-12 text-center shadow-none">
			<CardContent className="space-y-4">
				<CloudRain className="mx-auto size-9 text-muted-foreground" aria-hidden="true" />
				<div>
					<p className="font-semibold">Forecast unavailable</p>
					<p className="mt-1 text-sm text-muted-foreground">{message}</p>
				</div>
				<Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>
			</CardContent>
		</Card>
	);
}

function WeatherLoadingCards() {
	return (
		<div className="space-y-4" aria-label="Loading forecast">
			<div className="h-72 animate-pulse rounded-2xl border bg-muted/40" />
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{Array.from({ length: 3 }).map((_, index) => (
					<div key={index} className="h-72 animate-pulse rounded-2xl border bg-muted/40" />
				))}
			</div>
		</div>
	);
}

const getWeatherAlerts = (weather: WeatherResponse | null) => {
	const alerts = weather?.alerts;
	if (Array.isArray(alerts)) return alerts;
	return alerts?.features ?? [];
};

const formatLocation = (location: Locations | null) => {
	if (!location) return 'Location';
	const locality = [location.locationTown, location.locationState]
		.filter(Boolean)
		.join(', ');
	return [location.locationName, locality].filter(Boolean).join(' · ');
};

const formatPeriodDate = (startTime: string) => {
	const date = new Date(startTime);
	return Number.isNaN(date.getTime())
		? 'Date unavailable'
		: date.toLocaleDateString(undefined, {
				weekday: 'short',
				month: 'short',
				day: 'numeric',
			});
};

const formatRelativeUpdate = (updatedAt: Date) => {
	const minutes = Math.max(0, Math.round((Date.now() - updatedAt.getTime()) / 60_000));
	if (minutes < 1) return 'just now';
	if (minutes === 1) return '1 minute ago';
	if (minutes < 60) return `${minutes} minutes ago`;
	const hours = Math.round(minutes / 60);
	return `${hours} hour${hours === 1 ? '' : 's'} ago`;
};

const weatherCacheKey = (locationId: string) => `weather-forecast:${locationId}`;

const readWeatherCache = (locationId: string): WeatherCacheEntry | null => {
	if (typeof window === 'undefined') return null;
	try {
		const rawValue = localStorage.getItem(weatherCacheKey(locationId));
		if (!rawValue) return null;
		const entry = JSON.parse(rawValue) as WeatherCacheEntry;
		if (!entry?.data || !entry.cachedAt || Date.now() - entry.cachedAt > STALE_CACHE_MS) {
			localStorage.removeItem(weatherCacheKey(locationId));
			return null;
		}
		return entry;
	} catch {
		return null;
	}
};

const writeWeatherCache = (locationId: string, entry: WeatherCacheEntry) => {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(weatherCacheKey(locationId), JSON.stringify(entry));
	} catch {
		// A forecast can still be shown even when browser storage is unavailable.
	}
};

export default ExtendedForecastPage;

'use client';

import { getAccountsForUser } from '@/app/api/accountApi';
import { getUserLocationAccess, toggleLocationActive, updateLocation } from '@/app/api/locationApi';
import { AccessRole, AppRole, Locations, User } from '@/app/types';
import LineCheckSettingsForm from '@/components/locaitons/LineCheckSettingsForm';
import TemperatureCategorySettings from '@/components/settings/TemperatureCategorySettings';
import SettingsSectionNav from '@/components/settings/SettingsSectionNav';
import LocationNav from '@/components/navBar/LocationNav';
import LocationPageHeader from '@/components/navBar/LocationPageHeader';
import LocationHistoryFeed from '@/components/tableComponents/LocationHistoryFeed';
import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useSession } from '@/lib/auth/session-context';

import { US_STATES, US_TIME_ZONE_OPTIONS } from '@/lib/constants/usConstants';
import { Icons } from '@/lib/icon';
import { zodResolver } from '@hookform/resolvers/zod';
import { Activity, MapPin, MapPinned } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const LocationSettingsPage = () => {
	//icons
	const BadgeCheckMarkIcon = Icons.badgeCheck;
	const BadgeQuestionMarkIcon = Icons.badgeQuestionMark;

	//session
	const { user } = useSession();
	const currentUser = user as User | undefined;
	const sessionUserRole = user?.appRole;
	const MANAGER = currentUser?.appRole === AppRole.MANAGER;
	const SRADMIN = currentUser?.accessRole === AccessRole.SRADMIN;
	const canManageTemperatureCategories =
		MANAGER ||
		currentUser?.accessRole === AccessRole.ADMIN ||
		currentUser?.accessRole === AccessRole.SRADMIN;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;
	const isManager = user?.appRole === AppRole.MANAGER;
	const params = useParams<{ accountId: string; locationId: string; section?: string }>();
	const accountIdParam = params.accountId;
	const locationIdParam = params.locationId;
	const settingsSection = getSettingsSection(params.section);
	const invalidSettingsSection = Boolean(
		params.section && !ROUTED_SETTINGS_SECTIONS.includes(params.section as RoutedSettingsSection),
	);
	const router = useRouter();
	const canViewActivity = MANAGER || SRADMIN;
	const sectionCopy = SETTINGS_SECTION_COPY[settingsSection];

	// state
	const [hasAccess, setHasAccess] = useState(false);
	const [locationName, setLocationName] = useState<string | null>(null);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [locations, setLocations] = useState<Locations[]>([]);
	const [currentLocation, setCurrentLocation] = useState<Locations | null>(
		null
	);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
	const refreshLocationHistory = useCallback(
		() => setHistoryRefreshKey((current) => current + 1),
		[],
	);

	// Zod schema with all fields and validations
	const getSchema = (locations: Locations[] = [], currentLocationId: string) =>
		z.object({
			locationName: z
				.string()
				.min(1, 'Location name cannot be empty')
				.refine(
					(name) =>
						!locations.some(
							(l) =>
								l.locationName.toLowerCase() === name.toLowerCase() &&
								l.id !== currentLocationId
						),
					{ message: 'Location name already exists' }
				),
			locationStreet: z.string().min(1, 'Street is required'),
			locationTown: z.string().min(1, 'Town is required'),
			locationState: z
				.string()
				.min(1, 'State is required')
				.refine((val) => US_STATES.includes(val), {
					message: 'Select a valid state',
				}),
			locationZipCode: z
				.string()
				.min(5, 'ZIP code must be 5 digits')
				.max(10, 'ZIP code cannot exceed 10 characters')
				.regex(/^\d+$/, 'ZIP code must contain only digits'),
			locationTimeZoneMode: z.enum(['AUTO', 'MANUAL']),
			locationTimeZone: z.string(),
		}).superRefine((values, context) => {
			if (
				values.locationTimeZoneMode === 'MANUAL' &&
				!US_TIME_ZONE_OPTIONS.some(
					(option) => option.value === values.locationTimeZone,
				)
			) {
				context.addIssue({
					code: 'custom',
					path: ['locationTimeZone'],
					message: 'Select a valid time zone',
				});
			}
		});

	useEffect(() => {
		
		if (!user?.id) return;

		const verifyAccess = async () => {
			try {
				const response = await getAccountsForUser(user.id);
				const account = response.data?.find(
					(acc) => acc.id?.toString() === accountIdParam
				);

				if (!account) {
					toast.error('You do not have access to this account.');
					router.push('/accounts');
					return;
				}

				// Check location access
				const locationResponse = await getUserLocationAccess(user.id);

				const fetchedLocations = locationResponse.data ?? [];
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
				setAccountImage(account.imageBase64 || account.accountImage || null);
				setLocationName(location.locationName);
				setCurrentLocation(location);
			} catch (err) {
				toast.error('You do not have access to this location.');
				router.push('/accounts');
			} finally {
				// setLoadingAccess(false);
			}
		};

		verifyAccess();
	}, [user?.id, accountIdParam, locationIdParam, hasAccess, router]);

	useEffect(() => {
		if (!invalidSettingsSection) return;
		router.replace(
			`/accounts/${accountIdParam}/locations/${locationIdParam}/settings`,
		);
	}, [accountIdParam, invalidSettingsSection, locationIdParam, router]);

	useEffect(() => {
		if (!user || settingsSection !== 'activity' || canViewActivity) return;
		toast.error('Activity history is available to managers only.');
		router.replace(
			`/accounts/${accountIdParam}/locations/${locationIdParam}/settings`,
		);
	}, [accountIdParam, canViewActivity, locationIdParam, router, settingsSection, user]);

	const schema = useMemo(
		() => getSchema(locations, locationIdParam),
		[locations, locationIdParam]
	);

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			locationName: '',
			locationStreet: '',
			locationTown: '',
			locationState: '',
			locationZipCode: '',
			locationTimeZoneMode: 'AUTO',
			locationTimeZone: '',
		},
	});

	//

	useEffect(() => {
		if (!currentLocation) return;

		form.reset({
			locationName: currentLocation.locationName ?? '',
			locationStreet: currentLocation.locationStreet ?? '',
			locationTown: currentLocation.locationTown ?? '',
			locationState: currentLocation.locationState ?? '',
			locationZipCode: currentLocation.locationZipCode ?? '',
			locationTimeZoneMode: currentLocation.locationTimeZoneMode ?? 'AUTO',
			locationTimeZone: normalizeLegacyTimeZone(currentLocation.locationTimeZone),
		});
	}, [currentLocation, form]);

	const watchedValues = form.watch();
	const isChanged =
		watchedValues.locationName !== currentLocation?.locationName ||
		watchedValues.locationStreet !== currentLocation?.locationStreet ||
		watchedValues.locationTown !== currentLocation?.locationTown ||
		watchedValues.locationState !== currentLocation?.locationState ||
		watchedValues.locationZipCode !== currentLocation?.locationZipCode ||
		watchedValues.locationTimeZoneMode !==
			(currentLocation?.locationTimeZoneMode ?? 'AUTO') ||
		(watchedValues.locationTimeZoneMode === 'MANUAL' &&
			watchedValues.locationTimeZone !==
				normalizeLegacyTimeZone(currentLocation?.locationTimeZone));

	const onSubmit = async (values: z.infer<typeof schema>) => {
		// Ensure currentLocation is loaded before proceeding
		if (!currentLocation) {
			toast.error('Location not loaded');
			return;
		}

		// Check for duplicate location name
		const duplicate = locations.some(
			(l) =>
				l.locationName.toLowerCase() === values.locationName.toLowerCase() &&
				l.id !== currentLocation.id
		);
		if (duplicate) {
			toast.error('Location name already exists');
			return;
		}

		try {
			const updates: Partial<Record<string, any>> = {};
			(Object.keys(values) as Array<keyof typeof values>).forEach((key) => {
				const newValue = values[key];
				const oldValue = key === 'locationTimeZoneMode'
					? currentLocation.locationTimeZoneMode ?? 'AUTO'
					: key === 'locationTimeZone'
						? normalizeLegacyTimeZone(currentLocation.locationTimeZone)
						: (currentLocation as any)[key];
				if (newValue != null && newValue !== oldValue) {
					updates[key as string] = newValue;
				}
			});
			if (
				values.locationTimeZoneMode === 'MANUAL' &&
				('locationTimeZoneMode' in updates || 'locationTimeZone' in updates)
			) {
				updates.locationTimeZoneMode = 'MANUAL';
				updates.locationTimeZone = values.locationTimeZone;
			}

			

			if (!user?.id) {
				toast.error('You must be logged in to update a location.');
				return;
			}

			const { data, error } = await updateLocation(
				currentLocation.id!,
				user.id,
				updates
			);

			if (error) {
				if (error.toLowerCase().includes('exists')) {
					toast.error('Location name already exists');
					return;
				}
				toast.error(error);
				return;
			}

			// update local state instead of onUpdate()
			if (data) {
				setCurrentLocation((prev) => ({
					...prev!,
					...data,
				}));
				setLocationName(data.locationName);

				toast.success('Location updated successfully');
			}
		} catch (error: any) {
			const message =
				error?.response?.data?.message ||
				error?.message ||
				'Failed to update location';
			toast.error(message);
		}
	};

	//toggle location active
	const handleToggleActive = async (locationId: string, checked: boolean) => {
		// Optimistically update locations state
		setLocations((prev) =>
			prev.map((loc) =>
				loc.id === locationId ? { ...loc, locationActive: checked } : loc
			)
		);

		// Also update currentLocation if it matches
		if (currentLocation?.id === locationId) {
			setCurrentLocation({ ...currentLocation, locationActive: checked });
		}

		try {
			if (!user?.id) {
				toast.error('You must be logged in to update a location.');
				return;
			}

			await toggleLocationActive(locationId, checked, user.id);
		} catch (error: any) {
			// Rollback both states
			setLocations((prev) =>
				prev.map((loc) =>
					loc.id === locationId ? { ...loc, locationActive: !checked } : loc
				)
			);
			if (currentLocation?.id === locationId) {
				setCurrentLocation({ ...currentLocation, locationActive: !checked });
			}
			toast.error(
				'Failed to update location status: ' + (error?.message || error)
			);
		}
	};


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
			<section className="flex min-w-0 flex-1 flex-col">
				<LocationPageHeader
					accountId={accountIdParam}
					locationId={locationIdParam}
					accountName={accountName}
					accountImage={accountImage}
					locationName={locationName}
					pageName={settingsSection === 'general' ? 'Settings' : SETTINGS_SECTION_LABELS[settingsSection]}
					parentCrumb={settingsSection === 'general' ? undefined : {
						label: 'Settings',
						href: `/accounts/${accountIdParam}/locations/${locationIdParam}/settings`,
					}}
					sessionUserRole={sessionUserRole}
					drawerOpen={drawerOpen}
					setDrawerOpen={setDrawerOpen}
				/>
				<div className="flex-1 overflow-y-auto bg-muted/20">
					<div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
						<div>
							<h2 className="text-2xl font-semibold tracking-tight">{sectionCopy.title}</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								{sectionCopy.description}
							</p>
						</div>

						<SettingsSectionNav
							accountId={accountIdParam}
							locationId={locationIdParam}
							canViewActivity={canViewActivity}
						/>

						{settingsSection === 'general' && (
						<>
						<Card className="rounded-2xl border-border/60 bg-card shadow-sm">
							<CardHeader className="gap-4 border-b border-border/50 sm:flex sm:flex-row sm:items-start sm:justify-between">
							<div>
								<CardTitle className="flex items-center gap-2 text-xl">
									<MapPin className="size-5 text-primary" aria-hidden="true" />
									Location information
								</CardTitle>
								<CardDescription className="mt-2">
									Update the location name and address. The time zone is detected from its coordinates.
								</CardDescription>
							</div>
							<CardAction>
								<Button
									type="submit"
									form="location-form"
									disabled={!isChanged || form.formState.isSubmitting}
								>
									{form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
								</Button>
							</CardAction>
							</CardHeader>
							<CardContent className="pt-6">
							<Form {...form}>
								<form
									id="location-form"
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-4"
								>
									<FormField
										control={form.control}
										name="locationName"
										render={({ field }) => (
											<FormItem className="rounded-xl border border-border/60 bg-muted/15 px-4 py-4">
												<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,1fr)] sm:items-center">
													<div className="space-y-1">
														<FormLabel className="text-sm font-medium text-muted-foreground">
															Location Name
														</FormLabel>
														<p className="text-xs text-muted-foreground">
															Display name for this location
														</p>
													</div>

													<div>
														<FormControl>
															<Input
																placeholder="Enter location name"
															className="w-full bg-background sm:text-right"
																disabled={!isManager}
																{...field}
															/>
														</FormControl>
													</div>
												</div>

												<FormMessage className="pt-2 text-right" />
											</FormItem>
										)}
									/>

									<div className="space-y-3">
										<p className="text-sm font-medium text-muted-foreground px-1">
											Address
										</p>

										<div className="overflow-hidden rounded-xl border border-border/60 bg-muted/15">
											<div className="px-4 py-3">
												<FormField
													control={form.control}
													name="locationStreet"
													render={({ field }) => (
														<FormItem className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,1fr)] sm:items-center">
															<FormLabel>Street</FormLabel>
															<FormControl>
																<Input
																	placeholder="Enter street address"
																		className="w-full bg-background sm:text-right"
																	disabled={!isManager}
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>

											<Separator />

											<div className="px-4 py-3">
												<FormField
													control={form.control}
													name="locationTown"
													render={({ field }) => (
														<FormItem className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,1fr)] sm:items-center">
															<FormLabel>Town</FormLabel>
															<FormControl>
																<Input
																	placeholder="Enter town"
																	className="w-full bg-background sm:text-right"
																	disabled={!isManager}
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>

											<Separator />

											<div className="px-4 py-3">
												<FormField
													control={form.control}
													name="locationState"
													render={({ field }) => (
														<FormItem className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,1fr)] sm:items-center">
															<FormLabel>State</FormLabel>
															<FormControl>
																<Select
																	key={field.value}
																	onValueChange={field.onChange}
																	value={field.value ?? ''}
																	disabled={!isManager}
																>
																		<SelectTrigger className="w-full bg-background sm:justify-end">
																		<SelectValue placeholder="Select a state" />
																	</SelectTrigger>
																	<SelectContent
																		position="popper"
																		sideOffset={8}
																		className="w-1/2 rounded-2xl border border-black/5 bg-white/90 backdrop-blur-xl shadow-2xl"
																	>
																		{US_STATES.map((state) => (
																			<SelectItem key={state} value={state}>
																				{state}
																			</SelectItem>
																		))}
																	</SelectContent>
																</Select>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>

											<Separator />

											<div className="px-4 py-3">
												<FormField
													control={form.control}
													name="locationZipCode"
													render={({ field }) => (
														<FormItem className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,1fr)] sm:items-center">
															<FormLabel className="w-1/2">ZIP Code</FormLabel>
															<FormControl>
																<Input
																	placeholder="Enter ZIP code"
																	className="w-full bg-background sm:text-right"
																	disabled={!isManager}
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>

											<Separator />

											<div className="px-4 py-3">
											<div className="space-y-3">
												<div className="flex flex-wrap items-center justify-between gap-3">
													<div>
														<p className="text-sm font-medium">Time Zone</p>
														<p className="mt-1 text-xs text-muted-foreground">
															{form.watch('locationTimeZoneMode') === 'AUTO'
																? 'Automatically detected from verified coordinates'
																: 'Manual override is active'}
														</p>
													</div>
													<Button
														type="button"
														variant="outline"
														size="sm"
														disabled={!isManager}
														onClick={() => {
															const manual = form.getValues('locationTimeZoneMode') === 'MANUAL';
															form.setValue('locationTimeZoneMode', manual ? 'AUTO' : 'MANUAL', { shouldDirty: true });
															if (!manual && !US_TIME_ZONE_OPTIONS.some((option) => option.value === form.getValues('locationTimeZone'))) {
																form.setValue('locationTimeZone', 'America/New_York', { shouldDirty: true });
															}
														}}
													>
														{form.watch('locationTimeZoneMode') === 'AUTO' ? 'Change manually' : 'Use automatic'}
													</Button>
												</div>

												{form.watch('locationTimeZoneMode') === 'MANUAL' ? (
													<FormField
														control={form.control}
														name="locationTimeZone"
														render={({ field }) => (
															<FormItem>
																<Select onValueChange={field.onChange} value={field.value} disabled={!isManager}>
																	<FormControl>
																		<SelectTrigger className="w-full bg-background">
																			<SelectValue placeholder="Select a time zone" />
																		</SelectTrigger>
																	</FormControl>
																	<SelectContent>
																		{US_TIME_ZONE_OPTIONS.map((option) => (
																			<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
																		))}
																	</SelectContent>
																</Select>
																<FormMessage />
															</FormItem>
														)}
													/>
												) : (
													<div className="rounded-lg border bg-background px-4 py-3">
														<p className="font-medium">{formatTimeZone(currentLocation?.locationTimeZone)}</p>
														{currentLocation?.locationTimeZone && <p className="mt-1 text-xs text-muted-foreground">{currentLocation.locationTimeZone}</p>}
													</div>
												)}
											</div>
											</div>
										</div>
									</div>
								</form>
							</Form>
							</CardContent>
						</Card>

						<div className="grid gap-6 lg:grid-cols-2">
							<Card className="h-full rounded-2xl border-border/60 bg-card shadow-sm">
								<CardHeader className="border-b border-border/50">
									<CardTitle className="flex items-center gap-2 text-xl">
										<Activity className="size-5 text-primary" aria-hidden="true" />
										Location status
									</CardTitle>
									<CardDescription>
										Control whether this location is available to its users.
									</CardDescription>
								</CardHeader>
								<CardContent className="flex min-h-32 items-center justify-between gap-6 pt-6">
									<div className="space-y-1">
										<p className="text-sm font-medium">Active status</p>
										<p className="text-xs text-muted-foreground">
											Inactive locations are hidden from users.
										</p>
									</div>
									<StatusSwitchOrBadge
										entity={{
											id: currentLocation?.id!,
											active: currentLocation?.locationActive!,
										}}
										getLabel={() => `Location: ${currentLocation?.locationName}`}
										onToggle={handleToggleActive}
										canToggle={canToggle}
									/>
								</CardContent>
							</Card>

							<Card className="h-full rounded-2xl border-border/60 bg-card shadow-sm">
								<CardHeader className="border-b border-border/50">
									<CardTitle className="flex items-center gap-2 text-xl">
										<MapPinned className="size-5 text-primary" aria-hidden="true" />
										Geocoded coordinates
									</CardTitle>
									<CardDescription>
										Coordinates are derived from the address, with ZIP fallback.
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4 pt-6">
									<div className="flex items-center justify-between gap-4">
										<p className="text-sm font-medium">Geocoding status</p>
										{currentLocation?.geocodedFromZipFallback ? (
											<Badge variant="destructive" className="gap-2">
												<BadgeQuestionMarkIcon className="size-4" />
												Fallback (ZIP)
											</Badge>
										) : (
											<Badge variant="secondary" className="gap-2 bg-chart-3 text-background">
												<BadgeCheckMarkIcon className="size-4" />
												Verified
											</Badge>
										)}
									</div>
									<div className="divide-y overflow-hidden rounded-xl border border-border/60 bg-muted/15">
										<div className="flex items-center justify-between px-4 py-3">
											<span className="text-sm text-muted-foreground">Latitude</span>
											<span className="text-sm font-medium tabular-nums">
												{currentLocation?.locationLatitude ?? 'N/A'}
											</span>
										</div>
										<div className="flex items-center justify-between px-4 py-3">
											<span className="text-sm text-muted-foreground">Longitude</span>
											<span className="text-sm font-medium tabular-nums">
												{currentLocation?.locationLongitude ?? 'N/A'}
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
						</>
						)}

						{settingsSection === 'line-checks' && (
							<LineCheckSettingsForm locationId={locationIdParam} userId={user?.id} />
						)}

						{settingsSection === 'temperature-categories' && (
							<TemperatureCategorySettings
								locationId={locationIdParam}
								userId={user?.id}
								canManage={canManageTemperatureCategories}
								onHistoryChange={refreshLocationHistory}
							/>
						)}

						{settingsSection === 'activity' && canViewActivity && (
							<LocationHistoryFeed
								locationId={locationIdParam}
								refreshKey={historyRefreshKey}
							/>
						)}
					</div>
				</div>
			</section>
		</main>
	);
};

export default LocationSettingsPage;

type RoutedSettingsSection = 'line-checks' | 'temperature-categories' | 'activity';
type SettingsSection = 'general' | RoutedSettingsSection;

const ROUTED_SETTINGS_SECTIONS: readonly RoutedSettingsSection[] = [
	'line-checks',
	'temperature-categories',
	'activity',
];

const SETTINGS_SECTION_COPY: Record<
	SettingsSection,
	{ title: string; description: string }
> = {
	general: {
		title: 'General settings',
		description: 'Manage this location’s identity, address, status, coordinates, and time zone.',
	},
	'line-checks': {
		title: 'Line check settings',
		description: 'Set the reporting week, daily completion target, and operating-day cutoff.',
	},
	'temperature-categories': {
		title: 'Temperature category settings',
		description: 'Manage the acceptable temperature ranges available to this location’s items.',
	},
	activity: {
		title: 'Settings activity',
		description: 'Review manager-level location changes and audit history.',
	},
};

const SETTINGS_SECTION_LABELS: Record<RoutedSettingsSection, string> = {
	'line-checks': 'Line Checks',
	'temperature-categories': 'Temperature Categories',
	activity: 'Activity',
};

function getSettingsSection(value?: string): SettingsSection {
	return ROUTED_SETTINGS_SECTIONS.includes(value as RoutedSettingsSection)
		? (value as RoutedSettingsSection)
		: 'general';
}

function normalizeLegacyTimeZone(value?: string | null) {
	if (!value) return '';
	if (US_TIME_ZONE_OPTIONS.some((option) => option.value === value)) return value;

	const legacyMatch = US_TIME_ZONE_OPTIONS.find((option) =>
		value.toLocaleLowerCase().includes(option.label.split(' Time')[0].toLocaleLowerCase()),
	);
	return legacyMatch?.value ?? value;
}

function formatTimeZone(value?: string | null) {
	if (!value) return 'Waiting for automatic detection';
	const normalized = normalizeLegacyTimeZone(value);
	return US_TIME_ZONE_OPTIONS.find((option) => option.value === normalized)?.label ?? value;
}

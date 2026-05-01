'use client';

import { getAccountsForUser } from '@/app/api/accountApi';
import { getUserLocationAccess, toggleLocationActive, updateLocation } from '@/app/api/locationApi';
import { AccessRole, AppRole, Locations, User } from '@/app/types';
import LineCheckSettingsForm from '@/components/locaitons/LineCheckSettingsForm';
import LocationNav from '@/components/navBar/LocationNav';
import MobileDrawerNav from '@/components/navBar/MoibileDrawerNav';
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useSession } from '@/lib/auth/session-context';

import { US_STATES, US_TIME_ZONES } from '@/lib/constants/usConstants';
import { Icons } from '@/lib/icon';
import { zodResolver } from '@hookform/resolvers/zod';
import { se } from 'date-fns/locale';
import { useParams } from 'next/navigation';
import router from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const LocationSettingsPage = () => {
	//icons
	const BadgeCheckMarkIcon = Icons.badgeCheck;
	const BadgeQuestionMarkIcon = Icons.badgeQuestionMark;

	//session
	const { user, loading, logout } = useSession();
	const currentUser = user as User | undefined;
	const sessionUserRole = user?.appRole;
	const MANAGER = currentUser?.appRole === AppRole.MANAGER;
	const SRADMIN = currentUser?.accessRole === AccessRole.SRADMIN;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;
	const isManager = user?.appRole === AppRole.MANAGER;
	const params = useParams<{ accountId: string; locationId: string }>();
	const accountIdParam = params.accountId;
	const locationIdParam = params.locationId;

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
			locationTimeZone: z
				.string()
				.min(1, 'Time zone is required')
				.refine((val) => US_TIME_ZONES.includes(val), {
					message: 'Select a valid time zone',
				}),
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
				setAccountImage(account.imageBase64 || null);
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
	}, [user?.userId, accountIdParam, locationIdParam, hasAccess]);

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
			locationTimeZone: currentLocation.locationTimeZone ?? '',
		});
	}, [currentLocation, form]);

	const watchedValues = form.watch();
	const isChanged =
		watchedValues.locationName !== currentLocation?.locationName ||
		watchedValues.locationStreet !== currentLocation?.locationStreet ||
		watchedValues.locationTown !== currentLocation?.locationTown ||
		watchedValues.locationState !== currentLocation?.locationState ||
		watchedValues.locationZipCode !== currentLocation?.locationZipCode ||
		watchedValues.locationTimeZone !== currentLocation?.locationTimeZone;

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
				const oldValue = (currentLocation as any)[key];
				if (newValue != null && newValue !== oldValue) {
					updates[key as string] = newValue;
				}
			});

			

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
			if (!user?.userId) {
				toast.error('You must be logged in to update a location.');
				return;
			}

			await toggleLocationActive(locationId, checked, user.userId);
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
						<h1 className="text-3xl font-bold mb-4">{locationName}</h1>
					</div>
					<p className="text-3xl font-bold mb-4">Location Settings</p>
				</header>
				<div className="flex flex-col items-center">
					<Card className="w-2/3 mx-auto m-4 rounded-3xl border border-white/20 bg-accent backdrop-blur-2xl shadow-xl">
						<CardHeader className="pb-2">
							<CardTitle className="text-2xl">Location Information</CardTitle>
							<CardDescription>You can update fields here</CardDescription>
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
						<CardContent>
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
											<FormItem className="rounded-2xl border border-border/60 bg-background/80 px-4 py-4 shadow-sm">
												<div className="flex items-center justify-between gap-6">
													<div className="space-y-1 min-w-[180px]">
														<FormLabel className="text-sm font-medium text-muted-foreground">
															Location Name
														</FormLabel>
														<p className="text-xs text-muted-foreground">
															Display name for this location
														</p>
													</div>

													<div className="w-1/2">
														<FormControl>
															<Input
																placeholder="Enter location name"
																className="w-56 border-0 bg-transparent shadow-none text-right focus-visible:ring-0"
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

										<div className="rounded-2xl border overflow-hidden">
											<div className="px-4 py-3">
												<FormField
													control={form.control}
													name="locationStreet"
													render={({ field }) => (
														<FormItem className="flex justify-between items-center">
															<FormLabel>Street</FormLabel>
															<FormControl>
																<Input
																	placeholder="Enter street address"
																	className="w-56 border-0 bg-transparent shadow-none text-right focus-visible:ring-0"
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
														<FormItem className="flex justify-between items-center">
															<FormLabel>Town</FormLabel>
															<FormControl>
																<Input
																	placeholder="Enter town"
																	className="w-56 border-0 bg-transparent shadow-none text-right focus-visible:ring-0"
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
														<FormItem className="flex justify-between items-center">
															<FormLabel>State</FormLabel>
															<FormControl>
																<Select
																	key={field.value}
																	onValueChange={field.onChange}
																	value={field.value ?? ''}
																	disabled={!isManager}
																>
																	<SelectTrigger className="w-56 border-0 bg-transparent shadow-none justify-end">
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
														<FormItem className="flex justify-between items-center">
															<FormLabel className="w-1/2">ZIP Code</FormLabel>
															<FormControl>
																<Input
																	placeholder="Enter ZIP code"
																	className="w-56 border-0 bg-transparent shadow-none text-right focus-visible:ring-0"
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
													name="locationTimeZone"
													render={({ field }) => (
														<FormItem className="flex justify-between items-center">
															<FormLabel>Time Zone</FormLabel>
															<FormControl>
																<Select
																	key={field.value}
																	onValueChange={field.onChange}
																	value={field.value}
																	disabled={!isManager}
																>
																	<SelectTrigger className="w-56 border-0 bg-transparent shadow-none justify-end">
																		<SelectValue placeholder="Select a time zone" />
																	</SelectTrigger>
																	<SelectContent>
																		{US_TIME_ZONES.map((tz) => (
																			<SelectItem key={tz} value={tz}>
																				{tz}
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
										</div>
									</div>
								</form>
							</Form>
						</CardContent>
					</Card>

					{/* status */}
					<Card className="w-2/3 mx-auto m-4 rounded-2xl border border-border/40 bg-accent shadow-xl">
						<CardHeader className="pb-3">
							<CardTitle className="text-lg font-semibold">
								Location Status
							</CardTitle>
							<CardDescription className="text-sm text-muted-foreground">
								Controls whether this location is active in the system
							</CardDescription>
						</CardHeader>

						<CardContent className="flex items-center justify-between py-4">
							{/* LEFT SIDE (context) */}
							<div className="space-y-1">
								<p className="text-sm font-medium">Active Status</p>
								<p className="text-xs text-muted-foreground">
									Inactive locations will be hidden from users
								</p>
							</div>

							{/* RIGHT SIDE (control) */}
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

					{/* coordinates */}
					<Card className="w-2/3 mx-auto m-4 rounded-2xl border border-border/40 bg-accent shadow-xl">
						<CardHeader className="pb-3">
							<CardTitle className="text-lg font-semibold">
								Geo Synced Coordinates
							</CardTitle>
							<CardDescription className="text-sm text-muted-foreground">
								Coordinates are derived from the address. If unavailable, ZIP
								code fallback is used (less accurate).
							</CardDescription>
						</CardHeader>

						<CardContent className="space-y-6">
							{/* STATUS ROW */}
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<p className="text-sm font-medium">Geocoding Status</p>
									<p className="text-xs text-muted-foreground">
										Indicates how coordinates were resolved
									</p>
								</div>

								{currentLocation?.geocodedFromZipFallback ? (
									<Badge variant="destructive" className="gap-2">
										<BadgeQuestionMarkIcon className="w-4 h-4" />
										Fallback (ZIP)
									</Badge>
								) : (
									<Badge
										variant="secondary"
										className="gap-2 bg-chart-3 text-background"
									>
										<BadgeCheckMarkIcon className="w-4 h-4" />
										Verified
									</Badge>
								)}
							</div>

							{/* COORDINATES SECTION */}
							<div className="rounded-xl border border-border/30 divide-y divide-border/20 overflow-hidden">
								<div className="flex items-center justify-between px-4 py-3">
									<span className="text-sm text-muted-foreground">
										Latitude
									</span>
									<span className="text-sm font-medium">
										{currentLocation?.locationLatitude ?? 'N/A'}
									</span>
								</div>

								<div className="flex items-center justify-between px-4 py-3">
									<span className="text-sm text-muted-foreground">
										Longitude
									</span>
									<span className="text-sm font-medium">
										{currentLocation?.locationLongitude ?? 'N/A'}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="flex w-2/3 mx-auto">
					<LineCheckSettingsForm
						locationId={locationIdParam}
						userId={user?.userId}
					/>
				</div>

				<div className="flex justify-center items-center">
					{(SRADMIN || MANAGER) && (
						<LocationHistoryFeed accountId={accountIdParam} />
					)}
				</div>
			</section>
		</main>
	);
};

export default LocationSettingsPage;

'use client';

import { getAccountsForUser } from '@/app/api/accountApi';
import { getUserLocationAccess, toggleLocationActive, updateLocation } from '@/app/api/locationApi';
import { AppRole, Locations, User } from '@/app/types';
import LineCheckSettingsForm from '@/components/locaitons/LineCheckSettingsForm';
import LocationNav from '@/components/navBar/LocationNav';
import MobileDrawerNav from '@/components/navBar/MoibileDrawerNav';
import Spinner from '@/components/spinner/Spinner';
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
import { US_STATES, US_TIME_ZONES } from '@/lib/constants/usConstants';
import { Icons } from '@/lib/icon';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
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
	const { data: session, status } = useSession();
	const currentUser = session?.user as User | undefined;
	const sessionUserRole = session?.user?.appRole;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;
	const isManager = session?.user?.appRole === AppRole.MANAGER;
	const params = useParams<{ accountId: string; locationId: string }>();
	const accountIdParam = params.accountId;
	const locationIdParam = params.locationId;

	// state
	const [loadingAccess, setLoadingAccess] = useState(true);
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
				setLoadingAccess(false);
			}
		};

		verifyAccess();
	}, [status, session?.user?.id, accountIdParam, locationIdParam, hasAccess]);

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

			//console.log('Updates going to backend:', updates);

			const { data, error } = await updateLocation(currentLocation.id!, updates);

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
			await toggleLocationActive(locationId, checked);
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

	//show loadding state
	if (loadingAccess)
		return (
			<div className="flex justify-center items-center py-40  text-chart-3 text-xl">
				<Spinner />
				<span className="ml-4">Loading Location Settings…</span>
			</div>
		);

	return (
		<main className="flex min-h-screen overflow-hidden bg-accent">
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
					<p  className="text-3xl font-bold mb-4">Location Settings</p>
				</header>
				<div className="flex">
					<Card className="w-2/3 mx-auto m-4">
						<CardHeader>
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
											<FormItem className="flex gap-5">
												<FormLabel className="text-lg">
													Location Name:
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Location Name"
														className="w-1/2"
														disabled={!isManager}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="space-y-2 border p-4 rounded-2xl">
										<p className="text-xl">Address:</p>

										<FormField
											control={form.control}
											name="locationStreet"
											render={({ field }) => (
												<FormItem className="flex gap-4">
													<FormLabel>Street</FormLabel>
													<FormControl>
														<Input
															placeholder="Enter street"
															className="w-1/2"
															disabled={!isManager}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<div className="flex gap-16 items-center">
											<FormField
												control={form.control}
												name="locationTown"
												render={({ field }) => (
													<FormItem className="flex gap-5">
														<FormLabel>Town</FormLabel>
														<FormControl>
															<Input
																placeholder="Enter town"
																className="w-3/4"
																disabled={!isManager}
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="locationState"
												render={({ field }) => (
													<FormItem className="flex gap-5">
														<FormLabel>State</FormLabel>
														<FormControl>
															<Select
																key={field.value}
																onValueChange={field.onChange}
																value={field.value ?? ''}
																disabled={!isManager}
															>
																<SelectTrigger>
																	<SelectValue placeholder="Select a state" />
																</SelectTrigger>
																<SelectContent className="max-h-60 overflow-y-auto">
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

											<FormField
												control={form.control}
												name="locationZipCode"
												render={({ field }) => (
													<FormItem className="flex gap-5">
														<FormLabel className="">ZIP Code</FormLabel>
														<FormControl>
															<Input
																placeholder="Enter ZIP code"
																className="w-1/2"
																disabled={!isManager}
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<FormField
											control={form.control}
											name="locationTimeZone"
											render={({ field }) => (
												<FormItem className="flex gap-5">
													<FormLabel>Time Zone</FormLabel>
													<FormControl>
														<Select
															key={field.value}
															onValueChange={field.onChange}
															value={field.value}
															disabled={!isManager}
														>
															<SelectTrigger className="border rounded-md p-2">
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
								</form>
							</Form>
						</CardContent>
					</Card>

					<div className="flex flex-col w-1/3">
						{/* coordinates */}
						<Card className=" mx-auto m-4">
							<CardHeader>
								<CardTitle>Geo Synced Coordinates</CardTitle>
								<CardDescription>
									These coordinates come from your address, if address is not
									found the zipcode will be used for fallback but is not as
									accurate
								</CardDescription>
							</CardHeader>
							<CardContent className="">
								<div className="pb-3">
									{currentLocation?.geocodedFromZipFallback ? (
										<Badge className="text-lg" variant="destructive">
											<BadgeQuestionMarkIcon className="w-5! h-5!" />
											Failed back on ZIP Code
										</Badge>
									) : (
										<Badge
											className="bg-chart-3 text-background text-lg"
											variant="secondary"
										>
											<BadgeCheckMarkIcon className="w-5! h-5!" />
											Verified
										</Badge>
									)}
								</div>
								<div className="flex gap-8">
									<Label className="text-xl">Longitude:</Label>
									<Label className="text-xl">
										{currentLocation?.locationLongitude ?? 'N/A'}
									</Label>
								</div>
								<div className="flex gap-8">
									<Label className="text-xl">Latitude:</Label>
									<Label className="text-xl">
										{currentLocation?.locationLatitude ?? 'N/A'}
									</Label>
								</div>
							</CardContent>
						</Card>

						{/* status */}
						<Card className="mx-auto m-4">
							<CardHeader>
								<CardTitle>Location Status</CardTitle>
								<CardDescription>
									This will show if location is active
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-4">
									<Label className="text-xl">Status:</Label>
									<StatusSwitchOrBadge
										entity={{
											id: currentLocation?.id!,
											active: currentLocation?.locationActive!,
										}}
										getLabel={() =>
											`Location: ${currentLocation?.locationName}`
										}
										onToggle={handleToggleActive}
										canToggle={canToggle}
									/>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
				<LineCheckSettingsForm locationId={locationIdParam} />
			</section>
		</main>
	);
};

export default LocationSettingsPage;

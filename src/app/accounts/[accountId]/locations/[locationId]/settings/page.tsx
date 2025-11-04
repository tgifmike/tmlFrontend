'use client';

import { getAccountsForUser } from '@/app/api/accountApi';
import { getUserLocationAccess, toggleLocationActive, updateLocation } from '@/app/api/locationApi';
import { AppRole, Locations, User } from '@/app/types';
import LocationNav from '@/components/navBar/LocationNav';
import MobileDrawerNav from '@/components/navBar/MoibileDrawerNav';
import Spinner from '@/components/spinner/Spinner';
import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { US_STATES, US_TIME_ZONES } from '@/lib/constants/usConstants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import App from 'next/app';
import { useParams } from 'next/navigation';
import router from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z, { set } from 'zod';

const LocationSettingsPage = () => {
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
	}, [
		status,
		session?.user?.id,
		accountIdParam,
		locationIdParam,

		hasAccess,
	]);

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

			const { error } = await updateLocation(currentLocation.id!, updates);

			if (error) {
				if (error.toLowerCase().includes('exists')) {
					toast.error('Location name already exists');
					return;
				}
				toast.error(error);
				return;
			}

			// ✅ update local state instead of onUpdate()
			setCurrentLocation((prev) => ({
				...prev!,
				...values,
			}));
			setLocationName(values.locationName);

			toast.success('Location updated successfully');
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
						<h1 className="text-3xl font-bold mb-4">{locationName}</h1>
						</div>
				</header>
				<div className="w-3/4 mx-auto mt-4 bg-accent p-4 rounded-2xl shadow-2xl">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<div className="bg-background p-4 rounded-2xl">
								{/* <p>Location Name: </p> */}
								<FormField
									control={form.control}
									name="locationName"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xl">Location Name:</FormLabel>
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
							</div>

							<div className="bg-background p-4 rounded-2xl ">
								<p className="text-xl">Address:</p>

								<div className="flex p-2 gap-10">
									<FormField
										control={form.control}
										name="locationStreet"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Street</FormLabel>
												<FormControl>
													<Input
														placeholder="Enter street"
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
										name="locationTown"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Town</FormLabel>
												<FormControl>
													<Input
														placeholder="Enter town"
														disabled={!isManager}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="flex gap-10 p-2">
									<FormField
										control={form.control}
										name="locationState"
										render={({ field }) => (
											<FormItem>
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
											<FormItem>
												<FormLabel>ZIP Code</FormLabel>
												<FormControl>
													<Input
														placeholder="Enter ZIP code"
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
										name="locationTimeZone"
										render={({ field }) => (
											<FormItem>
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
							</div>

							<DialogFooter>
								<Button
									type="submit"
									disabled={!isChanged || form.formState.isSubmitting}
								>
									{form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</div>
				<div className="w-3/4 mx-auto flex justify-between items-center p-4 bg-accent rounded-2xl shadow-2xl mt-5">
					Status:
					<StatusSwitchOrBadge
						entity={{
							id: currentLocation?.id!,
							active: currentLocation?.locationActive!,
						}}
						getLabel={() => `Location: ${currentLocation?.locationName}`}
						onToggle={handleToggleActive}
						canToggle={canToggle}
					/>
				</div>
			</section>
		</main>
	);
};

export default LocationSettingsPage;

'use client';

import { Locations } from '@/app/types';
import { US_STATES, US_TIME_ZONE_OPTIONS } from '@/lib/constants/usConstants';
import { Icons } from '@/lib/icon';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTrigger } from '@radix-ui/react-dialog';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { Button } from '../ui/button';
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { updateLocation } from '@/app/api/locationApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type EditLocationProps = {
	location: Locations;
	locations?: Locations[];
	userId: string
	onUpdate: (
		id: string,
		updatedLocation: Locations,
	) => void;
};

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
			!US_TIME_ZONE_OPTIONS.some((option) => option.value === values.locationTimeZone)
		) {
			context.addIssue({
				code: 'custom',
				path: ['locationTimeZone'],
				message: 'Select a valid time zone',
			});
		}
	});

export function EditLocationDialog({
	location,
	locations = [],
	userId,
	onUpdate,
}: EditLocationProps) {
	const EditIcon = Icons.pencil;
	const [open, setOpen] = useState(false);

	const schema = useMemo(
		() => getSchema(locations, location.id!),
		[locations, location.id]
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

	//Sync form values when dialog opens or location changes
	useEffect(() => {
		if (!open) return; // only run when dialog opens
		if (!location) return;

		// Delay reset until next paint — ensures form is mounted & ready
		requestAnimationFrame(() => {
			form.reset({
				locationName: location.locationName ?? '',
				locationStreet: location.locationStreet ?? '',
				locationTown: location.locationTown ?? '',
				locationState: location.locationState ?? '',
				locationZipCode: location.locationZipCode ?? '',
				locationTimeZoneMode: location.locationTimeZoneMode ?? 'AUTO',
				locationTimeZone: normalizeLegacyTimeZone(location.locationTimeZone),
			});
		});
	}, [open, location?.id]); // only re-run when opening or switching locations

	const watchedValues = form.watch();
	const isChanged =
		watchedValues.locationName !== location.locationName ||
		watchedValues.locationStreet !== location.locationStreet ||
		watchedValues.locationTown !== location.locationTown ||
		watchedValues.locationState !== location.locationState ||
		watchedValues.locationZipCode !== location.locationZipCode ||
		watchedValues.locationTimeZoneMode !== (location.locationTimeZoneMode ?? 'AUTO') ||
		(watchedValues.locationTimeZoneMode === 'MANUAL' &&
			watchedValues.locationTimeZone !== normalizeLegacyTimeZone(location.locationTimeZone));

	const onSubmit = async (values: z.infer<typeof schema>) => {
		// Check for duplicate location name
		const duplicate = locations.some(
			(l) =>
				l.locationName.toLowerCase() === values.locationName.toLowerCase() &&
				l.id !== location.id
		);
		if (duplicate) {
			toast.error('Location name already exists');
			return;
		}

		try {
			const updates: Record<string, unknown> = {};
			(Object.keys(values) as Array<keyof typeof values>).forEach((key) => {
				const newValue = values[key];
				const oldValue = key === 'locationTimeZoneMode'
					? location.locationTimeZoneMode ?? 'AUTO'
					: key === 'locationTimeZone'
						? normalizeLegacyTimeZone(location.locationTimeZone)
						: location[key];
				if (newValue != null && newValue !== oldValue) {
					updates[key] = newValue;
				}
			});
			if (
				values.locationTimeZoneMode === 'MANUAL' &&
				('locationTimeZoneMode' in updates || 'locationTimeZone' in updates)
			) {
				updates.locationTimeZoneMode = 'MANUAL';
				updates.locationTimeZone = values.locationTimeZone;
			}
            
           // console.log('Updates going to backend:', updates);


			const { data, error } = await updateLocation(location.id!, userId, updates);

			if (error) {
				if (error.toLowerCase().includes('exists')) {
					toast.error('Location name already exists');
					return;
				}
				toast.error(error);
				return;
			}

			if (!data) {
				toast.error('The server did not return the updated location.');
				return;
			}

			onUpdate(location.id!, data);

			//toast.success('Location updated successfully');
			setOpen(false);
		} catch (error: any) {
			const message =
				error?.response?.data?.message ||
				error?.message ||
				'Failed to update location';
			toast.error(message);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" className="text-chart-3">
					<EditIcon className="!w-[30px] !h-[30px]" />
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Location</DialogTitle>
					<DialogDescription>
						Update the location details below.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="locationName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Location Name</FormLabel>
									<FormControl>
										<Input placeholder="Location Name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="locationStreet"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Street</FormLabel>
									<FormControl>
										<Input placeholder="Enter street" {...field} />
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
									<FormLabel>City</FormLabel>
									<FormControl>
										<Input placeholder="Enter town" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="locationState"
							render={({ field }) => (
								<FormItem>
									<FormLabel>State</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a state" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{US_STATES.map((state) => (
												<SelectItem key={state} value={state}>
													{state}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
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
										<Input placeholder="Enter ZIP code" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="space-y-3 rounded-xl border p-4">
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="text-sm font-medium">Time Zone</p>
									<p className="text-xs text-muted-foreground">
										{form.watch('locationTimeZoneMode') === 'AUTO' ? 'Detected from coordinates' : 'Manual override'}
									</p>
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
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
											<Select onValueChange={field.onChange} value={field.value}>
												<FormControl><SelectTrigger><SelectValue placeholder="Select a time zone" /></SelectTrigger></FormControl>
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
								<p className="text-sm font-medium">{formatTimeZone(location.locationTimeZone)}</p>
							)}
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
			</DialogContent>
		</Dialog>
	);
}

function normalizeLegacyTimeZone(value?: string | null) {
	if (!value) return '';
	if (US_TIME_ZONE_OPTIONS.some((option) => option.value === value)) return value;
	const match = US_TIME_ZONE_OPTIONS.find((option) =>
		value.toLocaleLowerCase().includes(option.label.split(' Time')[0].toLocaleLowerCase()),
	);
	return match?.value ?? value;
}

function formatTimeZone(value?: string | null) {
	if (!value) return 'Waiting for automatic detection';
	const normalized = normalizeLegacyTimeZone(value);
	return US_TIME_ZONE_OPTIONS.find((option) => option.value === normalized)?.label ?? value;
}

'use client';

import { Locations } from '@/app/types';
import { US_STATES, US_TIME_ZONES } from '@/lib/constants/usConstants';
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
		updatedFields: {
			locationName: string;
			locationStreet: string;
			locationTown: string;
			locationState: string;
			locationZipCode: string;
			locationTimeZone: string;
		}
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
		locationTimeZone: z
			.string()
			.min(1, 'Time zone is required')
			.refine((val) => US_TIME_ZONES.includes(val), {
				message: 'Select a valid time zone',
			}),
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
				locationTimeZone: location.locationTimeZone ?? '',
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
		watchedValues.locationTimeZone !== location.locationTimeZone;

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
			const updates: Partial<typeof values> = {};
			(Object.keys(values) as Array<keyof typeof values>).forEach((key) => {
				const newValue = values[key];
				const oldValue = location[key];
				if (newValue != null && newValue !== oldValue) {
					updates[key] = newValue;
				}
            });
            
           // console.log('Updates going to backend:', updates);


			const { error } = await updateLocation(location.id!, userId, updates);

			if (error) {
				if (error.toLowerCase().includes('exists')) {
					toast.error('Location name already exists');
					return;
				}
				toast.error(error);
				return;
			}

			// Update local state
	onUpdate(location.id!, {
		locationName: values.locationName,
		locationStreet: values.locationStreet,
		locationTown: values.locationTown,
		locationState: values.locationState,
		locationZipCode: values.locationZipCode,
		locationTimeZone: values.locationTimeZone,
	});

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
									<FormLabel>Town</FormLabel>
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

						<FormField
							control={form.control}
							name="locationTimeZone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Time Zone</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a time zone" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{US_TIME_ZONES.map((tz) => (
												<SelectItem key={tz} value={tz}>
													{tz}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

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

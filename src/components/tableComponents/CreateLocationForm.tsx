'use client';

import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { DialogDescription } from '@radix-ui/react-dialog';
import { createLocation } from '@/app/api/locationApi';
import { Locations } from '@/app/types';
import { Icons } from '@/lib/icon';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import z from 'zod';
import { Button } from '../ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../ui/form';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { US_STATES, US_TIME_ZONES } from '@/lib/constants/usConstants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type CreateLocationDialogProps = {
	onLocationCreated: (location: Locations) => void;
	existingLocations?: Locations[];
	accountId: string;
};



// Zod schema with all fields and validations
const getSchema = (locations: Locations[] = []) =>
	z.object({
		locationName: z
			.string()
			.min(1, 'Location name cannot be empty')
			.refine(
				(name) =>
					!locations.some(
						(l) => l.locationName.toLowerCase() === name.toLowerCase()
					),
				{ message: 'Location name already exists' }
			),
		street: z.string().min(1, 'Street is required'),
		town: z.string().min(1, 'Town is required'),
		state: z
			.string()
			.min(1, 'State is required')
			.refine((val) => US_STATES.includes(val), {
				message: 'Select a valid state',
			}),
		zipCode: z
			.string()
			.min(5, 'ZIP code must be 5 digits')
			.max(10, 'ZIP code cannot exceed 10 characters'),
		timeZone: z
			.string()
			.min(1, 'Time zone is required')
			.refine((val) => US_TIME_ZONES.includes(val), {
				message: 'Select a valid time zone',
			}),
	});

export default function CreateLocationDialog({
	onLocationCreated,
	existingLocations = [],
	accountId,
}: CreateLocationDialogProps) {
	const AddLocationIcon = Icons.addLocation;

	const [open, setOpen] = useState(false);

	const { data: session } = useSession();
	const userId = session?.user?.id;

	const schema = useMemo(
		() => getSchema(existingLocations),
		[existingLocations]
	);
	type FormValues = z.infer<typeof schema>;

	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			locationName: '',
			street: '',
			town: '',
			state: '',
			zipCode: '',
			timeZone: '',
		},
		mode: 'onChange',
	});

	const onSubmit = async (values: FormValues) => {
		try {
			const { data, error } = await createLocation(accountId, values);

			if (error || !data) {
				if (error?.includes('409') || error?.toLowerCase().includes('exists')) {
					toast.error('Location name already exists.');
				} else {
					toast.error('Failed to create location.');
				}
				return;
			}

			toast.success(`Location ${data.locationName} created successfully.`);
			form.reset();
			setOpen(false);
			onLocationCreated?.(data);
		} catch (error: any) {
			const message =
				error?.message?.data?.message ||
				error?.message ||
				'Failed to create location.';
			toast.error(message);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="text-chart-3 font-bold text-sm md:text-lg px-3 py-1 md:px-4 md:py-2 flex items-center gap-2"
				>
					<AddLocationIcon className="w-5 h-5 md:w-6 md:h-6" />
					<span className="hidden sm:inline">Create Location</span>
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Location</DialogTitle>
					<DialogDescription>
						Fill in the details below to create a new location.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						{/* Location Name */}
						<FormField
							control={form.control}
							name="locationName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Location Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter location name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Street */}
						<FormField
							control={form.control}
							name="street"
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

						{/* Town */}
						<FormField
							control={form.control}
							name="town"
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

						{/* State */}
						<FormField
							control={form.control}
							name="state"
							render={({ field }) => (
								<FormItem>
									<FormLabel>State</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
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

						{/* ZIP Code */}
						<FormField
							control={form.control}
							name="zipCode"
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

						{/* Time Zone */}
						<FormField
							control={form.control}
							name="timeZone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Time Zone</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
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
								disabled={
									!form.formState.isValid || form.formState.isSubmitting
								}
							>
								{form.formState.isSubmitting
									? 'Creating...'
									: 'Create Location'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

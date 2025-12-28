'use client';

import { updateStation } from '@/app/api/stationApi';
import { StationDto } from '@/app/types';
import { Icons } from '@/lib/icon';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

type EditStationProps = {
	station: StationDto;
	stations?: StationDto[];
	// locationId: string;
	currentUserId: string;
	onUpdate: (id: string, stationName: string) => void;
};

// ✅ Create Zod schema generator that checks duplicates by ignoring the current station
const getSchema = (stations: StationDto[] = [], currentStationId: string) =>
	z.object({
		stationName: z
			.string()
			.min(1, 'Station name cannot be empty.')
			.refine(
				(name) =>
					!stations.some(
						(s) =>
							s.stationName.toLowerCase() === name.toLowerCase() &&
							s.id !== currentStationId
					),
				{ message: 'Station name already exists.' }
			),
	});

export function EditStationDialog({
	station,
	stations = [],
	// locationId,
	currentUserId,
	onUpdate,
}: EditStationProps) {
	const [open, setOpen] = useState(false);
	const EditIcon = Icons.pencil;

	// ✅ Memoize schema so it updates when stations or current station change
	const schema = useMemo(
		() => getSchema(stations, station.id!),
		[stations, station.id]
	);

	type FormValues = z.infer<typeof schema>;

	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { stationName: station.stationName },
		mode: 'onChange',
	});

	const watchedValues = form.watch();
	const isChanged = watchedValues.stationName !== station.stationName;

	const onSubmit = async (values: FormValues) => {
		// Extra safety: check for duplicates
		const duplicate = stations.some(
			(s) =>
				s.stationName.toLowerCase() === values.stationName.toLowerCase() &&
				s.id !== station.id
		);
		if (duplicate) {
			toast.error(`Station "${values.stationName}" already exists.`);
			return;
		}

		try {
			await updateStation(station.id!, {
				stationName: values.stationName,
			}, currentUserId
			);

			onUpdate(station.id!, values.stationName);
			toast.success(`Station "${values.stationName}" updated successfully.`);
			setOpen(false);
		} catch (err: any) {
			// err.message might contain the backend error
			toast.error(err?.message || 'Failed to update station name.');
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
					<DialogTitle>Edit Station</DialogTitle>
					<DialogDescription>Update the station name</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="stationName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Station Name:</FormLabel>
									<FormControl>
										<Input placeholder="Station name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button
								type="submit"
								disabled={!isChanged || form.formState.isSubmitting}
							>
								{form.formState.isSubmitting ? 'Saving…' : 'Save'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

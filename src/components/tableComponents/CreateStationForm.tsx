'use client'

import { createStation } from "@/app/api/stationApi";

import { Icons } from "@/lib/icon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Station, StationDto, StationEntity } from "@/app/types";





type CreateStationDialogProps = {
    onStationCreated?: (station: StationDto) => void;
    existingStations?: StationDto[];
    locationId: string
    currentUserId: string;
}

const getSchema = (stations: StationDto[] = []) =>
    z.object({
        stationName: z
            .string()
            .min(1, 'Station name cannot be empty')
            .refine(
                (name) =>
                    !stations.some(
                        (s) => s.stationName.toLowerCase() === name.toLowerCase()
                    ),
                { message: 'Station name already exists' }
            ),
    });

export default function CreateStationDialog({
    onStationCreated,
    existingStations = [],
    locationId,
    currentUserId
}: CreateStationDialogProps) {
    
    //icons 
    const StationIcon = Icons.stations;

    //set state
    const [open, setOpen] = useState(false);

    //dynamically revaliate stations lists
    const schema = useMemo(() => getSchema(existingStations), [existingStations]);

    type FormValues = z.infer<typeof schema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { stationName: '' },
        mode: 'onChange',
    });

    const onSubmit = async (values: FormValues) => {
			try {
				const station = await createStation(locationId, values, currentUserId);

				toast.success(`Station ${station.stationName} created successfully`);
				form.reset();
				setOpen(false);
				onStationCreated?.(station);
			} catch (error: any) {
				const message =
					error?.response?.data?.message ||
					error?.message ||
					'Failed to create Station';

				if (
					message.includes('409') ||
					message.toLowerCase().includes('exists')
				) {
					toast.error('Station name already exists');
				} else {
					toast.error(message);
				}
			}
		};

    return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						variant="outline"
						className="text-chart-3 font-bold text-sm md:text-lg px-3 py-1 md:px-4 md:py-2 flex items-center gap-2"
					>
						<StationIcon className="!w-[25px] !h-[25px]" />
						<span className="hidden sm:inline">Create Station</span>
					</Button>
				</DialogTrigger>

				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Station</DialogTitle>
						<DialogDescription>
							Enter a unique name to create a new station.
						</DialogDescription>
					</DialogHeader>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="stationName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Station Name</FormLabel>
										<FormControl>
											<Input placeholder="Enter Station Name" {...field} />
										</FormControl>
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
										: 'Create Station'}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		);
}
'use client'

import { updateStation } from "@/app/api/stationApi";
import { Station } from "@/app/types";
import { Icons } from "@/lib/icon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

type EditStationsProps = {
    station: Station;
    stations?: Station[];
    onUpdate: (id: string, stationName: string) => void;
}

const getSchema = (stations: Station[] = [], currentStationId: string) =>
    z.object({
        stationName: z
            .string()
            .min(1, 'Station name cannot be empty.')
            .refine(
                (name) =>
                    !stations.some(
                        (s) =>
                            s.stationName?.toLowerCase() === name.toLowerCase() &&
                            s.id != currentStationId
                    ),
                { message: 'Staton name already exists' }
            ),
    });

export function EditStationDialog({
    station,
    stations = [],
    onUpdate,
}: EditStationsProps) {

    //icons
    const EditIcon = Icons.pencil;

    //set state
    const [open, setOpen] = useState(false);

        // ✅ Dynamically recompute schema whenever accounts or current account changes
        const schema = useMemo(
            () => getSchema(stations, station.id!),
            [stations, station.id]
        );

    // ✅ Use the memoized schema here (NOT another getSchema() call)
        const form = useForm<z.infer<typeof schema>>({
            resolver: zodResolver(schema),
            defaultValues: {
                stationName: station.stationName || '',
            },
        });
    
    const watchedValues = form.watch();
    const isChanged = watchedValues.stationName !== station.stationName;
    
    	const onSubmit = async (values: z.infer<typeof schema>) => {
				// ✅ Double-check for duplicates before hitting API (optional safety)
				const duplicate = stations.some(
					(s) =>
						s.stationName?.toLowerCase() === values.stationName.toLowerCase() &&
						s.id !== station.id
				);
				if (duplicate) {
					toast.error(`Station ${values.stationName} already exists`);
					return;
				}

				try {
					const { error } = await updateStation(
						station.id!,
						values.stationName
					);
					if (error) {
						if (error.toLowerCase().includes('exists')) {
							toast.error(`Station named " ${values.stationName} "  already exists`);
							return;
						}
						toast.error(error);
						return;
					}

					onUpdate(station.id!, values.stationName);
					setOpen(false);
					toast.success(`Station ${values.stationName} updated successfully`);
				} catch {
					toast.error('Failed to update station name.');
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
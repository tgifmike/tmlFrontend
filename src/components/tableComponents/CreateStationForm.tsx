'use client'

import { createStation } from "@/app/api/stationApi";
import { Station } from "@/app/types";
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





type CreateStationDialogProps = {
    onStationCreated?: (station: Station) => void;
    existingStations?: Station[];
    locationId: string
}

const getSchema = (stations: Station[] = []) =>
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
    locationId
}: CreateStationDialogProps) {
    
    //icons 
    const StationIcon = Icons.stations;

    //set state
    const [open, setOpen] = useState(false);

    //get user id from sessioin
    const { data: session, status } = useSession();
    const userId = session?.user.id || "";

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
            const { data, error } = await createStation(locationId, values);

            if (error || !data) {
                if (error?.includes('409') || error?.toLowerCase().includes('exists')) {
                    toast.error('Account name already exists');
                } else {
                    toast.error('Failed to create Station')
                }
                return;
            }

            toast.success(`Station ${data.stationName} created successfully`);
            form.reset();
            setOpen(false);
            onStationCreated?.(data);
        } catch (error: any) {
            const message =
                error?.response?.data?.messge ||
                error?.message ||
                'Failed ot create Station'
            toast.error(message);
        }
    };

    return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						variant="outline"
						size="lg"
						className="text-chart-3 text-lg font-bold"
					>
						<StationIcon className="!w-[25px] !h-[25px]" />
						Create Station
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
                                {form.formState.isSubmitting ? 'Creating...' : 'Create Station'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>

            </DialogContent>
			</Dialog>
		);
}
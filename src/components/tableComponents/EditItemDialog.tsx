'use client';

import { updateItem } from '@/app/api/item.Api';
import { Item } from '@/app/types';
import { Icons } from '@/lib/icon';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';

type editItemProps = {
	item: Item;
	items: Item[];
	stationId: string;
	onUpdate: (
		id: string,
		itemName: string,
		isTempTaken: boolean,
		isCheckMark: boolean,
		notes: string
	) => void;
};

// Zod schema
// Updated schema builder
const getSchema = (items: Item[] = [], currentItemId?: string) =>
  z.object({
    itemName: z
      .string()
      .min(1, 'Item name cannot be empty')
      .refine(
        (name) =>
          !items.some(
            (i) =>
              i.itemName.toLowerCase() === name.toLowerCase() &&
              i.id !== currentItemId // ✅ ignore current item
          ),
        { message: 'Item name already exists' }
      ),
    isTempTaken: z.boolean().default(false),
    isCheckMark: z.boolean().default(false),
    notes: z.string().optional(),
  });


export function EditItemDialog({
    item,
    items = [],
    stationId,
    onUpdate,
}: editItemProps) {
	//icons
	const EditIcon = Icons.pencil;

	//set state
	const [open, setOpen] = useState(false);

	// Schema and type
	const schema = useMemo(() => getSchema(items, item?.id), [items, item?.id]);
	type FormValues = z.infer<typeof schema>;

	// RHF form
	const form = useForm<FormValues>({
		resolver: zodResolver(schema) as any,
		defaultValues: {
			itemName: '',
			isTempTaken: false,
			isCheckMark: false,
			notes: '',
		},
		mode: 'onChange',
	});

    //Sync form values when dialog opens or location changes
    useEffect(() => {
        if (!open) return;
        if (!item) return;

        // Delay reset until next paint — ensures form is mounted & ready
        requestAnimationFrame(() => {
            form.reset({
                itemName: item.itemName ?? '',
                isTempTaken: item.isTempTaken ?? false,
                isCheckMark: item.isCheckMark ?? false,
                notes: item.notes ?? '',
            });
        });
    }, [open, item?.id]);

    const watchedValues = form.watch();
    const isChanged =
        watchedValues.itemName !== item.itemName ||
        watchedValues.isTempTaken !== item.isTempTaken ||
        watchedValues.isCheckMark !== item.isCheckMark ||
        watchedValues.notes !== item.notes;
    
    //const onSubmit = async (values: z.infer<typeof schema>) => {
    const onSubmit = async (values: FormValues) => {
        
        try {
            const payload = {
                itemName: values.itemName,
                isTempTaken: values.isTempTaken,
                isCheckMark: values.isCheckMark,
                notes: values.notes ?? '',
                itemTemperature: item.itemTemperature ?? '', // or 0 if your backend expects number
                itemActive: item.itemActive ?? true,
            };

            // Send update request
            const { error } = await updateItem(stationId, item.id!, payload);

            // Handle error returned from API
            if (error) {
                if (error.toLowerCase().includes('exists')) {
                    toast.error('Item name already exists');
                    return;
                }
                toast.error(error);
                return;
            }

            // Update local UI state
            onUpdate(
                item.id!,
                values.itemName,
                values.isTempTaken,
                values.isCheckMark,
                values.notes ?? ''
            );

            toast.success('Item updated successfully');
            setOpen(false);
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to update item';
            toast.error(message);
        }
    }

    return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button variant="ghost" size="icon" className="text-chart-3">
						<EditIcon className="!w-[30px] !h-[30px]" />
					</Button>
				</DialogTrigger>

				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Item</DialogTitle>
						<DialogDescription>
							Update the Item details below.
						</DialogDescription>
					</DialogHeader>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="itemName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Item Name</FormLabel>
										<FormControl>
											<Input placeholder="Item Name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* Temperature Taken */}
							<FormField
								control={form.control}
								name="isTempTaken"
								render={({ field }) => (
									<FormItem className="flex items-center justify-between">
										<FormLabel className="mb-0">Temperature Taken</FormLabel>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={(checked) => field.onChange(checked)}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Check Mark */}
							<FormField
								control={form.control}
								name="isCheckMark"
								render={({ field }) => (
									<FormItem className="flex items-center justify-between">
										<FormLabel className="mb-0">Check Mark</FormLabel>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={(checked) => field.onChange(checked)}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Notes */}
							<FormField
								control={form.control}
								name="notes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Notes</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter notes (optional)"
												{...field}
											/>
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
									{form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		);

    
}

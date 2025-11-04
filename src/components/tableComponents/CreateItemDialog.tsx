'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import z from 'zod';

import { createItem } from '@/app/api/item.Api';
import { Item } from '@/app/types';
import { Icons } from '@/lib/icon';

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
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';

type CreateItemDialogProps = {
	onItemCreated?: (item: Item) => void;
	existingItems?: Item[];
	stationId: string;
};

// Zod schema
const getSchema = (items: Item[] = []) =>
	z.object({
		itemName: z
			.string()
			.min(1, 'Item name cannot be empty')
			.refine(
				(name) =>
					!items.some((i) => i.itemName.toLowerCase() === name.toLowerCase()),
				{ message: 'Item name already exists' }
			),
		isTempTaken: z.boolean().default(false),
		isCheckMark: z.boolean().default(false),
		notes: z.string().optional(),
	});


export default function CreateItemDialog({
	onItemCreated,
	existingItems = [],
	stationId,
}: CreateItemDialogProps) {
	const ItemIcon = Icons.items;
	const [open, setOpen] = useState(false);

   

	// Schema and type
	const schema = useMemo(() => getSchema(existingItems), [existingItems]);
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

	// Submit handler
	const onSubmit = async (values: FormValues) => {
		try {
			const { data, error } = await createItem(stationId, values);
			if (error || !data) {
				if (error?.includes('409') || error?.toLowerCase().includes('exists')) {
					toast.error('Item name already exists.');
				} else {
					toast.error('Failed to create item.');
				}
				return;
			}

			toast.success(`Item ${data.itemName} created successfully`);
			form.reset();
            setOpen(false);
           

			onItemCreated?.(data);
		} catch (error: any) {
			const message =
				error?.message?.data?.message ||
				error?.message ||
				'Failed to create item.';
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
					<ItemIcon className="!w-[25px] !h-[25px]" />
					<span className="hidden sm:inline">Create Item</span>
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Item</DialogTitle>
					<DialogDescription>
						Enter the details for the new item
					</DialogDescription>
				</DialogHeader>

				{/* FormProvider with generic FormValues */}
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						{/* Item Name */}
						<FormField
							control={form.control}
							name="itemName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Item Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter Item Name" {...field} />
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
										<Textarea placeholder="Enter notes (optional)" {...field} />
									</FormControl>
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
								{form.formState.isSubmitting ? 'Creating…' : 'Create Item'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

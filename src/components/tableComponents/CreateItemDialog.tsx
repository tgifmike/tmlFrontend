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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
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

const toolOptions = [
	{ label: '3oz Scoop(Ivory #10)', value: '3oz Scoop' },
	{ label: 'teaspoon', value: 'teaspoon' },
	{ label: '2oz Ladel', value: '2oz Ladel' },
	{ label: '3oz Ladel', value: '3oz Ladel' },
	{ label: '4oz Ladel', value: '4oz Ladel' },
	{ label: '5oz Ladel', value: '5oz Ladel' },
];

const shelfLifeOptions = [
	{ label: '4 Hours', value: '4 hours' },
	{ label: '8 Hours', value: '8 hours' },
	{ label: '1 Day', value: '1 Day' },
	{ label: '2 Days', value: '2 Days' },
	{ label: '3 Days', value: '3 Days' },
	{ label: '4 Days', value: '4 Days' },
	{ label: '5 Days', value: '5 Days' },
];

const panSizeOptions = [
	{ label: 'Original Package', value: 'Original Package' },
	{ label: '1/9 Pan', value: '1/9 Pan' },
	{ label: '1/6 Pan', value: '1/6 Pan' },
	{ label: '1/3 Pan', value: '1/3 Pan' },
	{ label: '1/2 Pan', value: '1/2 Pan' },
	{ label: 'Squeeze Bottle', value: 'Squeeze Bottle' },
	{ label: 'Shaker', value: 'Shaker' },
];

const portionSizeOptions = [
	{ label: '1 oz', value: '1 oz' },
	{ label: '2 oz', value: '2 oz' },
	{ label: '4 oz', value: '4 oz' },
	{ label: '6 oz', value: '6 oz' },
	{ label: '8 oz', value: '8 oz' },
];

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
		shelfLife: z.string().min(1, 'Shelf life cannot be empty'),
		panSize: z.string().min(1, 'Pan Size cannot be empty'),
		isTool: z.boolean().default(false),
		isPortioned: z.boolean().default(false),
		isTempTaken: z.boolean().default(false),
		isCheckMark: z.boolean().default(false),
		itemNotes: z.string().optional(),
		toolName: z.string().optional(),
		portionSize: z.string().optional(),
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
				shelfLife: '',
				panSize: '',
				isTool: false,
				isPortioned: false,
				isTempTaken: false,
				isCheckMark: false,
				itemNotes: '',
				toolName: '',
				portionSize: '',
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
						{/* shelf life */}
						<FormField
							control={form.control}
							name="shelfLife"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Shelf Life</FormLabel>
									<FormControl>
										<Select onValueChange={field.onChange} value={field.value}>
											<SelectTrigger>
												<SelectValue placeholder="Select shelf life" />
											</SelectTrigger>
											<SelectContent>
												{shelfLifeOptions.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{/* pan size */}
						<FormField
							control={form.control}
							name="panSize"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Pan Size</FormLabel>
									<FormControl>
										<Select onValueChange={field.onChange} value={field.value}>
											<SelectTrigger>
												<SelectValue placeholder="Select pan size" />
											</SelectTrigger>
											<SelectContent>
												{panSizeOptions.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* is it a tool */}
						<FormField
							control={form.control}
							name="isTool"
							render={({ field }) => (
								<FormItem className="flex items-center justify-between">
									<FormLabel className="mb-0">Is tool needed?</FormLabel>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={(checked) => {
												field.onChange(checked);
												if (!checked) form.setValue('toolName', ''); // clear tool if unchecked
											}}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* tool dropdown appears only when isTool is true */}
						{form.watch('isTool') && (
							<FormField
								control={form.control}
								name="toolName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Select Tool</FormLabel>
										<FormControl>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Choose a tool" />
												</SelectTrigger>
												<SelectContent>
													{toolOptions.map((tool) => (
														<SelectItem key={tool.value} value={tool.value}>
															{tool.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{/* is it a portion size*/}
						<FormField
							control={form.control}
							name="isPortioned"
							render={({ field }) => (
								<FormItem className="flex items-center justify-between">
									<FormLabel className="mb-0">
										Is it a portionable item?
									</FormLabel>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={(checked) => field.onChange(checked)}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Portion Size Dropdown */}
						{form.watch('isPortioned') && (
							<FormField
								control={form.control}
								name="portionSize"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Portion Size</FormLabel>
										<FormControl>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select portion size" />
												</SelectTrigger>
												<SelectContent>
													{portionSizeOptions.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{/* Temperature Taken */}
						<FormField
							control={form.control}
							name="isTempTaken"
							render={({ field }) => (
								<FormItem className="flex items-center justify-between">
									<FormLabel className="mb-0">
										Will you take temperature of item?
									</FormLabel>
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
									<FormLabel className="mb-0">
										Will you be checking if item is correct?
									</FormLabel>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={(checked) => field.onChange(checked)}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* item Notes */}
						<FormField
							control={form.control}
							name="itemNotes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notes</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter item notes (optional)"
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

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
import { panSizeOptions, portionSizeOptions, shelfLifeOptions, tempCategories, tempCategoryRanges, toolOptions } from '@/lib/constants/usConstants';

type CreateItemDialogProps = {
	onItemCreated?: (item: Item) => void;
	existingItems?: Item[];
	stationId: string;
};

// Zod schema
const getSchema = (items: Item[] = [], currentItemId?: string) =>
	z
		.object({
			itemName: z
				.string()
				.min(1, 'Item name cannot be empty')
				.refine(
					(name) =>
						!items.some(
							(i) =>
								i.itemName.toLowerCase() === name.toLowerCase() &&
								i.id !== currentItemId
						),
					{ message: 'Item name already exists' }
				),

			shelfLife: z.string().min(1, 'Shelf life cannot be empty'),
			panSize: z.string().min(1, 'Pan size cannot be empty'),

			isTool: z.boolean().default(false),
			toolName: z.string().optional(),

			isPortioned: z.boolean().default(false),
			portionSize: z.string().optional(),

			isTempTaken: z.boolean().default(false),
			tempCategory: z.string().optional(),

			isCheckMark: z.boolean().default(false),
			itemNotes: z.string().optional(),
		})
		.refine((data) => !data.isTool || !!data.toolName, {
			message: 'Tool name is required when a tool is needed',
			path: ['toolName'],
		})
		.refine((data) => !data.isPortioned || !!data.portionSize, {
			message: 'Portion size is required for portioned items',
			path: ['portionSize'],
		})
		.refine((data) => !data.isTempTaken || !!data.tempCategory, {
			message: 'Temperature category is required when temperature is taken',
			path: ['tempCategory'],
		});



export default function CreateItemDialog({
	onItemCreated,
	existingItems = [],
	stationId,
}: CreateItemDialogProps) {

	//icons 
	const ItemIcon = Icons.items;
	
	//state
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
				toolName: '',
				isPortioned: false,
				portionSize: '',
				isTempTaken: false,
				tempCategory: '',
				isCheckMark: false,
				itemNotes: '',
			},
			mode: 'onChange',
		});

	// Submit handler
	const onSubmit = async (values: FormValues) => {
		try {
			// Build backend payload
			const payload: any = {
				...values,
				templateNotes: values.itemNotes || undefined,
			};

			// Temp logic
			if (values.isTempTaken && values.tempCategory) {
				const range = tempCategoryRanges[values.tempCategory];
				if (range) {
					payload.minTemp = range.min;
					payload.maxTemp = range.max;
				}
			}

			// backend does NOT accept empty strings for enum fields
			if (!payload.isTool) delete payload.toolName;
			if (payload.toolName === '') delete payload.toolName;

			if (!payload.isPortioned) delete payload.portionSize;
			if (payload.portionSize === '') delete payload.portionSize;

			if (!payload.isTempTaken) {
				delete payload.tempCategory;
				delete payload.minTemp;
				delete payload.maxTemp;
			}
			if (payload.tempCategory === '') delete payload.tempCategory;

			// empty notes → remove
			if (!payload.itemNotes) delete payload.itemNotes;
			if (!payload.templateNotes) delete payload.templateNotes;

			const { data, error } = await createItem(stationId, payload);

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
						{form.watch('isTempTaken') && (
							<FormField
								control={form.control}
								name="tempCategory"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Temperature Category</FormLabel>
										<FormControl>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select temp category" />
												</SelectTrigger>
												<SelectContent>
													{tempCategories.map((option) => (
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

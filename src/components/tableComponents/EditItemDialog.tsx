'use client';

import { updateItem } from '@/app/api/item.Api';
import { Item } from '@/app/types';
import { Icons } from '@/lib/icon';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
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
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import {
	panSizeOptions,
	portionSizeOptions,
	shelfLifeOptions,
	tempCategories,
	tempCategoryRanges,
	toolOptions,
} from '@/lib/constants/usConstants';

type EditItemDialogProps = {
	item: Item;
	items: Item[];
	stationId: string;
	onUpdate: (updatedItem: Item) => void;
};

// --- Schema ---
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


export function EditItemDialog({
	item,
	items,
	stationId,
	onUpdate,
}: EditItemDialogProps) {
	//icons
	const EditIcon = Icons.pencil;

	//state
	const [open, setOpen] = useState(false);

	const schema = useMemo(() => getSchema(items, item.id), [items, item.id]);
	type FormValues = z.infer<typeof schema>;

	const form = useForm<FormValues>({
		resolver: zodResolver(schema) as any,
		defaultValues: {
			itemName: '',
			shelfLife: '',
			panSize: '',
			isTool: false,
			isPortioned: false,
			isTempTaken: false,
			tempCategory: '',
			isCheckMark: false,
			itemNotes: '',
			toolName: undefined,
			portionSize: undefined,
		},
		mode: 'onChange',
	});

	// Sync form with item when opening
	useEffect(() => {
		if (!open) return;

		console.log('Editing item:', item);
		form.reset({
			itemName: item.itemName ?? '',
			shelfLife: item.shelfLife ?? '',
			panSize: item.panSize ?? '',
			isTool: item.isTool ?? false,
			toolName: item.toolName ?? '',
			isPortioned: item.portioned ?? false,
			portionSize: item.portionSize ?? '',
			isTempTaken: item.isTempTaken ?? false,
			tempCategory: item.tempCategory ?? '',
			isCheckMark: item.isCheckMark ?? false,
			itemNotes: item.itemNotes ?? '',
		});

	}, [open, item]);

	// 
const onSubmit = async (values: FormValues) => {
	try {
		const selectedTemp = values.isTempTaken ? values.tempCategory : null;

		const payload = {
			...values,
			 templateNotes: values.itemNotes,
			tempCategory: selectedTemp,
			minTemp: selectedTemp ? tempCategoryRanges[selectedTemp]?.min : null,
			maxTemp: selectedTemp ? tempCategoryRanges[selectedTemp]?.max : null,
		};

		const { error, data } = await updateItem(stationId, item.id!, payload);

		if (error) {
			toast.error(
				error.includes('exists') ? 'Item name already exists' : error
			);
			return;
		}

		if (error || !data) {
			toast.error(error || 'Failed to update item');
			return;
		}

		onUpdate(data);
		toast.success('Item updated successfully');
		console.log(data)
		setOpen(false);
	} catch (err: any) {
		toast.error(err?.message || 'Failed to update item');
	}
};





	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon">
					<EditIcon className="!w-[28px] !h-[28px]" />
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Item</DialogTitle>
					<DialogDescription>Update the item details below.</DialogDescription>
				</DialogHeader>

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
										<Input {...field} placeholder="Item Name" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Shelf Life */}
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
												{shelfLifeOptions.map((o) => (
													<SelectItem key={o.value} value={o.value}>
														{o.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Pan Size */}
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
												{panSizeOptions.map((o) => (
													<SelectItem key={o.value} value={o.value}>
														{o.label}
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

						{/* Temp Taken */}
						<FormField
							control={form.control}
							name="isTempTaken"
							render={({ field }) => (
								<FormItem className="flex items-center justify-between">
									<FormLabel> Will you take temperature of item?</FormLabel>
									<FormControl>
										{/* <Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/> */}
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
								{form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

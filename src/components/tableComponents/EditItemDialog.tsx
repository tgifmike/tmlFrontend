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
			panSize: z.string().min(1, 'Pan Size cannot be empty'),
			isTool: z.boolean().default(false),
			isPortioned: z.boolean().default(false),
			isTempTaken: z.boolean().default(false),
			tempCategory: z.string().optional(),
			isCheckMark: z.boolean().default(false),
			itemNotes: z.string().optional(),
			toolName: z.string().optional(),
			portionSize: z.string().optional(),
		})
		.refine((data) => !data.isTempTaken || !!data.tempCategory, {
			message: 'Temperature category is required if temperature is taken',
		}); //need to add other optons

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

		form.reset({
			itemName: item.itemName ?? '',
			shelfLife: item.shelfLife ?? '',
			panSize: item.panSize ?? '',
			isTool: item.isTool ?? false,
			isPortioned: item.portioned ?? false,
			isTempTaken: item.isTempTaken ?? false,
			tempCategory: item.tempCategory ?? '',
			isCheckMark: item.isCheckMark ?? false,
			itemNotes: item.templateNotes ?? '',
			toolName: item.toolName ?? undefined,
			portionSize: item.portionSize ?? undefined,
		});
	}, [open, item]);

	// 
const onSubmit = async (values: FormValues) => {
	try {
		const selectedTemp = values.isTempTaken ? values.tempCategory : null;

		const payload = {
			...values,
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
// 'use client';

// import { updateItem } from '@/app/api/item.Api';
// import { Item } from '@/app/types';
// import { Icons } from '@/lib/icon';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useEffect, useMemo, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { toast } from 'sonner';
// import z from 'zod';
// import {
// 	Dialog,
// 	DialogContent,
// 	DialogDescription,
// 	DialogFooter,
// 	DialogHeader,
// 	DialogTitle,
// 	DialogTrigger,
// } from '../ui/dialog';
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from '../ui/select';
// import { Button } from '../ui/button';
// import {
// 	Form,
// 	FormControl,
// 	FormField,
// 	FormItem,
// 	FormLabel,
// 	FormMessage,
// } from '../ui/form';
// import { Input } from '../ui/input';
// import { Switch } from '../ui/switch';
// import { Textarea } from '../ui/textarea';

// // --- Options ---
// const shelfLifeOptions = [
// 	{ label: '4 Hours', value: '4 hours' },
// 	{ label: '8 Hours', value: '8 hours' },
// 	{ label: '1 Day', value: '1 Day' },
// 	{ label: '2 Days', value: '2 Days' },
// 	{ label: '3 Days', value: '3 Days' },
// 	{ label: '4 Days', value: '4 Days' },
// 	{ label: '5 Days', value: '5 Days' },
// ];

// const panSizeOptions = [
// 	{ label: 'Original Package', value: 'Original Package' },
// 	{ label: '1/9 Pan', value: '1/9 Pan' },
// 	{ label: '1/6 Pan', value: '1/6 Pan' },
// 	{ label: '1/3 Pan', value: '1/3 Pan' },
// 	{ label: '1/2 Pan', value: '1/2 Pan' },
// 	{ label: 'Squeeze Bottle', value: 'Squeeze Bottle' },
// 	{ label: 'Shaker', value: 'Shaker' },
// ];

// const toolOptions = [
// 	{ label: '3oz Scoop (Ivory #10)', value: '3oz Scoop' },
// 	{ label: 'Teaspoon', value: 'teaspoon' },
// 	{ label: '2oz Ladle', value: '2oz Ladle' },
// 	{ label: '3oz Ladle', value: '3oz Ladle' },
// 	{ label: '4oz Ladle', value: '4oz Ladle' },
// 	{ label: '5oz Ladle', value: '5oz Ladle' },
// ];

// const portionSizeOptions = [
// 	{ label: '1 oz', value: '1 oz' },
// 	{ label: '2 oz', value: '2 oz' },
// 	{ label: '4 oz', value: '4 oz' },
// 	{ label: '6 oz', value: '6 oz' },
// 	{ label: '8 oz', value: '8 oz' },
// ];

// const tempCategoryRanges: Record<string, { min: number; max: number }> = {
// 	FROZEN: { min: -100, max: 32 },
// 	REFRIGERATED: { min: 33, max: 41 },
// 	ROOM_TEMP: { min: 42, max: 90 },
// 	HOT_HOLDING: { min: 120, max: 200 },
// };

// const tempCategories = [
// 	{ label: 'Frozen (-100°F to 32°F)', value: 'FROZEN' },
// 	{ label: 'Refrigerated (33°F to 41°F)', value: 'REFRIGERATED' },
// 	{ label: 'Room Temp (42°F to 90°F)', value: 'ROOM_TEMP' },
// 	{ label: 'Hot Holding (120°F to 200°F)', value: 'HOT_HOLDING' },
// ];

// // --- Schema ---
// const getSchema = (items: Item[] = [], currentItemId?: string) =>
// 	z
// 		.object({
// 			itemName: z
// 				.string()
// 				.min(1, 'Item name cannot be empty')
// 				.refine(
// 					(name) =>
// 						!items.some(
// 							(i) =>
// 								i.itemName.toLowerCase() === name.toLowerCase() &&
// 								i.id !== currentItemId
// 						),
// 					{ message: 'Item name already exists' }
// 				),
// 			shelfLife: z.string().min(1, 'Shelf life cannot be empty'),
// 			panSize: z.string().min(1, 'Pan Size cannot be empty'),
// 			isTool: z.boolean().default(false),
// 			isPortioned: z.boolean().default(false),
// 			isTempTaken: z.boolean().default(false),
// 			tempCategory: z.string().optional(),
// 			isCheckMark: z.boolean().default(false),
// 			itemNotes: z.string().optional(),
// 			toolName: z.string().optional(),
// 			portionSize: z.string().optional(),
// 		})
// 		.refine((data) => !data.isTempTaken || !!data.tempCategory, {
// 			message: 'Temperature category is required if temperature is taken',
// 		});

// type EditItemDialogProps = {
// 	item: Item;
// 	items: Item[];
// 	stationId: string;
// 	onUpdate: (updatedItem: Item) => void;
// };

// export function EditItemDialog({
// 	item,
// 	items,
// 	stationId,
// 	onUpdate,
// }: EditItemDialogProps) {
// 	const EditIcon = Icons.pencil;
// 	const [open, setOpen] = useState(false);

// 	const schema = useMemo(() => getSchema(items, item.id), [items, item.id]);
// 	type FormValues = z.infer<typeof schema>;

// 	const form = useForm<FormValues>({
// 		resolver: zodResolver(schema) as any,
// 		defaultValues: {
// 			itemName: '',
// 			shelfLife: '',
// 			panSize: '',
// 			isTool: false,
// 			isPortioned: false,
// 			isTempTaken: false,
// 			tempCategory: undefined,
// 			isCheckMark: false,
// 			itemNotes: '',
// 			toolName: undefined,
// 			portionSize: undefined,
// 		},
// 		mode: 'onChange',
// 	});

// 	// Sync form with item when opening
// 	useEffect(() => {
// 		if (!open) return;
// 		requestAnimationFrame(() => {
// 			form.reset({
// 				itemName: item.itemName ?? '',
// 				shelfLife: item.shelfLife ?? '',
// 				panSize: item.panSize ?? '',
// 				isTool: item.isTool ?? false,
// 				isPortioned: item.isPortioned ?? false,
// 				isTempTaken: item.isTempTaken ?? false,
// 				tempCategory: item.tempCategory ?? '', // default
// 				isCheckMark: item.isCheckMark ?? false,
// 				itemNotes: item.itemNotes ?? '',
// 				toolName: item.toolName ?? undefined,
// 				portionSize: item.portionSize ?? undefined,
// 			});
// 		});
// 	}, [open, item]);

// 	// Ensure tempCategory always has a value when isTempTaken is true
// 	const isTempTaken = form.watch('isTempTaken');
// 	useEffect(() => {
// 		if (isTempTaken && !form.getValues('tempCategory')) {
// 			form.setValue('tempCategory', item.tempCategory ?? 'REFRIGERATED');
// 		}
// 	}, [isTempTaken, form, item.tempCategory]);

// const onSubmit = async (values: FormValues) => {
// 	try {
// 		// Create payload for API call
// 		const payload: FormValues & { minTemp?: number; maxTemp?: number } = {
// 			...values,
// 		};

// 		// Set min/max temps if temperature is taken
// 		if (values.isTempTaken && values.tempCategory) {
// 			const range = tempCategoryRanges[values.tempCategory];
// 			if (range) {
// 				payload.minTemp = range.min;
// 				payload.maxTemp = range.max;
// 			}
// 		} else {
// 			payload.minTemp = undefined;
// 			payload.maxTemp = undefined;
// 		}

// 		const { error, data } = await updateItem(stationId, item.id!, payload);

// 		if (error) {
// 			toast.error(
// 				error.includes('exists') ? 'Item name already exists' : error
// 			);
// 			return;
// 		}

// 		// Ensure tempCategory is always a string to satisfy Item type
// 		const updatedItem: Item = (Array.isArray(data) ? data[0] : data) ?? {
// 			...item,
// 			...values,
// 			minTemp: payload.minTemp,
// 			maxTemp: payload.maxTemp,
// 			tempCategory: values.tempCategory || '', // <-- TS-safe
// 		};

// 		onUpdate(updatedItem);
// 		toast.success('Item updated successfully');
// 		setOpen(false);
// 	} catch (err: any) {
// 		const message =
// 			err?.response?.data?.message || err?.message || 'Failed to update item';
// 		toast.error(message);
// 	}
// };

// 	return (
// 		<Dialog open={open} onOpenChange={setOpen}>
// 			<DialogTrigger asChild>
// 				<Button variant="ghost" size="icon">
// 					<EditIcon className="!w-[28px] !h-[28px]" />
// 				</Button>
// 			</DialogTrigger>

// 			<DialogContent>
// 				<DialogHeader>
// 					<DialogTitle>Edit Item</DialogTitle>
// 					<DialogDescription>Update the item details below.</DialogDescription>
// 				</DialogHeader>

// 				<Form {...form}>
// 					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
// 						{/* Item Name */}
// 						<FormField
// 							control={form.control}
// 							name="itemName"
// 							render={({ field }) => (
// 								<FormItem>
// 									<FormLabel>Item Name</FormLabel>
// 									<FormControl>
// 										<Input {...field} placeholder="Item Name" />
// 									</FormControl>
// 									<FormMessage />
// 								</FormItem>
// 							)}
// 						/>

// 						{/* Shelf Life */}
// 						<FormField
// 							control={form.control}
// 							name="shelfLife"
// 							render={({ field }) => (
// 								<FormItem>
// 									<FormLabel>Shelf Life</FormLabel>
// 									<FormControl>
// 										<Select onValueChange={field.onChange} value={field.value}>
// 											<SelectTrigger>
// 												<SelectValue placeholder="Select shelf life" />
// 											</SelectTrigger>
// 											<SelectContent>
// 												{shelfLifeOptions.map((o) => (
// 													<SelectItem key={o.value} value={o.value}>
// 														{o.label}
// 													</SelectItem>
// 												))}
// 											</SelectContent>
// 										</Select>
// 									</FormControl>
// 									<FormMessage />
// 								</FormItem>
// 							)}
// 						/>

// 						{/* Pan Size */}
// 						<FormField
// 							control={form.control}
// 							name="panSize"
// 							render={({ field }) => (
// 								<FormItem>
// 									<FormLabel>Pan Size</FormLabel>
// 									<FormControl>
// 										<Select onValueChange={field.onChange} value={field.value}>
// 											<SelectTrigger>
// 												<SelectValue placeholder="Select pan size" />
// 											</SelectTrigger>
// 											<SelectContent>
// 												{panSizeOptions.map((o) => (
// 													<SelectItem key={o.value} value={o.value}>
// 														{o.label}
// 													</SelectItem>
// 												))}
// 											</SelectContent>
// 										</Select>
// 									</FormControl>
// 									<FormMessage />
// 								</FormItem>
// 							)}
// 						/>

// 						{/* Temp Taken */}
// 						<FormField
// 							control={form.control}
// 							name="isTempTaken"
// 							render={({ field }) => (
// 								<FormItem className="flex items-center justify-between">
// 									<FormLabel>Temperature Taken?</FormLabel>
// 									<FormControl>
// 										<Switch
// 											checked={field.value}
// 											onCheckedChange={field.onChange}
// 										/>
// 									</FormControl>
// 								</FormItem>
// 							)}
// 						/>

// 						{/* Temp Category */}
// 						<FormField
// 							control={form.control}
// 							name="tempCategory"
// 							render={({ field }) => (
// 								<FormItem>
// 									<FormLabel>Temperature Category</FormLabel>
// 									<FormControl>
// 										<Select
// 											onValueChange={field.onChange}
// 											value={field.value}
// 											disabled={!form.watch('isTempTaken')}
// 										>
// 											<SelectTrigger>
// 												<SelectValue placeholder="Select temp category" />
// 											</SelectTrigger>
// 											<SelectContent>
// 												{tempCategories.map((option) => (
// 													<SelectItem key={option.value} value={option.value}>
// 														{option.label}
// 													</SelectItem>
// 												))}
// 											</SelectContent>
// 										</Select>
// 									</FormControl>
// 									<FormMessage />
// 								</FormItem>
// 							)}
// 						/>

// 						<DialogFooter>
// 							<Button
// 								type="submit"
// 								disabled={
// 									!form.formState.isValid || form.formState.isSubmitting
// 								}
// 							>
// 								{form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
// 							</Button>
// 						</DialogFooter>
// 					</form>
// 				</Form>
// 			</DialogContent>
// 		</Dialog>
// 	);
// }

// 'use client';

// import { updateItem } from '@/app/api/item.Api';
// import { Item } from '@/app/types';
// import { Icons } from '@/lib/icon';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useEffect, useMemo, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { toast } from 'sonner';
// import z from 'zod';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
// import { Button } from '../ui/button';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
// import { Input } from '../ui/input';
// import { Switch } from '../ui/switch';
// import { Textarea } from '../ui/textarea';

// type editItemProps = {
// 	item: Item;
// 	items: Item[];
// 	stationId: string;
// 	onUpdate: (
// 		id: string,
// 		itemName: string,
// 		isTempTaken: boolean,
// 		isCheckMark: boolean,
// 		notes: string
// 	) => void;
// };

// // Zod schema
// // Updated schema builder
// const getSchema = (items: Item[] = [], currentItemId?: string) =>
//   z.object({
//     itemName: z
//       .string()
//       .min(1, 'Item name cannot be empty')
//       .refine(
//         (name) =>
//           !items.some(
//             (i) =>
//               i.itemName.toLowerCase() === name.toLowerCase() &&
//               i.id !== currentItemId // ✅ ignore current item
//           ),
//         { message: 'Item name already exists' }
//       ),
//     isTempTaken: z.boolean().default(false),
//     isCheckMark: z.boolean().default(false),
//     notes: z.string().optional(),
//   });


// export function EditItemDialog({
//     item,
//     items = [],
//     stationId,
//     onUpdate,
// }: editItemProps) {
// 	//icons
// 	const EditIcon = Icons.pencil;

// 	//set state
// 	const [open, setOpen] = useState(false);

// 	// Schema and type
// 	const schema = useMemo(() => getSchema(items, item?.id), [items, item?.id]);
// 	type FormValues = z.infer<typeof schema>;

// 	// RHF form
// 	const form = useForm<FormValues>({
// 		resolver: zodResolver(schema) as any,
// 		defaultValues: {
// 			itemName: '',
// 			isTempTaken: false,
// 			isCheckMark: false,
// 			notes: '',
// 		},
// 		mode: 'onChange',
// 	});

//     //Sync form values when dialog opens or location changes
//     useEffect(() => {
//         if (!open) return;
//         if (!item) return;

//         // Delay reset until next paint — ensures form is mounted & ready
//         requestAnimationFrame(() => {
//             form.reset({
//                 itemName: item.itemName ?? '',
//                 isTempTaken: item.isTempTaken ?? false,
//                 isCheckMark: item.isCheckMark ?? false,
//                 notes: item.notes ?? '',
//             });
//         });
//     }, [open, item?.id]);

//     const watchedValues = form.watch();
//     const isChanged =
//         watchedValues.itemName !== item.itemName ||
//         watchedValues.isTempTaken !== item.isTempTaken ||
//         watchedValues.isCheckMark !== item.isCheckMark ||
//         watchedValues.notes !== item.notes;
    
//     //const onSubmit = async (values: z.infer<typeof schema>) => {
//     const onSubmit = async (values: FormValues) => {
        
//         try {
//             const payload = {
//                 itemName: values.itemName,
//                 isTempTaken: values.isTempTaken,
//                 isCheckMark: values.isCheckMark,
//                 notes: values.notes ?? '',
//                 itemTemperature: item.itemTemperature ?? '', // or 0 if your backend expects number
//                 itemActive: item.itemActive ?? true,
//             };

//             // Send update request
//             const { error } = await updateItem(stationId, item.id!, payload);

//             // Handle error returned from API
//             if (error) {
//                 if (error.toLowerCase().includes('exists')) {
//                     toast.error('Item name already exists');
//                     return;
//                 }
//                 toast.error(error);
//                 return;
//             }

//             // Update local UI state
//             onUpdate(
//                 item.id!,
//                 values.itemName,
//                 values.isTempTaken,
//                 values.isCheckMark,
//                 values.notes ?? ''
//             );

//             toast.success('Item updated successfully');
//             setOpen(false);
//         } catch (err: any) {
//             const message =
//                 err?.response?.data?.message ||
//                 err?.message ||
//                 'Failed to update item';
//             toast.error(message);
//         }
//     }

//     return (
// 			<Dialog open={open} onOpenChange={setOpen}>
// 				<DialogTrigger asChild>
// 					<Button variant="ghost" size="icon" className="text-chart-3">
// 						<EditIcon className="!w-[30px] !h-[30px]" />
// 					</Button>
// 				</DialogTrigger>

// 				<DialogContent>
// 					<DialogHeader>
// 						<DialogTitle>Edit Item</DialogTitle>
// 						<DialogDescription>
// 							Update the Item details below.
// 						</DialogDescription>
// 					</DialogHeader>

// 					<Form {...form}>
// 						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
// 							<FormField
// 								control={form.control}
// 								name="itemName"
// 								render={({ field }) => (
// 									<FormItem>
// 										<FormLabel>Item Name</FormLabel>
// 										<FormControl>
// 											<Input placeholder="Item Name" {...field} />
// 										</FormControl>
// 										<FormMessage />
// 									</FormItem>
// 								)}
// 							/>
// 							{/* Temperature Taken */}
// 							<FormField
// 								control={form.control}
// 								name="isTempTaken"
// 								render={({ field }) => (
// 									<FormItem className="flex items-center justify-between">
// 										<FormLabel className="mb-0">Temperature Taken</FormLabel>
// 										<FormControl>
// 											<Switch
// 												checked={field.value}
// 												onCheckedChange={(checked) => field.onChange(checked)}
// 											/>
// 										</FormControl>
// 									</FormItem>
// 								)}
// 							/>

// 							{/* Check Mark */}
// 							<FormField
// 								control={form.control}
// 								name="isCheckMark"
// 								render={({ field }) => (
// 									<FormItem className="flex items-center justify-between">
// 										<FormLabel className="mb-0">Check Mark</FormLabel>
// 										<FormControl>
// 											<Switch
// 												checked={field.value}
// 												onCheckedChange={(checked) => field.onChange(checked)}
// 											/>
// 										</FormControl>
// 									</FormItem>
// 								)}
// 							/>

// 							{/* Notes */}
// 							<FormField
// 								control={form.control}
// 								name="notes"
// 								render={({ field }) => (
// 									<FormItem>
// 										<FormLabel>Notes</FormLabel>
// 										<FormControl>
// 											<Textarea
// 												placeholder="Enter notes (optional)"
// 												{...field}
// 											/>
// 										</FormControl>
// 										<FormMessage />
// 									</FormItem>
// 								)}
// 							/>

// 							<DialogFooter>
// 								<Button
// 									type="submit"
// 									disabled={!isChanged || form.formState.isSubmitting}
// 								>
// 									{form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
// 								</Button>
// 							</DialogFooter>
// 						</form>
// 					</Form>
// 				</DialogContent>
// 			</Dialog>
// 		);

    
// }

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

// --- options (match CreateItemDialog) ---
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

const toolOptions = [
	{ label: '3oz Scoop (Ivory #10)', value: '3oz Scoop' },
	{ label: 'teaspoon', value: 'teaspoon' },
	{ label: '2oz Ladel', value: '2oz Ladel' },
	{ label: '3oz Ladel', value: '3oz Ladel' },
	{ label: '4oz Ladel', value: '4oz Ladel' },
	{ label: '5oz Ladel', value: '5oz Ladel' },
];

const portionSizeOptions = [
	{ label: '1 oz', value: '1 oz' },
	{ label: '2 oz', value: '2 oz' },
	{ label: '4 oz', value: '4 oz' },
	{ label: '6 oz', value: '6 oz' },
	{ label: '8 oz', value: '8 oz' },
];

// --- Schema ---
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
							i.id !== currentItemId
					),
				{ message: 'Item name already exists' }
			),
		shelfLife: z.string().min(1, 'Shelf life cannot be empty'),
		panSize: z.string().min(1, 'Pan size cannot be empty'),
		isTool: z.boolean().default(false),
		isPortioned: z.boolean().default(false),
		isTempTaken: z.boolean().default(false),
		isCheckMark: z.boolean().default(false),
		itemNotes: z.string().optional(),
		toolName: z.string().optional(),
		portionSize: z.string().optional(),
	});

type EditItemDialogProps = {
	item: Item;
	items: Item[];
	stationId: string;
	onUpdate: (updatedItem: Item) => void;
};

export function EditItemDialog({
	item,
	items = [],
	stationId,
	onUpdate,
}: EditItemDialogProps) {
	const EditIcon = Icons.pencil;
	const [open, setOpen] = useState(false);

	const schema = useMemo(() => getSchema(items, item?.id), [items, item?.id]);
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
			isCheckMark: false,
			itemNotes: '',
			toolName: '',
			portionSize: '',
		},
		mode: 'onChange',
	});

	// Sync values on open
	useEffect(() => {
		if (!open) return;
		requestAnimationFrame(() => {
			form.reset({
				itemName: item.itemName ?? '',
				shelfLife: item.shelfLife ?? '',
				panSize: item.panSize ?? '',
				isTool: item.isTool ?? false,
				isPortioned: item.isPortioned ?? false,
				isTempTaken: item.isTempTaken ?? false,
				isCheckMark: item.isCheckMark ?? false,
				itemNotes: item.itemNotes ?? '',
				toolName: item.toolName ?? '',
				portionSize: item.portionSize ?? '',
			});
		});
	}, [open, item?.id]);

	const onSubmit = async (values: FormValues) => {
		try {
			const { error, data } = await updateItem(stationId, item.id!, values);
			if (error) {
				toast.error(
					error.includes('exists') ? 'Item name already exists' : error
				);
				return;
			}
			toast.success('Item updated successfully');
			const updatedItem = Array.isArray(data)
				? data[0]
				: (data as Item | undefined);

			if (updatedItem) {
				onUpdate(updatedItem);
			} else {
				// fallback in case the API didn’t return data
				onUpdate({
					...item, // preserve original item props
					...values, // apply updated form values
				});
			}

			setOpen(false);
		} catch (err: any) {
			const message =
				err?.response?.data?.message || err?.message || 'Failed to update item';
			toast.error(message);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" className="text-chart-3">
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
										<Input placeholder="Item Name" {...field} />
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
								</FormItem>
							)}
						/>

						{/* Tool Switch + Dropdown */}
						<FormField
							control={form.control}
							name="isTool"
							render={({ field }) => (
								<FormItem className="flex items-center justify-between">
									<FormLabel>Is Tool Needed?</FormLabel>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={(checked) => {
												field.onChange(checked);
												if (!checked) form.setValue('toolName', '');
											}}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
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
												<SelectTrigger>
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
									</FormItem>
								)}
							/>
						)}

						{/* Portioned Switch + Dropdown */}
						<FormField
							control={form.control}
							name="isPortioned"
							render={({ field }) => (
								<FormItem className="flex items-center justify-between">
									<FormLabel>Is Portionable?</FormLabel>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={(checked) => {
												field.onChange(checked);
												if (!checked) form.setValue('portionSize', '');
											}}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
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
									<FormLabel>Temperature Taken?</FormLabel>
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
									<FormLabel>Check Mark?</FormLabel>
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
							name="itemNotes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notes</FormLabel>
									<FormControl>
										<Textarea placeholder="Enter notes (optional)" {...field} />
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
								{form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

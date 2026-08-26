'use client';

import { createItem, ItemPayload } from '@/app/api/item.Api';
import { Item, ItemType, OptionEntity, TemperatureCategory } from '@/app/types';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
	createPresetCriteria,
	DraftItemCriterion,
	ItemCriteriaEditor,
} from '@/components/tableComponents/ItemCriteriaEditor';
import { getDefaultTemperatureCategories } from '@/lib/constants/usConstants';
import { createCriteria, validateCriteria } from '@/lib/item-criteria';
import { Icons } from '@/lib/icon';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type CreateItemDialogProps = {
	onItemCreated?: (item: Item) => void;
	existingItems?: Item[];
	stationId: string;
	currentUserId: string;
	tools?: OptionEntity[];
	panSizes?: OptionEntity[];
	portionSizes?: OptionEntity[];
	shelfLifes?: OptionEntity[];
	temperatureCategories?: TemperatureCategory[];
};

export const itemTypeLabels: Record<ItemType, string> = {
	[ItemType.FOOD_PREP]: 'Food prep',
	[ItemType.EQUIPMENT]: 'Equipment check',
	[ItemType.CLEANLINESS]: 'Cleanliness check',
	[ItemType.GENERAL]: 'General task',
};

export const itemTypeDescriptions: Record<ItemType, string> = {
	[ItemType.FOOD_PREP]: 'Food setup, portions, holding temperatures, and prep quality.',
	[ItemType.EQUIPMENT]: 'Coolers, freezers, appliances, and other operating standards.',
	[ItemType.CLEANLINESS]: 'Restrooms, dining areas, stations, and sanitation checks.',
	[ItemType.GENERAL]: 'Opening, closing, safety, stocking, or another custom task.',
};

const getSchema = (items: Item[] = []) =>
	z
		.object({
			itemName: z.string().trim().min(1, 'Item name cannot be empty').refine(
				(name) => !items.some((item) => item.itemName.toLowerCase() === name.toLowerCase()),
				{ message: 'Item name already exists' },
			),
			itemType: z.enum(ItemType),
			shelfLife: z.string().optional(),
			panSize: z.string().optional(),
			isTool: z.boolean(),
			toolName: z.string().optional(),
			isPortioned: z.boolean(),
			portionSize: z.string().optional(),
			isTempTaken: z.boolean(),
			tempCategory: z.string().optional(),
			templateNotes: z.string().optional(),
		})
		.superRefine((data, context) => {
			if (data.itemType !== ItemType.FOOD_PREP) return;

			const required: Array<[keyof typeof data, string]> = [
				['shelfLife', 'Shelf life is required for food prep'],
				['panSize', 'Pan size is required for food prep'],
			];
			if (data.isTool) required.push(['toolName', 'Select the required tool']);
			if (data.isPortioned) required.push(['portionSize', 'Select a portion size']);
			if (data.isTempTaken) required.push(['tempCategory', 'Select a temperature category']);

			for (const [path, message] of required) {
				if (!data[path]) context.addIssue({ code: 'custom', message, path: [path] });
			}
		});

type FormValues = z.infer<ReturnType<typeof getSchema>>;

export default function CreateItemDialog({
	onItemCreated,
	existingItems = [],
	stationId,
	currentUserId,
	tools = [],
	panSizes = [],
	portionSizes = [],
	shelfLifes = [],
	temperatureCategories = getDefaultTemperatureCategories(''),
}: CreateItemDialogProps) {
	const ItemIcon = Icons.items;
	const [open, setOpen] = useState(false);
	const [criteria, setCriteria] = useState<DraftItemCriterion[]>(() =>
		createPresetCriteria(ItemType.FOOD_PREP),
	);
	const [criteriaCustomized, setCriteriaCustomized] = useState(false);
	const schema = useMemo(() => getSchema(existingItems), [existingItems]);

	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			itemName: '',
			itemType: ItemType.FOOD_PREP,
			shelfLife: '',
			panSize: '',
			isTool: false,
			toolName: '',
			isPortioned: false,
			portionSize: '',
			isTempTaken: false,
			tempCategory: '',
			templateNotes: '',
		},
		mode: 'onChange',
	});

	const itemType = form.watch('itemType');
	const resetDialog = () => {
		form.reset();
		setCriteria(createPresetCriteria(ItemType.FOOD_PREP));
		setCriteriaCustomized(false);
	};

	const onSubmit = async (values: FormValues) => {
		const criteriaError = validateCriteria(criteria);
		if (criteriaError) return toast.error(criteriaError);

		const foodPrep = values.itemType === ItemType.FOOD_PREP;
		const selectedCategory = foodPrep && values.isTempTaken
			? temperatureCategories.find(
					(category) => category.id === values.tempCategory || category.code === values.tempCategory,
				)
			: undefined;

		if (foodPrep && values.isTempTaken && !selectedCategory) {
			return toast.error('Select a valid temperature category.');
		}

		const payload: ItemPayload = {
			itemName: values.itemName.trim(),
			itemType: values.itemType,
			itemActive: true,
			shelfLife: foodPrep ? values.shelfLife : null,
			panSize: foodPrep ? values.panSize : null,
			isTool: foodPrep && values.isTool,
			toolName: foodPrep && values.isTool ? values.toolName || null : null,
			isPortioned: foodPrep && values.isPortioned,
			portionSize: foodPrep && values.isPortioned ? values.portionSize || null : null,
			isTempTaken: foodPrep && values.isTempTaken,
			tempCategory:
				foodPrep && values.isTempTaken && selectedCategory && !selectedCategory.id
					? selectedCategory.code
					: null,
			tempCategoryId: foodPrep && values.isTempTaken ? selectedCategory?.id || null : null,
			isCheckMark: true,
			templateNotes: values.templateNotes?.trim() || null,
		};

		const response = await createItem(stationId, payload, currentUserId);
		if (response.error || !response.data) {
			return toast.error(response.error || 'Failed to create item.');
		}

		const item = response.data;
		if (!item.id) {
			onItemCreated?.(item);
			return toast.error('Item was created, but the server did not return its ID.');
		}

		try {
			const savedCriteria = await createCriteria(item.id, criteria);
			onItemCreated?.({ ...item, criteria: savedCriteria });
			toast.success(`Item ${item.itemName} created successfully`);
			resetDialog();
			setOpen(false);
		} catch (error) {
			onItemCreated?.(item);
			toast.error(
				`Item created, but its checks could not be saved: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`,
			);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (!nextOpen && !form.formState.isSubmitting) resetDialog();
			}}
		>
			<DialogTrigger asChild>
				<Button variant="outline" className="flex items-center gap-2 px-3 py-1 text-sm font-bold text-chart-3 md:px-4 md:py-2 md:text-lg">
					<ItemIcon className="!size-[25px]" />
					<span className="hidden sm:inline">Create Item</span>
				</Button>
			</DialogTrigger>

			<DialogContent className="max-h-[90vh] overflow-y-auto bg-accent sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>Create New Item</DialogTitle>
					<DialogDescription>
						Choose the item type, setup details, and what staff will check.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
						<div className="grid gap-4 sm:grid-cols-2">
							<FormField control={form.control} name="itemName" render={({ field }) => (
								<FormItem>
									<FormLabel>Item name</FormLabel>
									<FormControl><Input placeholder="e.g. Walk-in cooler" {...field} /></FormControl>
									<FormMessage />
								</FormItem>
							)} />
							<FormField control={form.control} name="itemType" render={({ field }) => (
								<FormItem>
									<FormLabel>Item type</FormLabel>
									<Select value={field.value} onValueChange={(value: ItemType) => {
										field.onChange(value);
										if (!criteriaCustomized) setCriteria(createPresetCriteria(value));
									}}>
										<FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
										<SelectContent>
											{Object.values(ItemType).map((type) => <SelectItem key={type} value={type}>{itemTypeLabels[type]}</SelectItem>)}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)} />
						</div>

						<p className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
							{itemTypeDescriptions[itemType]}
						</p>

						{itemType === ItemType.FOOD_PREP && (
							<FoodPrepFields form={form} tools={tools} panSizes={panSizes} portionSizes={portionSizes} shelfLifes={shelfLifes} temperatureCategories={temperatureCategories} />
						)}

						<FormField control={form.control} name="templateNotes" render={({ field }) => (
							<FormItem>
								<FormLabel>Instructions or notes</FormLabel>
								<FormControl><Textarea placeholder="What should the team know when checking this item?" {...field} /></FormControl>
								<FormMessage />
							</FormItem>
						)} />

						<ItemCriteriaEditor criteria={criteria} onChange={(nextCriteria) => {
							setCriteria(nextCriteria);
							setCriteriaCustomized(true);
						}} />

						<DialogFooter>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? 'Creating…' : 'Create item'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export function FoodPrepFields({
	form,
	tools,
	panSizes,
	portionSizes,
	shelfLifes,
	temperatureCategories,
}: {
	form: UseFormReturn<any>;
	tools: OptionEntity[];
	panSizes: OptionEntity[];
	portionSizes: OptionEntity[];
	shelfLifes: OptionEntity[];
	temperatureCategories: TemperatureCategory[];
}) {
	return (
		<section className="space-y-4 rounded-xl border bg-background/70 p-4">
			<div>
				<h3 className="font-semibold">Food setup</h3>
				<p className="text-sm text-muted-foreground">Shelf life and pan size are required for food prep items.</p>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				<OptionField form={form} name="shelfLife" label="Shelf life" options={shelfLifes} />
				<OptionField form={form} name="panSize" label="Pan size" options={panSizes} />
			</div>
			<ToggleFormField form={form} name="isTool" label="Is a tool needed?" onDisable={() => form.setValue('toolName', '')} />
			{form.watch('isTool') && <OptionField form={form} name="toolName" label="Tool" options={tools} />}
			<ToggleFormField form={form} name="isPortioned" label="Is this item portioned?" onDisable={() => form.setValue('portionSize', '')} />
			{form.watch('isPortioned') && <OptionField form={form} name="portionSize" label="Portion size" options={portionSizes} />}
			<ToggleFormField form={form} name="isTempTaken" label="Use the food temperature category?" onDisable={() => form.setValue('tempCategory', '')} />
			{form.watch('isTempTaken') && (
				<FormField control={form.control} name="tempCategory" render={({ field }) => (
					<FormItem>
						<FormLabel>Temperature category</FormLabel>
						<Select value={field.value} onValueChange={field.onChange}>
							<FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select temperature category" /></SelectTrigger></FormControl>
							<SelectContent>
								{temperatureCategories.filter((category) => category.active).map((category) => (
									<SelectItem key={category.id ?? category.code} value={category.id ?? category.code}>
										{category.name} ({category.minTemp}°{category.unit}–{category.maxTemp}°{category.unit})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)} />
			)}
		</section>
	);
}

function OptionField({
	form,
	name,
	label,
	options,
}: {
	form: UseFormReturn<FormValues>;
	name: 'shelfLife' | 'panSize' | 'toolName' | 'portionSize';
	label: string;
	options: OptionEntity[];
}) {
	return (
		<FormField control={form.control} name={name} render={({ field }) => (
			<FormItem>
				<FormLabel>{label}</FormLabel>
				<Select value={field.value} onValueChange={field.onChange}>
					<FormControl><SelectTrigger className="w-full"><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger></FormControl>
					<SelectContent>
						{options.map((option) => <SelectItem key={option.id} value={option.optionName}>{option.optionName}</SelectItem>)}
					</SelectContent>
				</Select>
				<FormMessage />
			</FormItem>
		)} />
	);
}

function ToggleFormField({
	form,
	name,
	label,
	onDisable,
}: {
	form: UseFormReturn<FormValues>;
	name: 'isTool' | 'isPortioned' | 'isTempTaken';
	label: string;
	onDisable: () => void;
}) {
	return (
		<FormField control={form.control} name={name} render={({ field }) => (
			<FormItem className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2.5">
				<FormLabel className="mb-0">{label}</FormLabel>
				<FormControl>
					<Switch checked={field.value} onCheckedChange={(checked) => {
						field.onChange(checked);
						if (!checked) onDisable();
					}} />
				</FormControl>
			</FormItem>
		)} />
	);
}

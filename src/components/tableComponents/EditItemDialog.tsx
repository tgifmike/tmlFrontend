'use client';

import { getItemCriteria, ItemPayload, updateItem } from '@/app/api/item.Api';
import {
	Item,
	ItemCriterion,
	ItemType,
	OptionEntity,
	TemperatureCategory,
} from '@/app/types';
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
import { Textarea } from '@/components/ui/textarea';
import {
	FoodPrepFields,
	itemTypeDescriptions,
	itemTypeLabels,
} from '@/components/tableComponents/CreateItemDialog';
import {
	createPresetCriteria,
	DraftItemCriterion,
	ItemCriteriaEditor,
	toCriterionDrafts,
} from '@/components/tableComponents/ItemCriteriaEditor';
import { getDefaultTemperatureCategories } from '@/lib/constants/usConstants';
import { syncCriteria, validateCriteria } from '@/lib/item-criteria';
import { Icons } from '@/lib/icon';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type EditItemDialogProps = {
	item: Item;
	items: Item[];
	tools?: OptionEntity[];
	panSizes?: OptionEntity[];
	portionSizes?: OptionEntity[];
	shelfLifes?: OptionEntity[];
	temperatureCategories?: TemperatureCategory[];
	stationId: string;
	currentUserId: string;
	onUpdate: (updatedItem: Item) => void;
	trigger?: ReactElement;
};

const getSchema = (items: Item[] = [], currentItemId?: string) =>
	z
		.object({
			itemName: z.string().trim().min(1, 'Item name cannot be empty').refine(
				(name) =>
					!items.some(
						(item) =>
							item.id !== currentItemId &&
							item.itemName.toLowerCase() === name.toLowerCase(),
					),
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

export function EditItemDialog({
	item,
	items,
	stationId,
	currentUserId,
	tools = [],
	panSizes = [],
	portionSizes = [],
	shelfLifes = [],
	temperatureCategories = getDefaultTemperatureCategories(''),
	onUpdate,
	trigger,
}: EditItemDialogProps) {
	const EditIcon = Icons.pencil;
	const [open, setOpen] = useState(false);
	const [criteriaLoading, setCriteriaLoading] = useState(false);
	const [criteria, setCriteria] = useState<DraftItemCriterion[]>([]);
	const [originalCriteria, setOriginalCriteria] = useState<ItemCriterion[]>([]);
	const schema = useMemo(() => getSchema(items, item.id), [items, item.id]);

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

	useEffect(() => {
		if (!open) return;

		const resolvedType = item.itemType ?? ItemType.FOOD_PREP;
		form.reset({
			itemName: item.itemName ?? '',
			itemType: resolvedType,
			shelfLife: item.shelfLife ?? '',
			panSize: item.panSize ?? '',
			isTool: item.isTool ?? false,
			toolName: item.toolName ?? '',
			isPortioned: item.isPortioned ?? false,
			portionSize: item.portionSize ?? '',
			isTempTaken: item.isTempTaken ?? false,
			tempCategory:
				item.tempCategoryId ?? item.temperatureCategory?.id ?? item.tempCategory ?? '',
			templateNotes: item.templateNotes ?? '',
		});

		let cancelled = false;
		const loadCriteria = async () => {
			if (!item.id) return;
			setCriteriaLoading(true);
			const response = await getItemCriteria(item.id);
			if (cancelled) return;

			const loaded = response.data ?? item.criteria ?? [];
			setOriginalCriteria(loaded);
			setCriteria(
				loaded.length > 0
					? toCriterionDrafts(loaded)
					: createPresetCriteria(resolvedType),
			);
			if (response.error) {
				toast.error(`Could not load the latest checks: ${response.error}`);
			}
			setCriteriaLoading(false);
		};

		loadCriteria();
		return () => {
			cancelled = true;
		};
	}, [open, item, form]);

	const onSubmit = async (values: FormValues) => {
		if (!currentUserId || !item.id) return toast.error('Invalid user or item ID.');
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

		// Empty strings intentionally clear old food-only fields. The current backend
		// update service treats null as "not supplied" for these values.
		const payload: Partial<ItemPayload> = {
			itemName: values.itemName.trim(),
			itemType: values.itemType,
			itemActive: item.itemActive ?? true,
			shelfLife: foodPrep ? values.shelfLife || '' : '',
			panSize: foodPrep ? values.panSize || '' : '',
			isTool: foodPrep && values.isTool,
			toolName: foodPrep && values.isTool ? values.toolName || '' : '',
			isPortioned: foodPrep && values.isPortioned,
			portionSize: foodPrep && values.isPortioned ? values.portionSize || '' : '',
			isTempTaken: foodPrep && values.isTempTaken,
			tempCategory:
				foodPrep && values.isTempTaken && selectedCategory && !selectedCategory.id
					? selectedCategory.code
					: null,
			tempCategoryId: foodPrep && values.isTempTaken ? selectedCategory?.id || null : null,
			isCheckMark: item.isCheckMark ?? true,
			templateNotes: values.templateNotes?.trim() || null,
		};

		try {
			const updatedItem = await updateItem(stationId, item.id, payload, currentUserId);
			try {
				const savedCriteria = await syncCriteria(item.id, originalCriteria, criteria);
				onUpdate({ ...updatedItem, criteria: savedCriteria });
				toast.success('Item and checks updated successfully');
				setOpen(false);
			} catch (error) {
				onUpdate(updatedItem);
				toast.error(
					`Item details saved, but its checks could not be fully saved: ${
						error instanceof Error ? error.message : 'Unknown error'
					}`,
				);
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to update item');
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger ?? (
					<Button variant="ghost" size="icon" aria-label={`Edit ${item.itemName}`}>
						<EditIcon className="!size-7" />
					</Button>
				)}
			</DialogTrigger>

			<DialogContent className="max-h-[90vh] overflow-y-auto bg-accent sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>Edit Item</DialogTitle>
					<DialogDescription>
						Update the setup and the checks shown during a line check.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
						<div className="grid gap-4 sm:grid-cols-2">
							<FormField control={form.control} name="itemName" render={({ field }) => (
								<FormItem>
									<FormLabel>Item name</FormLabel>
									<FormControl><Input {...field} /></FormControl>
									<FormMessage />
								</FormItem>
							)} />
							<FormField control={form.control} name="itemType" render={({ field }) => (
								<FormItem>
									<FormLabel>Item type</FormLabel>
									<Select value={field.value} onValueChange={(value: ItemType) => {
										field.onChange(value);
										if (criteria.length === 0) setCriteria(createPresetCriteria(value));
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

						{criteriaLoading ? (
							<div className="flex items-center justify-center gap-2 rounded-xl border p-8 text-sm text-muted-foreground">
								<Loader2 className="size-4 animate-spin" aria-hidden="true" />
								Loading checks…
							</div>
						) : (
							<ItemCriteriaEditor criteria={criteria} onChange={setCriteria} />
						)}

						<DialogFooter>
							<Button type="submit" disabled={criteriaLoading || form.formState.isSubmitting}>
								{form.formState.isSubmitting ? 'Saving…' : 'Save changes'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

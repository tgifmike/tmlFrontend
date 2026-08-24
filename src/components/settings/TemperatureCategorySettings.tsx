'use client';

import {
	addDefaultTemperatureCategories,
	createTemperatureCategory,
	deleteTemperatureCategory,
	getTemperatureCategories,
	toggleTemperatureCategory,
	updateTemperatureCategory,
	type TemperatureCategoryInput,
} from '@/app/api/temperatureCategoryApi';
import type { TemperatureCategory } from '@/app/types';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getDefaultTemperatureCategories } from '@/lib/constants/usConstants';
import {
	AlertTriangle,
	Loader2,
	Pencil,
	Plus,
	RotateCcw,
	Thermometer,
	Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

type TemperatureCategorySettingsProps = {
	locationId: string;
	userId?: string;
	canManage: boolean;
	onHistoryChange?: () => void;
};

const emptyEditor: TemperatureCategoryInput = {
	name: '',
	code: '',
	minTemp: 0,
	maxTemp: 0,
	unit: 'F',
	active: true,
};

export default function TemperatureCategorySettings({
	locationId,
	userId,
	canManage,
	onHistoryChange,
}: TemperatureCategorySettingsProps) {
	const [categories, setCategories] = useState<TemperatureCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [savingDefaults, setSavingDefaults] = useState(false);
	const [backendReady, setBackendReady] = useState(true);
	const [editorOpen, setEditorOpen] = useState(false);
	const [editingCategory, setEditingCategory] =
		useState<TemperatureCategory | null>(null);

	const loadCategories = useCallback(async () => {
		setLoading(true);
		const response = await getTemperatureCategories(locationId);

		if (response.error) {
			setCategories(getDefaultTemperatureCategories(locationId));
			setBackendReady(false);
		} else {
			setBackendReady(true);

			let loadedCategories = response.data ?? [];

			// Existing locations may predate temperature-category seeding. Initialize
			// them once through the idempotent defaults endpoint when a manager visits.
			if (loadedCategories.length === 0 && canManage && userId) {
				try {
					loadedCategories = await addDefaultTemperatureCategories(
						locationId,
						userId,
					);
					onHistoryChange?.();
				} catch {
					// Keep the UI useful if seeding has not been deployed yet. The
					// explicit "Add defaults" action remains available for retrying.
					loadedCategories = [];
				}
			}

			setCategories(
				(loadedCategories.length > 0
					? [...loadedCategories]
					: getDefaultTemperatureCategories(locationId)
				).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
			);
		}

		setLoading(false);
	}, [canManage, locationId, onHistoryChange, userId]);

	useEffect(() => {
		loadCategories();
	}, [loadCategories]);

	const openCreateDialog = () => {
		setEditingCategory(null);
		setEditorOpen(true);
	};

	const openEditDialog = (category: TemperatureCategory) => {
		setEditingCategory(category);
		setEditorOpen(true);
	};

	const handleSave = async (values: TemperatureCategoryInput) => {
		if (!userId) throw new Error('You must be logged in to manage categories.');

		const saved = editingCategory?.id
			? await updateTemperatureCategory(editingCategory.id, values, userId)
			: await createTemperatureCategory(locationId, values, userId);

		setCategories((current) =>
			current.some((category) => category.id === saved.id)
				? current.map((category) =>
						category.id === saved.id ? saved : category,
					)
				: [...current, saved],
		);
		toast.success(
			editingCategory ? 'Temperature category updated.' : 'Temperature category created.',
		);
		onHistoryChange?.();
	};

	const handleToggle = async (category: TemperatureCategory, active: boolean) => {
		if (!category.id || !userId) return;

		setCategories((current) =>
			current.map((existing) =>
				existing.id === category.id ? { ...existing, active } : existing,
			),
		);

		try {
			const saved = await toggleTemperatureCategory(category.id, active, userId);
			setCategories((current) =>
				current.map((existing) =>
					existing.id === saved.id ? saved : existing,
				),
			);
			onHistoryChange?.();
		} catch (error) {
			setCategories((current) =>
				current.map((existing) =>
					existing.id === category.id
						? { ...existing, active: category.active }
						: existing,
				),
			);
			toast.error(error instanceof Error ? error.message : 'Failed to update category.');
		}
	};

	const handleDelete = async (category: TemperatureCategory) => {
		if (!category.id || !userId) return;

		try {
			await deleteTemperatureCategory(category.id, userId);
			setCategories((current) =>
				current.filter((existing) => existing.id !== category.id),
			);
			toast.success(`${category.name} removed.`);
			onHistoryChange?.();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: 'This category could not be removed.',
			);
		}
	};

	const handleRestoreDefaults = async () => {
		if (!userId) return;

		setSavingDefaults(true);
		try {
			// First recreate any deleted built-in categories, then explicitly reset
			// each built-in row. The backend defaults endpoint only adds missing rows.
			await addDefaultTemperatureCategories(locationId, userId);

			const response = await getTemperatureCategories(locationId);
			if (response.error) throw new Error(response.error);

			const currentCategories = response.data ?? [];
			const defaults = getDefaultTemperatureCategories(locationId);
			const restoredDefaults = await Promise.all(
				defaults.map(async (defaultCategory) => {
					const existing = currentCategories.find(
						(category) => category.code === defaultCategory.code,
					);

					if (!existing?.id) {
						throw new Error(`Could not restore ${defaultCategory.name}.`);
					}

					return updateTemperatureCategory(
						existing.id,
						{
							name: defaultCategory.name,
							code: defaultCategory.code,
							minTemp: defaultCategory.minTemp,
							maxTemp: defaultCategory.maxTemp,
							unit: defaultCategory.unit,
							active: true,
						},
						userId,
					);
				}),
			);

			const restoredById = new Map(
				restoredDefaults.map((category) => [category.id, category]),
			);
			setCategories(
				currentCategories
					.map((category) => restoredById.get(category.id) ?? category)
					.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
			);
			toast.success('Default temperature categories restored.');
			onHistoryChange?.();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to restore defaults.',
			);
		} finally {
			setSavingDefaults(false);
		}
	};

	const managementDisabled = !canManage || !backendReady || !userId;

	return (
		<>
			<Card className="w-full rounded-2xl border-border/60 bg-card shadow-sm">
				<CardHeader className="gap-4 border-b border-border/50 sm:flex sm:flex-row sm:items-start sm:justify-between">
					<div>
						<CardTitle className="flex items-center gap-2 text-xl">
							<Thermometer className="size-5 text-primary" aria-hidden="true" />
							Temperature Categories
						</CardTitle>
						<CardDescription className="mt-2 max-w-2xl leading-6">
							Set the acceptable range used when an item requires a temperature check.
							Changes apply to this location.
						</CardDescription>
					</div>

					{canManage && (
						<div className="flex flex-wrap gap-2">
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										variant="outline"
										disabled={managementDisabled || savingDefaults}
									>
										{savingDefaults ? (
											<Loader2 className="animate-spin" aria-hidden="true" />
										) : (
											<RotateCcw aria-hidden="true" />
										)}
										Restore defaults
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											Restore default temperature categories?
										</AlertDialogTitle>
										<AlertDialogDescription>
											This resets the names, temperature ranges, and active status of
											the four built-in categories. Custom categories are not changed.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction onClick={handleRestoreDefaults}>
											Restore defaults
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
							<Button onClick={openCreateDialog} disabled={managementDisabled}>
								<Plus aria-hidden="true" />
								Add category
							</Button>
						</div>
					)}
				</CardHeader>

				<CardContent className="space-y-4 pt-6">
					{!backendReady && (
						<Alert className="border-amber-500/40 bg-amber-500/10">
							<AlertTriangle aria-hidden="true" />
							<AlertTitle>Backend endpoint required</AlertTitle>
							<AlertDescription>
								The built-in defaults are shown for preview. Add the temperature-category
								endpoints before changes can be saved.
							</AlertDescription>
						</Alert>
					)}

					{loading ? (
						<div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
							<Loader2 className="size-5 animate-spin" aria-hidden="true" />
							Loading temperature categories…
						</div>
					) : categories.length === 0 ? (
						<div className="rounded-2xl border border-dashed px-6 py-12 text-center">
							<p className="font-medium">No temperature categories configured</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Restore the standard defaults or create a category for this location.
							</p>
						</div>
					) : (
						<div className="grid gap-3">
							{categories.map((category) => (
								<div
									key={category.id ?? category.code}
									className="grid gap-4 rounded-xl border border-border/60 bg-muted/15 p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
								>
									<div className="min-w-0">
										<div className="flex flex-wrap items-center gap-2">
											<p className="truncate font-semibold">{category.name}</p>
											{category.systemDefault && (
												<Badge variant="secondary">Default</Badge>
											)}
											{!category.active && <Badge variant="outline">Inactive</Badge>}
										</div>
									</div>

									<div className="rounded-xl border bg-background px-4 py-2 text-center">
										<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
											Acceptable range
										</p>
										<p className="mt-1 font-semibold tabular-nums">
											{category.minTemp}°{category.unit} – {category.maxTemp}°{category.unit}
										</p>
									</div>

									{canManage && (
										<div className="flex items-center justify-end gap-1">
											<Switch
												checked={category.active}
												onCheckedChange={(active) =>
													handleToggle(category, Boolean(active))
												}
												disabled={managementDisabled || !category.id}
												aria-label={`${category.active ? 'Deactivate' : 'Activate'} ${category.name}`}
											/>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => openEditDialog(category)}
												disabled={managementDisabled || !category.id}
												aria-label={`Edit ${category.name}`}
											>
												<Pencil aria-hidden="true" />
											</Button>

											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="text-destructive hover:text-destructive"
														disabled={managementDisabled || !category.id}
														aria-label={`Delete ${category.name}`}
													>
														<Trash2 aria-hidden="true" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Remove {category.name}?</AlertDialogTitle>
														<AlertDialogDescription>
															Categories used by items should be deactivated instead of deleted.
															The backend will reject deletion when the category is in use.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => handleDelete(category)}
															className="bg-destructive text-white hover:bg-destructive/90"
														>
															Remove
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<TemperatureCategoryEditor
				open={editorOpen}
				onOpenChange={setEditorOpen}
				category={editingCategory}
				onSave={handleSave}
			/>
		</>
	);
}

function TemperatureCategoryEditor({
	open,
	onOpenChange,
	category,
	onSave,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	category: TemperatureCategory | null;
	onSave: (values: TemperatureCategoryInput) => Promise<void>;
}) {
	const [values, setValues] = useState<TemperatureCategoryInput>(emptyEditor);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;

		setValues(
			category
				? {
						name: category.name,
						code: category.code,
						minTemp: category.minTemp,
						maxTemp: category.maxTemp,
						unit: category.unit,
						active: category.active,
					}
				: emptyEditor,
		);
		setError(null);
	}, [category, open]);

	const submit = async () => {
		const name = values.name.trim();
		const minTemp = Number(values.minTemp);
		const maxTemp = Number(values.maxTemp);

		if (!name) {
			setError('Category name is required.');
			return;
		}
		if (!Number.isFinite(minTemp) || !Number.isFinite(maxTemp)) {
			setError('Enter valid minimum and maximum temperatures.');
			return;
		}
		if (minTemp >= maxTemp) {
			setError('Minimum temperature must be lower than maximum temperature.');
			return;
		}

		const code = category?.code || toCategoryCode(name);
		setSaving(true);
		setError(null);

		try {
			await onSave({ ...values, name, code, minTemp, maxTemp, unit: 'F' });
			onOpenChange(false);
		} catch (saveError) {
			setError(
				saveError instanceof Error ? saveError.message : 'Failed to save category.',
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{category ? 'Edit temperature category' : 'Create temperature category'}
					</DialogTitle>
					<DialogDescription>
						Set the inclusive acceptable range in Fahrenheit. The minimum must be
						lower than the maximum.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-5 py-2">
					<div className="grid gap-2">
						<Label htmlFor="temperature-category-name">Category name</Label>
						<Input
							id="temperature-category-name"
							value={values.name}
							onChange={(event) =>
								setValues((current) => ({ ...current, name: event.target.value }))
							}
							placeholder="Example: Cold prep"
							autoFocus
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label htmlFor="temperature-category-min">Minimum °F</Label>
							<Input
								id="temperature-category-min"
								type="number"
								step="0.1"
								value={values.minTemp}
								onChange={(event) =>
									setValues((current) => ({
										...current,
										minTemp: event.target.valueAsNumber,
									}))
								}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="temperature-category-max">Maximum °F</Label>
							<Input
								id="temperature-category-max"
								type="number"
								step="0.1"
								value={values.maxTemp}
								onChange={(event) =>
									setValues((current) => ({
										...current,
										maxTemp: event.target.valueAsNumber,
									}))
								}
							/>
						</div>
					</div>

					<div className="flex items-center justify-between rounded-xl border p-4">
						<div>
							<Label htmlFor="temperature-category-active">Active</Label>
							<p className="mt-1 text-xs text-muted-foreground">
								Inactive categories cannot be selected for new item configurations.
							</p>
						</div>
						<Switch
							id="temperature-category-active"
							checked={values.active}
							onCheckedChange={(active) =>
								setValues((current) => ({ ...current, active: Boolean(active) }))
							}
						/>
					</div>

					{error && <p className="text-sm text-destructive">{error}</p>}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
						Cancel
					</Button>
					<Button onClick={submit} disabled={saving}>
						{saving && <Loader2 className="animate-spin" aria-hidden="true" />}
						{category ? 'Save changes' : 'Create category'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function toCategoryCode(name: string) {
	return name
		.trim()
		.toUpperCase()
		.replace(/[^A-Z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '');
}

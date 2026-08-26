'use client';

import { useMemo, useState } from 'react';
import {
	CheckCircle2,
	Circle,
	Loader2,
	Sparkles,
	Trash2,
	WandSparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { createItem, getItemsByStation } from '@/app/api/item.Api';
import { createOption, getOptions } from '@/app/api/optionsApi';
import {
	createStation,
	getStationsByLocation,
} from '@/app/api/stationApi';
import { ItemType, OptionType, OptionTypeLabels } from '@/app/types';
import type {
	OptionEntity,
	StationDto,
	TemperatureCategory,
} from '@/app/types';
import type {
	LocationBlueprint,
	LocationBlueprintRequest,
} from '@/lib/location-blueprint';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type LocationBlueprintBuilderProps = {
	accountId: string;
	accountName?: string | null;
	locationId: string;
	locationName?: string | null;
	userId: string;
	existingOptions: OptionEntity[];
	existingStations: StationDto[];
	temperatureCategories: TemperatureCategory[];
	onApplied: (result: BlueprintApplyResult) => Promise<void> | void;
};

export type BlueprintApplyResult = {
	primaryStationId?: string;
	createdOptions: number;
	createdStations: number;
	createdItems: number;
	skippedExisting: number;
};

const optionBlueprintKeys: Record<
	OptionType,
	keyof LocationBlueprint['options']
> = {
	[OptionType.TOOL]: 'tools',
	[OptionType.SHELF_LIFE]: 'shelfLives',
	[OptionType.PAN_SIZE]: 'panSizes',
	[OptionType.PORTION_SIZE]: 'portionSizes',
};

type BlueprintGuideItem = {
	id: string;
	label: string;
	examples: string[];
	keywords: string[];
};

export default function LocationBlueprintBuilder({
	accountId,
	accountName,
	locationId,
	locationName,
	userId,
	existingOptions,
	existingStations,
	temperatureCategories,
	onApplied,
}: LocationBlueprintBuilderProps) {
	const [description, setDescription] = useState('');
	const [blueprint, setBlueprint] = useState<LocationBlueprint | null>(null);
	const [generating, setGenerating] = useState(false);
	const [applying, setApplying] = useState(false);
	const [applyStatus, setApplyStatus] = useState('');
	const [lastResult, setLastResult] = useState<BlueprintApplyResult | null>(null);

	const blueprintItemCount = useMemo(
		() =>
			blueprint?.stations.reduce(
				(total, station) => total + station.items.length,
				0,
			) ?? 0,
		[blueprint],
	);
	const promptGuide = useMemo(
		() => buildPromptGuide(existingOptions, existingStations),
		[existingOptions, existingStations],
	);
	const completedGuideItems = promptGuide.filter((item) =>
		guideItemIsPresent(description, item),
	).length;

	const addExampleToDescription = (item: BlueprintGuideItem, example: string) => {
		if (description.toLocaleLowerCase().includes(example.toLocaleLowerCase())) {
			return;
		}

		setDescription((current) => {
			const separator = current.trim() ? ' ' : '';
			return `${current.trim()}${separator}${item.label}: ${example}.`;
		});
	};

	const generateBlueprint = async () => {
		if (description.trim().length < 20) {
			toast.error('Add a little more detail about the location first.');
			return;
		}

		setGenerating(true);
		setLastResult(null);
		try {
			const payload: LocationBlueprintRequest = {
				description: description.trim(),
				accountName: accountName ?? undefined,
				locationName: locationName ?? undefined,
				existingOptions: {
					tools: optionNames(existingOptions, OptionType.TOOL),
					shelfLives: optionNames(existingOptions, OptionType.SHELF_LIFE),
					panSizes: optionNames(existingOptions, OptionType.PAN_SIZE),
					portionSizes: optionNames(
						existingOptions,
						OptionType.PORTION_SIZE,
					),
				},
				existingStations: existingStations.map((station) => ({
					name: station.stationName,
					items: (station.items ?? []).map((item) => item.itemName),
				})),
				temperatureCategories: temperatureCategories
					.filter((category) => category.active)
					.map((category) => ({
						code: category.code,
						name: category.name,
					})),
			};

			const response = await fetch('/api/location-blueprint', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const body = (await response.json()) as {
				blueprint?: LocationBlueprint;
				error?: string;
			};

			if (!response.ok || !body.blueprint) {
				throw new Error(body.error || 'Failed to generate a location blueprint.');
			}

			setBlueprint(body.blueprint);
			toast.success('Blueprint ready for review.');
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: 'Failed to generate a location blueprint.',
			);
		} finally {
			setGenerating(false);
		}
	};

	const removeStation = (stationIndex: number) => {
		setBlueprint((current) =>
			current
				? {
						...current,
						stations: current.stations.filter(
							(_, index) => index !== stationIndex,
						),
					}
				: current,
		);
	};

	const removeItem = (stationIndex: number, itemIndex: number) => {
		setBlueprint((current) => {
			if (!current) return current;
			return {
				...current,
				stations: current.stations.map((station, index) =>
					index === stationIndex
						? {
								...station,
								items: station.items.filter(
									(_, currentItemIndex) => currentItemIndex !== itemIndex,
								),
							}
						: station,
				),
			};
		});
	};

	const applyBlueprint = async () => {
		if (!blueprint || blueprint.stations.length === 0) return;

		setApplying(true);
		setApplyStatus('Checking the current location setup…');
		try {
			const result = await applyLocationBlueprint({
				blueprint,
				accountId,
				locationId,
				userId,
				temperatureCategories,
				onStatus: setApplyStatus,
			});

			setLastResult(result);
			await onApplied(result);
			toast.success(
				`Blueprint applied: ${result.createdStations} stations and ${result.createdItems} items added.`,
			);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: 'The blueprint could not be applied.',
			);
		} finally {
			setApplying(false);
			setApplyStatus('');
		}
	};

	return (
		<div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
			<div className="flex items-start gap-3">
				<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
					<WandSparkles className="size-4" aria-hidden="true" />
				</span>
				<div>
					<p className="font-semibold">Generate a location blueprint</p>
					<p className="text-sm text-muted-foreground">
						Describe the operation and get a proposed set of options, stations,
						and line-check items. Nothing is saved until you approve it.
					</p>
				</div>
			</div>

			<div className="space-y-3 rounded-xl border bg-background p-3">
				<div className="flex items-start justify-between gap-3">
					<div>
						<p className="text-sm font-semibold">Blueprint details to include</p>
						<p className="text-xs text-muted-foreground">
							Add what you know—you do not need every checkmark. Tap an example
							to add it, or type your own details below.
						</p>
					</div>
					<Badge variant="secondary" className="shrink-0">
						{completedGuideItems}/{promptGuide.length} included
					</Badge>
				</div>

				<div className="grid gap-2 sm:grid-cols-2">
					{promptGuide.map((item) => {
						const complete = guideItemIsPresent(description, item);

						return (
							<div
								key={item.id}
								className={`rounded-lg border p-3 transition-colors ${
									complete
										? 'border-emerald-300 bg-emerald-50/70'
										: 'bg-muted/20'
								}`}
							>
								<div className="flex items-center gap-2">
									{complete ? (
										<CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
									) : (
										<Circle className="size-4 shrink-0 text-muted-foreground" />
									)}
									<span
										className={`text-sm font-medium ${
											complete ? 'text-emerald-800' : ''
										}`}
									>
										{item.label}
									</span>
								</div>
								<div className="mt-2 flex flex-wrap gap-1.5">
									{item.examples.map((example) => {
										const included = description
											.toLocaleLowerCase()
											.includes(example.toLocaleLowerCase());

										return (
											<button
												type="button"
												key={example}
												onClick={() => addExampleToDescription(item, example)}
												className={`rounded-full border px-2 py-1 text-xs transition-colors ${
													included
														? 'border-emerald-300 bg-emerald-100 text-emerald-800'
														: 'bg-background text-muted-foreground hover:border-primary/40 hover:text-primary'
												}`}
											>
												{included && <span aria-hidden="true">✓ </span>}
												{example}
											</button>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<div className="space-y-1.5">
				<label
					htmlFor="location-blueprint-description"
					className="text-sm font-medium"
				>
					Describe this location
				</label>
				<Textarea
					id="location-blueprint-description"
					value={description}
					onChange={(event) => setDescription(event.target.value)}
					placeholder="Example: A fast-casual burger restaurant with a grill, fryer, cold prep, walk-in cooler, restrooms, and opening/closing cleanliness checks. We portion sauces and use 1/6 and 1/3 pans."
					className="min-h-32 bg-background"
					maxLength={4000}
				/>
				<p className="text-right text-xs text-muted-foreground">
					{description.length}/4000 characters
				</p>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<Button
					type="button"
					onClick={generateBlueprint}
					disabled={generating || applying || description.trim().length < 20}
				>
					{generating ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<Sparkles className="size-4" />
					)}
					{generating ? 'Generating blueprint…' : blueprint ? 'Regenerate' : 'Generate blueprint'}
				</Button>
				<span className="text-xs text-muted-foreground">
					AI suggestions require manager review.
				</span>
			</div>

			{blueprint && (
				<div className="space-y-4 rounded-xl border bg-background p-4">
					<div className="flex flex-wrap items-start justify-between gap-3">
						<div>
							<p className="font-semibold">Blueprint preview</p>
							<p className="mt-1 text-sm text-muted-foreground">
								{blueprint.summary}
							</p>
						</div>
						<div className="flex gap-2">
							<Badge variant="secondary">
								{blueprint.stations.length} stations
							</Badge>
							<Badge variant="secondary">{blueprintItemCount} items</Badge>
						</div>
					</div>

					{blueprint.assumptions.length > 0 && (
						<Alert>
							<AlertTitle>Assumptions to review</AlertTitle>
							<AlertDescription>
								<ul className="mt-1 list-disc space-y-1 pl-4">
									{blueprint.assumptions.map((assumption) => (
										<li key={assumption}>{assumption}</li>
									))}
								</ul>
							</AlertDescription>
						</Alert>
					)}

					<div className="space-y-2">
						<p className="text-sm font-semibold">Suggested options</p>
						{Object.entries(optionBlueprintKeys).map(([type, key]) => (
							<div key={type} className="grid gap-2 sm:grid-cols-[8rem_1fr]">
								<span className="text-xs font-medium text-muted-foreground">
									{OptionTypeLabels[type as OptionType]}
								</span>
								<div className="flex flex-wrap gap-1.5">
									{blueprint.options[key].length > 0 ? (
										blueprint.options[key].map((value) => (
											<Badge key={value} variant="outline">
												{value}
											</Badge>
										))
									) : (
										<span className="text-xs text-muted-foreground">None</span>
									)}
								</div>
							</div>
						))}
					</div>

					<div className="space-y-3">
						{blueprint.stations.map((station, stationIndex) => (
							<div key={`${station.name}-${stationIndex}`} className="rounded-lg border p-3">
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="font-medium">{station.name}</p>
										<p className="text-xs text-muted-foreground">{station.purpose}</p>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => removeStation(stationIndex)}
										aria-label={`Remove ${station.name} from blueprint`}
									>
										<Trash2 className="size-4" />
									</Button>
								</div>
								<div className="mt-3 space-y-1.5">
									{station.items.map((item, itemIndex) => (
										<div
											key={`${item.name}-${itemIndex}`}
											className="flex items-center justify-between gap-3 rounded-md bg-muted/40 px-3 py-2"
										>
											<div className="min-w-0">
												<p className="truncate text-sm font-medium">{item.name}</p>
												<p className="truncate text-xs text-muted-foreground">
													{item.shelfLife} · {item.panSize}
													{item.temperatureRequired && item.temperatureCategoryCode
														? ` · ${item.temperatureCategoryCode}`
														: ''}
												</p>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => removeItem(stationIndex, itemIndex)}
												aria-label={`Remove ${item.name} from blueprint`}
											>
												<Trash2 className="size-3.5" />
											</Button>
										</div>
									))}
								</div>
							</div>
						))}
					</div>

					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button disabled={applying || blueprintItemCount === 0}>
								{applying ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<CheckCircle2 className="size-4" />
								)}
								{applying ? applyStatus || 'Applying…' : 'Approve and apply blueprint'}
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Apply this location blueprint?</AlertDialogTitle>
								<AlertDialogDescription>
									This adds missing options, stations, and items. Existing records are
									kept unchanged, and matching names are skipped. Because the backend
									does not yet provide a bulk transaction, you can safely retry if a
									partial network failure occurs.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Keep reviewing</AlertDialogCancel>
								<AlertDialogAction onClick={applyBlueprint}>
									Apply blueprint
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			)}

			{lastResult && (
				<Alert className="border-emerald-200 bg-emerald-50/70 text-emerald-950">
					<CheckCircle2 className="size-4 text-emerald-700" />
					<AlertTitle>Blueprint applied</AlertTitle>
					<AlertDescription>
						Added {lastResult.createdOptions} options, {lastResult.createdStations}{' '}
						stations, and {lastResult.createdItems} items. Skipped{' '}
						{lastResult.skippedExisting} matching records already in the account.
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}

async function applyLocationBlueprint({
	blueprint,
	accountId,
	locationId,
	userId,
	temperatureCategories,
	onStatus,
}: {
	blueprint: LocationBlueprint;
	accountId: string;
	locationId: string;
	userId: string;
	temperatureCategories: TemperatureCategory[];
	onStatus: (status: string) => void;
}): Promise<BlueprintApplyResult> {
	const currentOptionResponse = await getOptions(accountId);
	if (currentOptionResponse.error) throw new Error(currentOptionResponse.error);
	let currentOptions = currentOptionResponse.data ?? [];

	const requestedOptions = collectRequestedOptions(blueprint);
	for (const requested of requestedOptions) {
		const existing = currentOptions.find(
			(option) =>
				option.optionType === requested.type &&
				normalizeName(option.optionName) === normalizeName(requested.name),
		);
		if (existing && !existing.optionActive) {
			throw new Error(
				`${OptionTypeLabels[requested.type]} “${existing.optionName}” is inactive. Reactivate it on the Options page, then apply the blueprint again.`,
			);
		}
	}

	for (const station of blueprint.stations) {
		for (const item of station.items) {
			if (!item.temperatureRequired) continue;
			const category = findTemperatureCategory(
				temperatureCategories,
				item.temperatureCategoryCode,
			);
			if (!category) {
				throw new Error(
					`“${item.name}” references a temperature category that is unavailable. Remove that item or regenerate the blueprint.`,
				);
			}
		}
	}

	let createdOptions = 0;
	let createdStations = 0;
	let createdItems = 0;
	let skippedExisting = 0;
	let primaryStationId: string | undefined;

	for (const requested of requestedOptions) {
		const existing = currentOptions.find(
			(option) =>
				option.optionType === requested.type &&
				normalizeName(option.optionName) === normalizeName(requested.name),
		);
		if (existing) {
			skippedExisting += 1;
			continue;
		}

		onStatus(`Adding ${OptionTypeLabels[requested.type].toLowerCase()} options…`);
		const created = await createOption(
			{
				accountId,
				optionName: requested.name,
				optionType: requested.type,
				optionActive: true,
			},
			userId,
		);
		if (!created?.optionName) {
			throw new Error(`Failed to create option “${requested.name}”.`);
		}
		currentOptions = [...currentOptions, created];
		createdOptions += 1;
	}

	const stationResponse = await getStationsByLocation(locationId);
	if (stationResponse.error) throw new Error(stationResponse.error);
	let currentStations = stationResponse.data ?? [];

	for (const stationBlueprint of blueprint.stations) {
		if (stationBlueprint.items.length === 0) continue;
		onStatus(`Preparing ${stationBlueprint.name}…`);

		let station = currentStations.find(
			(candidate) =>
				normalizeName(candidate.stationName) ===
				normalizeName(stationBlueprint.name),
		);

		if (!station) {
			const created = await createStation(
				locationId,
				{
					stationName: stationBlueprint.name,
					stationActive: true,
					sortOrder: currentStations.length,
				},
				userId,
			);
			station = created;
			if (!station?.id) {
				const refreshed = await getStationsByLocation(locationId);
				station = (refreshed.data ?? []).find(
					(candidate) =>
						normalizeName(candidate.stationName) ===
						normalizeName(stationBlueprint.name),
				);
			}
			if (!station?.id) {
				throw new Error(`Failed to create station “${stationBlueprint.name}”.`);
			}
			currentStations = [...currentStations, station];
			createdStations += 1;
		} else {
			skippedExisting += 1;
		}

		primaryStationId ??= station.id;
		const itemResponse = await getItemsByStation(station.id!);
		if (itemResponse.error) throw new Error(itemResponse.error);
		let currentItems = itemResponse.data ?? [];

		for (const item of stationBlueprint.items) {
			const duplicate = currentItems.some(
				(existing) => normalizeName(existing.itemName) === normalizeName(item.name),
			);
			if (duplicate) {
				skippedExisting += 1;
				continue;
			}

			onStatus(`Adding ${item.name} to ${stationBlueprint.name}…`);
			const category = item.temperatureRequired
				? findTemperatureCategory(
						temperatureCategories,
						item.temperatureCategoryCode,
					)
				: undefined;
			const toolName = resolveOptionName(
				currentOptions,
				OptionType.TOOL,
				item.tool,
			);
			const portionSize = resolveOptionName(
				currentOptions,
				OptionType.PORTION_SIZE,
				item.portionSize,
			);

			const response = await createItem(
				station.id!,
				{
					itemName: item.name,
					itemType: ItemType.FOOD_PREP,
					shelfLife: resolveRequiredOptionName(
						currentOptions,
						OptionType.SHELF_LIFE,
						item.shelfLife,
					),
					panSize: resolveRequiredOptionName(
						currentOptions,
						OptionType.PAN_SIZE,
						item.panSize,
					),
					isTool: Boolean(toolName),
					...(toolName ? { toolName } : {}),
					isPortioned: Boolean(portionSize),
					...(portionSize ? { portionSize } : {}),
					isTempTaken: Boolean(category),
					...(category?.id
						? {
								tempCategoryId: category.id,
								minTemp: category.minTemp,
								maxTemp: category.maxTemp,
							}
						: {}),
					isCheckMark: true,
					itemActive: true,
					...(item.notes
						? { templateNotes: item.notes, itemNotes: item.notes }
						: {}),
				},
				userId,
			);
			if (response.error || !response.data) {
				throw new Error(response.error || `Failed to create “${item.name}”.`);
			}
			currentItems = [...currentItems, response.data];
			createdItems += 1;
		}
	}

	return {
		primaryStationId,
		createdOptions,
		createdStations,
		createdItems,
		skippedExisting,
	};
}

function collectRequestedOptions(blueprint: LocationBlueprint) {
	const requests: Array<{ type: OptionType; name: string }> = [];
	for (const [type, key] of Object.entries(optionBlueprintKeys)) {
		for (const name of blueprint.options[key]) {
			requests.push({ type: type as OptionType, name });
		}
	}

	for (const station of blueprint.stations) {
		for (const item of station.items) {
			requests.push({ type: OptionType.SHELF_LIFE, name: item.shelfLife });
			requests.push({ type: OptionType.PAN_SIZE, name: item.panSize });
			if (item.tool) requests.push({ type: OptionType.TOOL, name: item.tool });
			if (item.portionSize) {
				requests.push({
					type: OptionType.PORTION_SIZE,
					name: item.portionSize,
				});
			}
		}
	}

	return requests.filter(
		(request, index, all) =>
			all.findIndex(
				(candidate) =>
					candidate.type === request.type &&
					normalizeName(candidate.name) === normalizeName(request.name),
			) === index,
	);
}

function optionNames(options: OptionEntity[], type: OptionType) {
	return options
		.filter((option) => option.optionType === type && option.optionActive)
		.map((option) => option.optionName);
}

function buildPromptGuide(
	options: OptionEntity[],
	stations: StationDto[],
): BlueprintGuideItem[] {
	const examplesForOption = (type: OptionType, defaults: string[]) =>
		uniqueValues([
			...optionNames(options, type),
			...defaults,
		]).slice(0, 6);
	const stationExamples = uniqueValues([
		...stations.map((station) => station.stationName),
		'Broil',
		'Fry',
		'Cold prep',
		'Walk-in cooler',
		'Freezer',
		'Restrooms',
	]).slice(0, 8);

	return [
		{
			id: 'operation',
			label: 'Operation type',
			examples: ['Fast casual', 'Full service', 'Retail', 'Grocery'],
			keywords: [
				'restaurant',
				'retail',
				'grocery',
				'fast casual',
				'full service',
				'cafe',
				'bakery',
				'operation type',
			],
		},
		{
			id: 'tools',
			label: 'Tools',
			examples: examplesForOption(OptionType.TOOL, [
				'Spatula',
				'1 oz ladle',
				'Tongs',
				'Thermometer',
			]),
			keywords: [
				'tool',
				'spatula',
				'ladle',
				'tongs',
				'thermometer',
				'scoop',
				...optionNames(options, OptionType.TOOL),
			],
		},
		{
			id: 'shelf-life',
			label: 'Shelf lives',
			examples: examplesForOption(OptionType.SHELF_LIFE, [
				'1 day',
				'3 days',
				'7 days',
			]),
			keywords: [
				'shelf life',
				'shelf lives',
				'1 day',
				'2 days',
				'3 days',
				'7 days',
				'use by',
				'expires',
				...optionNames(options, OptionType.SHELF_LIFE),
			],
		},
		{
			id: 'portion-size',
			label: 'Portion sizes',
			examples: examplesForOption(OptionType.PORTION_SIZE, [
				'1 oz',
				'2 oz',
				'4 oz',
				'1 cup',
			]),
			keywords: [
				'portion',
				'portioned',
				'portion sizes',
				'serving size',
				...optionNames(options, OptionType.PORTION_SIZE),
			],
		},
		{
			id: 'pan-size',
			label: 'Pan sizes',
			examples: examplesForOption(OptionType.PAN_SIZE, [
				'1/6 pan',
				'1/3 pan',
				'1/2 pan',
				'Full pan',
			]),
			keywords: [
				'pan size',
				'pan sizes',
				'1/6 pan',
				'1/3 pan',
				'1/2 pan',
				'full pan',
				'hotel pan',
				...optionNames(options, OptionType.PAN_SIZE),
			],
		},
		{
			id: 'stations',
			label: 'Stations and areas',
			examples: stationExamples,
			keywords: [
				'station',
				'broil',
				'grill',
				'fryer',
				'fry station',
				'cold prep',
				'walk-in',
				'walkin',
				'cooler',
				'freezer',
				'restroom',
				'bathroom',
				...stations.map((station) => station.stationName),
			],
		},
		{
			id: 'checks',
			label: 'Items and checks',
			examples: [
				'Chicken temperature',
				'Fryer oil quality',
				'Bathroom cleanliness',
				'Opening checks',
			],
			keywords: [
				'item',
				'check',
				'temperature',
				'cleanliness',
				'quality',
				'opening',
				'closing',
				'inspect',
			],
		},
	];
}

function guideItemIsPresent(
	description: string,
	item: BlueprintGuideItem,
) {
	const normalizedDescription = normalizeName(description);
	return item.keywords.some((keyword) =>
		normalizedDescription.includes(normalizeName(keyword)),
	);
}

function uniqueValues(values: string[]) {
	return values.filter(
		(value, index, all) =>
			value.trim() &&
			all.findIndex(
				(candidate) => normalizeName(candidate) === normalizeName(value),
			) === index,
	);
}

function resolveRequiredOptionName(
	options: OptionEntity[],
	type: OptionType,
	name: string,
) {
	const resolved = resolveOptionName(options, type, name);
	if (!resolved) {
		throw new Error(`${OptionTypeLabels[type]} “${name}” could not be resolved.`);
	}
	return resolved;
}

function resolveOptionName(
	options: OptionEntity[],
	type: OptionType,
	name: string | null,
) {
	if (!name) return undefined;
	return options.find(
		(option) =>
			option.optionType === type &&
			option.optionActive &&
			normalizeName(option.optionName) === normalizeName(name),
	)?.optionName;
}

function findTemperatureCategory(
	categories: TemperatureCategory[],
	code: string | null,
) {
	if (!code) return undefined;
	return categories.find(
		(category) =>
			category.active &&
			(normalizeName(category.code) === normalizeName(code) ||
				normalizeName(category.name) === normalizeName(code)),
	);
}

function normalizeName(value: string) {
	return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

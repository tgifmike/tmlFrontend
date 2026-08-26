'use client';

import {
	CriterionResponseType,
	ItemCriterion,
	ItemType,
} from '@/app/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

export type DraftItemCriterion = ItemCriterion & { clientId: string };

const responseTypeLabels: Record<CriterionResponseType, string> = {
	[CriterionResponseType.PASS_FAIL]: 'Pass / fail',
	[CriterionResponseType.CHECKBOX]: 'Checkbox',
	[CriterionResponseType.TEMPERATURE]: 'Temperature',
	[CriterionResponseType.NUMBER]: 'Number',
	[CriterionResponseType.TEXT]: 'Text',
	[CriterionResponseType.PHOTO]: 'Photo',
};

const presetLabels: Record<ItemType, string[]> = {
	[ItemType.FOOD_PREP]: ['Prepared correctly'],
	[ItemType.EQUIPMENT]: ['Equipment is operating at standard'],
	[ItemType.CLEANLINESS]: ['Area is clean', 'Area is stocked and at standard'],
	[ItemType.GENERAL]: ['Task completed'],
};

const makeClientId = () =>
	typeof crypto !== 'undefined' && 'randomUUID' in crypto
		? crypto.randomUUID()
		: `${Date.now()}-${Math.random()}`;

export const createCriterionDraft = (
	overrides: Partial<ItemCriterion> = {},
): DraftItemCriterion => ({
	clientId: makeClientId(),
	label: '',
	responseType: CriterionResponseType.PASS_FAIL,
	required: true,
	requireNotesOnFailure: true,
	minValue: null,
	maxValue: null,
	unit: null,
	sortOrder: 0,
	active: true,
	...overrides,
});

export const createPresetCriteria = (itemType: ItemType): DraftItemCriterion[] =>
	presetLabels[itemType].map((label, index) =>
		createCriterionDraft({
			label,
			responseType:
				itemType === ItemType.GENERAL
					? CriterionResponseType.CHECKBOX
					: CriterionResponseType.PASS_FAIL,
			sortOrder: index,
		}),
	);

export const toCriterionDrafts = (
	criteria: ItemCriterion[] = [],
): DraftItemCriterion[] =>
	criteria
		.slice()
		.sort((a, b) => a.sortOrder - b.sortOrder)
		.map((criterion) => ({ ...criterion, clientId: makeClientId() }));

type ItemCriteriaEditorProps = {
	criteria: DraftItemCriterion[];
	onChange: (criteria: DraftItemCriterion[]) => void;
};

export function ItemCriteriaEditor({
	criteria,
	onChange,
}: ItemCriteriaEditorProps) {
	const update = (
		clientId: string,
		changes: Partial<DraftItemCriterion>,
	) => {
		onChange(
			criteria.map((criterion, index) =>
				criterion.clientId === clientId
					? { ...criterion, ...changes, sortOrder: index }
					: criterion,
			),
		);
	};

	const move = (index: number, direction: -1 | 1) => {
		const nextIndex = index + direction;
		if (nextIndex < 0 || nextIndex >= criteria.length) return;

		const reordered = [...criteria];
		[reordered[index], reordered[nextIndex]] = [
			reordered[nextIndex],
			reordered[index],
		];
		onChange(reordered.map((criterion, order) => ({ ...criterion, sortOrder: order })));
	};

	const remove = (clientId: string) => {
		onChange(
			criteria
				.filter((criterion) => criterion.clientId !== clientId)
				.map((criterion, index) => ({ ...criterion, sortOrder: index })),
		);
	};

	return (
		<section className="space-y-3 rounded-xl border bg-background/70 p-4">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h3 className="font-semibold">Check criteria</h3>
					<p className="text-sm text-muted-foreground">
						Choose what the iPad line check asks for this item.
					</p>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() =>
						onChange([
							...criteria,
							createCriterionDraft({ sortOrder: criteria.length }),
						])
					}
				>
					<Plus aria-hidden="true" />
					Add check
				</Button>
			</div>

			{criteria.length === 0 ? (
				<div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
					No custom checks yet. Add one if this item needs a response during a
					line check.
				</div>
			) : (
				<div className="space-y-3">
					{criteria.map((criterion, index) => {
						const numeric =
							criterion.responseType === CriterionResponseType.TEMPERATURE ||
							criterion.responseType === CriterionResponseType.NUMBER;

						return (
							<div
								key={criterion.clientId}
								className="space-y-3 rounded-lg border bg-card p-3 shadow-sm"
							>
								<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
									<div className="space-y-1.5">
										<Label htmlFor={`criterion-label-${criterion.clientId}`}>
											Check label
										</Label>
										<Input
											id={`criterion-label-${criterion.clientId}`}
											value={criterion.label}
											placeholder="e.g. Area is clean"
											onChange={(event) =>
												update(criterion.clientId, { label: event.target.value })
											}
										/>
									</div>
									<div className="space-y-1.5">
										<Label>Response</Label>
										<Select
											value={criterion.responseType}
											onValueChange={(value: CriterionResponseType) =>
												update(criterion.clientId, {
													responseType: value,
													...(value !== CriterionResponseType.TEMPERATURE &&
													value !== CriterionResponseType.NUMBER
														? { minValue: null, maxValue: null, unit: null }
														: {}),
												})
											}
										>
											<SelectTrigger className="w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{Object.values(CriterionResponseType).map((type) => (
													<SelectItem key={type} value={type}>
														{responseTypeLabels[type]}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="flex items-end gap-1">
										<Button
											type="button"
											variant="ghost"
											size="icon"
											disabled={index === 0}
											onClick={() => move(index, -1)}
											aria-label={`Move ${criterion.label || 'check'} up`}
										>
											<ChevronUp aria-hidden="true" />
										</Button>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											disabled={index === criteria.length - 1}
											onClick={() => move(index, 1)}
											aria-label={`Move ${criterion.label || 'check'} down`}
										>
											<ChevronDown aria-hidden="true" />
										</Button>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="text-destructive hover:text-destructive"
											onClick={() => remove(criterion.clientId)}
											aria-label={`Remove ${criterion.label || 'check'}`}
										>
											<Trash2 aria-hidden="true" />
										</Button>
									</div>
								</div>

								{numeric && (
									<div className="grid gap-3 sm:grid-cols-3">
										<NumberField
											label="Minimum"
											value={criterion.minValue}
											onChange={(minValue) =>
												update(criterion.clientId, { minValue })
											}
										/>
										<NumberField
											label="Maximum"
											value={criterion.maxValue}
											onChange={(maxValue) =>
												update(criterion.clientId, { maxValue })
											}
										/>
										<div className="space-y-1.5">
											<Label htmlFor={`criterion-unit-${criterion.clientId}`}>
												Unit
											</Label>
											<Input
												id={`criterion-unit-${criterion.clientId}`}
												value={criterion.unit ?? ''}
												placeholder={
													criterion.responseType === CriterionResponseType.TEMPERATURE
														? '°F'
														: 'count, %, etc.'
												}
												onChange={(event) =>
													update(criterion.clientId, {
														unit: event.target.value || null,
													})
												}
											/>
										</div>
									</div>
								)}

								<div className="flex flex-wrap gap-x-6 gap-y-3 border-t pt-3">
									<ToggleField
										label="Required"
										checked={criterion.required}
										onCheckedChange={(required) =>
											update(criterion.clientId, { required })
										}
									/>
									<ToggleField
										label="Require notes on failure"
										checked={criterion.requireNotesOnFailure}
										onCheckedChange={(requireNotesOnFailure) =>
											update(criterion.clientId, { requireNotesOnFailure })
										}
									/>
									<ToggleField
										label="Active"
										checked={criterion.active}
										onCheckedChange={(active) =>
											update(criterion.clientId, { active })
										}
									/>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</section>
	);
}

function NumberField({
	label,
	value,
	onChange,
}: {
	label: string;
	value?: number | null;
	onChange: (value: number | null) => void;
}) {
	return (
		<div className="space-y-1.5">
			<Label>{label}</Label>
			<Input
				type="number"
				step="any"
				value={value ?? ''}
				onChange={(event) =>
					onChange(event.target.value === '' ? null : Number(event.target.value))
				}
			/>
		</div>
	);
}

function ToggleField({
	label,
	checked,
	onCheckedChange,
}: {
	label: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
}) {
	return (
		<div className="flex items-center gap-2">
			<Switch checked={checked} onCheckedChange={onCheckedChange} />
			<span className="text-sm">{label}</span>
		</div>
	);
}

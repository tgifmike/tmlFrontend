import {
	createItemCriterion,
	deleteItemCriterion,
	reorderItemCriteria,
	updateItemCriterion,
} from '@/app/api/item.Api';
import { ItemCriterion } from '@/app/types';
import { DraftItemCriterion } from '@/components/tableComponents/ItemCriteriaEditor';

const toPayload = (criterion: DraftItemCriterion, sortOrder: number) => ({
	label: criterion.label.trim(),
	responseType: criterion.responseType,
	required: criterion.required,
	requireNotesOnFailure: criterion.requireNotesOnFailure,
	minValue: criterion.minValue ?? null,
	maxValue: criterion.maxValue ?? null,
	unit: criterion.unit?.trim() || null,
	sortOrder,
	active: criterion.active,
});

export function validateCriteria(criteria: DraftItemCriterion[]): string | null {
	for (const [index, criterion] of criteria.entries()) {
		if (!criterion.label.trim()) {
			return `Check ${index + 1} needs a label.`;
		}

		if (
			criterion.minValue != null &&
			criterion.maxValue != null &&
			criterion.minValue > criterion.maxValue
		) {
			return `${criterion.label}: minimum cannot be greater than maximum.`;
		}
	}

	return null;
}

export async function createCriteria(
	itemId: string,
	criteria: DraftItemCriterion[],
): Promise<ItemCriterion[]> {
	const created: ItemCriterion[] = [];

	for (const [index, criterion] of criteria.entries()) {
		const response = await createItemCriterion(itemId, toPayload(criterion, index));
		if (response.error || !response.data) {
			throw new Error(response.error || `Failed to create ${criterion.label}`);
		}
		created.push(response.data);
	}

	return created;
}

export async function syncCriteria(
	itemId: string,
	original: ItemCriterion[],
	drafts: DraftItemCriterion[],
): Promise<ItemCriterion[]> {
	const retainedIds = new Set(
		drafts.flatMap((criterion) => (criterion.id ? [criterion.id] : [])),
	);

	for (const criterion of original) {
		if (criterion.id && !retainedIds.has(criterion.id)) {
			const response = await deleteItemCriterion(itemId, criterion.id);
			if (response.error) throw new Error(response.error);
		}
	}

	const saved: ItemCriterion[] = [];
	for (const [index, criterion] of drafts.entries()) {
		const response = criterion.id
			? await updateItemCriterion(
					itemId,
					criterion.id,
					toPayload(criterion, index),
				)
			: await createItemCriterion(itemId, toPayload(criterion, index));

		if (response.error || !response.data) {
			throw new Error(response.error || `Failed to save ${criterion.label}`);
		}
		saved.push(response.data);
	}

	if (saved.length > 0) {
		const orderedIds = saved.flatMap((criterion) =>
			criterion.id ? [criterion.id] : [],
		);
		const response = await reorderItemCriteria(itemId, orderedIds);
		if (response.error) throw new Error(response.error);
	}

	return saved.map((criterion, index) => ({ ...criterion, sortOrder: index }));
}

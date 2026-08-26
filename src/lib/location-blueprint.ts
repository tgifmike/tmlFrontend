import { z } from 'zod';

const nullableText = z.string().trim().max(500).nullable();

export const locationBlueprintSchema = z.object({
	summary: z.string().trim().min(1).max(800),
	assumptions: z.array(z.string().trim().min(1).max(300)).max(12),
	options: z.object({
		tools: z.array(z.string().trim().min(1).max(80)).max(30),
		shelfLives: z.array(z.string().trim().min(1).max(80)).min(1).max(30),
		panSizes: z.array(z.string().trim().min(1).max(80)).min(1).max(30),
		portionSizes: z.array(z.string().trim().min(1).max(80)).max(30),
	}),
	stations: z
		.array(
			z.object({
				name: z.string().trim().min(1).max(100),
				purpose: z.string().trim().min(1).max(300),
				items: z
					.array(
						z.object({
							name: z.string().trim().min(1).max(120),
							shelfLife: z.string().trim().min(1).max(80),
							panSize: z.string().trim().min(1).max(80),
							tool: nullableText,
							portionSize: nullableText,
							temperatureRequired: z.boolean(),
							temperatureCategoryCode: nullableText,
							notes: nullableText,
						}),
					)
					.min(1)
					.max(30),
			}),
		)
		.min(1)
		.max(12),
});

export type LocationBlueprint = z.infer<typeof locationBlueprintSchema>;

export const locationBlueprintRequestSchema = z.object({
	description: z.string().trim().min(20).max(4000),
	accountName: z.string().trim().max(150).optional(),
	locationName: z.string().trim().max(150).optional(),
	existingOptions: z.object({
		tools: z.array(z.string().trim().max(80)).max(100),
		shelfLives: z.array(z.string().trim().max(80)).max(100),
		panSizes: z.array(z.string().trim().max(80)).max(100),
		portionSizes: z.array(z.string().trim().max(80)).max(100),
	}),
	existingStations: z
		.array(
			z.object({
				name: z.string().trim().max(100),
				items: z.array(z.string().trim().max(120)).max(100),
			}),
		)
		.max(100),
	temperatureCategories: z
		.array(
			z.object({
				code: z.string().trim().max(80),
				name: z.string().trim().max(100),
			}),
		)
		.max(50),
});

export type LocationBlueprintRequest = z.infer<
	typeof locationBlueprintRequestSchema
>;

// Kept as plain JSON Schema because the Responses API consumes this format.
export const locationBlueprintJsonSchema = {
	type: 'object',
	additionalProperties: false,
	required: ['summary', 'assumptions', 'options', 'stations'],
	properties: {
		summary: { type: 'string' },
		assumptions: {
			type: 'array',
			maxItems: 12,
			items: { type: 'string' },
		},
		options: {
			type: 'object',
			additionalProperties: false,
			required: ['tools', 'shelfLives', 'panSizes', 'portionSizes'],
			properties: {
				tools: stringArraySchema(30),
				shelfLives: stringArraySchema(30, 1),
				panSizes: stringArraySchema(30, 1),
				portionSizes: stringArraySchema(30),
			},
		},
		stations: {
			type: 'array',
			minItems: 1,
			maxItems: 12,
			items: {
				type: 'object',
				additionalProperties: false,
				required: ['name', 'purpose', 'items'],
				properties: {
					name: { type: 'string' },
					purpose: { type: 'string' },
					items: {
						type: 'array',
						minItems: 1,
						maxItems: 30,
						items: {
							type: 'object',
							additionalProperties: false,
							required: [
								'name',
								'shelfLife',
								'panSize',
								'tool',
								'portionSize',
								'temperatureRequired',
								'temperatureCategoryCode',
								'notes',
							],
							properties: {
								name: { type: 'string' },
								shelfLife: { type: 'string' },
								panSize: { type: 'string' },
								tool: nullableStringSchema(),
								portionSize: nullableStringSchema(),
								temperatureRequired: { type: 'boolean' },
								temperatureCategoryCode: nullableStringSchema(),
								notes: nullableStringSchema(),
							},
						},
					},
				},
			},
		},
	},
} as const;

function stringArraySchema(maxItems: number, minItems = 0) {
	return {
		type: 'array',
		minItems,
		maxItems,
		items: { type: 'string' },
	} as const;
}

function nullableStringSchema() {
	return { type: ['string', 'null'] } as const;
}

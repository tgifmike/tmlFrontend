'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getLocationHistory } from '@/app/api/locationApi';
import { LocationHistoryEntity, User } from '@/app/types';
import Spinner from '@/components/spinner/Spinner';
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from '@/components/ui/accordion';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/lib/icon';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

type Props = {
	accountId?: string;
	locationId?: string;
	refreshKey?: number;
	currentUser?: User;
};

type UserMap = Record<string, string>;

const LOCATION_FIELD_LABELS: Record<string, string> = {
	locationName: 'Location Name',
	locationActive: 'Status',
	sortOrder: 'Display Order',
	locationTimeZone: 'Time Zone',
	locationZipCode: 'ZIP Code',
	locationStreet: 'Street',
	locationTown: 'City',
	locationState: 'State',
	locationCountry: 'Country',
	startOfWeek: 'Start of Week',
	lineCheckDailyGoal: 'Daily Line Check Goal',
	name: 'Category Name',
	categoryName: 'Category Name',
	code: 'Category Code',
	minTemp: 'Minimum Temperature',
	maxTemp: 'Maximum Temperature',
	unit: 'Temperature Unit',
	active: 'Category Status',
	systemDefault: 'Built-in Default',
};

const toBoolean = (val: any): boolean => {
	if (typeof val === 'boolean') return val;
	if (typeof val === 'string') return val.toLowerCase() === 'true';
	if (typeof val === 'number') return val === 1;
	return false;
};

const formatLocationValue = (key: string, value: any) => {
	if (value === null || value === undefined) return '—';

	switch (key) {
		case 'locationActive':
		case 'active':
		case 'systemDefault': {
			const bool = toBoolean(value);
			if (key === 'systemDefault') return bool ? 'Yes' : 'No';
			return bool ? 'Active' : 'Inactive';
		}

		case 'minTemp':
		case 'maxTemp':
			return `${value}°`;

		case 'sortOrder':
			// zero-based → user-friendly
			return Number(value) + 1;

		default:
			return String(value);
	}
};


const parseJson = (val?: string | Record<string, unknown>): Record<string, any> => {
	if (!val) return {};
	if (typeof val === 'object') return val;
	try {
		return JSON.parse(val);
	} catch {
		return {};
	}
};

const getHistoryActionType = (history: LocationHistoryEntity) => {
	const oldValues = parseJson(history.oldValues);
	const newValues = parseJson(history.newValues);
	return history.actionType || newValues.actionType || oldValues.actionType || null;
};

export default function LocationAuditFeed({
	accountId,
	locationId,
	refreshKey = 0,
}: Props) {
	const [history, setHistory] = useState<LocationHistoryEntity[]>([]);
	const [usersMap] = useState<UserMap>({});
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
	const [changeTypeFilter, setChangeTypeFilter] = useState<
		'ALL' | 'CREATED' | 'UPDATED' | 'DELETED'
	>('ALL');

	const LogIcon = Icons.log;
	const getUserName = (id?: string) => (id ? usersMap[id] ?? id : 'System');

	useEffect(() => {
		const load = async () => {
			try {
				const h = await getLocationHistory(locationId ?? accountId);
				setHistory(h);
			} catch (err) {
				console.error(err);
				toast.error('Failed to load location audit log');
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [accountId, locationId, refreshKey]);
const filteredHistory = useMemo(() => {
	const arr = Array.isArray(history) ? history : history ? [history] : [];

	let sorted = [...arr]; // ✅ use the normalized array

	sorted.sort((a, b) =>
		sortOrder === 'newest'
			? new Date(b.changeAt).getTime() - new Date(a.changeAt).getTime()
			: new Date(a.changeAt).getTime() - new Date(b.changeAt).getTime()
	);

	return sorted.filter((h) => {
		const who = h.changedByName || getUserName(h.changedBy);
		const searchableValues = `${h.entityName ?? ''} ${h.subjectName ?? ''} ${
			h.categoryName ?? ''
		} ${h.temperatureCategoryName ?? ''} ${h.oldValues ?? ''} ${
			h.newValues ?? ''
		}`.toLowerCase();
		const matchesSearch =
			who.toLowerCase().includes(search.toLowerCase()) ||
			h.locationName?.toLowerCase().includes(search.toLowerCase()) ||
			searchableValues.includes(search.toLowerCase());

		const matchesType =
			changeTypeFilter === 'ALL' || h.changeType === changeTypeFilter;

		return matchesSearch && matchesType;
	});
}, [history, search, sortOrder, changeTypeFilter]);


	if (loading) {
		return (
			<div className="flex justify-center items-center py-20">
				<Spinner />
				<span className="ml-4 text-lg">Loading location audit feed…</span>
			</div>
		);
	}

	if (history.length === 0) {
		return <p className="p-4 text-center">No location audit logs found.</p>;
	}

	const formatHistory = (h: LocationHistoryEntity) => {
		const who = h.changedByName || getUserName(h.changedBy);
		const when = new Date(h.changeAt).toLocaleString();
		const oldVals = parseJson(h.oldValues);
		const newVals = parseJson(h.newValues);
		const isTemperatureCategory =
			h.entityType === 'TEMPERATURE_CATEGORY' ||
			getHistoryActionType(h) === 'TEMPERATURE_DEFAULTS_RESTORED' ||
			Boolean(
				h.categoryName || h.temperatureCategoryName || h.subjectName,
			) ||
			[
				'name',
				'categoryName',
				'code',
				'minTemp',
				'maxTemp',
				'active',
				'temperatureCategoryId',
			].some(
				(key) => key in oldVals || key in newVals,
			);
		const entityName =
			h.entityName ||
			h.categoryName ||
			h.temperatureCategoryName ||
			h.subjectName ||
			newVals.name ||
			oldVals.name ||
			newVals.categoryName ||
			oldVals.categoryName ||
			'Temperature category';
		const actionType = getHistoryActionType(h);

		if (actionType === 'TEMPERATURE_DEFAULTS_RESTORED') {
			return (
				<span className="text-sm sm:text-base">
					{who} restored the default temperature categories for “
					<strong>{h.locationName}</strong>” at {when}
				</span>
			);
		}

		switch (h.changeType) {
			case 'CREATED':
				return (
					<span className="text-sm sm:text-base">
						{isTemperatureCategory ? (
							<>
								{who} created temperature category “<strong>{entityName}</strong>” at{' '}
								{when}
							</>
						) : (
							<>
								{who} created location “<strong>{h.locationName}</strong>” at {when}
							</>
						)}
					</span>
				);

			case 'UPDATED': {
				const changes = Object.keys(oldVals).filter(
					(key) =>
						![
							'actionType',
							'categoryName',
							'code',
							'temperatureCategoryId',
						].includes(
							key,
						) && String(oldVals[key]) !== String(newVals[key]),
				);

				return (
					<div className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
						<span>
							{who} updated{' '}
							{isTemperatureCategory ? 'temperature category' : 'location'} “
							<strong>{isTemperatureCategory ? entityName : h.locationName}</strong>” at{' '}
							{when}
						</span>

						{changes.length > 0 && (
							<span className="flex flex-wrap gap-2">
								(
								{changes.map((key, i) => (
									<span key={key} className="flex gap-1">
										<span className="font-medium">
											{LOCATION_FIELD_LABELS[key] ?? key}:
										</span>
										<span className="text-red-600 line-through">
											{formatLocationValue(key, oldVals[key])}
										</span>
										→
										<span className="text-green-600">
											{formatLocationValue(key, newVals[key])}
										</span>
										{i < changes.length - 1 ? ',' : ''}
									</span>
								))}
								)
							</span>
						)}
					</div>
				);
			}

			case 'DELETED':
				return (
					<span className="text-sm sm:text-base">
						{who} deleted {isTemperatureCategory ? 'temperature category' : 'location'} “
						<strong>{isTemperatureCategory ? entityName : h.locationName}</strong>” at{' '}
						{when}
					</span>
				);

			default:
				return null;
		}
	};

	return (
		<div className="w-full">
			<div className="w-full">
				<Accordion type="single" collapsible>
					<AccordionItem
						value="location-history"
						className="rounded-2xl border border-border/60 bg-card px-6 shadow-sm"
					>
						<AccordionTrigger className="text-lg font-semibold hover:no-underline">
							<div className="flex gap-2 items-center">
								<LogIcon className="size-5 text-primary" />
								Show Location History
							</div>
						</AccordionTrigger>

						<AccordionContent>
							<Card className="border-0 bg-transparent shadow-none">
								<CardHeader className="gap-4 px-0">
									<CardTitle className="text-xl">Location history</CardTitle>
									<div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
										<div>
											<Input
												type="text"
												placeholder="Search by location or user..."
												value={search}
												onChange={(e) => setSearch(e.target.value)}
												className="w-full"
											/>
										</div>

										<div className="flex flex-col gap-2 sm:flex-row">
											<Select
												value={sortOrder}
												onValueChange={(v) =>
													setSortOrder(v as 'newest' | 'oldest')
												}
											>
												<SelectTrigger className="w-36">
													<SelectValue>
														{sortOrder === 'newest'
															? 'Newest → Oldest'
															: 'Oldest → Newest'}
													</SelectValue>
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="newest">
														Newest → Oldest
													</SelectItem>
													<SelectItem value="oldest">
														Oldest → Newest
													</SelectItem>
												</SelectContent>
											</Select>

											<Select
												value={changeTypeFilter}
												onValueChange={(v) =>
													setChangeTypeFilter(
														v as 'ALL' | 'CREATED' | 'UPDATED' | 'DELETED'
													)
												}
											>
												<SelectTrigger className="w-36">
													<SelectValue>{changeTypeFilter}</SelectValue>
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="ALL">All</SelectItem>
													<SelectItem value="CREATED">Created</SelectItem>
													<SelectItem value="UPDATED">Updated</SelectItem>
													<SelectItem value="DELETED">Deleted</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									<CardDescription>
										Review changes made to locations over time.
									</CardDescription>
								</CardHeader>

								<CardContent className="space-y-4">
									{filteredHistory.length === 0 && (
										<p className="text-center text-muted-foreground">
											No matching results.
										</p>
									)}

									{filteredHistory.map((h) => (
										<div key={h.id} className="space-y-2">
											<div className="flex justify-between items-start">
												<span>{formatHistory(h)}</span>
												<Badge
											className="font-semibold"
													variant={
														h.changeType === 'CREATED'
															? 'default'
															: h.changeType === 'UPDATED'
															? 'secondary'
															: 'destructive'
													}
												>
											{getHistoryActionType(h) ===
											'TEMPERATURE_DEFAULTS_RESTORED'
												? 'RESTORED'
												: h.changeType}
												</Badge>
											</div>
											<Separator />
										</div>
									))}
								</CardContent>
							</Card>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</div>
	);
}

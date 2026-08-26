'use client';

import {
	DragDropContext,
	Draggable,
	Droppable,
	type DropResult,
} from '@hello-pangea/dnd';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getAccountsForUser } from '@/app/api/accountApi';
import { getUserLocationAccess } from '@/app/api/locationApi';
import {
	deleteOption,
	getOptions,
	reorderOptions,
	toggleOptionActive,
} from '@/app/api/optionsApi';
import {
	AccessRole,
	AppRole,
	Locations,
	OptionEntity,
	OptionType,
	OptionTypeLabels,
	User,
} from '@/app/types';
import LocationNav from '@/components/navBar/LocationNav';
import LocationPageHeader from '@/components/navBar/LocationPageHeader';
import OptionAuditFeed from '@/components/options/OptionAuditFeed';
import { CreateOptionDialog } from '@/components/options/CreateOptionDialog';
import { EditOptionDialog } from '@/components/options/EditOptionDialog';
import Spinner from '@/components/spinner/Spinner';
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
import { UserControls } from '@/components/tableComponents/UserControls';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useSession } from '@/lib/auth/session-context';
import { Icons } from '@/lib/icon';

const OPTION_TYPES = Object.values(OptionType) as OptionType[];

const OPTION_DESCRIPTIONS: Record<OptionType, string> = {
	[OptionType.TOOL]: 'Utensils and equipment available for food-prep items.',
	[OptionType.SHELF_LIFE]: 'Approved holding times used for food-prep items.',
	[OptionType.PAN_SIZE]: 'Container and pan sizes used during item setup.',
	[OptionType.PORTION_SIZE]: 'Standard portions available when configuring an item.',
};

const OptionsPage = () => {
	const SortIcon = Icons.sort;
	const ToolboxIcon = Icons.toolbox;
	const { user, loading } = useSession();
	const params = useParams<{ accountId: string; locationId: string }>();
	const accountId = params.accountId;
	const locationId = params.locationId;
	const router = useRouter();

	const [loadingAccess, setLoadingAccess] = useState(true);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [currentLocation, setCurrentLocation] = useState<Locations | null>(null);
	const [options, setOptions] = useState<OptionEntity[]>([]);
	const [showActiveOnly, setShowActiveOnly] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [expandedTypes, setExpandedTypes] = useState<Set<OptionType>>(
		new Set(OPTION_TYPES),
	);
	const [deletingOptionIds, setDeletingOptionIds] = useState<Set<string>>(
		new Set(),
	);
	const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

	const currentUser = user as User | undefined;
	const currentUserId = currentUser?.id ?? '';
	const sessionUserRole = currentUser?.appRole;
	const canManage =
		currentUser?.appRole === AppRole.MANAGER ||
		currentUser?.accessRole === AccessRole.ADMIN ||
		currentUser?.accessRole === AccessRole.SRADMIN;

	useEffect(() => {
		if (loading || !currentUserId || !accountId || !locationId) return;

		let cancelled = false;
		const loadPage = async () => {
			setLoadingAccess(true);
			try {
				const [accountsRes, locationRes, optionsRes] = await Promise.all([
					getAccountsForUser(currentUserId),
					getUserLocationAccess(currentUserId),
					getOptions(accountId),
				]);
				if (cancelled) return;

				if (accountsRes.error) throw new Error(accountsRes.error);
				if (locationRes.error) throw new Error(locationRes.error);
				if (optionsRes.error) throw new Error(optionsRes.error);

				const account = accountsRes.data?.find(
					(candidate) => candidate.id?.toString() === accountId,
				);
				if (!account) {
					toast.error('You do not have access to this account.');
					router.push('/accounts');
					return;
				}

				const location = (locationRes.data ?? []).find(
					(candidate) => candidate.id?.toString() === locationId,
				);
				if (!location) {
					toast.error('You do not have access to this location.');
					router.push(`/accounts/${accountId}`);
					return;
				}

				setOptions(sortOptions(optionsRes.data ?? []));
				setCurrentLocation(location);
				setAccountImage(account.imageBase64 || account.accountImage || null);
				setAccountName(account.accountName);
			} catch (error) {
				if (!cancelled) {
					toast.error(
						error instanceof Error ? error.message : 'Failed to load options.',
					);
				}
			} finally {
				if (!cancelled) setLoadingAccess(false);
			}
		};

		loadPage();
		return () => {
			cancelled = true;
		};
	}, [loading, currentUserId, accountId, locationId, router]);

	const handleToggleActive = async (optionId: string, checked: boolean) => {
		setOptions((previous) =>
			previous.map((option) =>
				option.id === optionId
					? { ...option, optionActive: checked }
					: option,
			),
		);

		try {
			await toggleOptionActive(optionId, checked, currentUserId);
			setHistoryRefreshKey((key) => key + 1);
		} catch (error) {
			setOptions((previous) =>
				previous.map((option) =>
					option.id === optionId
						? { ...option, optionActive: !checked }
						: option,
				),
			);
			toast.error(
				error instanceof Error
					? error.message
					: 'Failed to update option status.',
			);
		}
	};

	const handleOptionSave = (savedOption: OptionEntity) => {
		setOptions((previous) =>
			sortOptions(
				previous.some((option) => option.id === savedOption.id)
					? previous.map((option) =>
							option.id === savedOption.id ? savedOption : option,
						)
					: [...previous, savedOption],
			),
		);
		setExpandedTypes((previous) =>
			new Set(previous).add(savedOption.optionType),
		);
		setHistoryRefreshKey((key) => key + 1);
	};

	const handleOptionDelete = async (optionId: string) => {
		if (!currentUserId) throw new Error('User not authenticated.');

		setDeletingOptionIds((previous) => new Set(previous).add(optionId));
		try {
			await deleteOption(optionId, currentUserId);
			setOptions((previous) =>
				previous.filter((option) => option.id !== optionId),
			);
			setHistoryRefreshKey((key) => key + 1);
		} finally {
			setDeletingOptionIds((previous) => {
				const next = new Set(previous);
				next.delete(optionId);
				return next;
			});
		}
	};

	const filteredOptions = options.filter((option) => {
		const matchesSearch = option.optionName
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		return matchesSearch && (!showActiveOnly || option.optionActive);
	});

	const handleDragEnd =
		(optionType: OptionType, visibleOptions: OptionEntity[]) =>
		async (result: DropResult) => {
			if (
				!result.destination ||
				result.source.index === result.destination.index
			) {
				return;
			}

			const previousOptions = options;
			const reorderedVisible = [...visibleOptions];
			const [moved] = reorderedVisible.splice(result.source.index, 1);
			reorderedVisible.splice(result.destination.index, 0, moved);

			const visibleIds = new Set(visibleOptions.map((option) => option.id));
			const reorderedIds = reorderedVisible.map((option) => option.id);
			const reorderedById = new Map(
				reorderedVisible.map((option) => [option.id, option]),
			);
			let visibleIndex = 0;
			const nextTypeOptions = options
				.filter((option) => option.optionType === optionType)
				.sort(compareOptions)
				.map((option) => {
					if (!visibleIds.has(option.id)) return option;
					const replacement = reorderedById.get(reorderedIds[visibleIndex]);
					visibleIndex += 1;
					return replacement ?? option;
				})
				.map((option, index) => ({ ...option, sortOrder: index }));

			const nextById = new Map(
				nextTypeOptions.map((option) => [option.id, option]),
			);
			setOptions((previous) =>
				previous.map((option) => nextById.get(option.id) ?? option),
			);

			try {
				await reorderOptions(
					accountId,
					optionType,
					nextTypeOptions.map((option) => option.id),
					currentUserId,
				);
				setHistoryRefreshKey((key) => key + 1);
			} catch (error) {
				setOptions(previousOptions);
				toast.error(
					error instanceof Error
						? error.message
						: 'Failed to save the new option order.',
				);
			}
		};

	if (loadingAccess) {
		return (
			<div className="flex items-center justify-center py-40 text-xl text-chart-3">
				<Spinner />
				<span className="ml-4">Loading options…</span>
			</div>
		);
	}

	return (
		<main className="flex min-h-screen overflow-hidden">
			<aside className="hidden w-1/6 shrink-0 self-stretch border-r bg-ring md:block">
				<LocationNav
					accountName={accountName}
					accountImage={accountImage}
					accountId={accountId}
					locationId={locationId}
					sessionUserRole={sessionUserRole ?? undefined}
				/>
			</aside>

			<section className="flex min-w-0 flex-1 flex-col">
				<LocationPageHeader
					accountId={accountId}
					locationId={locationId}
					accountName={accountName}
					accountImage={accountImage}
					locationName={currentLocation?.locationName}
					pageName="Options"
					sessionUserRole={sessionUserRole ?? undefined}
					drawerOpen={drawerOpen}
					setDrawerOpen={setDrawerOpen}
				>
					{canManage && currentUser && (
						<CreateOptionDialog
							accountId={accountId}
							currentUser={currentUser}
							existingOptions={options}
							onOptionCreated={handleOptionSave}
						/>
					)}
				</LocationPageHeader>

				<div className="flex-1 overflow-y-auto p-4">
					<div className="mx-auto w-full max-w-6xl">
						<UserControls
							showActiveOnly={showActiveOnly}
							setShowActiveOnly={setShowActiveOnly}
							searchTerm={searchTerm}
							setSearchTerm={setSearchTerm}
							searchPlaceholder="Search options"
						/>

						<div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1 text-sm text-muted-foreground">
							<span>
								{filteredOptions.length} shown · {options.length} total
							</span>
							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setExpandedTypes(new Set(OPTION_TYPES))}
								>
									Expand all
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setExpandedTypes(new Set())}
								>
									Collapse all
								</Button>
							</div>
						</div>

						<Accordion
							type="multiple"
							value={[...expandedTypes]}
							onValueChange={(values) =>
								setExpandedTypes(new Set(values as OptionType[]))
							}
							className="mt-6 space-y-4"
						>
							{OPTION_TYPES.map((type) => {
								const allTypeOptions = options
									.filter((option) => option.optionType === type)
									.sort(compareOptions);
								const visibleTypeOptions = filteredOptions
									.filter((option) => option.optionType === type)
									.sort(compareOptions);
								const activeCount = allTypeOptions.filter(
									(option) => option.optionActive,
								).length;

								return (
									<AccordionItem
										key={type}
										value={type}
										className="overflow-hidden rounded-2xl border bg-card px-0 shadow-sm"
									>
										<AccordionTrigger className="px-5 py-5 hover:no-underline sm:px-6">
											<div className="flex min-w-0 flex-1 items-center gap-3 text-left">
												<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3">
													<ToolboxIcon className="size-5" aria-hidden="true" />
												</span>
												<span className="min-w-0 flex-1">
													<span className="block text-lg font-semibold">
														{OptionTypeLabels[type]}
													</span>
													<span className="mt-1 block text-xs font-normal text-muted-foreground sm:text-sm">
														{OPTION_DESCRIPTIONS[type]}
													</span>
												</span>
												<Badge variant="secondary" className="mr-2 shrink-0">
													{activeCount}/{allTypeOptions.length} active
												</Badge>
											</div>
										</AccordionTrigger>

										<AccordionContent className="pb-0">
											<div className="flex items-center justify-between border-t bg-muted/20 px-5 py-3 sm:px-6">
												<span className="text-sm text-muted-foreground">
													{visibleTypeOptions.length} shown
												</span>
												{canManage && currentUser && (
													<CreateOptionDialog
														accountId={accountId}
														currentUser={currentUser}
														existingOptions={options}
														defaultOptionType={type}
														onOptionCreated={handleOptionSave}
														trigger={
															<Button variant="outline" size="sm">
																Add {OptionTypeLabels[type].toLowerCase()}
															</Button>
														}
													/>
												)}
											</div>

											<OptionList
												options={visibleTypeOptions}
												allOptions={options}
												optionType={type}
												canManage={canManage}
												currentUser={currentUser}
												deletingOptionIds={deletingOptionIds}
												showActiveOnly={showActiveOnly}
												searchTerm={searchTerm}
												SortIcon={SortIcon}
												onDragEnd={handleDragEnd(type, visibleTypeOptions)}
												onToggle={handleToggleActive}
												onSave={handleOptionSave}
												onDelete={handleOptionDelete}
												onShowAll={() => {
													setShowActiveOnly(false);
													setSearchTerm('');
												}}
											/>
										</AccordionContent>
									</AccordionItem>
								);
							})}
						</Accordion>

						{canManage && (
							<OptionAuditFeed
								accountId={accountId}
								currentUser={currentUser}
								refreshKey={historyRefreshKey}
							/>
						)}
					</div>
				</div>
			</section>
		</main>
	);
};

type OptionListProps = {
	options: OptionEntity[];
	allOptions: OptionEntity[];
	optionType: OptionType;
	canManage: boolean;
	currentUser?: User;
	deletingOptionIds: Set<string>;
	showActiveOnly: boolean;
	searchTerm: string;
	SortIcon: typeof Icons.sort;
	onDragEnd: (result: DropResult) => Promise<void>;
	onToggle: (optionId: string, checked: boolean) => Promise<void>;
	onSave: (option: OptionEntity) => void;
	onDelete: (optionId: string) => Promise<void>;
	onShowAll: () => void;
};

function OptionList({
	options,
	allOptions,
	optionType,
	canManage,
	currentUser,
	deletingOptionIds,
	showActiveOnly,
	searchTerm,
	SortIcon,
	onDragEnd,
	onToggle,
	onSave,
	onDelete,
	onShowAll,
}: OptionListProps) {
	if (options.length === 0) {
		const hasAnyOfType = allOptions.some(
			(option) => option.optionType === optionType,
		);
		return (
			<div className="border-t px-6 py-12 text-center text-sm text-muted-foreground">
				<p>
					{hasAnyOfType
						? `No ${OptionTypeLabels[optionType].toLowerCase()} options match the current filters.`
						: `No ${OptionTypeLabels[optionType].toLowerCase()} options have been created yet.`}
				</p>
				{hasAnyOfType && (showActiveOnly || searchTerm) && (
					<Button variant="link" onClick={onShowAll}>
						Show all options
					</Button>
				)}
			</div>
		);
	}

	return (
		<>
			<DragDropContext onDragEnd={onDragEnd}>
				<Droppable droppableId={`options-${optionType}`}>
					{(dropProvided) => (
						<div
							ref={dropProvided.innerRef}
							{...dropProvided.droppableProps}
							className="hidden md:block"
						>
							<div className="grid grid-cols-[minmax(0,3fr)_minmax(130px,1fr)_minmax(150px,1fr)] items-center border-t bg-muted/40 px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
								<span>Option name</span>
								<span className="text-center">Status</span>
								<span className="text-center">Actions</span>
							</div>

							{options.map((option, index) => (
								<Draggable
									key={option.id}
									draggableId={option.id}
									index={index}
									isDragDisabled={!canManage}
								>
									{(dragProvided, snapshot) => (
										<div
											ref={dragProvided.innerRef}
											{...dragProvided.draggableProps}
											className={`grid min-h-18 grid-cols-[minmax(0,3fr)_minmax(130px,1fr)_minmax(150px,1fr)] items-center border-t px-6 transition-colors ${
												snapshot.isDragging ? 'bg-card shadow-lg' : 'hover:bg-muted/30'
											}`}
										>
											<div className="flex min-w-0 items-center gap-3">
												{canManage && (
													<Button
														variant="ghost"
														size="icon"
														className="cursor-grab text-muted-foreground active:cursor-grabbing"
														aria-label={`Reorder ${option.optionName}`}
														{...dragProvided.dragHandleProps}
													>
														<SortIcon className="size-5" aria-hidden="true" />
													</Button>
												)}
												<span className="truncate font-semibold">
													{option.optionName}
												</span>
											</div>

											<OptionStatus
												option={option}
												canManage={canManage}
												disabled={deletingOptionIds.has(option.id)}
												onToggle={onToggle}
											/>

											<OptionActions
												option={option}
												canManage={canManage}
												currentUser={currentUser}
												onSave={onSave}
												onDelete={onDelete}
											/>
										</div>
									)}
								</Draggable>
							))}
							{dropProvided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>

			<div className="space-y-3 border-t p-3 md:hidden">
				{options.map((option) => (
					<Card key={option.id} className="gap-0 overflow-hidden py-0 shadow-none">
						<div className="p-5 font-semibold">{option.optionName}</div>
						<div className="flex items-center justify-between border-t bg-muted/20 px-5 py-4">
							<span className="text-sm font-medium text-muted-foreground">Status</span>
							<OptionStatus
								option={option}
								canManage={canManage}
								disabled={deletingOptionIds.has(option.id)}
								onToggle={onToggle}
							/>
						</div>
						{canManage && (
							<div className="flex items-center justify-between border-t px-5 py-2">
								<span className="text-sm font-medium text-muted-foreground">
									Manage option
								</span>
								<OptionActions
									option={option}
									canManage={canManage}
									currentUser={currentUser}
									onSave={onSave}
									onDelete={onDelete}
								/>
							</div>
						)}
					</Card>
				))}
			</div>
		</>
	);
}

function OptionStatus({
	option,
	canManage,
	disabled,
	onToggle,
}: {
	option: OptionEntity;
	canManage: boolean;
	disabled: boolean;
	onToggle: (optionId: string, checked: boolean) => Promise<void>;
}) {
	return (
		<div className="flex items-center justify-center gap-3">
			<Switch
				checked={option.optionActive}
				onCheckedChange={(checked) => onToggle(option.id, Boolean(checked))}
				disabled={!canManage || disabled}
				aria-label={`${option.optionName} status`}
			/>
			<span className="text-xs font-medium text-muted-foreground">
				{option.optionActive ? 'Active' : 'Inactive'}
			</span>
		</div>
	);
}

function OptionActions({
	option,
	canManage,
	currentUser,
	onSave,
	onDelete,
}: {
	option: OptionEntity;
	canManage: boolean;
	currentUser?: User;
	onSave: (option: OptionEntity) => void;
	onDelete: (optionId: string) => Promise<void>;
}) {
	if (!canManage) {
		return (
			<div className="text-center text-sm text-muted-foreground">View only</div>
		);
	}

	return (
		<div className="flex items-center justify-center gap-1">
			<EditOptionDialog
				option={option}
				currentUser={currentUser}
				onOptionUpdated={onSave}
			/>
			<DeleteConfirmButton
				item={{ id: option.id }}
				entityLabel="Option"
				onDelete={onDelete}
				getItemName={() => option.optionName}
			/>
		</div>
	);
}

const compareOptions = (a: OptionEntity, b: OptionEntity) =>
	(a.sortOrder ?? 0) - (b.sortOrder ?? 0);

const sortOptions = (options: OptionEntity[]) =>
	[...options].sort((a, b) => {
		const typeDifference =
			OPTION_TYPES.indexOf(a.optionType) - OPTION_TYPES.indexOf(b.optionType);
		return typeDifference || compareOptions(a, b);
	});

export default OptionsPage;

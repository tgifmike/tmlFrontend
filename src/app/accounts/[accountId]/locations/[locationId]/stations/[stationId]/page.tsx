'use client';

import {
	DragDropContext,
	Draggable,
	Droppable,
	type DropResult,
} from '@hello-pangea/dnd';
import { type ReactElement, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getAccountsForUser } from '@/app/api/accountApi';
import {
	deleteItem,
	getItemsByStation,
	reorderItems,
	toggleItemActive,
} from '@/app/api/item.Api';
import { getUserLocationAccess } from '@/app/api/locationApi';
import { getOptions } from '@/app/api/optionsApi';
import { getStationsByLocation } from '@/app/api/stationApi';
import { getTemperatureCategories } from '@/app/api/temperatureCategoryApi';
import {
	AppRole,
	Item,
	ItemType,
	Locations,
	OptionEntity,
	StationDto,
	TemperatureCategory,
	User,
} from '@/app/types';
import { Card } from '@/components/ui/card';
import LocationNav from '@/components/navBar/LocationNav';
import LocationPageHeader from '@/components/navBar/LocationPageHeader';
import Spinner from '@/components/spinner/Spinner';
import CreateItemDialog from '@/components/tableComponents/CreateItemDialog';
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
import { EditItemDialog } from '@/components/tableComponents/EditItemDialog';
import ItemHistoryFeed from '@/components/tableComponents/ItemHistoryFeed';
import { Pagination } from '@/components/tableComponents/Pagination';
import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
import { UserControls } from '@/components/tableComponents/UserControls';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSession } from '@/lib/auth/session-context';
import { getDefaultTemperatureCategories } from '@/lib/constants/usConstants';
import { Icons } from '@/lib/icon';

const itemTypeLabels: Record<ItemType, string> = {
	[ItemType.FOOD_PREP]: 'Food prep',
	[ItemType.EQUIPMENT]: 'Equipment check',
	[ItemType.CLEANLINESS]: 'Cleanliness check',
	[ItemType.GENERAL]: 'General task',
};

const getItemTypeLabel = (itemType?: ItemType) =>
	itemTypeLabels[itemType ?? ItemType.FOOD_PREP];

const StationPage = () => {
	const SortIcon = Icons.sort;
	const ItemIcon = Icons.items;
	const { user, loading } = useSession();
	const params = useParams<{
		accountId: string;
		locationId: string;
		stationId: string;
	}>();
	const accountId = params.accountId;
	const locationId = params.locationId;
	const stationId = params.stationId;
	const router = useRouter();

	const [loadingAccess, setLoadingAccess] = useState(true);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [items, setItems] = useState<Item[]>([]);
	const [stationName, setStationName] = useState<string | null>(null);
	const [currentLocation, setCurrentLocation] = useState<Locations | null>(null);
	const [showActiveOnly, setShowActiveOnly] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [options, setOptions] = useState<OptionEntity[]>([]);
	const [temperatureCategories, setTemperatureCategories] = useState<
		TemperatureCategory[]
	>(getDefaultTemperatureCategories(locationId));

	const currentUser = user as User | undefined;
	const currentUserId = user?.id ?? '';
	const sessionUserRole = user?.appRole;
	const canManage = currentUser?.appRole === AppRole.MANAGER;

	useEffect(() => {
		if (loading || !user?.id || !accountId || !locationId || !stationId) return;

		let cancelled = false;
		const loadPage = async () => {
			setLoadingAccess(true);
			try {
				const [
					accountsRes,
					locationRes,
					stationRes,
					itemsRes,
					optionsRes,
					temperatureRes,
				] = await Promise.all([
					getAccountsForUser(user.id),
					getUserLocationAccess(user.id),
					getStationsByLocation(locationId),
					getItemsByStation(stationId),
					getOptions(accountId),
					getTemperatureCategories(locationId),
				]);
				if (cancelled) return;

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

				const station = (stationRes.data ?? []).find(
					(candidate: StationDto) => candidate.id?.toString() === stationId,
				);
				if (!station) {
					toast.error('Station not found.');
					router.push(`/accounts/${accountId}/locations/${locationId}/stations`);
					return;
				}

				if (itemsRes.error) throw new Error(itemsRes.error);
				if (optionsRes.error) throw new Error(optionsRes.error);

				setItems(
					[...(itemsRes.data ?? [])].sort(
						(a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
					),
				);
				setOptions(
					[...(optionsRes.data ?? [])].sort(
						(a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
					),
				);
				setTemperatureCategories(
					temperatureRes.error
						? getDefaultTemperatureCategories(locationId)
						: [...(temperatureRes.data ?? [])].sort(
								(a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
							),
				);
				setAccountName(account.accountName);
				setAccountImage(account.imageBase64 || account.accountImage || null);
				setCurrentLocation(location);
				setStationName(station.stationName);
			} catch (error) {
				if (!cancelled) {
					toast.error(
						error instanceof Error ? error.message : 'Failed to load station items.',
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
	}, [loading, user?.id, accountId, locationId, stationId, router]);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		setCurrentPage(Number(localStorage.getItem('itemCurrentPage')) || 1);
		setPageSize(Number(localStorage.getItem('itemPageSize')) || 10);
	}, []);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('itemCurrentPage', String(currentPage));
		}
	}, [currentPage]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('itemPageSize', String(pageSize));
		}
		setCurrentPage(1);
	}, [pageSize]);

	const handleToggleActive = async (itemId: string, checked: boolean) => {
		setItems((previous) =>
			previous.map((item) =>
				item.id === itemId ? { ...item, itemActive: checked } : item,
			),
		);

		const response = await toggleItemActive(
			stationId,
			itemId,
			checked,
			currentUserId,
		);
		if (response.error) {
			setItems((previous) =>
				previous.map((item) =>
					item.id === itemId ? { ...item, itemActive: !checked } : item,
				),
			);
			toast.error(response.error);
		}
	};

	const handleDeleteItem = async (itemId: string) => {
		const response = await deleteItem(itemId, currentUserId);
		if (response.error) throw new Error(response.error);
		setItems((previous) => previous.filter((item) => item.id !== itemId));
	};

	const filteredItems = items.filter((item) => {
		const matchesSearch = (item.itemName ?? '')
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		return matchesSearch && (!showActiveOnly || item.itemActive);
	});

	const paginatedItems = filteredItems.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);

	useEffect(() => {
		const lastPage = Math.max(1, Math.ceil(filteredItems.length / pageSize));
		if (currentPage > lastPage) setCurrentPage(lastPage);
	}, [currentPage, filteredItems.length, pageSize]);

	const handleDragEnd = async (result: DropResult) => {
		if (!result.destination || result.source.index === result.destination.index) {
			return;
		}

		const reorderedPage = [...paginatedItems];
		const [moved] = reorderedPage.splice(result.source.index, 1);
		reorderedPage.splice(result.destination.index, 0, moved);

		const visibleIds = new Set(
			paginatedItems.flatMap((item) => (item.id ? [item.id] : [])),
		);
		const reorderedById = new Map(
			reorderedPage.flatMap((item) =>
				item.id ? ([[item.id, item]] as const) : [],
			),
		);
		const orderedVisibleIds = reorderedPage.flatMap((item) =>
			item.id ? [item.id] : [],
		);
		let visibleIndex = 0;
		const nextItems = items.map((item) => {
			if (!item.id || !visibleIds.has(item.id)) return item;
			const replacement = reorderedById.get(orderedVisibleIds[visibleIndex]);
			visibleIndex += 1;
			return replacement ?? item;
		});

		setItems(nextItems);
		const response = await reorderItems(
			stationId,
			nextItems.flatMap((item) => (item.id ? [item.id] : [])),
			currentUserId,
		);
		if (response.error) {
			setItems(items);
			toast.error(response.error);
		}
	};

	const optionsByType = options.reduce<Record<string, OptionEntity[]>>(
		(grouped, option) => {
			(grouped[option.optionType] ??= []).push(option);
			return grouped;
		},
		{},
	);
	const tools = optionsByType.TOOL ?? [];
	const panSizes = optionsByType.PAN_SIZE ?? [];
	const portionSizes = optionsByType.PORTION_SIZE ?? [];
	const shelfLifes = optionsByType.SHELF_LIFE ?? [];

	const updateItemInState = (updatedItem: Item) => {
		setItems((previous) =>
			previous.map((item) =>
				item.id === updatedItem.id ? updatedItem : item,
			),
		);
	};

	const renderEditDialog = (item: Item, trigger?: ReactElement) => (
		<EditItemDialog
			item={item}
			items={items}
			tools={tools}
			panSizes={panSizes}
			portionSizes={portionSizes}
			shelfLifes={shelfLifes}
			temperatureCategories={temperatureCategories}
			stationId={stationId}
			currentUserId={currentUserId}
			onUpdate={updateItemInState}
			trigger={trigger}
		/>
	);

	if (loadingAccess) {
		return (
			<div className="flex items-center justify-center py-40 text-xl text-chart-3">
				<Spinner />
				<span className="ml-4">Loading items…</span>
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
					sessionUserRole={sessionUserRole}
				/>
			</aside>

			<section className="flex min-w-0 flex-1 flex-col">
				<LocationPageHeader
					accountId={accountId}
					locationId={locationId}
					accountName={accountName}
					accountImage={accountImage}
					locationName={currentLocation?.locationName}
					pageName={stationName || 'Station'}
					pageHref={`/accounts/${accountId}/locations/${locationId}/stations`}
					sessionUserRole={sessionUserRole}
					drawerOpen={drawerOpen}
					setDrawerOpen={setDrawerOpen}
				>
					{canManage && (
						<CreateItemDialog
							onItemCreated={(item) =>
								setItems((previous) => [...previous, item])
							}
							existingItems={items}
							stationId={stationId}
							currentUserId={currentUserId}
							tools={tools}
							panSizes={panSizes}
							portionSizes={portionSizes}
							shelfLifes={shelfLifes}
							temperatureCategories={temperatureCategories}
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
							searchPlaceholder="Search items"
						/>

						<div className="mt-4 flex items-center justify-between px-1 text-sm text-muted-foreground">
							<span>{filteredItems.length} item{filteredItems.length === 1 ? '' : 's'}</span>
							<span className="hidden sm:inline">Drag rows by the handle to set their order</span>
						</div>

						<DragDropContext onDragEnd={handleDragEnd}>
							<Droppable droppableId="station-items">
								{(dropProvided) => (
									<div
										ref={dropProvided.innerRef}
										{...dropProvided.droppableProps}
										className="mt-6 hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block"
									>
										<div className="grid grid-cols-[minmax(0,3fr)_minmax(150px,1fr)_minmax(150px,1fr)] items-center bg-muted/60 px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
											<span>Item name</span>
											<span className="text-center">Status</span>
											<span className="text-center">Actions</span>
										</div>

										{paginatedItems.map((item, index) => (
											<Draggable key={item.id} draggableId={item.id!} index={index}>
												{(dragProvided, snapshot) => (
													<div
														ref={dragProvided.innerRef}
														{...dragProvided.draggableProps}
														className={`grid min-h-20 grid-cols-[minmax(0,3fr)_minmax(150px,1fr)_minmax(150px,1fr)] items-center border-t px-6 text-base transition-colors ${
															snapshot.isDragging ? 'bg-card shadow-lg' : 'hover:bg-muted/40'
														}`}
													>
														<div className="flex min-w-0 items-center gap-3">
															<Tooltip>
																<TooltipTrigger asChild>
																	<button
																		type="button"
																		className="cursor-grab rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
																		aria-label={`Reorder ${item.itemName}`}
																		{...dragProvided.dragHandleProps}
																	>
																		<SortIcon className="size-5" aria-hidden="true" />
																	</button>
																</TooltipTrigger>
																<TooltipContent>Drag to reorder</TooltipContent>
															</Tooltip>

															<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3">
																<ItemIcon className="size-5" aria-hidden="true" />
															</span>
															<div className="min-w-0">
														{canManage ? (
															renderEditDialog(
																		item,
																		<button type="button" className="block max-w-full truncate rounded-sm text-left font-semibold text-foreground transition-colors hover:text-chart-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
																			{item.itemName}
																		</button>,
																	)
																) : (
																	<p className="truncate font-semibold">{item.itemName}</p>
																)}
																<p className="mt-1 text-xs text-muted-foreground">
																	{getItemTypeLabel(item.itemType)}
																</p>
															</div>
														</div>

														<div className="flex flex-col items-center gap-1.5">
															<StatusSwitchOrBadge
																entity={{ id: item.id!, active: item.itemActive }}
																getLabel={() => `Item: ${item.itemName}`}
																onToggle={handleToggleActive}
																canToggle={canManage}
															/>
															{canManage && <span className="text-xs font-medium text-muted-foreground">{item.itemActive ? 'Active' : 'Inactive'}</span>}
														</div>

														<div className="flex items-center justify-center gap-1">
															{canManage ? (
																<>
																	{renderEditDialog(item)}
																	<DeleteConfirmButton
																		item={{ id: item.id!, stationId }}
																		entityLabel="Item"
																		onDelete={handleDeleteItem}
																		getItemName={() => item.itemName}
																	/>
																</>
															) : (
																<span className="text-sm text-muted-foreground">View only</span>
															)}
														</div>
													</div>
												)}
											</Draggable>
										))}
										{dropProvided.placeholder}
										{paginatedItems.length === 0 && <EmptyState searchTerm={searchTerm} />}
									</div>
								)}
							</Droppable>
						</DragDropContext>

						<div className="mt-6 space-y-4 md:hidden">
							{paginatedItems.map((item) => (
								<Card key={item.id} className="gap-0 overflow-hidden py-0 shadow-sm">
									<div className="flex items-center gap-3 p-5">
										<span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3">
											<ItemIcon className="size-5" aria-hidden="true" />
										</span>
										<div className="min-w-0 flex-1">
											{canManage ? (
												renderEditDialog(
													item,
																<button type="button" className="block min-h-11 w-full truncate rounded-sm text-left font-semibold transition-colors hover:text-chart-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
																	{item.itemName}
																</button>,
															)
											) : (
												<p className="truncate font-semibold">{item.itemName}</p>
											)}
											<p className="text-xs text-muted-foreground">{getItemTypeLabel(item.itemType)}</p>
										</div>
									</div>

									{isFoodPrep(item) && (
										<>
											<ItemDetailRow label="Shelf life" value={item.shelfLife || 'Not set'} />
											<ItemDetailRow label="Pan size" value={item.panSize || 'Not set'} />
											<ItemDetailRow
												label="Food temperature"
												value={
													item.isTempTaken
														? item.temperatureCategory?.name || item.tempCategory || 'Required'
														: 'Not required'
												}
											/>
										</>
									)}
									<div className="flex items-center justify-between border-t bg-muted/20 px-5 py-4">
										<span className="text-sm font-medium text-muted-foreground">Status</span>
										<div className="flex items-center gap-3">
											<StatusSwitchOrBadge
												entity={{ id: item.id!, active: item.itemActive }}
												getLabel={() => `Item: ${item.itemName}`}
												onToggle={handleToggleActive}
												canToggle={canManage}
											/>
											{canManage && <span className="text-sm font-medium">{item.itemActive ? 'Active' : 'Inactive'}</span>}
										</div>
									</div>

									{canManage && (
										<div className="flex items-center justify-between border-t px-5 py-2">
											<span className="text-sm font-medium text-muted-foreground">Manage item</span>
											<div className="flex items-center gap-1">
												{renderEditDialog(item)}
												<DeleteConfirmButton
													item={{ id: item.id!, stationId }}
													entityLabel="Item"
													onDelete={handleDeleteItem}
													getItemName={() => item.itemName}
												/>
											</div>
										</div>
									)}
								</Card>
							))}
							{paginatedItems.length === 0 && <EmptyState searchTerm={searchTerm} mobile />}
						</div>

						<Pagination
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
							pageSize={pageSize}
							setPageSize={setPageSize}
							totalItems={filteredItems.length}
						/>

						<ItemHistoryFeed stationId={stationId} />
					</div>
				</div>
			</section>
		</main>
	);
};

const isFoodPrep = (item: Item) =>
	!item.itemType || item.itemType === ItemType.FOOD_PREP;

function ItemDetailRow({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="flex min-h-12 items-center justify-between gap-4 border-t px-5 py-3 text-sm">
			<span className="font-medium text-muted-foreground">{label}</span>
			<span className="text-right font-medium">{value}</span>
		</div>
	);
}

function EmptyState({ searchTerm, mobile = false }: { searchTerm: string; mobile?: boolean }) {
	return (
		<div className={`${mobile ? '' : 'border-t'} px-6 py-14 text-center text-sm text-muted-foreground`}>
			{searchTerm ? `No items match “${searchTerm}”.` : 'No items have been created for this station yet.'}
		</div>
	);
}

export default StationPage;

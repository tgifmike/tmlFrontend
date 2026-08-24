'use client';

import { getAccountsForUser } from '@/app/api/accountApi';
import {
	deleteItem,
	getItemsByStation,
	toggleItemActive,
	reorderItems,
} from '@/app/api/item.Api';
import {
	DragDropContext,
	Droppable,
	Draggable,
	DropResult,
} from '@hello-pangea/dnd';
import { getUserLocationAccess } from '@/app/api/locationApi';
import { getStationsByLocation } from '@/app/api/stationApi';
import { AppRole, Item, Locations, OptionEntity, Station, StationDto, User } from '@/app/types';
import LocationNav from '@/components/navBar/LocationNav';
import LocationPageHeader from '@/components/navBar/LocationPageHeader';
import Spinner from '@/components/spinner/Spinner';
import CreateItemDialog from '@/components/tableComponents/CreateItemDialog';
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
import { EditItemDialog } from '@/components/tableComponents/EditItemDialog';
import { Pagination } from '@/components/tableComponents/Pagination';
import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
import { UserControls } from '@/components/tableComponents/UserControls';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Icons } from '@/lib/icon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DataCard } from '@/components/cards/DataCard';
import { getOptions } from '@/app/api/optionsApi';
import { getTemperatureCategories } from '@/app/api/temperatureCategoryApi';
import ItemHistoryFeed from '@/components/tableComponents/ItemHistoryFeed';
import { useSession } from '@/lib/auth/session-context';
import { getDefaultTemperatureCategories } from '@/lib/constants/usConstants';
import type { TemperatureCategory } from '@/app/types';



const StationPage = () => {
	//icon
	const UpDownIcon = Icons.sort;
	const ItemIcon = Icons.items;

	//session
	const { user, loading, logout } = useSession();
	const params = useParams<{
		accountId: string;
		locationId: string;
		stationId: string;
	}>();
	const accountIdParam = params.accountId;
	const locationIdParam = params.locationId;
	const stationIdParam = params.stationId;
	const router = useRouter();

	// state
	const [loadingAccess, setLoadingAccess] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [locations, setLocations] = useState<Locations[]>([]);
	const [stations, setStations] = useState<Station[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	const [stationName, setStationName] = useState<string | null>(null);
	const [currentLocation, setCurrentLocation] = useState<Locations | null>(
		null
	);
	const [showActiveOnly, setShowActiveOnly] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [options, setOptions] = useState<OptionEntity[]>([]);
	const [temperatureCategories, setTemperatureCategories] = useState<
		TemperatureCategory[]
	>(getDefaultTemperatureCategories(locationIdParam));

	const currentUser = user as User | undefined;
	const currentUserId = user?.id;
	const sessionUserRole = user?.appRole;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;

	// verify access & fetch items
	useEffect(() => {
		if (
			loading ||
			!user?.id ||
			!accountIdParam ||
			!locationIdParam ||
			!stationIdParam
		)
			return;
		if (hasAccess) return;

		const verifyAccess = async () => {
			try {
				const accountsRes = await getAccountsForUser(user.id);
				const account = accountsRes.data?.find(
					(acc) => acc.id?.toString() === accountIdParam
				);
				if (!account) {
					toast.error('You do not have access to this account.');
					router.push('/accounts');
					return;
				}

				const locationRes = await getUserLocationAccess(user.id);
				const fetchedLocations = locationRes.data ?? [];
				setLocations(fetchedLocations);

				const location = fetchedLocations.find(
					(loc) => loc.id?.toString() === locationIdParam
				);
				if (!location) {
					toast.error('You do not have access to this location.');
					router.push(`/accounts/${accountIdParam}/locations`);
					return;
				}

				const stationRes = await getStationsByLocation(locationIdParam);

				// Explicitly map to your frontend Station type
				const fetchedStations: Station[] = (stationRes.data ?? []).map(
					(s: StationDto) => ({
						id: s.id ?? undefined,
						stationName: s.stationName,
						stationActive: s.stationActive,
						sortOrder: s.sortOrder ?? 0,
						items: s.items ?? [],
						location: s.location
							? { id: s.location.id, locationName: s.location.locationName }
							: currentLocation
							? {
									id: currentLocation.id,
									locationName: currentLocation.locationName,
							  }
							: { id: undefined, locationName: undefined },
						createdAt: s.createdAt ?? null,
						updatedAt: s.updatedAt ?? null,
					})
				);

				setStations(fetchedStations);


				const station = fetchedStations.find(
					(sta) => sta.id?.toString() === stationIdParam
				);
				if (!station) return;

				const itemsRes = await getItemsByStation(stationIdParam);
				const fetchedItems = itemsRes.data ?? [];

				// sort by saved sortOrder
				fetchedItems.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

				const optionsRes = await getOptions(accountIdParam);
				if (!optionsRes.data) {
					toast.error('Failed to fetch account options.');
					return;
				}
				const optionsSorted = optionsRes.data.sort(
					(a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
				)

				const temperatureCategoryRes =
					await getTemperatureCategories(locationIdParam);
				setTemperatureCategories(
					temperatureCategoryRes.error
						? getDefaultTemperatureCategories(locationIdParam)
						: [...(temperatureCategoryRes.data ?? [])].sort(
								(a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
							),
				);

				setItems(fetchedItems);
				setOptions(optionsSorted);
				setHasAccess(true);
				setAccountName(account.accountName);
				setAccountImage(account.imageBase64 || account.accountImage || null);
				setStationName(station.stationName);
				setCurrentLocation(location);
			} catch (err) {
				toast.error('You do not have access to this location.');
				router.push('/accounts');
			} finally {
				setLoadingAccess(false);
			}
		};

		verifyAccess();
	}, [loading, user, accountIdParam, locationIdParam, hasAccess, router]);

	// toggle active
	const handleToggleActive = async (itemId: string, checked: boolean) => {
		setItems((prev) =>
			prev.map((item) =>
				item.id === itemId ? { ...item, itemActive: checked } : item
			)
		);

		try {
			await toggleItemActive(stationIdParam, itemId, checked, currentUserId!);
		} catch (error: any) {
			setItems((prev) =>
				prev.map((item) =>
					item.id === itemId ? { ...item, itemActive: !checked } : item
				)
			);
			toast.error(`Failed to update item status: ${error?.message || error}`);
		}
	};

	// handle item created
	const handleItemCreated = (newItem: Item) => {
		setItems((prev) => [...prev, newItem]);
	};

	const handleItemUpdate = (updatedItem: Item) => {
		setItems((prev) =>
			prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
		);
	};


	const handleSave = (savedItem: Item) => {
		if (items.some((i) => i.id === savedItem.id)) {
			// Edit
			setItems(items.map((i) => (i.id === savedItem.id ? savedItem : i)));
		} else {
			// Create
			setItems([...items, savedItem]);
		}
	};

	// filtered & paginated
	const filteredItems = items.filter((item) => {
		const itemName = item.itemName ?? '';
		const matchesSearch = itemName
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesActive = showActiveOnly ? item.itemActive : true;
		return matchesActive && matchesSearch;
	});

	const paginatedItems = filteredItems.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize
	);

	// drag & drop
	const handleDragEnd = async (result: DropResult) => {
		if (!result.destination) return;
		const sourceIndex = result.source.index;
		const destIndex = result.destination.index;

		const updatedItems = Array.from(items);
		const [removed] = updatedItems.splice(sourceIndex, 1);
		updatedItems.splice(destIndex, 0, removed);

		setItems(updatedItems);

		try {
			const itemIdsInOrder = updatedItems.map((i) => i.id!) as any;
			await reorderItems(stationIdParam, itemIdsInOrder, currentUserId!);
		} catch (err) {
			toast.error('Failed to save new item order.');
		}
	};

	const optionsByType = options.reduce<Record<string, OptionEntity[]>>((acc, option) => {
		const type = option.optionType;
		if (!acc[type]) acc[type] = [];
		acc[type].push(option);
		return acc;
	}, {});

	const tools = optionsByType['TOOL'] ?? [];
	const panSize = optionsByType['PAN_SIZE'] ?? [];
	const portionSize = optionsByType['PORTION_SIZE'] ?? [];
	const shelfLife = optionsByType['SHELF_LIFE'] ?? [];
		

	return (
		<main className="flex min-h-screen overflow-hidden">
			{/* Desktop Sidebar */}
			{/* left nav */}
			<aside className="hidden w-1/6 shrink-0 self-stretch border-r bg-ring md:block">
				<LocationNav
					accountName={accountName}
					accountImage={accountImage}
					accountId={accountIdParam}
					locationId={locationIdParam}
					sessionUserRole={sessionUserRole}
				/>
			</aside>

			{/* main content */}
			<section className="flex-1 flex flex-col">
				<LocationPageHeader
					accountId={accountIdParam}
					locationId={locationIdParam}
					accountName={accountName}
					accountImage={accountImage}
					locationName={currentLocation?.locationName}
					pageName={stationName || 'Station'}
					sessionUserRole={sessionUserRole}
					drawerOpen={drawerOpen}
					setDrawerOpen={setDrawerOpen}
				>
					<CreateItemDialog
						onItemCreated={handleItemCreated}
						stationId={stationIdParam}
						currentUserId={currentUserId!}
						tools={tools}
						panSizes={panSize}
						portionSizes={portionSize}
						shelfLifes={shelfLife}
						temperatureCategories={temperatureCategories}
					/>
				</LocationPageHeader>

				{/* content */}
				{items.length === 0 ? (
					<p className="text-destructive text-2xl">No items found.</p>
				) : (
					<div>
						{/* Controls */}
						<div className="w-full md:w-3/4 mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 mt-4">
							<UserControls
								showActiveOnly={showActiveOnly}
								setShowActiveOnly={setShowActiveOnly}
								searchTerm={searchTerm}
								setSearchTerm={setSearchTerm}
							/>
						</div>
						{/* Dragable Desktop Table */}
						<DragDropContext onDragEnd={handleDragEnd}>
							<Droppable droppableId="items">
								{(provided) => (
									<div
										className="hidden md:block bg-ring/40 p-4 rounded-2xl shadow-md w-full md:w-3/4 mx-auto mt-8"
										{...provided.droppableProps}
										ref={provided.innerRef}
									>
										{/* Table headers */}
										<div className="flex justify-between items-center font-bold text-lg px-2 py-1 border-b border-accent mb-2">
											<span className="flex items-center gap-2 w-1/2">
												<UpDownIcon className="w-5 h-5" />
												Item Name
											</span>
											<span className="w-1/4 text-center">Status</span>
											<span className="w-1/4 text-center">Actions</span>
										</div>

										{/* Draggable rows */}
										{paginatedItems.map((item, index) => (
											<Draggable
												key={item.id}
												draggableId={item.id!}
												index={index}
											>
												{(provided) => (
													<div
														className="flex justify-between items-center p-2 mb-2 bg-accent rounded-2xl text-chart-3"
														ref={provided.innerRef}
														{...provided.draggableProps}
														{...provided.dragHandleProps}
													>
														{/* Icon + Name */}
														<div className="flex items-center gap-2 w-1/2">
															<Tooltip>
																<TooltipTrigger>
																	<UpDownIcon className="w-5 h-5" />
																</TooltipTrigger>
																<TooltipContent>
																	<p>Drag and Drop items to sort them.</p>
																</TooltipContent>
															</Tooltip>

													{sessionUserRole === AppRole.MANAGER ? (
														<EditItemDialog
															item={item}
															items={items}
															tools={tools}
															panSizes={panSize}
															portionSizes={portionSize}
													shelfLifes={shelfLife}
													temperatureCategories={temperatureCategories}
													stationId={stationIdParam}
															currentUserId={currentUserId!}
															onUpdate={handleItemUpdate}
															trigger={
																<button
																	type="button"
																	className="rounded-sm text-left underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
																>
																	{item.itemName}
																</button>
															}
														/>
													) : (
														<span>{item.itemName}</span>
													)}
														</div>

														{/* Status */}
														<div className="w-1/4 text-center">
															<StatusSwitchOrBadge
																entity={{
																	id: item.id!,
																	active: item.itemActive,
																}}
																getLabel={() => `item: ${item.itemName}`}
																onToggle={handleToggleActive}
																canToggle={canToggle}
															/>
														</div>

														{/* Actions */}
														<div className="w-1/4 flex justify-center items-center gap-2">
															{sessionUserRole === AppRole.MANAGER && (
																<>
																	{/* Edit Item */}
																	<EditItemDialog
																		key={item.id}
																		item={item}
																		items={items}
																		tools={tools}
																		panSizes={panSize}
																		portionSizes={portionSize}
														shelfLifes={shelfLife}
														temperatureCategories={temperatureCategories}
														stationId={stationIdParam}
																		currentUserId={currentUserId!}
																		onUpdate={handleItemUpdate}
																	/>

																	<DeleteConfirmButton
																		item={{
																			id: item.id!,
																			stationId: stationIdParam,
																		}}
																		entityLabel="Item"
																		onDelete={async (id) => {
																			await deleteItem(id, currentUserId!);
																			setItems((prev) =>
																				prev.filter((it) => it.id !== id)
																			);
																		}}
																		getItemName={() => item.itemName}
																	/>
																</>
															)}
														</div>
													</div>
												)}
											</Draggable>
										))}

										{provided.placeholder}
									</div>
								)}
							</Droppable>
						</DragDropContext>

						{/* Mobile Cards */}
						<div className="mt-6 space-y-4 px-3 md:hidden">
							{paginatedItems.map((item) => (
								<DataCard
									key={item.id}
									avatar={
										<span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
											<ItemIcon className="size-5" aria-hidden="true" />
										</span>
									}
									title={
										sessionUserRole === AppRole.MANAGER ? (
											<EditItemDialog
												item={item}
												items={items}
												tools={tools}
												panSizes={panSize}
												portionSizes={portionSize}
												shelfLifes={shelfLife}
												temperatureCategories={temperatureCategories}
												stationId={stationIdParam}
												currentUserId={currentUserId!}
												onUpdate={handleItemUpdate}
												trigger={
													<button
														type="button"
														className="inline-flex min-h-11 items-center rounded-sm text-left underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
													>
														{item.itemName}
													</button>
												}
											/>
										) : (
											item.itemName
										)
									}
									description={
										sessionUserRole === AppRole.MANAGER
											? 'Tap the item name to edit its setup'
											: 'Line-check item setup'
									}
									fields={[
										{
											label: 'Status',
											value: (
												<div className="flex items-center gap-3">
													<StatusSwitchOrBadge
														entity={{
															id: item.id!,
															active: item.itemActive,
														}}
														getLabel={() => `Item: ${item.itemName}`}
														onToggle={handleToggleActive}
														canToggle={canToggle}
													/>
													{canToggle && (
														<span>{item.itemActive ? 'Active' : 'Inactive'}</span>
													)}
												</div>
											),
										},
										{
											label: 'Shelf life',
											value: item.shelfLife || 'Not set',
										},
										{
											label: 'Pan size',
											value: item.panSize || 'Not set',
										},
										{
											label: 'Temp check',
											value: (
												<span
													className={
														item.isTempTaken
															? 'rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary'
															: 'rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground'
													}
												>
													{item.isTempTaken
														? item.tempCategory || 'Required'
														: 'Not required'}
												</span>
											),
										},
									]}
									actions={[
										{
											element: (
												<div className="flex justify-center gap-4 items-center">
																{sessionUserRole === 'MANAGER' ? (
																	<>
																		<EditItemDialog
																			item={items.find((i) => i.id === item.id)!}
																			items={items}
																			tools={tools}
																			panSizes={panSize}
																			portionSizes={portionSize}
																	shelfLifes={shelfLife}
																	temperatureCategories={temperatureCategories}
																	stationId={stationIdParam}
																			currentUserId={currentUserId!}
																			onUpdate={handleItemUpdate}
																		/>

																		{item.id && (
																			<DeleteConfirmButton
																				item={{
																					id: item.id,
																					locationId: locationIdParam,
																				}}
																				entityLabel="Item"
																				onDelete={async (id) => {
																					await deleteItem(id, currentUserId!);
																					setItems((prev) =>
																						prev.filter(
																							(existingItem) => existingItem.id !== id
																						)
																					);
																				}}
																				getItemName={() => item.itemName}
																			/>
																		)}
																	</>
													) : (
														<span className="text-ring">No Actions</span>
													)}
												</div>
											),
										},
									]}
								/>
							))}

							{paginatedItems.length === 0 && (
								<div className="rounded-2xl border border-dashed bg-muted/10 px-6 py-12 text-center text-sm text-muted-foreground">
									{searchTerm
										? `No items match “${searchTerm}”.`
										: 'No items to display.'}
								</div>
							)}
						</div>

						<div className="w-full md:w-3/4 mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 mt-4">
							<Pagination
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
								pageSize={pageSize}
								setPageSize={setPageSize}
								totalItems={filteredItems.length}
							/>
							</div>
							<ItemHistoryFeed stationId={stationIdParam}
							/>
					</div>
				)}
			</section>
		</main>
	);
};

export default StationPage;

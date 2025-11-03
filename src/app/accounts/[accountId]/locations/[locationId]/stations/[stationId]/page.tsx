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
import { AppRole, Item, Locations, Station, User } from '@/app/types';
import LocationNav from '@/components/navBar/LocationNav';
import Spinner from '@/components/spinner/Spinner';
import CreateItemDialog from '@/components/tableComponents/CreateItemDialog';
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
import { EditItemDialog } from '@/components/tableComponents/EditItemDialog';
import { Pagination } from '@/components/tableComponents/Pagination';
import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
import { UserControls } from '@/components/tableComponents/UserControls';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Icons } from '@/lib/icon';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import MobileDrawerNav from '@/components/navBar/MobileDrawerNav';

const StationPage = () => {
	//icon
	const UpDownIcon = Icons.sort;

	//session
	const { data: session, status } = useSession();
	const router = useRouter();
	const params = useParams<{
		accountId: string;
		locationId: string;
		stationId: string;
	}>();
	const accountIdParam = params.accountId;
	const locationIdParam = params.locationId;
	const stationIdParam = params.stationId;

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
	const [showActiveOnly, setShowActiveOnly] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const currentUser = session?.user as User | undefined;
	const sessionUserRole = session?.user?.appRole;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;

	// verify access & fetch items
	useEffect(() => {
		if (
			status !== 'authenticated' ||
			!session?.user?.id ||
			!accountIdParam ||
			!locationIdParam ||
			!stationIdParam
		)
			return;
		if (hasAccess) return;

		const verifyAccess = async () => {
			try {
				const accountsRes = await getAccountsForUser(session.user.id);
				const account = accountsRes.data?.find(
					(acc) => acc.id?.toString() === accountIdParam
				);
				if (!account) {
					toast.error('You do not have access to this account.');
					router.push('/accounts');
					return;
				}

				const locationRes = await getUserLocationAccess(session.user.id);
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
				const fetchedStations = stationRes.data ?? [];
				setStations(fetchedStations);

				const station = fetchedStations.find(
					(sta) => sta.id?.toString() === stationIdParam
				);
				if (!station) return;

				const itemsRes = await getItemsByStation(stationIdParam);
				const fetchedItems = itemsRes.data ?? [];

				// sort by saved sortOrder
				fetchedItems.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

				setItems(fetchedItems);
				setHasAccess(true);
				setAccountName(account.accountName);
				setAccountImage(account.imageBase64 || null);
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
	}, [status, session, accountIdParam, locationIdParam, hasAccess, router]);

	// toggle active
	const handleToggleActive = async (itemId: string, checked: boolean) => {
		setItems((prev) =>
			prev.map((item) =>
				item.id === itemId ? { ...item, itemActive: checked } : item
			)
		);

		try {
			await toggleItemActive(stationIdParam, itemId, checked);
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
			await reorderItems(stationIdParam, itemIdsInOrder);
		} catch (err) {
			toast.error('Failed to save new item order.');
		}
	};

	if (status === 'loading' || loadingAccess) {
		return (
			<div className="flex justify-center items-center py-40 text-chart-3 text-xl">
				<Spinner />
				<span className="ml-4">Loading items…</span>
			</div>
		);
	}

	return (
		<main className="flex min-h-screen overflow-hidden">
			{/* Desktop Sidebar */}
			<aside className="hidden md:block w-1/6 border-r h-screen bg-ring">
				<LocationNav
					accountName={accountName}
					accountImage={accountImage}
					accountId={accountIdParam}
					locationId={locationIdParam}
					sessionUserRole={sessionUserRole}
				/>
			</aside>

			{/* Main Content */}
			<section className="flex-1 flex flex-col">
				{/* Header */}
				<header className="flex justify-between items-center px-4 py-3 border-b bg-background/70 backdrop-blur-md sticky top-0 z-20">
					{/* Left */}
					<div className="flex items-center gap-3">
						{/* Mobile Drawer */}

						<MobileDrawerNav
							open={drawerOpen}
							setOpen={setDrawerOpen}
							title="Account Menu"
						>
							<LocationNav
								accountName={accountName}
								accountImage={accountImage}
								accountId={accountIdParam}
								locationId={locationIdParam}
								sessionUserRole={sessionUserRole}
							/>
						</MobileDrawerNav>
						<div>
							<h1 className="text-lg md:text-3xl font-bold">
								{currentLocation?.locationName}
							</h1>
						</div>
					</div>

					{/* center */}
					<div>
						<p className="text-4xl">
							Items on{' '}
							<span className="text-chart-3 italic">{stationName}</span> Station
						</p>
					</div>

					{/* Right */}
					<CreateItemDialog
						onItemCreated={handleItemCreated}
						stationId={stationIdParam}
					/>
				</header>

				{/* content */}
				{items.length === 0 ? (
					<p className="text-destructive text-2xl">No items found.</p>
				) : (
					<div>
						{/* contorls */}
						<div className="w-full md:w-3/4 mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 mt-4">
							<UserControls
								showActiveOnly={showActiveOnly}
								setShowActiveOnly={setShowActiveOnly}
								searchTerm={searchTerm}
								setSearchTerm={setSearchTerm}
							/>
						</div>

						{/* Desktop Table */}
						<DragDropContext onDragEnd={handleDragEnd}>
							<Droppable droppableId="items">
								{(provided) => (
									<div
										className="hidden md:block bg-accent p-4 rounded-2xl shadow-md w-full md:w-3/4 mx-auto mt-8"
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
														className="flex justify-between items-center p-2 mb-2 bg-background rounded-2xl text-chart-3"
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

															<span>{item.itemName}</span>
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
																	<EditItemDialog
																		item={item}
																		items={items}
																		stationId={stationIdParam}
																		onUpdate={(
																			id,
																			itemName,
																			isTempTaken,
																			isCheckMark,
																			notes
																		) =>
																			setItems((prev) =>
																				prev.map((it) =>
																					it.id === id
																						? {
																								...it,
																								itemName,
																								isTempTaken,
																								isCheckMark,
																								notes,
																						  }
																						: it
																				)
																			)
																		}
																	/>
																	<DeleteConfirmButton
																		item={{
																			id: item.id!,
																			stationId: stationIdParam,
																		}}
																		entityLabel="Station"
																		onDelete={async (id) => {
																			await deleteItem(stationIdParam, id);
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

						<div className="w-full md:w-3/4 mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 mt-4">
							<Pagination
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
								pageSize={pageSize}
								setPageSize={setPageSize}
								totalItems={items.length}
							/>
						</div>
					</div>
				)}
			</section>
		</main>
	);
};

export default StationPage;
